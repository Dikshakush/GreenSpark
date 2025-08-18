can you see and analyze this code and tell me what it do ?

// EcoJourneyScreen.jsx
import React, { useEffect, useMemo, useState, useRef, useContext } from "react";
import { PointsContext } from "../../context/PointsContext";
import { Button, Card, Form, Modal, ProgressBar } from "react-bootstrap";
import "../DashBoard/DashBoard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ---------- Axios helper (baseURL + auth) ----------
const API = axios.create({
  baseURL: "https://greenspark-backend-yuw8.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------- Utils ----------
const randomFrom = (arr) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);
const getId = (obj) => obj?._id || obj?.id;
const safe = (v, f) => (v === undefined || v === null ? f : v);

export default function EcoJourneyScreen() {
  const { updatePoints } = useContext(PointsContext);
  const nav = useNavigate();

  const [state, setState] = useState({
    points: 0,
    goals: [],
    pledges: [],
    leaderboard: [],
    streak: 0,
    habitsBadges: [],
    unlockedLocations: ["Home"],
    lastSpin: null,
  });

  const [newGoalText, setNewGoalText] = useState("");
  const [pledgeText, setPledgeText] = useState("");
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [spinResult, setSpinResult] = useState(null);

  const [challengesBank, setChallengesBank] = useState([]); // [{_id, text}] expected
  const [randomChallenge, setRandomChallenge] = useState(null); // store whole object for text + id

  const [currentTrivia, setCurrentTrivia] = useState({
    options: [],
    q: "",
    correctAnswer: "",
    points: 0,
    _id: "",
  });

  const confettiContainerRef = useRef(null);

  // ---------- Confetti ----------
  const launchConfetti = (count = 40) => {
    const container = confettiContainerRef.current;
    if (!container) return;
    const colors = ["#4facfe", "#00f2fe", "#6ee7b7", "#ffd166", "#ff8fab"];
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "mini-confetti";
      s.style.left = `${Math.random() * 100}%`;
      s.style.background = colors[Math.floor(Math.random() * colors.length)];
      s.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(s);
      setTimeout(() => s.remove(), 2200 + Math.random() * 600);
    }
  };

  // ---------- Initial load ----------
  useEffect(() => {
    const loadAll = async () => {
      try {
        // 1) Points
        const pointsRes = await API.get("/users/points");
        const points = safe(pointsRes?.data?.points, 0);

        // 2) Journey bundle
        const journeyRes = await API.get("/ecojourney");
        const {
          goals = [],
          pledges = [],
          streak = 0,
          habitsBadges = [],
          unlockedLocations = ["Home"],
          lastSpin = null,
          challenges = [], // if your controller returns this, we'll use it
        } = journeyRes?.data || {};

        // 3) Leaderboard
        const leaderboardRes = await API.get("/leaderboard");
        const leaderboard = leaderboardRes?.data?.leaderboard || leaderboardRes?.data || [];

        // 4) Challenges (fallback if not included in /ecojourney)
        let bank = challenges;
        if (!bank?.length) {
          try {
            const challengesRes = await API.get("/ecojourney/challenges");
            // expect {challenges: [{_id, text}]} — if your backend doesn’t expose this,
            // the catch below will seed a local fallback set.
            bank = challengesRes?.data?.challenges || [];
          } catch {
            bank = [
              { _id: "home", text: "Bring your own bottle today" },
              { _id: "park", text: "Pick up 5 pieces of litter" },
              { _id: "market", text: "Buy a local/seasonal product" },
              { _id: "campus", text: "Use stairs instead of elevator" },
              { _id: "forest", text: "Spend 10 mins in nature" },
            ];
          }
        }

        // 5) First trivia
        let trivia = { options: [], q: "", points: 0, _id: "", correctAnswer: "" };
        try {
          const nextTriviaRes = await API.get("/ecojourney/trivia/next");
          trivia = nextTriviaRes?.data || trivia;
        } catch {
          // ignore — trivia will show as empty until backend provides one
        }
        setCurrentTrivia(trivia); 

        setChallengesBank(bank);
        setRandomChallenge(randomFrom(bank));
        setState({
          points,
          goals,
          pledges,
          leaderboard,
          streak,
          habitsBadges,
          unlockedLocations,
          lastSpin,
        });
        updatePoints(points);
      } catch (err) {
        console.error("Error fetching EcoJourney data:", err);
      }
    };

    loadAll();
  }, [updatePoints]);

  // ---------- Points helper ----------
  const setPointsEverywhere = (newPoints) => {
    updatePoints(newPoints);
    setState((s) => {
      const lb = [...s.leaderboard];
      const youIdx = lb.findIndex((u) => u.name === "You");
      if (youIdx >= 0) lb[youIdx] = { ...lb[youIdx], points: newPoints };
      else lb.push({ name: "You", points: newPoints });
      return { ...s, points: newPoints, leaderboard: lb };
    });
  };

  const addPoints = async (delta) => {
    if (!delta) return;
    const newPoints = state.points + delta;
    try {
      await API.post("/users/points", { points: newPoints });
    } catch (err) {
      console.error("Failed to persist points", err);
    }
    setPointsEverywhere(newPoints);
  };

  // ---------- Goals ----------
  const addGoal = async (type = "short") => {
    if (!newGoalText.trim()) return;
    try {
      const res = await API.post("/ecojourney/goals", {
        text: newGoalText.trim(),
        type,
      });
      const created = res?.data;
      setState((s) => ({ ...s, goals: [created, ...s.goals] }));
      setNewGoalText("");
    } catch (err) {
      console.error("Failed to add goal:", err?.response?.data || err);
    }
  };

  const toggleGoal = async (id) => {
    const goal = state.goals.find((g) => getId(g) === id);
    const willBeDone = goal && !goal.done;

    // optimistic UI
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (getId(g) === id ? { ...g, done: !g.done } : g)),
    }));

    try {
      await API.post(`/ecojourney/goals/${id}/toggle`, {});
      if (willBeDone) {
        addPoints(15);
        launchConfetti(28);
      }
    } catch (err) {
      console.error("Failed to toggle goal:", err?.response?.data || err);
      // revert on error
      setState((s) => ({
        ...s,
        goals: s.goals.map((g) => (getId(g) === id ? { ...g, done: !g.done } : g)),
      }));
    }
  };

  // ---------- Challenges ----------
  const completeRandomChallenge = async () => {
    const challengeId = getId(randomChallenge);
    if (!challengeId) return;
    try {
      await API.post("/ecojourney/challenges/complete", { challengeId });
      addPoints(8);
      setState((s) => {
        const text = randomChallenge?.text || challengeId;
        const newUnlocked = s.unlockedLocations.includes(text)
          ? s.unlockedLocations
          : [...s.unlockedLocations, text];
        return { ...s, unlockedLocations: newUnlocked };
      });
      launchConfetti(24);
      setRandomChallenge(randomFrom(challengesBank));
    } catch (err) {
      console.error("Failed to complete challenge:", err?.response?.data || err);
    }
  };

  // ---------- Trivia ----------
  const answerTrivia = async (option) => {
    if (!currentTrivia?._id) return;
    const correct = option === currentTrivia.correctAnswer;
    try {
      if (correct) {
        await API.post(`/ecojourney/trivia/${currentTrivia._id}`, { answer: option });
        if (currentTrivia.points) {
          addPoints(currentTrivia.points);
          launchConfetti(36);
        }
      } else {
        await API.post(`/ecojourney/trivia/${currentTrivia._id}`, { answer: option });
      }
      const nextTriviaRes = await API.get("/ecojourney/trivia/next");
      setCurrentTrivia(nextTriviaRes?.data || {});
    } catch (err) {
      console.error("Failed to answer trivia:", err?.response?.data || err);
    }
  };

  // ---------- Habit / Streak ----------
  const logHabitAction = async () => {
    try {
      // increment streak on backend
      const streakRes = await API.post("/ecojourney/streak", {});
      const newStreak = safe(streakRes?.data?.streak, state.streak + 1);
      setState((s) => ({ ...s, streak: newStreak }));

      // award points locally (and persist via /users/points helper)
      await addPoints(5);
      launchConfetti(18);
    } catch (err) {
      console.error("Failed to log habit action:", err?.response?.data || err);
    }
  };

  // ---------- Spin-to-Win ----------
  const spinWheel = async () => {
    try {
      const res = await API.post("/spin", {});
      const prize = res?.data?.prize || res?.data || null;
      setSpinResult(prize);
      setShowSpinModal(true);

      if (prize?.type === "points") {
        await addPoints(Number(prize.value || 0));
        launchConfetti(30);
      } else if (prize?.type === "badge") {
        setState((s) => ({
          ...s,
          habitsBadges: [...s.habitsBadges, prize.value],
          lastSpin: { prize, time: Date.now() },
        }));
        launchConfetti(30);
      } else {
        setState((s) => ({ ...s, lastSpin: { prize, time: Date.now() } }));
      }
    } catch (err) {
      console.error("Failed to spin wheel:", err?.response?.data || err);
    }
  };

  // ---------- Log Eco Action (WITH PROOF IMAGE) ----------
  // usage: logEcoAction("recycle", selectedFile)
  // eslint-disable-next-line no-unused-vars
  const logEcoAction = async (actionType, proofFile) => {
    try {
      if (!proofFile) throw new Error("A proof image file is required");
      const fd = new FormData();
      fd.append("actionType", actionType);
      fd.append("proofImage", proofFile); // backend expects field name "proofImage"

      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "https://greenspark-backend-yuw8.onrender.com/api/ecoactions",
        fd,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // If controller returns totalPoints, sync; otherwise grant a small default bump
      if (typeof data?.totalPoints === "number") {
        try {
          await API.post("/users/points", { points: data.totalPoints });
        } catch {
          // ignore error
        }
        setPointsEverywhere(data.totalPoints);
      } else {
        await addPoints(5);
      }

      // Optional: reflect action as a quick “goal-like” badge chip
      if (data?.action?.actionType) {
        setState((s) => ({
          ...s,
          habitsBadges: Array.from(new Set([...(s.habitsBadges || []), `EcoAction: ${data.action.actionType}`])),
        }));
      }

      launchConfetti(22);
      return data;
    } catch (err) {
      console.error("Error logging eco action:", err?.response?.data || err.message);
      throw err;
    }
  };

  // ---------- Pledges ----------
  const addPledge = async () => {
    if (!pledgeText.trim()) return;
    try {
      const res = await API.post("/ecojourney/pledges", { text: pledgeText.trim() });
      const created = res?.data;
      setState((s) => ({ ...s, pledges: [created, ...s.pledges] }));
      setPledgeText("");
    } catch (err) {
      console.error("Failed to add pledge:", err?.response?.data || err);
    }
  };

  // ---------- Leaderboard (top 5 + you) ----------
  const top5 = useMemo(() => {
    const sorted = [...(state.leaderboard || [])].sort((a, b) => b.points - a.points).slice(0, 5);
    if (!sorted.some((u) => u?.name === "You")) {
      const you = (state.leaderboard || []).find((u) => u?.name === "You") || {
        name: "You",
        points: state.points,
      };
      sorted.push(you);
    }
    return sorted;
  }, [state.leaderboard, state.points]);

  return (
    <div className="dashboard-screen dark" style={{ padding: "2rem", gap: "1.25rem" }}>
      {/* Confetti layer */}
      <div ref={confettiContainerRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2000 }} />

      {/* Header */}
      <div className="dashboard-header glass-card" style={{ alignItems: "center" }}>
        <div>
          <h2 className="dashboard-title"> Eco Journey!🌿</h2>
          <p className="dashboard-sub">Your green path — goals, challenges, and rewards</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline-light" onClick={() => nav("/dashboard")}>← Back to Dashboard</Button>
          <Button variant="primary" onClick={() => { /* invite hook later */ }}>Invite Friends</Button>
        </div>
      </div>

      {/* Top row: Goals / Streak / Leaderboard */}
      <div className="eco-grid-row top">
        {/* Goals */}
        <Card className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>Eco Goals</h4>
            <small style={{ color: "#9fb4c9" }}>{state.goals.length} goals</small>
          </div>

          <div style={{ marginTop: 12 }}>
            <Form.Control
              size="sm"
              placeholder="Add a goal (e.g. No plastic bottles for a week)"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
            />
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button size="sm" variant="success" onClick={() => addGoal("short")}>Add</Button>
              <Button size="sm" variant="outline-light" onClick={() => addGoal("long")}>Long-term</Button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {state.goals.map((g) => {
              const id = getId(g);
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: g.done ? "#9fb4c9" : "#fff" }}>{g.text}</div>
                    <small style={{ color: "#9fb4c9" }}>{g.type} goal</small>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button size="sm" variant={g.done ? "outline-light" : "success"} onClick={() => toggleGoal(id)}>
                      {g.done ? "Undo" : "Complete"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Streak */}
        <Card className="glass-card" style={{ padding: 16 }}>
          <h5>Habit Streak</h5>
          <p style={{ marginTop: 6, color: "#9fb4c9" }}>Consistent eco actions earn badges</p>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{state.streak}d</div>
              <div style={{ flex: 1 }}>
                <ProgressBar now={Math.min((state.streak % 7) * 14.28, 100)} />
                <small style={{ color: "#9fb4c9" }}>Progress to next weekly badge</small>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button variant="outline-light" size="sm" onClick={logHabitAction}>Log Eco Action</Button>
              <Button variant="primary" size="sm" onClick={() => { setState((s) => ({ ...s, streak: 0 })); }}>Reset Streak</Button>
            </div>

            <div style={{ marginTop: 12 }}>
              <h6>Badges</h6>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {state.habitsBadges.length ? state.habitsBadges.map((b, i) => (
                  <div key={i} className="glass-card" style={{ padding: "6px 8px", background: "rgba(255,255,255,0.03)" }}>{b}</div>
                )) : <small style={{ color: "#9fb4c9" }}>No badges yet</small>}
              </div>
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="glass-card" style={{ padding: 16 }}>
          <h5>Leaderboard</h5>
          <ol style={{ paddingLeft: 18, marginTop: 10 }}>
            {top5.map((u, i) => (
              <li key={`${u?.name || "u"}-${i}`} style={{ color: u?.name === "You" ? "#fff" : "#9fb4c9", fontWeight: u?.name === "You" ? 700 : 500 }}>
                {u?.name} <span style={{ float: "right", color: "#4fc3ff" }}>{u?.points ?? 0} pts</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Middle row: Map / Spin / Random Challenge */}
      <div className="eco-grid-row middle">
        {/* Achievements Map */}
        <Card className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>Green Achievements Map</h4>
            <small style={{ color: "#9fb4c9" }}>Unlock new locations as you earn points</small>
          </div>
          <div style={{ marginTop: 12 }}>
            <svg viewBox="0 0 600 140" style={{ width: "100%", height: 140 }}>
              <rect x="10" y="20" width="580" height="100" rx="12" fill="rgba(255,255,255,0.02)" />
              {["Home", "Park", "Market", "Campus", "Forest"].map((loc, i) => {
                const x = 40 + i * 110;
                const unlocked = state.unlockedLocations.includes(loc);
                return (
                  <g key={loc} transform={`translate(${x},70)`}>
                    <circle cx={0} cy={0} r={24} fill={unlocked ? "#4facfe" : "#2b3942"} stroke={unlocked ? "#e6f7ff" : "#1a2430"} strokeWidth={3} />
                    <text x={0} y={40} fontSize="10" textAnchor="middle" fill={unlocked ? "#fff" : "#9fb4c9"}>{loc}</text>
                  </g>
                );
              })}
            </svg>
            <div style={{ marginTop: 10 }}>
              <small style={{ color: "#9fb4c9" }}>Unlocked: {state.unlockedLocations.join(", ")}</small>
            </div>
          </div>
        </Card>

        {/* Spin-to-Win */}
        <Card className="glass-card" style={{ padding: 16, textAlign: "center" }}>
          <h5>Spin to Win</h5>
          <p style={{ color: "#9fb4c9" }}>Try your luck — you might win bonus points or a badge!</p>
          <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: "conic-gradient(#4facfe, #00f2fe, #6ee7b7, #ffd166, #ff8fab)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  background: "#08202a",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700
                }}
              >
                Wheel
              </div>
            </div>
          </div>
          <Button variant="primary" onClick={spinWheel}>Spin</Button>

          <Modal show={showSpinModal} onHide={() => setShowSpinModal(false)} centered>
            <Modal.Header closeButton><Modal.Title>Spin Result</Modal.Title></Modal.Header>
            <Modal.Body style={{ textAlign: "center" }}>
              {spinResult ? (
                <>
                  <h5>{spinResult.label || "Result"}</h5>
                  {spinResult.type === "points" && <p>You won {spinResult.value} points 🎉</p>}
                  {spinResult.type === "badge" && <p>Congrats! Badge: {spinResult.value}</p>}
                  {spinResult.type === "tip" && <p>Eco Tip: {spinResult.value}</p>}
                  {!["points", "badge", "tip"].includes(safe(spinResult.type, "none")) && <p>Better luck next time!</p>}
                </>
              ) : (
                <p>Spinning...</p>
              )}
              <div style={{ marginTop: 12 }}>
                <Button variant="secondary" onClick={() => setShowSpinModal(false)}>Close</Button>
              </div>
            </Modal.Body>
          </Modal>
        </Card>

        {/* Random Challenge / Pledge */}
        <Card className="glass-card" style={{ padding: 16 }}>
          <h5>Random Challenge</h5>
          <p style={{ color: "#9fb4c9" }}>{randomChallenge?.text || "No challenge available"}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button variant="success" onClick={completeRandomChallenge} disabled={!randomChallenge}>Complete (+8 pts)</Button>
            <Button variant="outline-light" onClick={() => setRandomChallenge(randomFrom(challengesBank))}>New</Button>
          </div>

          <hr style={{ borderColor: "rgba(255,255,255,0.04)" }} />

          <h6>Eco Pledge Wall</h6>
          <Form.Control size="sm" placeholder="I pledge to..." value={pledgeText} onChange={(e) => setPledgeText(e.target.value)} />
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button size="sm" variant="primary" onClick={addPledge}>Pledge</Button>
            <Button size="sm" variant="outline-light" onClick={() => setPledgeText("")}>Clear</Button>
          </div>
          <div style={{ marginTop: 10, maxHeight: 110, overflow: "auto" }}>
            {state.pledges?.map((p) => (
              <div key={getId(p)} style={{ padding: "8px 0", borderBottom: "1px dashed rgba(255,255,255,0.02)" }}>
                <div style={{ fontWeight: 600 }}>{p.user || "Anonymous"}</div>
                <div style={{ color: "#9fb4c9" }}>{p.text}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lower row: Trivia / Summary */}
      <div className="eco-grid-row bottom">
        {/* Trivia */}
        <Card className="glass-card" style={{ padding: 16 }}>
          <h4>Daily Eco Trivia</h4>
          <p style={{ color: "#9fb4c9" }}>{currentTrivia.q || "No trivia yet — check back soon!"}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {currentTrivia.options?.map((opt) => (
              <Button key={opt} variant="outline-light" onClick={() => answerTrivia(opt)}>{opt}</Button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <small style={{ color: "#9fb4c9" }}>Reward: {currentTrivia.points || 0} pts</small>
          </div>
        </Card>

        {/* Summary */}
        <Card className="glass-card" style={{ padding: 16 }}>
          <h5>Summary</h5>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>Total Points</div>
              <div style={{ fontWeight: 700, color: "#4fc3ff" }}>{state.points} pts</div>
            </div>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>CO₂ Saved (est.)</div>
              <div style={{ fontWeight: 700 }}>{(state.points * 0.05).toFixed(1)} kg</div>
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.04)" }} />
            <h6>Achievements</h6>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {state.goals.filter((g) => g.done).length
                ? state.goals.filter((g) => g.done)?.map((g) => (
                    <div key={getId(g)} className="glass-card" style={{ padding: "6px 8px" }}>{g.text}</div>
                  ))
                : <small style={{ color: "#9fb4c9" }}>No achievements yet!</small>}
            </div>
          </div>
        </Card>
      </div>

      {/* tiny helpers */}
      <style jsx="true">{`
        .mini-confetti {
          position: absolute;
          top: -10px;
          width: 10px;
          height: 18px;
          border-radius: 2px;
          opacity: 0.95;
          animation: fall 1.8s linear forwards;
          transform-origin: center;
        }
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(600deg); opacity: 0; }
        }

        .eco-grid-row { display: grid; gap: 16px; }
        .eco-grid-row.top { grid-template-columns: 1fr 260px 260px; }
        .eco-grid-row.middle { grid-template-columns: 1fr 360px 320px; }
        .eco-grid-row.bottom { grid-template-columns: 1fr 360px; }

        @media (max-width: 1200px) {
          .eco-grid-row.top { grid-template-columns: 1fr 1fr; }
          .eco-grid-row.middle { grid-template-columns: 1fr 1fr; }
          .eco-grid-row.bottom { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 860px) {
          .eco-grid-row.top,
          .eco-grid-row.middle,
          .eco-grid-row.bottom {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
