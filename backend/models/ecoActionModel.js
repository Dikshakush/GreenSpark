// backend/models/ecoActionModel.js
const mongoose = require('mongoose');

const ecoActionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actionType: { 
      type: String, 
      enum: ['recycling', 'biking', 'planting', 'carpooling', 'cleanup'],
      required: true 
    },
    notes: { type: String },
    proofUrl: { type: String, required: true }, // Cloudinary URL 
    lat: { type: Number },
    lng: { type: Number },
    pointsEarned: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EcoAction', ecoActionSchema);
