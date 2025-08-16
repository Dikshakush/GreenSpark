const express = require('express');
const router = express.Router();
const { getUserProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserProgress);

module.exports = router;
