// backend/models/ecoTipModel.js
const mongoose = require('mongoose');

const ecoTipSchema = new mongoose.Schema(
  {
    text: { type: String, required: true }, // The actual tip
    category: { type: String, enum: ['recycling', 'energy', 'water', 'transport', 'general'], default: 'general' }, // Optional
    source: { type: String }, // Optional: where the tip comes from
  },
  { timestamps: true }
);

module.exports = mongoose.model('EcoTip', ecoTipSchema);
