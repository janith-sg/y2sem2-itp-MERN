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
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  nic: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  image: {
    type: String, // uploaded image filename or URL
  },
  pets: [PetSchema], // Array of pets
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = Employee = mongoose.model("employee", EmployeeSchema);
