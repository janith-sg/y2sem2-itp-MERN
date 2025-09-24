const mongoose = require("mongoose");

// Sub-schema for pets
const PetSchema = new mongoose.Schema({
  petID: { type: String },
  petName: { type: String },
});

// Main employee schema
const EmployeeSchema = new mongoose.Schema({
  employeeID: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  nic: {
    type: String,
    required: true,
  },
  mobile: {                // ✅ Added mobile number
    type: String,
    required: true,
  },
  image: {
    type: String, // uploaded image filename or URL
  },
  pets: [PetSchema], // Array of pets
});

module.exports = Employee = mongoose.model("employee", EmployeeSchema);
