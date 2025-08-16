const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    threshold: { type: Number, required: true },
    type: { type: String, required: true }, // e.g., 'recycle', 'bike', 'energy'
  },
  { timestamps: true }
);

// Changed model name to avoid conflict
module.exports = mongoose.models.ChallengeBadge || mongoose.model('ChallengeBadge', badgeSchema);
