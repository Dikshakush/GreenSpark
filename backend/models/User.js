const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },

  // Existing badges from achievements/goals
  earnedBadges: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
    }
  ],

  // Spin wheel badges or prizes (simple strings)
  badges: [
    {
      type: String
    }
  ],

  // Reset token fields
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },

  // OTP-based reset fields
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  otpVerified: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
