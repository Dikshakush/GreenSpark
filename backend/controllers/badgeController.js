const ChallengeBadge = require('../models/badgeModel');
const User = require('../models/User');

// @desc Get all badge rules
// @route GET /api/badges
// @access Public
const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({});
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch badge rules' });
  }
};

// @desc Unlock badges based on user's eco actions
// @route POST /api/badges/unlock
// @access Private
const unlockBadges = async (req, res) => {
  try {
    const { userId, ecoActions } = req.body;

    const user = await User.findById(userId).populate('earnedBadges');
    const badges = await Badge.find({});

    const actionCounts = ecoActions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {});

    const alreadyEarnedIds = user.earnedBadges.map(b => b._id.toString());

    const newBadges = badges.filter(badge =>
      actionCounts[badge.type] >= badge.threshold &&
      !alreadyEarnedIds.includes(badge._id.toString())
    );

    if (newBadges.length > 0) {
      user.earnedBadges.push(...newBadges.map(b => b._id));
      await user.save();
    }

    res.json({
      message: newBadges.length > 0 ? 'New badge(s) unlocked!' : 'No new badges unlocked.',
      newBadges,
      earnedBadges: user.earnedBadges,
    });
  } catch (error) {
    console.error('Error unlocking badges:', error);
    res.status(500).json({ message: 'Failed to unlock badges' });
  }
};

module.exports = {
  getAllBadges,
  unlockBadges,
};
