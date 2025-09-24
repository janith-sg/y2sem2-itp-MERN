const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Employees = require("../models/employee");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, Date.now() + "-" + base + ext);
  },
});

// Only allow images
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ---------------- POST: Add Employee ----------------
router.post("/", upload.single("image"), (req, res) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  let pets = [];
  if (req.body.pets) {
    try {
      pets = JSON.parse(req.body.pets); // Expect pets as JSON string
    } catch (e) {
      return res.status(400).json({ msg: "Invalid pets format" });
    }
  }

  Employees.create({
    employeeID: req.body.employeeID,
    name: req.body.name,
    address: req.body.address,
    nic: req.body.nic,
    mobile: req.body.mobile, // ✅ Added mobile
    image: imageUrl,
    pets: pets,
  })
    .then(() => res.json({ msg: "Employee added successfully" }))
    .catch((err) => {
      console.error(err);
      res.status(400).json({ msg: "Employee adding failed" });
    });
});

// ---------------- GET: All Employees ----------------
router.get("/", (req, res) => {
  Employees.find()
    .then((employees) => res.json(employees))
    .catch(() => res.status(400).json({ msg: "No employees found" }));
});

// ---------------- GET: Employee by ID ----------------
router.get("/:id", (req, res) => {
  Employees.findById(req.params.id)
    .then((employee) => res.json(employee))
    .catch(() => res.status(400).json({ msg: "Cannot find this employee" }));
});

// ---------------- PUT: Update Employee ----------------
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      employeeID: req.body.employeeID,
      name: req.body.name,
      address: req.body.address,
      nic: req.body.nic,
      mobile: req.body.mobile, // ✅ Added mobile
    };

    if (req.body.pets) {
      try {
        updateData.pets = JSON.parse(req.body.pets);
      } catch (e) {
        return res.status(400).json({ msg: "Invalid pets format" });
      }
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await Employees.findByIdAndUpdate(req.params.id, updateData);
    res.json({ msg: "Update Successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Update failed" });
  }
});

// ---------------- DELETE: Remove Employee ----------------
router.delete("/:id", (req, res) => {
  Employees.findByIdAndDelete(req.params.id)
    .then(() => res.json({ msg: "Deleted successfully" }))
    .catch(() => res.status(400).json({ msg: "Cannot delete employee" }));
});

module.exports = router;
