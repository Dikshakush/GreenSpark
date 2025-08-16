// routes/ecoTipsRoutes.js
const express = require('express');
const router = express.Router();
const { getEcoTip } = require('../controllers/ecoTipsController');

router.get('/', getEcoTip);

module.exports = router;
