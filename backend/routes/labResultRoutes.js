const express = require("express");
const router = express.Router();

// Insert controller
const labResultController = require("../Controllers/labResultController");

// Routes
router.get("/", labResultController.getAllLabResults); // Get all lab results
router.post("/", labResultController.addLabResult); // Add a new lab result
router.get("/:id", labResultController.getLabResultById); // Get lab result by ID
router.put("/:id", labResultController.updateLabResult); // Update lab result by ID
router.delete("/:id", labResultController.deleteLabResult); // Delete lab result by ID

module.exports = router;
