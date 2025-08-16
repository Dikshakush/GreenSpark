const mongoose = require("mongoose");

const spinHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  spinsToday: { type: Number, default: 0 },
  lastSpinAt: { type: Date, default: null },
  date: { type: String, required: true } // e.g., '2025-08-14' to track daily spins
});

module.exports = mongoose.model("SpinHistory", spinHistorySchema);
