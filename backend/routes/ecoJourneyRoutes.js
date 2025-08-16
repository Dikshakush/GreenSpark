const express = require("express");
const router = express.Router();
const {
  getJourney,
  addGoal,
  toggleGoal,
  answerTrivia,
  incrementStreak,
  completeChallenge,
  nextTrivia,
} = require("../controllers/ecoJourneyController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getJourney);
router.get("/trivia/next", protect, nextTrivia);
router.post("/goals", protect, addGoal);
router.post("/goals/:goalId/toggle", protect, toggleGoal);
router.post("/trivia/:triviaId", protect, answerTrivia);
router.post("/streak", protect, incrementStreak);
router.post("/challenges/complete", protect, completeChallenge);



module.exports = router;