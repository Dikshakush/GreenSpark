// src/context/PointsProvider.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { PointsContext } from "./PointsContext";

export const PointsProvider = ({ children }) => {
  const [points, setPoints] = useState(0);

  // Helper: Get token from localStorage
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return token
      ? {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      : {};
  };

  // Fetch points when component mounts
  useEffect(() => {
    axios
      .get("https://greenspark-backend-yuw8.onrender.com/api/users/points", getAuthConfig())
      .then((res) => setPoints(res.data.points || 0))
      .catch((err) => {
        console.error("Could not load points:", err.response?.data || err);
      });
  }, []);

  // Update points both locally and in backend
  const updatePoints = (newPoints) => {
    setPoints(newPoints);
    axios
      .post("https://greenspark-backend-yuw8.onrender.com/api/users/points", { points: newPoints }, getAuthConfig())
      .catch((err) => {
        console.error("Could not update points:", err.response?.data || err);
      });
  };

  return (
    <PointsContext.Provider value={{ points, updatePoints }}>
      {children}
    </PointsContext.Provider>
  );
};
