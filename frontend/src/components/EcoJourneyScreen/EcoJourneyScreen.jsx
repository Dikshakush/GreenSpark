// EcoJourneyScreen.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Form, Modal, ProgressBar, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../DashBoard/DashBoard.css";


const API_BASE = import.meta.env.VITE_API_BASE || "";
const STORAGE_KEY = "eco_journey_cache_v1";

/**
 * ====== API client with auth ======
 */
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * ====== Local helpers / seeds ======
 */
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TRIVIA_SEED = [
  { q: "What gas do trees absorb from the atmosphere?", options: ["CO₂", "O₂", "N₂", "H₂"], ans: "CO₂", points: 10 },
  { q: "Which is a recyclable material?", options: ["Glass", "Styrofoam", "Grease-laden pizza box", "Wet tissues"], ans: "Glass", points: 8 },
  { q: "What's an eco-friendly commute option?", options: ["Car alone", "Bike", "Helicopter", "Single rider taxi"], ans: "Bike", points: 6 },
];

const CHALLENGES_SEED = [
  "Unplug chargers when not in use",
  "Use public transport for one trip",
  "Bring reusable cutlery for lunch",
  "Switch to LED bulbs for one room",
  "Compost kitchen scraps for a week",
];

const SPIN_FALLBACK = ["5 pts", "10 pts", "Eco Tip", "Badge", "No win"];

const INITIAL = {
  points: 0,
  goals: [],
  pledges: [],
  leaderboard: [{ name: "You", points: 0 }],
  streak: 0,
  habitsBadges: [],
  unlockedLocations: ["Home"],
  lastSpin: null,
};

