import React from 'react';

const EcoActionsList = ({ actions, loading, theme }) => {
  return (
    <div className={`container p-4 rounded border ${theme === 'dark' ? 'bg-secondary bg-opacity-25 border-light' : 'bg-white border-dark'}`}>
      <h3 className={`mb-4 ${theme === 'dark' ? 'text-success' : 'text-primary'}`}>📜 Recent Eco Actions</h3>
      {loading ? (
        <p>Loading...</p>
      ) : actions.length === 0 ? (
        <p>You haven’t logged any actions yet. Start your eco journey!</p>
      ) : (
        <ul className="list-group">
          {actions.map((action) => (
            <li
              key={action._id}
              className={`list-group-item ${theme === 'dark' ? 'bg-dark text-white border-light' : 'bg-light text-dark border-dark'}`}
            >
              <div className="d-flex justify-content-between">
                <span className={`fw-semibold ${theme === 'dark' ? 'text-success' : 'text-primary'}`}>{action.actionType}</span>
                <span className="small">
                  {action.createdAt ? new Date(action.createdAt).toLocaleDateString() : 'No date'}
                </span>
              </div>
              <div className="small">Points Earned 🌱: {action.pointsEarned}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EcoActionsList;
