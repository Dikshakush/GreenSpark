const express = require ( 'express' );
const asyncHandler = require ('express-async-handler');
const Badge = require ( '../models/Badge.js' );
const User = require ('../models/User.js');
const { protect } = require ('../middleware/authMiddleware.js');

const router = express.Router();

// @desc    Get all badge rules
// @route   GET /api/badges
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const badges = await Badge.find({});
    res.json(badges);
  })
);

// @desc    Add earned badge for user
// @route   POST /api/badges/earn
// @access  Private
router.post(
  '/earn',
  protect,
  asyncHandler(async (req, res) => {
    const { badgeId } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!user.earnedBadges.includes(badgeId)) {
      user.earnedBadges.push(badgeId);
      await user.save();
    }

    res.json({ message: 'Badge added to user', earnedBadges: user.earnedBadges });
  })
);

module.exports = router; 

