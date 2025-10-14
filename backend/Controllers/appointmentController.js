const Appointment = require("../models/appointment");

const getAllAppointments = async (req, res, next) => {
  let appointments;
  try {
    appointments = await Appointment.find();
  } catch (err) {
    console.log(err);
  }

  if (!appointments) {
    return res.status(404).json({ message: "Appointments not found" });
  }
  return res.status(200).json({ appointments });
};

const addAppointment = async (req, res, next) => {
  const {
    ownerName,
    contactNo,
    email,
    address,
    petName,
    species,
    breed,
    age,
    appointmentDate,
    appointmentTime,
    reason,
    petImage,
    session,
    doctorName
  } = req.body;

  let appointment;
  try {
    appointment = new Appointment({
      ownerName,
      contactNo,
      email,
      address,
      petName,
      species,
      breed,
      age,
      appointmentDate,
      appointmentTime,
      reason,
      petImage,
      session,
      doctorName
    });
    await appointment.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error during creation" });
  }

  if (!appointment) {
    return res.status(404).json({ message: "unable to add appointments" });
  }
  return res.status(200).json({ appointment });
};

const getById = async (req, res, next) => {
  const id = req.params.id.trim();
  let appointment;
  try {
    appointment = await Appointment.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Invalid ID format" });
  }
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }
  return res.status(200).json({ appointment });
};

const updateAppointment = async (req, res, next) => {
  const id = req.params.id;
  const {
    ownerName,
    contactNo,
    email,
    address,
    petName,
    species,
    breed,
    age,
    appointmentDate,
    appointmentTime,
    reason,
    petImage,
    session,
    doctorName
  } = req.body;

  let appointment;
  try {
    const trimmedId = id.trim();
    appointment = await Appointment.findByIdAndUpdate(
      trimmedId,
      {
        ownerName,
        contactNo,
        email,
        address,
        petName,
        species,
        breed,
        age,
        appointmentDate,
        appointmentTime,
        reason,
        petImage,
        session,
        doctorName
      },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }
  return res.status(200).json({ appointment });
};

const deleteAppointment = async (req, res, next) => {
  const { id } = req.params;
  let appointment;
  try {
    const trimmedId = id.trim();
    appointment = await Appointment.findByIdAndDelete(trimmedId);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }
  return res.status(200).json({ message: "Appointment deleted successfully" });
};

exports.getAllAppointments = getAllAppointments;
exports.addAppointment = addAppointment;
exports.getById = getById;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;