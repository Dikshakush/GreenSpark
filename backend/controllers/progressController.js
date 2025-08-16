// controllers/progressController.js
const EcoAction = require('../models/ecoActionModel'); // assuming you have one

// @desc    Get user's progress over time
// @route   GET /api/progress
// @access  Private
exports.getUserProgress = async (req, res) => {
  try {
    // Group points earned by date
    const progress = await EcoAction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalPoints: { $sum: "$pointsEarned" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format into [{date, points}]
    const formatted = progress.map(item => ({
      date: item._id,
      points: item.totalPoints
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching progress data' });
  }
};
