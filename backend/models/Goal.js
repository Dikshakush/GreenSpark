const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['short', 'long'], default: 'short' },
  completed: { type: Boolean, default: false },
  points: { type: Number, default: 10 }, // points awarded when goal is completed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);
