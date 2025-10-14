const express = require("express");
const router = express.Router();

// Insert controller
const vaccinationController = require("../Controllers/vaccinationController");

// Routes
router.get("/", vaccinationController.getAllVaccinations); // Get all vaccinations
router.post("/", vaccinationController.addVaccination); // Add a new vaccination
router.get("/:id", vaccinationController.getVaccinationById); // Get vaccination by ID
router.put("/:id", vaccinationController.updateVaccination); // Update vaccination by ID
router.delete("/:id", vaccinationController.deleteVaccination); // Delete vaccination by ID

module.exports = router;


