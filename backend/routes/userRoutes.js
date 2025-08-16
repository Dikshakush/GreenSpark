const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  sendOTP,
  verifyOTP,
  resetPasswordWithOTP,
  getUserStreak,
  getUserPoints,
  updateUserPoints
} = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');
const User = require('../models/User.js');

const router = express.Router();

// Auth Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// OTP-based Password Reset Routes
router.post('/send-otp', sendOTP);         // Body: { email }
router.post('/verify-otp', verifyOTP);     // Body: { email, otp }
router.post('/reset-password', resetPasswordWithOTP); // Body: { email, newPassword, confirmPassword }

// Get User Streak
router.get('/streak', protect, getUserStreak);

// Get User Points
router.get('/points', protect, getUserPoints);

// Update User Points
router.post('/points', protect, updateUserPoints);

module.exports = router;
