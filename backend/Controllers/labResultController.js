// Controllers/labResultController.js
const LabResult = require("../models/labResultModel");

// Helper
const isValidDate = (val) => {
  const parsed = new Date(val);
  return !isNaN(parsed.getTime());
};

// Get all lab results
const getAllLabResults = async (req, res) => {
  try {
    const labResults = await LabResult.find();
    return res.status(200).json({ labResults });
  } catch (err) {
    console.error("GET ALL LAB RESULTS ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Add a new lab result (LabResultId is auto-assigned by model hook)
const addLabResult = async (req, res) => {
  console.log("POST /labresults body:", JSON.stringify(req.body, null, 2));

  // DO NOT accept LabResultId from client
  // 🛑 MODIFICATION: Added Cost
  const { RecordId, PetId, Type, FileUrl, Notes, Date: dateValue, Cost } = req.body;

  if (dateValue && !isValidDate(dateValue)) {
    return res.status(400).json({ message: "Invalid Date format. Please provide a valid date." });
  }

  try {
    const labResult = new LabResult({
      RecordId,
      PetId,
      Type,
      FileUrl, // optional
      Notes,   // optional
      Date: dateValue ? new Date(dateValue) : undefined,
      // 💰 NEW FIELD
      Cost: Cost !== undefined ? Cost : undefined,
    });

    const saved = await labResult.save(); // LabResultId set in pre-validate hook
    return res.status(201).json({ labResult: saved });
  } catch (err) {
    console.error("ADD LAB RESULT ERROR:", err);
    const message = err.code === 11000 ? "Duplicate LabResultId" : err.message;
    return res.status(400).json({ message: "Unable to add lab result", error: message });
  }
};

// Get lab result by Mongo _id
const getLabResultById = async (req, res) => {
  const id = req.params.id;
  try {
    const labResult = await LabResult.findById(id);
    if (!labResult) return res.status(404).json({ message: "Lab Result not found" });
    return res.status(200).json({ labResult });
  } catch (err) {
    console.error("GET LAB RESULT BY ID ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Update lab result (do not allow changing LabResultId)
const updateLabResult = async (req, res) => {
  const id = req.params.id;
  console.log("PUT /labresults/:id body:", JSON.stringify(req.body, null, 2));

  // Strip LabResultId; whitelist allowed fields
  const { LabResultId, ...rest } = req.body;

  if (rest.Date && !isValidDate(rest.Date)) {
    return res.status(400).json({ message: "Invalid Date format. Please provide a valid date." });
  }

  const updatePayload = {
    ...(rest.RecordId !== undefined && { RecordId: rest.RecordId }),
    ...(rest.PetId !== undefined && { PetId: rest.PetId }),
    ...(rest.Type !== undefined && { Type: rest.Type }),
    ...(rest.FileUrl !== undefined && { FileUrl: rest.FileUrl }),
    ...(rest.Notes !== undefined && { Notes: rest.Notes }),
    ...(rest.Date !== undefined && { Date: new Date(rest.Date) }),
    // 💰 NEW FIELD
    ...(rest.Cost !== undefined && { Cost: rest.Cost }), 
  };

  try {
    const labResult = await LabResult.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });
    if (!labResult) return res.status(404).json({ message: "Unable to update lab result" });
    return res.status(200).json({ labResult });
  } catch (err) {
    console.error("UPDATE LAB RESULT ERROR:", err);
    return res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// Delete lab result
const deleteLabResult = async (req, res) => {
  const id = req.params.id;
  try {
    const labResult = await LabResult.findByIdAndDelete(id);
    if (!labResult) return res.status(404).json({ message: "Unable to delete lab result" });
    return res.status(200).json({ labResult });
  } catch (err) {
    console.error("DELETE LAB RESULT ERROR:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
  getAllLabResults,
  addLabResult,
  getLabResultById,
  updateLabResult,
  deleteLabResult,
};