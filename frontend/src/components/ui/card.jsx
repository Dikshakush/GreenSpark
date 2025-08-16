
// frontend/src/components/ui/card.jsx
import React from "react";
import "./card.css"; // Optional CSS styling

export const Card = ({ children, className = "" }) => {
  return (
    <div className={`custom-card ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = "" }) => {
  return (
    <div className={`custom-card-content ${className}`}>
      {children}
    </div>
  );
};
