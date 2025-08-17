

// EcoJourneyScreen.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Button, Card, Form, Modal, ProgressBar } from "react-bootstrap";
import "../DashBoard/DashBoard.css";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "eco_journey_mock_v2";

// ---- Initial UI state (frontend only; replace from backend later) ----
const initialState = {
  points: 0,
  goals: [
    { id: 1, text: "Use a reusable bottle for a week", type: "short", done: false },
    { id: 2, text: "Reduce electricity usage by 10%", type: "long", done: false }
  ],
  pledges: [
    { id: 1, user: "Community", text: "No plastic bags for a week", time: Date.now() - 86400000 }
  ],
  leaderboard: [
    { name: "Alice", points: 350 },
    { name: "Bob", points: 280 },
    { name: "You", points: 0 },
    { name: "Carmen", points: 110 },
    { name: "Dee", points: 95 }
  ],
  streak: 0,                // as requested: show 0d
  habitsBadges: [],         // as requested: “No badges yet”
  unlockedLocations: ["Home"],
  lastSpin: null
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const sampleTrivia = [
  {
    q: "What gas do trees absorb from the atmosphere?",
    options: ["CO₂", "O₂", "N₂", "H₂"],
    ans: "CO₂",
    points: 10
  },
  {
    q: "Which is a recyclable material?",
    options: ["Glass", "Styrofoam", "Grease-laden pizza box", "Wet tissues"],
    ans: "Glass",
    points: 8
  },
  {
    q: "What's an eco-friendly commute option?",
    options: ["Car alone", "Bike", "Helicopter", "Single rider taxi"],
    ans: "Bike",
    points: 6
  }
];

const challengesBank = [
  "Unplug chargers when not in use",
  "Use public transport for one trip",
  "Bring reusable cutlery for lunch",
  "Switch to LED bulbs for one room",
  "Compost kitchen scraps for a week"
];

const spinPrizes = [
  { label: "5 pts", type: "points", value: 5 },
  { label: "10 pts", type: "points", value: 10 },
  { label: "Eco Tip", type: "tip", value: "Use a clothesline instead of dryer" },
  { label: "Badge", type: "badge", value: "Spinner Novice" },
  { label: "No win", type: "none", value: null }
];

export default function EcoJourneyScreen() {
  const nav = useNavigate?.() || (() => {});
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : initialState;
    } catch {
      return initialState;
    }
  });

  // UI micro-state
  const [newGoalText, setNewGoalText] = useState("");
  const [pledgeText, setPledgeText] = useState("");
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [currentTrivia, setCurrentTrivia] = useState(() => randomFrom(sampleTrivia));
  const [randomChallenge, setRandomChallenge] = useState(() => randomFrom(challengesBank));
  const confettiContainerRef = useRef(null);

  // persist locally (you’ll replace with backend calls later)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // small confetti
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

  // ---- helper: ALWAYS keep points + leaderboard("You") in sync ----
  const addPoints = (delta) => {
    if (!delta) return;
    setState((s) => {
      const newPoints = (s.points || 0) + delta;
      let lb = [...s.leaderboard];
      const youIdx = lb.findIndex((u) => u.name === "You");
      if (youIdx >= 0) {
        lb[youIdx] = { ...lb[youIdx], points: newPoints };
      } else {
        lb = [...lb, { name: "You", points: newPoints }];
      }
      return { ...s, points: newPoints, leaderboard: lb };
    });
  };

  // actions
  const addGoal = (type = "short") => {
    if (!newGoalText.trim()) return;
    const g = { id: Date.now(), text: newGoalText.trim(), type, done: false };
    setState((s) => ({ ...s, goals: [g, ...s.goals] }));
    setNewGoalText("");
  };

  const toggleGoal = (id) => {
    setState((s) => {
      const goals = s.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
      return { ...s, goals };
    });
    // award points when marking as done (remove if backend differs)
    const g = state.goals.find((x) => x.id === id);
    const willBeDone = g && !g.done;
    if (willBeDone) {
      addPoints(15);
      launchConfetti(28);
    }
  };

  const addPledge = () => {
    if (!pledgeText.trim()) return;
    const p = { id: Date.now(), user: "You", text: pledgeText.trim(), time: Date.now() };
    setState((s) => ({ ...s, pledges: [p, ...s.pledges] }));
    setPledgeText("");
  };

  const spinWheel = () => {
    const prize = randomFrom(spinPrizes);
    setSpinResult(prize);
    setShowSpinModal(true);
    setTimeout(() => {
      if (prize.type === "points") {
        addPoints(prize.value);
        launchConfetti(30);
      } else if (prize.type === "badge") {
        setState((s) => ({ ...s, habitsBadges: [...s.habitsBadges, prize.value], lastSpin: { prize, time: Date.now() } }));
        launchConfetti(30);
      } else {
        setState((s) => ({ ...s, lastSpin: { prize, time: Date.now() } }));
      }
    }, 400);
  };

  const completeRandomChallenge = () => {
    addPoints(8);
    setState((s) => {
      const newUnlocked = s.unlockedLocations.includes(randomChallenge)
        ? s.unlockedLocations
        : [...s.unlockedLocations, randomChallenge];
      return { ...s, unlockedLocations: newUnlocked };
    });
    launchConfetti(24);
    setRandomChallenge(randomFrom(challengesBank));
  };

  const answerTrivia = (option) => {
    if (option === currentTrivia.ans) {
      addPoints(currentTrivia.points);
      launchConfetti(36);
    }
    setTimeout(() => setCurrentTrivia(randomFrom(sampleTrivia)), 500);
  };

  const logHabitAction = () => {
    setState((s) => {
      const newStreak = (s.streak || 0) + 1;
      const badges = [...s.habitsBadges];
      if (newStreak % 7 === 0) badges.push(`Streak ${newStreak} days`);
      return { ...s, streak: newStreak, habitsBadges: badges };
    });
    launchConfetti(18);
  };

  // derived
  const top5 = useMemo(() => {
    const sorted = [...state.leaderboard].sort((a, b) => b.points - a.points).slice(0, 5);
    if (!sorted.some((u) => u.name === "You")) {
      const you = state.leaderboard.find((u) => u.name === "You") || { name: "You", points: state.points };
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
          <Button variant="outline-light" onClick={() => nav("/dashBoard")}>← Back to Dashboard</Button>
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
            {state.goals.map((g) => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                <div>
                  <div style={{ fontWeight: 600, color: g.done ? "#9fb4c9" : "#fff" }}>{g.text}</div>
                  <small style={{ color: "#9fb4c9" }}>{g.type} goal</small>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button size="sm" variant={g.done ? "outline-light" : "success"} onClick={() => toggleGoal(g.id)}>
                    {g.done ? "Undo" : "Complete"}
                  </Button>
                </div>
              </div>
            ))}
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
              <li key={i} style={{ color: u.name === "You" ? "#fff" : "#9fb4c9", fontWeight: u.name === "You" ? 700 : 500 }}>
                {u.name} <span style={{ float: "right", color: "#4fc3ff" }}>{u.points} pts</span>
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
                  <h5>{spinResult.label}</h5>
                  {spinResult.type === "points" && <p>You won {spinResult.value} points 🎉</p>}
                  {spinResult.type === "badge" && <p>Congrats! Badge: {spinResult.value}</p>}
                  {spinResult.type === "tip" && <p>Eco Tip: {spinResult.value}</p>}
                  {spinResult.type === "none" && <p>Better luck next time!</p>}
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
          <p style={{ color: "#9fb4c9" }}>{randomChallenge}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button variant="success" onClick={completeRandomChallenge}>Complete (+8 pts)</Button>
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
            {state.pledges.map((p) => (
              <div key={p.id} style={{ padding: "8px 0", borderBottom: "1px dashed rgba(255,255,255,0.02)" }}>
                <div style={{ fontWeight: 600 }}>{p.user}</div>
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
          <p style={{ color: "#9fb4c9" }}>{currentTrivia.q}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {currentTrivia.options.map((opt) => (
              <Button key={opt} variant="outline-light" onClick={() => answerTrivia(opt)}>{opt}</Button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <small style={{ color: "#9fb4c9" }}>Correct: {currentTrivia.ans} • Reward: {currentTrivia.points} pts</small>
          </div>
        </Card>

        {/* Summary */}
        <Card className="glass-card" style={{ padding: 16 }}>
          <h5>Summary</h5>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>Total Points</div>
              <div style={{ fontWeight: 700, color: "#4fc3ff" }}>{state.points} pts</div>
            </div>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
              <div>CO₂ Saved (est.)</div>
              <div style={{ fontWeight: 700 }}>{(state.points * 0.5).toFixed(1)} kg</div>
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.04)" }} />
            <h6>Achievements</h6>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {state.goals.filter((g) => g.done).length
                ? state.goals.filter((g) => g.done).map((g) => (
                    <div key={g.id} className="glass-card" style={{ padding: "6px 8px" }}>{g.text}</div>
                  ))
                : <small style={{ color: "#9fb4c9" }}>No achievements yet</small>}
            </div>
          </div>
        </Card>
      </div>

      {/* tiny helpers: confetti + responsive grid that respects your theme */}
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

        /* Responsive rows that keep your DashBoard.css glass theme */
        .eco-grid-row {
          display: grid;
          gap: 16px;
        }
        .eco-grid-row.top {
          grid-template-columns: 1fr 260px 260px;
        }
        .eco-grid-row.middle {
          grid-template-columns: 1fr 360px 320px;
        }
        .eco-grid-row.bottom {
          grid-template-columns: 1fr 360px;
        }

        /* Breakpoints to keep layout consistent with your screenshots */
        @media (max-width: 1200px) {
          .eco-grid-row.top {
            grid-template-columns: 1fr 1fr;
          }
          .eco-grid-row.middle {
            grid-template-columns: 1fr 1fr;
          }
          .eco-grid-row.bottom {
            grid-template-columns: 1fr 1fr;
          }
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


