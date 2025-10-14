const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Pet = require("../models/pet");

// ---------------------------
// Multer setup (file upload)
// ---------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 👇 absolute path use කරන්න
    cb(null, path.join(__dirname, "../uploads/pets"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_") // unique file name
    );
  },
});

const upload = multer({ storage: storage });

// ---------------------------
// CREATE Pet (with image upload)
// ---------------------------
router.post("/", upload.single("petImage"), async (req, res) => {
  try {
    const petData = req.body;

    if (req.file) {
      // 👇 save DB path as URL (not OS path)
      petData.petImage = `/uploads/pets/${req.file.filename}`;
    }

    const newPet = new Pet(petData);
    await newPet.save();
    res.status(201).json({ message: "Pet added successfully!", pet: newPet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------------
// GET all Pets
// ---------------------------
router.get("/", async (req, res) => {
  try {
    const pets = await Pet.find();
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------
// GET Pet by ID
// ---------------------------
router.get("/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------
// UPDATE Pet (with optional image upload)
// ---------------------------
router.put("/:id", upload.single("petImage"), async (req, res) => {
  try {
    const updateData = req.body;

    if (req.file) {
      updateData.petImage = `/uploads/pets/${req.file.filename}`;
    }

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPet) return res.status(404).json({ message: "Pet not found" });
    res
      .status(200)
      .json({ message: "Pet updated successfully!", pet: updatedPet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------------------------
// DELETE Pet
// ---------------------------
router.delete("/:id", async (req, res) => {
  try {
    const deletedPet = await Pet.findByIdAndDelete(req.params.id);
    if (!deletedPet) return res.status(404).json({ message: "Pet not found" });
    res.status(200).json({ message: "Pet deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
