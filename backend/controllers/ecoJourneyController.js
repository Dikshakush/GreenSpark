const Goal = require('../models/Goal');
const Trivia = require('../models/Trivia');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Badge = require('../models/Badge');

// @desc    Get user's eco journey data
// @route   GET /api/eco-journey
// @access  Private
exports.getJourney = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    const challenges = await Challenge.find();
    const trivia = await Trivia.findOne().sort({ createdAt: -1 });
    const user = await User.findById(req.user._id).populate('earnedBadges');

    res.json({
      goals,
      challenges: challenges.slice(0, 3),
      currentTrivia: trivia,
      points: user.points || 0,
      streak: user.streak?.count || 0,
      earnedBadges: user.earnedBadges || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a new goal
// @route   POST /api/eco-journey/goals
// @access  Private
exports.addGoal = async (req, res) => {
  try {
    const { description, type } = req.body;
    
    const goal = new Goal({
      user: req.user._id,
      description,
      type
    });
    
    await goal.save();
    
    await User.findByIdAndUpdate(req.user._id, {
      $push: { goals: goal._id }
    });
    
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle goal completion
// @route   POST /api/eco-journey/goals/:goalId/toggle
// @access  Private
exports.toggleGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
    
    goal.completed = !goal.completed;
    await goal.save();
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Complete a challenge
// @route   POST /api/eco-journey/challenges/complete
// @access  Private
exports.completeChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;
    const challenge = await Challenge.findById(challengeId);
    
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const user = await User.findById(req.user._id).populate('earnedBadges');
    if (user.completedChallenges.includes(challengeId)) return res.status(400).json({ message: 'Challenge already completed' });

    // Update points
    user.points += challenge.points;
    user.completedChallenges.push(challengeId);

    // Update streak
    await user.updateStreak();

    // Assign badges
    const badges = await Badge.find({
      pointsRequired: { $lte: user.points },
      _id: { $nin: user.earnedBadges }
    });
    if (badges.length > 0) {
      user.earnedBadges.push(...badges.map(b => b._id));
    }

    await user.save();

    res.json({
      points: user.points,
      streak: user.streak.count,
      earnedBadges: badges
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get next trivia question
// @route   GET /api/eco-journey/trivia/next
// @access  Private
exports.nextTrivia = async (req, res) => {
  try {
    const count = await Trivia.countDocuments();
    const random = Math.floor(Math.random() * count);
    const trivia = await Trivia.findOne().skip(random);
    
    res.json(trivia);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Answer trivia question
// @route   POST /api/eco-journey/trivia/:triviaId
// @access  Private
exports.answerTrivia = async (req, res) => {
  try {
    const { answer } = req.body;
    const trivia = await Trivia.findById(req.params.triviaId);
    if (!trivia) return res.status(404).json({ message: 'Trivia not found' });

    const user = await User.findById(req.user._id).populate('earnedBadges');
    let pointsEarned = 0;

    if (answer === trivia.correctAnswer) {
      pointsEarned = trivia.points;
      user.points += pointsEarned;
      await user.updateStreak();

      // Assign badges
      const badges = await Badge.find({
        pointsRequired: { $lte: user.points },
        _id: { $nin: user.earnedBadges }
      });
      if (badges.length > 0) user.earnedBadges.push(...badges.map(b => b._id));
      await user.save();
    }

    // Next trivia
    const nextTrivia = await Trivia.findOne({ _id: { $ne: trivia._id } }).sort({ createdAt: -1 });

    res.json({
      correct: answer === trivia.correctAnswer,
      pointsEarned,
      nextTrivia
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Increment streak
// @route   POST /api/eco-journey/streak/increment
// @access  Private
exports.incrementStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await user.updateStreak();
    await user.save();

    res.json({ streak: user.streak.count });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.addPledge = async (req, res) => {
  try {
    const pledge = await Pledge.create({
      text: req.body.text,
      user: req.user.name,
      userId: req.user._id,
    });
    res.status(201).json(pledge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
