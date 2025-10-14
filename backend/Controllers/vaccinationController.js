// Controllers/vaccinationController.js
const Vaccination = require("../models/vaccinationModel");

// Get all vaccinations
const getAllVaccinations = async (req, res) => {
  try {
    const vaccinations = await Vaccination.find();
    return res.status(200).json({ vaccinations });
  } catch (err) {
    console.error("GET ALL VACCINATIONS ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Add a new vaccination (VaccinationId is auto-assigned by model hook)
const addVaccination = async (req, res) => {
  console.log("POST /vaccinations body:", JSON.stringify(req.body, null, 2));

  // 🛑 MODIFICATION: Added Cost
  const { RecordId, PetId, VaccineName, DateGiven, NextDueDate, Notes, Cost } = req.body;

  try {
    const vaccination = new Vaccination({
      RecordId,
      PetId,
      VaccineName,
      DateGiven,
      NextDueDate,
      Notes, // optional
      // 💰 NEW FIELD
      Cost: Cost !== undefined ? Cost : undefined, 
    });

    const saved = await vaccination.save(); // VaccinationId assigned in pre-validate hook
    return res.status(201).json({ vaccination: saved });
  } catch (err) {
    console.error("ADD VACCINATION ERROR:", err);
    const message = err.code === 11000 ? "Duplicate VaccinationId" : err.message;
    return res.status(400).json({ message: "Unable to add vaccination", error: message });
  }
};

// Get vaccination by Mongo _id
const getVaccinationById = async (req, res) => {
  const id = req.params.id;
  try {
    const vaccination = await Vaccination.findById(id);
    if (!vaccination) return res.status(404).json({ message: "Vaccination not found" });
    return res.status(200).json({ vaccination });
  } catch (err) {
    console.error("GET VACCINATION BY ID ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Update vaccination (do not allow changing VaccinationId)
const updateVaccination = async (req, res) => {
  const id = req.params.id;
  console.log("PUT /vaccinations/:id body:", JSON.stringify(req.body, null, 2));

  // Strip VaccinationId if sent; whitelist allowed fields
  // 🛑 MODIFICATION: Cost is implicitly included in 'rest'
  const { VaccinationId, ...rest } = req.body;

  const updatePayload = {
    ...(rest.RecordId !== undefined && { RecordId: rest.RecordId }),
    ...(rest.PetId !== undefined && { PetId: rest.PetId }),
    ...(rest.VaccineName !== undefined && { VaccineName: rest.VaccineName }),
    ...(rest.DateGiven !== undefined && { DateGiven: rest.DateGiven }),
    ...(rest.NextDueDate !== undefined && { NextDueDate: rest.NextDueDate }),
    ...(rest.Notes !== undefined && { Notes: rest.Notes }),
    
    // 💰 NEW FIELD: Include Cost in the update payload
    ...(rest.Cost !== undefined && { Cost: rest.Cost }), 
  };

  try {
    const vaccination = await Vaccination.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!vaccination) return res.status(404).json({ message: "Unable to update vaccination" });
    return res.status(200).json({ vaccination });
  } catch (err) {
    console.error("UPDATE VACCINATION ERROR:", err);
    return res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// Delete vaccination
const deleteVaccination = async (req, res) => {
  const id = req.params.id;
  try {
    const vaccination = await Vaccination.findByIdAndDelete(id);
    if (!vaccination) return res.status(404).json({ message: "Unable to delete vaccination" });
    return res.status(200).json({ vaccination });
  } catch (err) {
    console.error("DELETE VACCINATION ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
  getAllVaccinations,
  addVaccination,
  getVaccinationById,
  updateVaccination,
  deleteVaccination,
};