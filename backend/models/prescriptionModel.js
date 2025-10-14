// Model/prescriptionModel.js
const mongoose = require("mongoose");
const { getNextSeq } = require("../utils/getNextSeq");

const Schema = mongoose.Schema;

const prescriptionSchema = new Schema(
  {
    // Human-friendly auto-increment numeric ID
    PrescriptionId: { type: Number, required: true, unique: true, index: true, min: 1 },

    // Linkage (validated in controllers if you want)
    // RecordId remains Number (as it's the numeric visit ID)
    RecordId: { type: Number, required: true, min: 1, index: true }, 
    
    // 🛑 MODIFICATION: PetId must be String to support alphanumeric format (e.g., P-017)
    PetId:    { type: String, required: true, trim: true }, 

    Name:     { type: String, required: true, trim: true },
    Dose:     { type: String, required: true, trim: true },
    Duration: { type: String, required: true, trim: true },

    Notes: { type: String, trim: true },
    
    // 💰 NEW FIELD FOR BILLING/COST
    Cost: { type: Number, min: 0, default: 0 }, 
  },
  { timestamps: true }
);

prescriptionSchema.pre("validate", async function (next) {
  try {
    if (this.isNew && (this.PrescriptionId === undefined || this.PrescriptionId === null)) {
      this.PrescriptionId = await getNextSeq("prescription");
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("prescriptionModel", prescriptionSchema);