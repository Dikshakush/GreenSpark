// backend/controllers/statsController.js
const EcoAction = require('../models/ecoActionModel');
const User = require('../models/User');
const Badge = require('../models/Badge');

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Date boundaries
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user
    const user = await User.findById(userId).populate("earnedBadges");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Total actions
    const totalActions = await EcoAction.countDocuments({ user: userId });

    // This week
    const weeklyActions = await EcoAction.countDocuments({
      user: userId,
      createdAt: { $gte: startOfWeek }
    });

    // This month
    const monthlyActions = await EcoAction.countDocuments({
      user: userId,
      createdAt: { $gte: startOfMonth }
    });

    // Streak calculation
    const actions = await EcoAction.find({ user: userId }).sort({ createdAt: -1 });
    let streak = 0;
    if (actions.length) {
      streak = 1;
      let lastDate = new Date(actions[0].createdAt).setHours(0, 0, 0, 0);

      for (let i = 1; i < actions.length; i++) {
        const actionDate = new Date(actions[i].createdAt).setHours(0, 0, 0, 0);
        const diffDays = (lastDate - actionDate) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          streak++;
          lastDate = actionDate;
        } else if (diffDays > 1) {
          break;
        }
      }
    }

    // Category breakdown (use actionType instead of category if needed)
    const categoryBreakdownRaw = await EcoAction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$actionType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoryBreakdown = {};
    const categoryPercentages = {};
    categoryBreakdownRaw.forEach(item => {
      categoryBreakdown[item._id] = item.count;
      categoryPercentages[item._id] = totalActions
        ? ((item.count / totalActions) * 100).toFixed(1)
        : 0;
    });

    // Most active day
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayStats = await EcoAction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    let mostActiveDay = null;
    if (dayStats.length > 0) {
      const topDayIndex = dayStats[0]._id - 1;
      mostActiveDay = daysOfWeek[topDayIndex];
    }

    // Level calculation (example: 100 points per level)
    const level = Math.floor(user.totalPoints / 100);

    res.json({
      totalPoints: user.totalPoints || 0,
      level,
      badgesEarned: user.earnedBadges.length,
      badgeDetails: user.earnedBadges,
      totalActions,
      weeklyActions,
      monthlyActions,
      currentStreak: streak,
      categoryBreakdown,
      categoryPercentages,
      mostActiveDay
    });

  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
