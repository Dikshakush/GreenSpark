const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  pointsRequired: { type: Number, required: true },
  challengeRequired: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }
});

module.exports = mongoose.models.Badge || mongoose.model('Badge', badgeSchema);
