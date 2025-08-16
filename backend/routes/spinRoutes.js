const express = require("express");
const { spinWheel, getSpinStatus } = require("../controllers/spinController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, spinWheel);
router.get("/status", protect, getSpinStatus);

module.exports = router;