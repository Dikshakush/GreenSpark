// controllers/ecoTipsController.js

const ecoTips = [
  { id: 1, tip: "Turn off lights when leaving a room to save energy." },
  { id: 2, tip: "Use reusable water bottles instead of single-use plastic." },
  { id: 3, tip: "Plant a tree to help absorb CO2 and provide shade." },
  { id: 4, tip: "Walk or cycle instead of driving short distances." },
  { id: 5, tip: "Compost food scraps to reduce landfill waste." },
  { id: 6, tip: "Reduce water use by turning off the tap while brushing teeth." },
  { id: 7, tip: "Support local farmers by buying locally produced food." },
  { id: 8, tip: "Unplug devices when not in use to prevent phantom energy drain." },
  { id: 9, tip: "Recycle paper, glass, and metal products properly." },
  { id: 10, tip: "Use public transport to reduce your carbon footprint." },
];

// Temporary in-memory storage for daily tips per user
const userDailyTips = {}; // { userId: { date: 'YYYY-MM-DD', tip: {...} } }

// @desc    Get a random eco-friendly tip (same tip for the whole day per user)
// @route   GET /api/ecotips
// @access  Public (or protect if per-user)
exports.getEcoTip = (req, res) => {
  const userId = req.user ? req.user._id.toString() : 'guest'; // handle logged-in or guest
  const today = new Date().toISOString().split('T')[0];

  // If the user already has a tip for today, return it
  if (userDailyTips[userId] && userDailyTips[userId].date === today) {
    return res.json(userDailyTips[userId].tip);
  }

  // Otherwise, pick a new random tip and store it
  const randomTip = ecoTips[Math.floor(Math.random() * ecoTips.length)];
  userDailyTips[userId] = { date: today, tip: randomTip };

  res.json(randomTip);
};
