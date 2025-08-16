// models/EcoJourney.js
const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const triviaSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
    answered: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const pledgeSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const ecoJourneySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    goals: [goalSchema],
    trivia: [triviaSchema],
    streak: { type: Number, default: 0 },
    challenges: [{ type: String }],
    pledges: [pledgeSchema],
    points: { type: Number, default: 0 },
    unlockedLocations: { type: [String], default: ["Home"] }, // ✅ fixed to array
    lastSpinAt: { type: Date, default: null }, // optional, for spin cooldowns
  },
  { timestamps: true }
);

module.exports = mongoose.model("EcoJourney", ecoJourneySchema);
