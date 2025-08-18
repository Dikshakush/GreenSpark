const Goal = require('../models/Goal');
const Trivia = require('../models/Trivia');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Badge = require('../models/Badge');
const Pledge = require('../models/Pledge');
const EcoJourney = require('../models/EcoJourney'); 

// @desc    Get all challenges
// @route   GET /api/eco-journey/challenges
// @access  Private
exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user's eco journey data
// @route   GET /api/eco-journey
// @access  Private
exports.getJourney = async (req, res) => {
  try {
    let journey = await EcoJourney.findOne({ user: req.user._id }).populate('goals trivia pledges');
    
    // Create EcoJourney for new users
    if (!journey) {
      journey = await EcoJourney.create({ user: req.user._id });
    }

    res.json({
      goals: journey.goals,
      challenges: journey.challenges.slice(0, 3),
      currentTrivia: journey.trivia.find(t => !t.answered) || null,
      points: journey.points || 0,
      streak: journey.streak || 0,
      earnedBadges: req.user.earnedBadges || [],
      pledges: journey.pledges || [],
      unlockedLocations: journey.unlockedLocations || ['Home'],
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
    console.log("➡️ Add Goal request body:", req.body);
    console.log("➡️ Current user:", req.user ? req.user._id : "No user in req");

    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    // Find or create EcoJourney for this user
    let journey = await EcoJourney.findOne({ user: req.user._id });
    if (!journey) {
      console.log("ℹ️ No EcoJourney found, creating a new one...");
      journey = await EcoJourney.create({ user: req.user._id, goals: [] });
    }

    // Create embedded goal (inside EcoJourney)
    const newGoal = {
      title: description,
      description,
      completed: false,
      points: 10, // default points (can be adjusted)
    };

    journey.goals.push(newGoal);
    await journey.save();

    // return the new goal (last one added)
    res.status(201).json(journey.goals[journey.goals.length - 1]);
  } catch (error) {
    console.error("❌ Error in addGoal:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//@desc    Toggle goal completion
// @route   POST /api/eco-journey/goals/:goalId/toggle
// @access  Private
exports.toggleGoal = async (req, res) => {
  try {
    const journey = await EcoJourney.findOne({ user: req.user._id });
    if (!journey) return res.status(404).json({ message: 'Journey not found' });

    const goal = journey.goals.id(req.params.goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    goal.completed = !goal.completed;

    // Update EcoJourney points if completed
    if (goal.completed) {
      journey.points += goal.points;
    } else {
      journey.points -= goal.points;
    }

    await journey.save();

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

    const journey = await EcoJourney.findOne({ user: req.user._id });
    if (journey.challenges.includes(challengeId)) return res.status(400).json({ message: 'Challenge already completed' });

    // Update points and challenges
    journey.points += challenge.points;
    journey.challenges.push(challengeId);

    // Update streak
    journey.streak += 1;

    // Assign badges
    const user = await User.findById(req.user._id).populate('earnedBadges');
    const badges = await Badge.find({
      pointsRequired: { $lte: journey.points },
      _id: { $nin: user.earnedBadges }
    });
    if (badges.length > 0) user.earnedBadges.push(...badges.map(b => b._id));

    await journey.save();
    await user.save();

    res.json({
      points: journey.points,
      streak: journey.streak,
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
    const journey = await EcoJourney.findOne({ user: req.user._id });
    if (!journey) return res.status(404).json({ message: 'Journey not found' });

    // Find first unanswered trivia
    const nextTrivia = journey.trivia.find(t => !t.answered) || null;

    res.json({ nextTrivia });
  } catch (error) {
    console.error("❌ Error in nextTrivia:", error);
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

    const journey = await EcoJourney.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id).populate('earnedBadges');

    let pointsEarned = 0;
    if (answer === trivia.correctAnswer) {
      pointsEarned = trivia.points;
      journey.points += pointsEarned;
      journey.trivia = journey.trivia.map(t =>
        t._id.toString() === trivia._id.toString() ? { ...t._doc, answered: true } : t
      );
      journey.streak += 1;

      // Assign badges
      const badges = await Badge.find({
        pointsRequired: { $lte: journey.points },
        _id: { $nin: user.earnedBadges }
      });
      if (badges.length > 0) user.earnedBadges.push(...badges.map(b => b._id));
      await user.save();
    }

    await journey.save();

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

// @desc    Add a pledge
// @route   POST /api/eco-journey/pledges
// @access  Private
exports.addPledge = async (req, res) => {
  try {
    const pledge = await Pledge.create({
      text: req.body.text,
      user: req.user.name,
      userId: req.user._id,
    });

    // Add pledge to EcoJourney
    const journey = await EcoJourney.findOne({ user: req.user._id });
    journey.pledges.push({ text: pledge.text, completed: false });
    await journey.save();

    res.status(201).json(pledge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Increment streak
// @route   POST /api/eco-journey/streak/increment
// @access  Private
exports.incrementStreak = async (req, res) => {
  try {
    const journey = await EcoJourney.findOne({ user: req.user._id });
    journey.streak += 1;
    await journey.save();

    res.json({ streak: journey.streak });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
