const express = require("express");
const router = express.Router();

// Insert controller
const prescriptionController = require("../Controllers/prescriptionController");

// Routes
router.get("/", prescriptionController.getAllPrescriptions); // Get all prescriptions
router.post("/", prescriptionController.addPrescription); // Add a new prescription
router.get("/:id", prescriptionController.getPrescriptionById); // Get prescription by ID
router.put("/:id", prescriptionController.updatePrescription); // Update prescription by ID
router.delete("/:id", prescriptionController.deletePrescription); // Delete prescription by ID

module.exports = router;
