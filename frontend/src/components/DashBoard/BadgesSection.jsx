import React, { useEffect, useState } from 'react';
import './DashBoard.css';
import axios from 'axios';

const BadgesSection = () => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [newBadges, setNewBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch earned badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo?.token || '';

        const { data } = await axios.get('https://greenspark-backend-yuw8.onrender.com/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.earnedBadges) {
          setEarnedBadges(data.earnedBadges);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch earned badges', error);
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  // Detect and show newly unlocked badges
  useEffect(() => {
    if (earnedBadges.length > 0) {
      const stored = JSON.parse(localStorage.getItem('displayedBadges') || '[]');
      const unseen = earnedBadges.filter(b => !stored.includes(b._id));

      if (unseen.length > 0) {
        setNewBadges(unseen);
        localStorage.setItem(
          'displayedBadges',
          JSON.stringify([...stored, ...unseen.map(b => b._id)])
        );
      }
    }
  }, [earnedBadges]);

  return (
    <div className="mt-5">
      <h4 className="text-light mb-3">🏅 Your Eco Badges</h4>

      {loading ? (
        <div className="placeholder-message">Loading badges...</div>
      ) : earnedBadges.length === 0 ? (
        <div className="placeholder-message">No badges earned yet. Start your eco journey! 🌱</div>
      ) : (
        <div className="d-flex flex-wrap gap-3">
          {earnedBadges.map(badge => (
            <div
              key={badge._id}
              className="badge-card p-3 border rounded bg-dark text-warning"
            >
              <h6>{badge.title}</h6>
              <small>{badge.description}</small>
            </div>
          ))}
        </div>
      )}

      {/* Badge popup animation */}
      {newBadges.length > 0 && (
        <div className="badge-popup sparkle-explosion">
          <div className="popup-content">
            <h5>🎉 New Badge Unlocked!</h5>
            <p><strong>{newBadges[0].title}</strong></p>
            <small>{newBadges[0].description}</small>
            <button
              className="btn btn-outline-warning mt-2"
              onClick={() => setNewBadges([])}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgesSection;
