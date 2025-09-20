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

//  login route to set cookie
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Call loginUser controller logic
    const user = await loginUser(req, res);

    // If login failed, loginUser should already handle response
    if (!user) return;

    // Create JWT token 
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Set token as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only HTTPS in production
      sameSite: 'None', // allow cross-origin if frontend is on different domain
    });

    // Return success response (without breaking existing frontend expectations)
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/profile', protect, getUserProfile);

// OTP-based Password Reset Routes
router.post('/send-otp', sendOTP);         
router.post('/verify-otp', verifyOTP);     
router.post('/reset-password', resetPasswordWithOTP); 

// Get User Streak
router.get('/streak', protect, getUserStreak);

// Get User Points
router.get('/points', protect, getUserPoints);

// Update User Points
router.post('/points', protect, updateUserPoints);

module.exports = router;
