// Controllers/prescriptionController.js
const Prescription = require("../models/prescriptionModel");

// Get all prescriptions
const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    return res.status(200).json({ prescriptions });
  } catch (err) {
    console.error("GET ALL PRESCRIPTIONS ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Add a new prescription (PrescriptionId is auto-assigned by model hook)
const addPrescription = async (req, res) => {
  // Do NOT accept PrescriptionId from client
  // 🛑 MODIFIED: Added Cost
  const { RecordId, PetId, Name, Dose, Duration, Notes, Cost } = req.body;

  try {
    const prescription = new Prescription({
      RecordId,
      PetId,
      Name,
      Dose,
      Duration,
      Notes, // optional
      // 💰 NEW FIELD: Pass Cost if provided
      Cost: Cost !== undefined ? Cost : undefined, 
    });

    const saved = await prescription.save(); // PrescriptionId auto in pre-validate hook
    return res.status(201).json({ prescription: saved });
  } catch (err) {
    console.error("ADD PRESCRIPTION ERROR:", err);
    const message = err.code === 11000 ? "Duplicate PrescriptionId" : err.message;
    return res.status(400).json({ message: "Unable to add prescription", error: message });
  }
};

// Get prescription by Mongo _id
const getPrescriptionById = async (req, res) => {
  const id = req.params.id;
  try {
    const prescription = await Prescription.findById(id);
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });
    return res.status(200).json({ prescription });
  } catch (err) {
    console.error("GET PRESCRIPTION BY ID ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Update prescription (do not allow changing PrescriptionId)
const updatePrescription = async (req, res) => {
  const id = req.params.id;

  // Strip PrescriptionId if sent; whitelist allowed fields
  const { PrescriptionId, ...rest } = req.body;

  const updatePayload = {
    ...(rest.RecordId !== undefined && { RecordId: rest.RecordId }),
    ...(rest.PetId !== undefined && { PetId: rest.PetId }),
    ...(rest.Name !== undefined && { Name: rest.Name }),
    ...(rest.Dose !== undefined && { Dose: rest.Dose }),
    ...(rest.Duration !== undefined && { Duration: rest.Duration }),
    ...(rest.Notes !== undefined && { Notes: rest.Notes }),
    
    // 💰 NEW FIELD: Include Cost in the update payload
    ...(rest.Cost !== undefined && { Cost: rest.Cost }), 
  };

  try {
    const prescription = await Prescription.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!prescription) return res.status(404).json({ message: "Unable to update prescription" });
    return res.status(200).json({ prescription });
  } catch (err) {
    console.error("UPDATE PRESCRIPTION ERROR:", err);
    return res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// Delete prescription
const deletePrescription = async (req, res) => {
  const id = req.params.id;
  try {
    const prescription = await Prescription.findByIdAndDelete(id);
    if (!prescription) return res.status(404).json({ message: "Unable to delete prescription" });
    return res.status(200).json({ prescription });
  } catch (err) {
    console.error("DELETE PRESCRIPTION ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
  getAllPrescriptions,
  addPrescription,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};