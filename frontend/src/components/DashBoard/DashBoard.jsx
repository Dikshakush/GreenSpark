import React, { useEffect, useState, useCallback, useRef, useContext  } from 'react';
import { PointsContext } from "../../context/PointsContext"; 
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Modal, Button, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import StatsCards from './StatsCards';
import BadgesSection from './BadgesSection';
import LogEcoAction from '../actions/LogEcoAction';
import './DashBoard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
const { points } = useContext(PointsContext);
  const [actions, setActions] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [ecoTips, setEcoTips] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalCO2: 0 });
  const [streak, setStreak] = useState(0);
  const [progressData, setProgressData] = useState([]);
  const [quote, setQuote] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const { updatePoints } = useContext(PointsContext);

  const [challenges, setChallenges] = useState({
    daily: { goal: "", progress: 0 },
    weekly: { goal: "", progress: 0 }
  });

  const tabsRef = useRef(null);
  const { userInfo } = useSelector((state) => state.userLogin);
  const navigate = useNavigate();

  const fetchActions = useCallback(async () => {
    try {
      if (!userInfo?.token) {
        setActions([]);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('https://greenspark-backend-yuw8.onrender.com/api/ecoactions', config);
      updatePoints(data.points || 0);
    } catch (error) {
      console.error('Error fetching eco actions:', error);
    }
  }, [userInfo, updatePoints]);

  const fetchExtraData = useCallback(async () => {
    try {
      if (!userInfo?.token) return;

      const tipsRes = await axios.get('https://greenspark-backend-yuw8.onrender.com/api/ecotips');
      setEcoTips(tipsRes.data || []);

      const lbRes = await axios.get('https://greenspark-backend-yuw8.onrender.com/api/leaderboard');
      setLeaderboard(lbRes.data || []);

      const statsRes = await axios.get('https://greenspark-backend-yuw8.onrender.com/api/stats');
      setGlobalStats(statsRes.data || { totalCO2: 0 });

      const streakRes = await axios.get('https://greenspark-backend-yuw8.onrender.com/api/user/streak', {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      setStreak(streakRes.data?.streak || 0);

    } catch (err) {
      console.error('Failed to fetch extra data', err);
    }
  }, [userInfo]);

  const fetchProgressData = useCallback(async () => {
    try {
      if (!userInfo?.token) {
        setProgressData([]);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('https://greenspark-backend-yuw8.onrender.com/api/progress', config);
      setProgressData(data || []);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  }, [userInfo]);

  useEffect(() => {
    const quotes = [
      "Small steps make a big difference 🌱",
      "Every action counts towards a greener world 💚",
      "You're making the planet proud 🌍",
      "Eco-warrior mode: ON ⚡"
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [streak]);

  useEffect(() => {
    if (streak && streak % 7 === 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [streak]);

  useEffect(() => {
    document.body.setAttribute('data-theme', 'dark');
    fetchActions();
    fetchExtraData();
    fetchProgressData();
  }, [fetchActions, fetchExtraData, fetchProgressData]);

    useEffect(() => {
    setChallenges(prev => ({
      ...prev,
      daily: { ...prev.daily, progress: streak % 100 }
    }));
  }, [streak]);

  const handleActionLogged = () => {
    setShowLogModal(false);
    fetchActions();
    fetchExtraData();
    fetchProgressData();
  };

  const handleLearnButtonClick = () => {
    if (tabsRef.current) {
      const learnTab = tabsRef.current.querySelector('[data-rr-ui-event-key="learn"]');
      if (learnTab) {
        learnTab.click();
        setTimeout(() => {
          learnTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  };
  const totalPoints = points;
  const co2Saved = totalPoints > 0 ? (totalPoints * 0.5).toFixed(2) : 0;
  const level = totalPoints > 0 ? Math.floor(totalPoints / 100) + 1 : 0;

  
  const chartData = {
    labels: progressData.map(item => item.date),
    datasets: [
      {
        label: 'Points Over Time',
        data: progressData.map(item => item.points),
        borderColor: '#4cafef',
        backgroundColor: 'rgba(76, 175, 239, 0.2)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#fff' } },
      title: { display: true, text: '📈 Progress Tracking Over Time', color: '#fff', font: { size: 20, weight: 'bold' } }
    },
    scales: {
      x: { ticks: { color: '#fff' } },
      y: { ticks: { color: '#fff' } }
    }
  };

  return (
    <div className="dashboard-screen dark">
      {showConfetti && <Confetti />}
      <div className="dashboard-header glass-card">
        <div>
          <h2 className="dashboard-title"> Eco Quest Dashboard </h2>
          <p className="dashboard-sub">{quote}</p>
        </div>
      </div>

      <div className="welcome-card glass-card">
        <div>
          <h4>Welcome back, {userInfo?.name || 'Eco Hero'}! 🌱</h4>
          <p>
            Level {level} • {streak || 0} Day Streak •{" "}
            {totalPoints > 0 ? `${totalPoints} Points` : "Nothing earned, start earning!"}
          </p>
          <ProgressBar now={totalPoints > 0 ? (totalPoints % 100) : 0} label={totalPoints > 0 ? `${totalPoints % 100}` : "0"} />
        </div>
        <Button variant="secondary" className="log-action-btn" onClick={() => setShowLogModal(true)}>
          + Log New Eco Action
        </Button>
      </div>

      <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <h4> More Actions!!🚀</h4>
        <p>*Explore more features and take your eco journey further!</p>

        <div style={{ marginTop: '1rem' }}>
          <h6>Start Your Eco Journey</h6>
          <p>*Begin your personalized path towards making a positive impact on the planet.</p>
          <Button variant="secondary" onClick={() => navigate('/ecojourney')}>Start Eco Journey</Button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h6>Learn More</h6>
          <p>*Discover eco tips, resources, and sustainability guides.</p>
          <Button variant="secondary" onClick={handleLearnButtonClick}>Go to Learn Tab</Button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h6>Join the Community</h6>
          <p>*Share your progress, tips, and inspiration with fellow eco-warriors.</p>
          <Button variant="secondary" onClick={() => navigate('/community')}>Go to Community</Button>
        </div>
      </div>

      <div className="stats-row">
        <StatsCards totalPoints={totalPoints} co2Saved={co2Saved} earnedBadges={[]} theme="dark" />
      </div>

      <div className="chart-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '700px', padding: '1rem' }}>
          {progressData.length > 0 ? (
            <Line data={chartData} options={{ ...chartOptions, maintainAspectRatio: false }} height={300} />
          ) : (
            <p style={{ textAlign: 'center' }}>No progress yet. Log your first eco action to start tracking!</p>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="left-panel" ref={tabsRef}>
          <Tabs defaultActiveKey="challenges" id="dashboard-tabs" className="glass-card custom-tabs">
            <Tab eventKey="challenges" title=" Challenges! 🏆">
              <div className="challenge-section">
                {challenges.daily.goal ? (
                  <>
                    <h5>Daily Challenge</h5>
                    <p>{challenges.daily.goal}</p>
                    <ProgressBar now={challenges.daily.progress} label={`${challenges.daily.progress}%`} className="mb-3" />
                    <h5>Weekly Challenge</h5>
                    <p>{challenges.weekly.goal}</p>
                    <ProgressBar now={challenges.weekly.progress} label={`${challenges.weekly.progress}%`} className="mb-3" />
                  </>
                ) : (
                  <p>No challenges yet.</p>
                )}
                <h5>Community Challenge</h5>
                <p>Save 1 ton of CO₂ together this month</p>
                <ProgressBar now={0} label="0%" className="mb-3" />
              </div>
            </Tab>

            <Tab eventKey="stats" title=" Stats 📊">
              <div className="tab-content-black">
                <h5>
                  Global CO₂ Saved 🌍:{" "}
                  {globalStats.totalCO2 > 0 ? `${globalStats.totalCO2} kg` : "No CO₂ saved yet"}
                </h5>
                {leaderboard.length > 0 && (
                  <>
                    <h5 className="mt-4"> Leaderboard 🏅</h5>
                    <ol>
                      {leaderboard.map((user, idx) => (
                        <li key={idx}>{user.name} - {user.points} pts</li>
                      ))}
                    </ol>
                  </>
                )}
              </div>
            </Tab>

            <Tab eventKey="learn" title=" Learn 📚">
              <div className="tab-content-black">
                <h5>Eco Tip of the Day</h5>
                <p>{ecoTips[0]?.tip || 'No tips available yet.'}</p>
              </div>
            </Tab>

            <Tab eventKey="rewards" title=" Rewards 🎁">
              <div className="tab-content-black">
                <p>Redeem your points for discounts, donations, or profile upgrades.</p>
              </div>
            </Tab>

            <Tab eventKey="badges" title=" Badges 🏅">
              <div className="tab-content-black">
                <BadgesSection ecoActions={actions} earnedBadges={[]} />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>

      <Modal show={showLogModal} onHide={() => setShowLogModal(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Log Eco Action</Modal.Title></Modal.Header>
        <Modal.Body>
          <LogEcoAction onActionLogged={handleActionLogged} onClose={() => setShowLogModal(false)} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Dashboard;
