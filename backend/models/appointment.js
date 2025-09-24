const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  ownerName: { type: String, required: true },
  contactNo: { type: Number, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },

  // Pet Details
  petName: { type: String, required: true },
  species: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },

  session: { type: String, required: true, enum: ['Morning', 'Evening'] },
  doctorName: { type: String, required: true },

  petImage: { type: String, required: false },

  // Appointment Details
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  reason: { type: String, required: true },

}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);