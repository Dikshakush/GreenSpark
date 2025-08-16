// backend/middleware/uploadProof.js
const multer = require("multer");
const path = require("path");

// Storage in memory (we'll upload to Cloudinary later)
const storage = multer.memoryStorage();

// File filter - only allow JPEG and PNG images
const fileFilter = (req, file, cb) => {
  if (!file) return cb(null, true); // allow empty file (optional uploads)
  
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, JPG, PNG) are allowed!"));
  }
};

// Multer instance - flexible for any route
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
