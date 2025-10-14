// Model/counterModel.js
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // e.g. "record", "prescription", "vaccination", "labresult"
    seq: { type: Number, required: true, default: 0, min: 0 },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Counter", counterSchema);
