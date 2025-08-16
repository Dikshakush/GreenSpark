const EcoAction = require('../models/ecoActionModel.js');
const User = require('../models/User.js');
const ChallengeBadge = require('../models/badgeModel.js');

// 📌 Log a new eco action (proof already uploaded in route)
const logEcoAction = async (req, res) => {
  const { actionType, proofUrl } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  const pointsMap = {
    recycling: 10,
    biking: 15,
    planting: 20,
    carpooling: 10,
    cleanup: 25,
  };

  const pointsEarned = pointsMap[actionType];
  if (!pointsEarned) {
    return res.status(400).json({ message: 'Invalid action type' });
  }

  if (!proofUrl) {
    return res.status(400).json({ message: 'Proof image URL is required' });
  }

  try {
    // 1️⃣ Create eco action record (no upload here)
    const action = await EcoAction.create({
      user: userId,
      actionType,
      pointsEarned,
      proofUrl, // already from Cloudinary
      status: 'pending',
    });

    // 2️⃣ Update user points and assign badges
    const user = await User.findById(userId).populate('earnedBadges');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.totalPoints += pointsEarned;

    const badgeRules = await ChallengeBadge.find({});
    const allActions = await EcoAction.find({ user: userId });

    const actionCounts = allActions.reduce((acc, curr) => {
      acc[curr.actionType] = (acc[curr.actionType] || 0) + 1;
      return acc;
    }, {});

    const alreadyEarnedIds = user.earnedBadges.map(b => b._id.toString());
    const newBadges = badgeRules.filter(
      rule =>
        actionCounts[rule.type] >= rule.threshold &&
        !alreadyEarnedIds.includes(rule._id.toString())
    );

    if (newBadges.length > 0) {
      user.earnedBadges.push(...newBadges.map(b => b._id));
    }

    await user.save();

    res.status(201).json({
      message: 'Action logged successfully',
      action,
      newBadges,
      totalPoints: user.totalPoints,
    });

  } catch (error) {
    console.error('Error logging action:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// 📌 Get all eco actions for the logged-in user
const getEcoActions = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const actions = await EcoAction.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json(actions);
  } catch (error) {
    console.error('Error fetching eco actions:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  logEcoAction,
  getEcoActions
};
