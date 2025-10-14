// Model/labResultModel.js
const mongoose = require("mongoose");
const { getNextSeq } = require("../utils/getNextSeq");

const Schema = mongoose.Schema;

// allow undefined/null or valid date
const validateDate = (value) => value == null || !isNaN(new Date(value).getTime());

const labResultSchema = new Schema(
  {
    LabResultId: { type: Number, required: true, unique: true, index: true, min: 1 }, // auto-assigned
    RecordId:    { type: Number, required: true, min: 1, index: true },               // <-- indexed
    
    // 🛑 MODIFICATION: PetId must be String to support alphanumeric format (e.g., P-017)
    PetId:       { type: String, required: true, trim: true },

    // 👇 NO ENUM HERE
    Type:    { type: String, required: true },   // any string now
    FileUrl: { type: String },                   // optional

    Notes:   { type: String },
    
    // 💰 NEW FIELD FOR BILLING/COST
    Cost: { type: Number, min: 0, default: 0 }, 

    Date: {
      type: Date,
      default: Date.now,
      validate: { validator: validateDate, message: "Invalid Date format" },
    },
  },
  { timestamps: true }
);

labResultSchema.pre("validate", async function (next) {
  try {
    if (this.isNew && (this.LabResultId === undefined || this.LabResultId === null)) {
      this.LabResultId = await getNextSeq("labresult");
    }
    next();
  } catch (err) { next(err); }
});

module.exports = mongoose.model("labResultModel", labResultSchema);