export default function EcoJourneyScreen() {
  const nav = useNavigate?.() || (() => {});
  const [state, setState] = useState(INITIAL);

  // micro UI state
  const [loading, setLoading] = useState(true);
  const [newGoalText, setNewGoalText] = useState("");
  const [pledgeText, setPledgeText] = useState("");
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [currentTrivia, setCurrentTrivia] = useState(() => randomFrom(TRIVIA_SEED));
  const [randomChallenge, setRandomChallenge] = useState(() => randomFrom(CHALLENGES_SEED));
  const confettiRef = useRef(null);

  /**
   * ====== Data boot ======
   * GET /api/ecojourney/state
   * GET /api/leaderboard (optional)
   */
  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        const [{ data: s }, lbRes] = await Promise.all([
          api.get("/api/ecojourney/state"),
          api.get("/api/leaderboard").catch(() => ({ data: null })),
        ]);

        const merged = { ...INITIAL, ...(s || {}) };
        if (lbRes?.data?.leaderboard?.length) {
          merged.leaderboard = lbRes.data.leaderboard;
        }

        // Ensure "You" row mirrors points
        const youIdx = merged.leaderboard.findIndex((u) => u.name === "You");
        if (youIdx >= 0) merged.leaderboard[youIdx] = { ...merged.leaderboard[youIdx], points: merged.points || 0 };
        else merged.leaderboard.push({ name: "You", points: merged.points || 0 });

        setState(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (err) {
        // fallback cache
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setState(JSON.parse(raw));
      
        console.error("Boot load failed:", err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  // keep a small cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /**
   * ====== Confetti micro effect ======
   */
  const confetti = (count = 36) => {
    const host = confettiRef.current;
    if (!host) return;
    const colors = ["#4facfe", "#00f2fe", "#6ee7b7", "#ffd166", "#ff8fab"];
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "mini-confetti";
      s.style.left = `${Math.random() * 100}%`;
      s.style.background = colors[Math.floor(Math.random() * colors.length)];
      s.style.transform = `rotate(${Math.random() * 360}deg)`;
      host.appendChild(s);
      setTimeout(() => s.remove(), 2000 + Math.random() * 700);
    }
  };

  /**
   * ====== Keep points + "You" leaderboard in sync ======
   */
  const syncPoints = (pts) => {
    setState((prev) => {
      const lb = [...(prev.leaderboard || [])];
      const idx = lb.findIndex((u) => u.name === "You");
      if (idx >= 0) lb[idx] = { ...lb[idx], points: pts };
      else lb.push({ name: "You", points: pts });
      return { ...prev, points: pts, leaderboard: lb };
    });
  };

  /**
   * ====== Actions wired to endpoints ======
   */

  // POST /api/ecojourney/goals
  const addGoal = async (type = "short") => {
    const text = newGoalText.trim();
    if (!text) return;
    try {
      const { data } = await api.post("/api/ecojourney/goals", { text, type });
      setState((s) => ({ ...s, goals: [data.goal, ...(s.goals || [])] }));
      setNewGoalText("");
    } catch (err) {
      console.error("Add goal failed:", err?.response?.data || err.message);
    }
  };

  // PATCH /api/ecojourney/goals/:id/toggle
  const toggleGoal = async (id) => {
    try {
      const { data } = await api.patch(`/api/ecojourney/goals/${id}/toggle`);
      // { goal, pointsAwarded?, totalPoints }
      setState((s) => {
        const goals = (s.goals || []).map((g) => (g._id === id || g.id === id ? { ...g, done: data.goal.done } : g));
        return { ...s, goals };
      });
      if (typeof data.totalPoints === "number") {
        syncPoints(data.totalPoints);
        if (data.pointsAwarded > 0) confetti(28);
      }
    } catch (err) {
      console.error("Toggle goal failed:", err?.response?.data || err.message);
    }
  };

  // POST /api/ecojourney/pledges
  const addPledge = async () => {
    const text = pledgeText.trim();
    if (!text) return;
    try {
      const { data } = await api.post("/api/ecojourney/pledges", { text });
      setState((s) => ({ ...s, pledges: [data.pledge, ...(s.pledges || [])] }));
      setPledgeText("");
    } catch (err) {
      console.error("Add pledge failed:", err?.response?.data || err.message);
    }
  };

  // POST /api/spin/roll
  const spinWheel = async () => {
    try {
      setShowSpinModal(true);
      setSpinResult(null);
      const { data } = await api.post("/api/spin/roll"); // { prize, pointsAfter, badge? }
      setSpinResult(data.prize);
      if (data.badge) {
        setState((s) => ({ ...s, habitsBadges: [...(s.habitsBadges || []), data.badge] }));
        confetti(30);
      }
      if (typeof data.pointsAfter === "number") {
        syncPoints(data.pointsAfter);
        if (data.prize?.type === "points") confetti(30);
      }
      setState((s) => ({ ...s, lastSpin: { prize: data.prize, time: Date.now() } }));
    } catch (err) {
      console.error("Spin failed:", err?.response?.data || err.message);
      setSpinResult({ label: randomFrom(SPIN_FALLBACK), type: "none", value: null });
    }
  };

  // POST /api/ecojourney/challenges/complete
  const completeRandomChallenge = async () => {
    try {
      const { data } = await api.post("/api/ecojourney/challenges/complete", { text: randomChallenge });
      if (data?.unlockedLocations) {
        setState((s) => ({ ...s, unlockedLocations: data.unlockedLocations }));
      } else {
        setState((s) => {
          const list = new Set(s.unlockedLocations || []);
          list.add(randomChallenge);
          return { ...s, unlockedLocations: Array.from(list) };
        });
      }
      if (typeof data?.pointsAfter === "number") syncPoints(data.pointsAfter);
      confetti(24);
      setRandomChallenge(randomFrom(CHALLENGES_SEED));
    } catch (err) {
      console.error("Challenge complete failed:", err?.response?.data || err.message);
    }
  };

  // POST /api/ecojourney/trivia/answer
  const answerTrivia = async (option) => {
    try {
      const body = {
        question: currentTrivia.q,
        selected: option,
        correct: currentTrivia.ans,
        reward: currentTrivia.points,
      };
      const { data } = await api.post("/api/ecojourney/trivia/answer", body); // { correct, pointsAfter }
      if (data?.correct) confetti(36);
      if (typeof data?.pointsAfter === "number") {
        syncPoints(data.pointsAfter);
      } else if (option === currentTrivia.ans) {
        syncPoints((state.points || 0) + (currentTrivia.points || 0));
      }
    } catch (err) {
      console.error("Trivia failed:", err?.response?.data || err.message);
      if (option === currentTrivia.ans) {
        syncPoints((state.points || 0) + (currentTrivia.points || 0));
        confetti(36);
      }
    } finally {
      setTimeout(() => setCurrentTrivia(randomFrom(TRIVIA_SEED)), 500);
    }
  };

  // POST /api/ecojourney/streak/log
  const logHabitAction = async () => {
    try {
      const { data } = await api.post("/api/ecojourney/streak/log"); // { streak, badges?, pointsAfter? }
      setState((s) => {
        const badges = data.badges || s.habitsBadges || [];
        return { ...s, streak: data.streak ?? (s.streak || 0), habitsBadges: badges };
      });
      if (typeof data?.pointsAfter === "number") syncPoints(data.pointsAfter);
      confetti(18);
    } catch (err) {
      console.error("Streak log failed:", err?.response?.data || err.message);
      setState((s) => {
        const newStreak = (s.streak || 0) + 1;
        const badges = [...(s.habitsBadges || [])];
        if (newStreak % 7 === 0) badges.push(`Streak ${newStreak} days`);
        return { ...s, streak: newStreak, habitsBadges: badges };
      });
      confetti(18);
    }
  };

  /**
   * ====== Derived leaderboard (top 5 incl. You) ======
   */
  const top5 = useMemo(() => {
    const sorted = [...(state.leaderboard || [])].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5);
    if (!sorted.some((u) => u.name === "You")) sorted.push({ name: "You", points: state.points || 0 });
    return sorted;
  }, [state.leaderboard, state.points]);

  return (
    <div className="dashboard-screen dark" style={{ padding: "2rem", gap: "1.25rem", opacity: loading ? 0.75 : 1 }}>
      {/* Confetti layer */}
      <div ref={confettiRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2000 }} />

      {/* Header */}
      <div className="dashboard-header glass-card" style={{ alignItems: "center" }}>
        <div>
          <h2 className="dashboard-title">Eco Journey! 🌿</h2>
          <p className="dashboard-sub">Your green path — goals, challenges, and rewards</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline-light" onClick={() => nav("/dashBoard")}>← Back to Dashboard</Button>
          <Button variant="primary" onClick={() => { /* future invite hook */ }}>Invite Friends</Button>
        </div>
      </div>

      {/* Loading banner */}
      {loading && (
        <div className="glass-card" style={{ padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <Spinner size="sm" /> <span style={{ color: "#9fb4c9" }}>Loading your eco journey…</span>
        </div>
      )}

      {/* Top row: Goals / Streak / Leaderboard */}
      <div className="eco-grid-row top">
        {/* Goals */}
        <Card className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>Eco Goals</h4>
            <small style={{ color: "#9fb4c9" }}>{(state.goals || []).length} goals</small>
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
            {(state.goals || []).length ? (
              (state.goals || []).map((g) => {
                const id = g._id || g.id;
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
              })
            ) : (
              <small style={{ color: "#9fb4c9" }}>No goals yet — add your first one above.</small>
            )}
          </div>
        </Card>

        {/* Streak */}
        <Card className="glass-card" style={{ padding: 16 }}>
          <h5>Habit Streak</h5>
          <p style={{ marginTop: 6, color: "#9fb4c9" }}>Consistent eco actions earn badges</p>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{state.streak || 0}d</div>
              <div style={{ flex: 1 }}>
                <ProgressBar now={Math.min(((state.streak || 0) % 7) * 14.28, 100)} />
                <small style={{ color: "#9fb4c9" }}>Progress to next weekly badge</small>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button variant="outline-light" size="sm" onClick={logHabitAction}>Log Eco Action</Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setState((s) => ({ ...s, streak: 0 }))}
              >
                Reset Streak
              </Button>
            </div>

            <div style={{ marginTop: 12 }}>
              <h6>Badges</h6>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(state.habitsBadges || []).length ? (
                  (state.habitsBadges || []).map((b, i) => (
                    <div key={i} className="glass-card" style={{ padding: "6px 8px", background: "rgba(255,255,255,0.03)" }}>{b}</div>
                  ))
                ) : (
                  <small style={{ color: "#9fb4c9" }}>No badges yet</small>
                )}
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
        {/* Map */}
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
                const unlocked = (state.unlockedLocations || []).includes(loc);
                return (
                  <g key={loc} transform={`translate(${x},70)`}>
                    <circle cx={0} cy={0} r={24} fill={unlocked ? "#4facfe" : "#2b3942"} stroke={unlocked ? "#e6f7ff" : "#1a2430"} strokeWidth={3} />
                    <text x={0} y={40} fontSize="10" textAnchor="middle" fill={unlocked ? "#fff" : "#9fb4c9"}>{loc}</text>
                  </g>
                );
              })}
            </svg>
            <div style={{ marginTop: 10 }}>
              <small style={{ color: "#9fb4c9" }}>Unlocked: {(state.unlockedLocations || []).join(", ")}</small>
            </div>
          </div>
        </Card>

        {/* Spin */}
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
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
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
                  fontWeight: 700,
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
                <p>Spinning…</p>
              )}
              <div style={{ marginTop: 12 }}>
                <Button variant="secondary" onClick={() => setShowSpinModal(false)}>Close</Button>
              </div>
            </Modal.Body>
          </Modal>
        </Card>

        {/* Random Challenge + Pledge */}
        <Card className="glass-card" style={{ padding: 16 }}>
          <h5>Random Challenge</h5>
          <p style={{ color: "#9fb4c9" }}>{randomChallenge}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button variant="success" onClick={completeRandomChallenge}>Complete (+pts)</Button>
            <Button variant="outline-light" onClick={() => setRandomChallenge(randomFrom(CHALLENGES_SEED))}>New</Button>
          </div>

          <hr style={{ borderColor: "rgba(255,255,255,0.04)" }} />

          <h6>Eco Pledge Wall</h6>
          <Form.Control size="sm" placeholder="I pledge to…" value={pledgeText} onChange={(e) => setPledgeText(e.target.value)} />
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button size="sm" variant="primary" onClick={addPledge}>Pledge</Button>
            <Button size="sm" variant="outline-light" onClick={() => setPledgeText("")}>Clear</Button>
          </div>
          <div style={{ marginTop: 10, maxHeight: 110, overflow: "auto" }}>
            {(state.pledges || []).length ? (
              (state.pledges || []).map((p) => (
                <div key={p._id || p.id} style={{ padding: "8px 0", borderBottom: "1px dashed rgba(255,255,255,0.04)" }}>
                  <div style={{ fontWeight: 600 }}>{p.user || "You"}</div>
                  <div style={{ color: "#9fb4c9" }}>{p.text}</div>
                </div>
              ))
            ) : (
              <small style={{ color: "#9fb4c9" }}>No pledges yet — make your first pledge above.</small>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom row: Trivia / Summary */}
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
              <div style={{ fontWeight: 700, color: "#4fc3ff" }}>{state.points || 0} pts</div>
            </div>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
              <div>CO₂ Saved (est.)</div>
              <div style={{ fontWeight: 700 }}>{((state.points || 0) * 0.5).toFixed(1)} kg</div>
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.04)" }} />
            <h6>Achievements</h6>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {(state.goals || []).filter((g) => g.done).length ? (
                (state.goals || [])
                  .filter((g) => g.done)
                  .map((g) => (
                    <div key={g._id || g.id} className="glass-card" style={{ padding: "6px 8px" }}>
                      {g.text}
                    </div>
                  ))
              ) : (
                <small style={{ color: "#9fb4c9" }}>No achievements yet</small>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Inline tiny helpers: confetti + responsive grid */}
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
          .eco-grid-row.top, .eco-grid-row.middle, .eco-grid-row.bottom { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
