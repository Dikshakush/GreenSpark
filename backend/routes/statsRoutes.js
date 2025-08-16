const express = require('express');
const router = express.Router();
const { getUserStats } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware'); // for auth

router.get('/', protect, getUserStats);

module.exports = router;
