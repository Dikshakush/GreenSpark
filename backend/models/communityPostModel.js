const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const communityPostSchema = new mongoose.Schema({
  user: { type: String, required: true },
  caption: { type: String, required: true },
  image: { type: String }, // Cloudinary URL
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);

module.exports = CommunityPost;
