import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./InsertPet.css";

const InsertPet = () => {
  const { user } = useAuth(); // Get logged-in user
  const navigate = useNavigate(); // For navigation after successful submission
  
  const [petData, setPetData] = useState({
    petId: "", // Will be auto-generated
    name: "",
    species: "",
    breed: "",
    bloodType: "",
    color: "",
    birthday: "",
    age: "", // New age field
    ownerContact: "",
    ownerId: "", // Will be auto-filled with logged-in user ID
    petImage: null,
  });
  
  const [isGeneratingId, setIsGeneratingId] = useState(true);

  // Auto-generate Pet ID and set Owner ID when component loads
  useEffect(() => {
    const generatePetId = async () => {
      try {
        console.log("=== Generating Pet ID ===");
        
        // Get existing pets to determine next ID
        const response = await axios.get("http://localhost:3000/api/pets");
        const existingPets = response.data;
        
        console.log("Existing pets count:", existingPets.length);
        console.log("Existing pet IDs:", existingPets.map(pet => pet.petId));
        
        // Find the highest existing pet number
        let maxPetNumber = 0;
        existingPets.forEach(pet => {
          if (pet.petId && pet.petId.startsWith('P-')) {
            const petNumber = parseInt(pet.petId.split('-')[1]);
            if (!isNaN(petNumber) && petNumber > maxPetNumber) {
              maxPetNumber = petNumber;
            }
          }
        });
        
        // Generate next Pet ID
        const nextPetNumber = maxPetNumber + 1;
        const newPetId = `P-${nextPetNumber.toString().padStart(3, '0')}`;
        
        console.log("Max existing pet number:", maxPetNumber);
        console.log("Generated Pet ID:", newPetId);
        console.log("Current user:", user);
        
        // Get user's contact information
        let userContact = "";
        if (user?.phone || user?.mobile || user?.phoneNumber) {
          userContact = user.phone || user.mobile || user.phoneNumber || "";
        }
        
        console.log("User contact found:", userContact);
        
        // Set Pet ID and Owner ID
        setPetData(prevData => ({
          ...prevData,
          petId: newPetId,
          ownerId: user?.email || user?.id || "", // Use user email or ID as owner ID
          ownerContact: userContact, // Auto-fill with user's contact
        }));
        
        setIsGeneratingId(false);
        
      } catch (error) {
        console.error("Error generating Pet ID:", error);
        
        // Fallback: generate ID based on timestamp to ensure uniqueness
        const timestamp = Date.now();
        const fallbackId = `P-${timestamp.toString().slice(-6)}`;
        console.log("Using fallback Pet ID:", fallbackId);
        
        // Get user's contact information
        let userContact = "";
        if (user?.phone || user?.mobile || user?.phoneNumber) {
          userContact = user.phone || user.mobile || user.phoneNumber || "";
        }
        
        setPetData(prevData => ({
          ...prevData,
          petId: fallbackId,
          ownerId: user?.email || user?.id || "",
          ownerContact: userContact, // Auto-fill with user's contact
        }));
        
        setIsGeneratingId(false);
      }
    };

    if (user) {
      generatePetId();
    } else {
      console.warn("No user logged in");
      setIsGeneratingId(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Input restrictions for owner contact (only digits, max 10)
    if (name === 'ownerContact') {
      const newValue = value.replace(/\D/g, '').slice(0, 10);
      setPetData({ ...petData, [name]: newValue });
    } else {
      setPetData({ ...petData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setPetData({ ...petData, petImage: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Ensure Pet ID and Owner ID are generated
    if (!petData.petId || !petData.ownerId) {
      alert("❌ Pet ID or Owner ID not generated. Please wait or refresh the page.");
      return;
    }

    // Validation: Ensure user is logged in
    if (!user) {
      alert("❌ You must be logged in to register a pet.");
      return;
    }

    // Validation: Check required fields
    if (!petData.name.trim()) {
      alert("❌ Please enter the pet's name.");
      return;
    }

    if (!petData.species) {
      alert("❌ Please select the pet's species.");
      return;
    }

    if (!petData.ownerContact.trim()) {
      alert("❌ Please enter your contact number (10 digits).");
      return;
    }

    // Validate owner contact format
    if (!/^\d{10}$/.test(petData.ownerContact)) {
      alert("❌ Owner contact must be exactly 10 digits.");
      return;
    }

    // Validate age if provided
    if (petData.age && (parseInt(petData.age) < 0 || parseInt(petData.age) > 50)) {
      alert("❌ Pet age must be between 0 and 50 years.");
      return;
    }

    console.log("=== Submitting Pet Data ===");
    console.log("Pet Data:", petData);
    console.log("Current User:", user);

    try {
      // Double-check for duplicate Pet ID before submission
      const checkResponse = await axios.get("http://localhost:3000/api/pets");
      const existingPets = checkResponse.data;
      const duplicatePet = existingPets.find(pet => pet.petId === petData.petId);
      
      if (duplicatePet) {
        console.warn("Duplicate Pet ID detected, regenerating...");
        // Regenerate with timestamp to ensure uniqueness
        const timestamp = Date.now();
        const newPetId = `P-${timestamp.toString().slice(-6)}`;
        setPetData(prevData => ({ ...prevData, petId: newPetId }));
        alert("❌ Pet ID conflict detected. Please try submitting again.");
        return;
      }

      const formData = new FormData();
      Object.keys(petData).forEach((key) => {
        formData.append(key, petData[key]);
      });

      console.log("Sending request to add pet...");
      const response = await axios.post(
        "http://localhost:3000/api/pets",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("✅ Pet added successfully!");
      console.log("Response:", response.data);

      // Redirect to pets page after successful submission
      console.log("Redirecting to pets page...");
      navigate('/pets');
      
    } catch (error) {
      console.error("Error adding pet:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      let errorMessage = "❌ Failed to add pet. ";
      
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please check the console for details.";
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="form-container">
      <form className="pet-form" onSubmit={handleSubmit}>
        <h2>Pet Registration</h2>
        
       
        
        {isGeneratingId && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#e7f3ff', 
            border: '1px solid #b3d7ff', 
            borderRadius: '5px', 
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            <span>🔄 Generating Pet ID...</span>
          </div>
        )}

        <label>Pet ID <span style={{color: '#666', fontSize: '12px'}}>(Auto-generated)</span></label>
        <input
          type="text"
          name="petId"
          value={petData.petId}
          readOnly
          disabled
          style={{ 
            backgroundColor: '#f8f9fa', 
            color: '#6c757d', 
            cursor: 'not-allowed',
            fontWeight: 'bold' 
          }}
          title="Pet ID is automatically generated and cannot be changed"
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

  <label>Age (in years)</label>
  <input
    type="number"
    name="age"
    value={petData.age}
    onChange={handleChange}
    min="0"
    max="50"
    placeholder="Enter pet's age in years"
    title="Pet age should be between 0 and 50 years"
  />

  <label>Owner Contact <span style={{color: '#666', fontSize: '12px'}}>(Your contact number)</span></label>
  <input
    type="text"
    name="ownerContact"
    value={petData.ownerContact}
    onChange={handleChange}
    required
    pattern="\d{10}"
    placeholder="Enter your 10-digit contact number"
    title="Owner contact must be exactly 10 digits"
    maxLength="10"
  />

  <label>Owner ID <span style={{color: '#666', fontSize: '12px'}}>(Auto-filled with your ID)</span></label>
  <input
    type="text"
    name="ownerId"
    value={petData.ownerId}
    readOnly
    disabled
    style={{ 
      backgroundColor: '#f8f9fa', 
      color: '#6c757d', 
      cursor: 'not-allowed',
      fontWeight: 'bold' 
    }}
    title="Owner ID is automatically set to your user ID and cannot be changed"
  />

  <label>Upload Pet Image</label>
  <input
    type="file"
    name="petImage"
    accept="image/*"
    onChange={handleFileChange}
    title="Upload an image of the pet"
  />

  <input 
    type="submit" 
    value={isGeneratingId ? "Generating IDs..." : "Submit Pet"} 
    className="submit-btn" 
    disabled={isGeneratingId || !petData.petId || !petData.ownerId}
    style={{
      opacity: (isGeneratingId || !petData.petId || !petData.ownerId) ? 0.6 : 1,
      cursor: (isGeneratingId || !petData.petId || !petData.ownerId) ? 'not-allowed' : 'pointer'
    }}
  />
</form>

    </div>
  );
};

export default InsertPet;
