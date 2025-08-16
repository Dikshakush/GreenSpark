import React from 'react';
import './DashBoard.css'; 

const StatsCards = ({ totalPoints, co2Saved, earnedBadges = [], theme }) => {
  const stats = [
    { title: 'Total Points 🌟', value: totalPoints },
    { title: 'CO₂ Saved 🌍', value: `${Number(co2Saved || 0).toFixed(2)} kg` },
    {
      title: 'Badges 🏅',
      value: earnedBadges.length > 0 ? `${earnedBadges.length} unlocked` : 'No badges yet',
      progress: Math.min((earnedBadges.length / 3) * 100, 100),
    },
  ];

  return (
    <div className="row justify-content-center mb-5">
      {stats.map((stat, idx) => (
        <div key={idx} className="col-md-4 mb-4">
          <div
            className={`glass-card stats-card text-center ${
              theme === 'dark' ? 'glass-dark' : 'glass-light'
            }`}
          >
            <div className="card-body">
              <h5 className="card-title fs-5 fw-semibold">{stat.title}</h5>
              <p
                className={`card-text fs-3 mb-2 ${
                  idx === 2 ? 'pulse text-warning' : 'fw-bold text-primary'
                }`}
              >
                {stat.value}
              </p>

              {stat.progress !== undefined && (
                <div className="progress mt-3 rounded-pill" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-success rounded-pill"
                    role="progressbar"
                    style={{ width: `${stat.progress}%` }}
                    aria-valuenow={stat.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
