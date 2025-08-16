const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  category: { type: String, required: true },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // track users who completed it
});

module.exports = mongoose.model('Challenge', challengeSchema);
