const User = require('../models/User');
const Badge = require('../models/Badge');

// Possible rewards for spinning the wheel
const WHEEL_REWARDS = [
  { type: 'points', value: 5 },
  { type: 'points', value: 10 },
  { type: 'points', value: 15 },
  { type: 'points', value: 20 },
  { type: 'badge', value: 'Wheel Spinner' },
  { type: 'nothing', value: 0 }
];

// @desc    Spin the wheel
// @route   POST /api/spin
// @access  Private
exports.spinWheel = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Check if user can spin (e.g., once per day)
    const lastSpin = user.lastSpin || new Date(0);
    const today = new Date();
    
    if (lastSpin.toDateString() === today.toDateString()) {
      return res.status(400).json({ message: 'You can only spin once per day' });
    }
    
    // Spin the wheel
    const spinResult = WHEEL_REWARDS[Math.floor(Math.random() * WHEEL_REWARDS.length)];
    let badgeEarned = null;
    
    if (spinResult.type === 'points') {
      user.points += spinResult.value;
    } else if (spinResult.type === 'badge') {
      const badge = await Badge.findOne({ name: spinResult.value });
      if (badge && !user.earnedBadges.includes(badge._id)) {
        user.earnedBadges.push(badge._id);
        badgeEarned = badge;
      }
    }
    
    user.lastSpin = today;
    await user.save();
    
    res.json({
      points: user.points,
      prize: spinResult,
      badge: badgeEarned
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get spin status
// @route   GET /api/spin/status
// @access  Private
exports.getSpinStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date();
    const lastSpin = user.lastSpin || new Date(0);
    
    res.json({
      canSpin: lastSpin.toDateString() !== today.toDateString(),
      lastSpin: user.lastSpin
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};