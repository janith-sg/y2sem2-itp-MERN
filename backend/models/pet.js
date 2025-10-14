const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema({
  petId: {
    type: String,
    required: true,
    unique: true,
  },
  petImage: {
    type: String, // we’ll store image URL or path
  },
  species: {
    type: String,
    enum: ["Dog", "Cat", "Rabbit", "Bird", "Other"], // dropdown options
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
  },
  bloodType: {
    type: String,
  },
  color: {
    type: String,
  },
  birthday: {
    type: Date,
  },
  age: {
    type: Number,
    min: 0,
    max: 50
  },
  ownerContact: {
    type: String,
    required: true,
  },
  ownerId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Pet", PetSchema);
