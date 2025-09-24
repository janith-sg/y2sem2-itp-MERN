const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");

router.get("/", appointmentController.getAllAppointments);
router.post("/", appointmentController.addAppointment);
router.get("/:id", appointmentController.getById);
router.put("/:id", appointmentController.updateAppointment);
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;