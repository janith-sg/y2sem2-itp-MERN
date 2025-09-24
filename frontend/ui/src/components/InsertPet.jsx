import React, { useState } from "react";
import axios from "axios";
import "./InsertPet.css";

const InsertPet = () => {
  const [petData, setPetData] = useState({
    petId: "",
    name: "",
    species: "",
    breed: "",
    bloodType: "",
    color: "",
    birthday: "",
    ownerContact: "",
    ownerId: "",
    petImage: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetData({ ...petData, [name]: value });
  };

  const handleFileChange = (e) => {
    setPetData({ ...petData, petImage: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.keys(petData).forEach((key) => {
        formData.append(key, petData[key]);
      });

      const response = await axios.post(
        "http://localhost:3000/api/pets",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("✅ Pet added successfully!");
      console.log("Response:", response.data);

      // Reset form
      setPetData({
        petId: "",
        name: "",
        species: "",
        breed: "",
        bloodType: "",
        color: "",
        birthday: "",
        ownerContact: "",
        ownerId: "",
        petImage: null,
      });
    } catch (error) {
      console.error("Error adding pet:", error.response?.data || error.message);
      alert(" Failed to add pet. Check console for details.");
    }
  };

  return (
    <div className="form-container">
      <form className="pet-form" onSubmit={handleSubmit}>
  <h2>Pet Registration</h2>

  <label>Pet ID</label>
  <input
    type="text"
    name="petId"
    value={petData.petId}
    onChange={handleChange}
    required
    minLength={2}
    title="Enter a valid Pet ID (at least 2 characters)"
  />

  <label>Pet Name</label>
  <input
    type="text"
    name="name"
    value={petData.name}
    onChange={handleChange}
    required
    pattern="[A-Za-z ]+"
    title="Pet name can only contain letters and spaces"
  />

  <label>Species</label>
  <select
    name="species"
    value={petData.species}
    onChange={handleChange}
    required
  >
    <option value="">-- Select Species --</option>
    <option value="Dog">Dog</option>
    <option value="Cat">Cat</option>
    <option value="Rabbit">Rabbit</option>
    <option value="Bird">Bird</option>
    <option value="Other">Other</option>
  </select>

  <label>Breed</label>
  <input
    type="text"
    name="breed"
    value={petData.breed}
    onChange={handleChange}
    pattern="[A-Za-z0-9 ]*"
    title="Breed can contain letters, numbers and spaces"
  />

  <label>Blood Type</label>
  <input
    type="text"
    name="bloodType"
    value={petData.bloodType}
    onChange={handleChange}
    pattern="[A-Za-z0-9+-]*"
    title="Blood type can contain letters, numbers, + and -"
  />

  <label>Color</label>
  <input
    type="text"
    name="color"
    value={petData.color}
    onChange={handleChange}
    pattern="[A-Za-z ]*"
    title="Color can only contain letters and spaces"
  />

  <label>Birthday</label>
  <input
    type="date"
    name="birthday"
    value={petData.birthday}
    onChange={handleChange}
    max={new Date().toISOString().split("T")[0]} 
    title="Birthday cannot be in the future"
  />

  <label>Owner Contact</label>
  <input
    type="text"
    name="ownerContact"
    value={petData.ownerContact}
    onChange={handleChange}
    required
    pattern="\d{10}"
    title="Owner contact must be exactly 10 digits"
  />

  <label>Owner ID</label>
  <input
    type="text"
    name="ownerId"
    value={petData.ownerId}
    onChange={handleChange}
    required
    minLength={2}
    title="Enter a valid Owner ID (at least 2 characters)"
  />

  <label>Upload Pet Image</label>
  <input
    type="file"
    name="petImage"
    accept="image/*"
    onChange={handleFileChange}
    title="Upload an image of the pet"
  />

  <input type="submit" value="Submit Pet" className="submit-btn" />
</form>

    </div>
  );
};

export default InsertPet;
