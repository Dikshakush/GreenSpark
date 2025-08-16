import React from 'react';

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <div className="theme-switch" onClick={toggleTheme} role="button" aria-label="Toggle Theme">
      <div className={`switch-slider ${theme === 'dark' ? 'dark' : 'light'}`}>
        {theme === 'dark' ? '🌙' : '☀️'}
      </div>
    </div>
  );
};

export default ThemeToggle;
