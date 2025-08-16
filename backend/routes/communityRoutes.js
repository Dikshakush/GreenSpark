const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const uploadProof = require("../middleware/uploadProof");
const CommunityPost = require("../models/communityPostModel");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const router = express.Router();

// 🔹 Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload to Cloudinary as a Promise
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// 🔹 GET all posts
router.get("/", protect, async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 POST create new post with optional image
router.post("/", protect, uploadProof.single("image"), async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "greenspark/community_posts"
      );
      imageUrl = result.secure_url;
    }

    const post = await CommunityPost.create({
      user: req.user.name,
      caption: req.body.caption,
      image: imageUrl || undefined,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 POST add comment
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = {
      user: req.user.name,
      text: req.body.text,
    };

    post.comments.push(comment);
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
