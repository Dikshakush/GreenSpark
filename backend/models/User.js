const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },

  totalPoints: { type: Number, default: 0 }, // total accumulated points

  goals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal', // tracks all goals user added
    }
  ],

  completedChallenges: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge', // tracks completed challenges
    }
  ],

  completedTrivia: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trivia', // tracks answered trivia
    }
  ],

  streak: {
    count: { type: Number, default: 0 },
    lastUpdated: { type: Date },
  },

  earnedBadges: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' } // permanent badges
  ],

  spinBadges: [
    { type: String } // simple strings for spin wheel prizes
  ],

  // Reset token & OTP fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otp: String,
  otpExpires: Date,
  otpVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Method to update streak automatically
userSchema.methods.updateStreak = function () {
  const today = new Date();
  if (!this.streak.lastUpdated || (today - this.streak.lastUpdated) > 24*60*60*1000) {
    this.streak.count += 1;
    this.streak.lastUpdated = today;
  }
};

module.exports = mongoose.model('User', userSchema);
