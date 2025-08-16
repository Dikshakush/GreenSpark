const EcoAction = require('../models/ecoActionModel');
const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
  try {
    const { period = "all" } = req.query;

    // Filter by date range
    let matchStage = {};
    const now = new Date();

    if (period === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      matchStage = { createdAt: { $gte: startOfWeek } };
    } else if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      matchStage = { createdAt: { $gte: startOfMonth } };
    }

    // Get top users by points (modified to use points instead of action count)
    const leaderboard = await User.aggregate([
      { $match: { totalPoints: { $gt: 0 } } }, 
      { $sort: { totalPoints: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          name: 1,
          points: "$totalPoints",
         badgesCount: { $size: { $ifNull: ["$earnedBadges", []] } }

        }
      }
    ]);

    res.json({
      success: true,
      period,
      leaderboard
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};