const express = require("express");
const { logEcoAction, getEcoActions } = require("../controllers/ecoActionController.js");
const { protect } = require("../middleware/authMiddleware.js");
const uploadProof = require("../middleware/uploadProof.js");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const router = express.Router();

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📌 Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// 📌 POST - Log Eco Action (upload once, then pass URL to controller)
router.post("/", protect, uploadProof.single("proofImage"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Proof image file is required" });
    }

    // 1️⃣ Upload proof to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "greenspark/proofs");

    // 2️⃣ Attach Cloudinary details to req.body
    req.body.proofUrl = result.secure_url;
    req.body.status = "pending";

    // 3️⃣ Pass to controller without re-uploading
    return logEcoAction(req, res);
  } catch (err) {
    console.error("Error in ecoActionRoutes POST:", err);
    res.status(500).json({
      message: "Error logging eco action",
      error: err.message,
    });
  }
});

// 📌 GET - Fetch Eco Actions
router.get("/", protect, getEcoActions);

module.exports = router;
