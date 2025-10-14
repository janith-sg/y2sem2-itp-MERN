// Model/vaccinationModel.js
const mongoose = require("mongoose");
const { getNextSeq } = require("../utils/getNextSeq");

const Schema = mongoose.Schema;

const vaccinationSchema = new Schema(
  {
    // Human-friendly auto-increment numeric ID
    VaccinationId: { type: Number, required: true, unique: true, index: true, min: 1 },

    // Linkage
    RecordId: { type: Number, required: true, min: 1, index: true }, // <-- indexed
    
    // 🛑 MODIFICATION: PetId must be String to support alphanumeric format (e.g., P-017)
    PetId:    { type: String, required: true, trim: true },

    VaccineName: { type: String, required: true, trim: true },
    // 🛑 MODIFICATION: Notes field is kept, but we ADD Cost
    Notes:       { type: String, trim: true },
    
    DateGiven:   { type: Date, required: true },
    NextDueDate: { type: Date },
    
    // 💰 NEW FIELD FOR BILLING/COST
    Cost: { type: Number, min: 0, default: 0 }, 
  },
  { timestamps: true }
);

vaccinationSchema.pre("validate", async function (next) {
  try {
    if (this.isNew && (this.VaccinationId === undefined || this.VaccinationId === null)) {
      this.VaccinationId = await getNextSeq("vaccination");
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("vaccinationModel", vaccinationSchema);