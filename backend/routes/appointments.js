const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment");

// @route   GET /api/appointments
// @desc    Get all appointments or filter by user
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { userId, userEmail, role } = req.query;
    
    let filter = {};
    
    // If not admin, filter by user's appointments
    if (role !== 'admin' && (userId || userEmail)) {
      filter = {
        $or: [
          { ownerId: userId },
          { ownerId: userEmail },
          { ownerEmail: userEmail }
        ]
      };
    }
    
    const appointments = await Appointment.find(filter).sort({ appointmentDate: 1, appointmentTime: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointment",
      error: error.message
    });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Public
router.post("/", async (req, res) => {
  try {
    const {
      petName,
      petType,
      petBreed,
      petAge,
      petId,
      petOwnerName,
      ownerId,
      ownerEmail,
      ownerPhone,
      appointmentDate,
      appointmentTime,
      serviceType,
      veterinarian,
      symptoms,
      notes
    } = req.body;

    // Validate required fields
    if (!petName || !petType || !petOwnerName || !ownerId || !ownerEmail || !appointmentDate || !appointmentTime || !serviceType || !veterinarian) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Check for appointment conflicts
    const conflictingAppointment = await Appointment.findOne({
      appointmentDate: new Date(appointmentDate),
      appointmentTime: appointmentTime,
      veterinarian: veterinarian,
      status: { $ne: 'Cancelled' }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: `Time slot already booked! Dr. ${veterinarian} has an appointment at ${appointmentTime} on ${appointmentDate}.`
      });
    }

    // Create new appointment
    const appointment = new Appointment({
      petName,
      petType,
      petBreed,
      petAge,
      petId,
      petOwnerName,
      ownerId,
      ownerEmail,
      ownerPhone,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      serviceType,
      veterinarian,
      symptoms: symptoms || "",
      notes: notes || ""
    });

    const savedAppointment = await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: savedAppointment
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating appointment",
      error: error.message
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Public
router.put("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Check for conflicts if date/time/vet is being changed
    if (req.body.appointmentDate || req.body.appointmentTime || req.body.veterinarian) {
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id },
        appointmentDate: new Date(req.body.appointmentDate || appointment.appointmentDate),
        appointmentTime: req.body.appointmentTime || appointment.appointmentTime,
        veterinarian: req.body.veterinarian || appointment.veterinarian,
        status: { $ne: 'Cancelled' }
      });

      if (conflictingAppointment) {
        return res.status(400).json({
          success: false,
          message: "Time slot already booked with another appointment."
        });
      }
    }

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        appointmentDate: req.body.appointmentDate ? new Date(req.body.appointmentDate) : appointment.appointmentDate,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment",
      error: error.message
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Public
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting appointment",
      error: error.message
    });
  }
});

// @route   GET /api/appointments/search/:query
// @desc    Search appointments
// @access  Public
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const { userId, userEmail, role } = req.query;
    
    let searchFilter = {
      $or: [
        { appointmentId: { $regex: query, $options: 'i' } },
        { petName: { $regex: query, $options: 'i' } },
        { petOwnerName: { $regex: query, $options: 'i' } },
        { serviceType: { $regex: query, $options: 'i' } },
        { veterinarian: { $regex: query, $options: 'i' } },
        { status: { $regex: query, $options: 'i' } }
      ]
    };

    // If not admin, also filter by user
    if (role !== 'admin' && (userId || userEmail)) {
      searchFilter = {
        $and: [
          searchFilter,
          {
            $or: [
              { ownerId: userId },
              { ownerId: userEmail },
              { ownerEmail: userEmail }
            ]
          }
        ]
      };
    }
    
    const appointments = await Appointment.find(searchFilter).sort({ appointmentDate: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error("Error searching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error searching appointments",
      error: error.message
    });
  }
});

// @route   PATCH /api/appointments/:id/status
// @desc    Update appointment status
// @access  Public
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Scheduled', 'In-Progress', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided"
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: appointment
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment status",
      error: error.message
    });
  }
});

module.exports = router;