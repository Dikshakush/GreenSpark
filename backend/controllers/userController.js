const User = require('../models/User');
const EcoAction = require('../models/ecoActionModel');
const EcoJourney = require('../models/EcoJourney');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simulated email sender
const sendOTPEmail = async (email, otp) => {
  console.log(`📧 OTP email sent to ${email}: ${otp}`);
};

// JWT Token generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // ✅ Create default EcoJourney for new user (only if not exists)
    const existingJourney = await EcoJourney.findOne({ user: user._id });
    if (!existingJourney) {
      await EcoJourney.create({
        user: user._id,
        goals: [],
        trivia: [],
        challenges: [],
        pledges: [],
        points: 0,
        unlockedLocations: [],
        streak: 0,
        lastSpinAt: null
      });

    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

//////////////////////////////////////////////////////
// ✅ FORGOT PASSWORD (OTP FLOW)
//////////////////////////////////////////////////////

// Step 1: Send OTP to email
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.otpVerified = false;

    await user.save();
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 2: Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.otpVerified = true;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 3: Reset password after OTP verification
exports.resetPasswordWithOTP = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      otpVerified: true,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'OTP verification required or expired' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpVerified = false;

    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user streak
exports.getUserStreak = async (req, res) => {
  try {
    const actions = await EcoAction.find({ user: req.user._id }).sort({ createdAt: -1 });

    if (!actions.length) {
      return res.json({ streak: 0 });
    }

    let streak = 1;
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

    res.json({ streak });
  } catch (err) {
    console.error('Error calculating streak:', err);
    res.status(500).json({ message: 'Error calculating streak' });
  }
};
// ✅ Get user points
exports.getUserPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('totalPoints');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ points: user.totalPoints || 0 });
  } catch (error) {
    console.error("Error fetching points:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Update user points
exports.updateUserPoints = async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.totalPoints = points;
    await user.save();

    res.json({ points: user.totalPoints });
  } catch (error) {
    console.error("Error updating points:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
