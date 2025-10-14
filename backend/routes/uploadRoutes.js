const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Ensure uploads dir exists
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Optional: basic file type allowlist
const allowed = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (_req, file, cb) => {
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Unsupported file type"));
    }
    cb(null, true);
  },
});

// POST /uploads/labresult  (field name: "file")
router.post("/labresult", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  // Public URL for the file we just saved:
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

module.exports = router;

