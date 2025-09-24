import React, { useState } from "react";
import "./InsertEmployee.css";
import axios from "axios";

const InsertEmployee = () => {
  const [employeeData, setEmployeedata] = useState({
    employeeID: "",
    name: "",
    address: "",
    nic: "",
    mobile: "",
    image: null,
  });

  const [pets, setPets] = useState([{ petID: "", petName: "" }]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeedata({
      ...employeeData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setEmployeedata({
      ...employeeData,
      image: e.target.files[0],
    });
  };

  const handlePetChange = (index, field, value) => {
    const newPets = [...pets];
    newPets[index][field] = value;
    setPets(newPets);
  };

  const addPetField = () => {
    setPets([...pets, { petID: "", petName: "" }]);
  };

  // ✅ Validation function
  const validateForm = () => {
    if (!employeeData.employeeID.trim()) {
      alert("❌ Employee ID is required");
      return false;
    }
    if (!/^[A-Za-z ]+$/.test(employeeData.name)) {
      alert("❌ Name must contain only letters and spaces");
      return false;
    }
    if (employeeData.address.trim().length < 5) {
      alert("❌ Address must be at least 5 characters long");
      return false;
    }
    if (!/^\d{9}[vVxX]$|^\d{12}$/.test(employeeData.nic)) {
      alert("❌ NIC must be 9 digits + V/X or 12 digits");
      return false;
    }
    if (!/^\d{10}$/.test(employeeData.mobile)) {
      alert("❌ Mobile number must be 10 digits");
      return false;
    }
    if (employeeData.image && !employeeData.image.type.startsWith("image/")) {
      alert("❌ Only image files are allowed");
      return false;
    }
    for (let i = 0; i < pets.length; i++) {
      if (!pets[i].petID.trim() || !pets[i].petName.trim()) {
        alert(`❌ Pet ${i + 1} must have both ID and Name`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validations
    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("employeeID", employeeData.employeeID);
      formData.append("name", employeeData.name);
      formData.append("address", employeeData.address);
      formData.append("nic", employeeData.nic);
      formData.append("mobile", employeeData.mobile);
      if (employeeData.image) {
        formData.append("image", employeeData.image);
      }
      formData.append("pets", JSON.stringify(pets));

      await axios.post("http://localhost:3000/api/employees", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Employee added successfully!");
      setEmployeedata({
        employeeID: "",
        name: "",
        address: "",
        nic: "",
        mobile: "",
        image: null,
      });
      setPets([{ petID: "", petName: "" }]);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add employee");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="employee-form">
  <h2>Employee Registration</h2>

  <label>Employee ID</label>
  <input
    type="text"
    name="employeeID"
    value={employeeData.employeeID}
    onChange={handleChange}
    required
    minLength={3}
    title="Enter a valid Employee ID (min 3 characters)"
  />

  <label>Name</label>
  <input
    type="text"
    name="name"
    value={employeeData.name}
    onChange={handleChange}
    required
    pattern="[A-Za-z ]+"
    title="Name can only contain letters and spaces"
  />

  <label>Address</label>
  <input
    type="text"
    name="address"
    value={employeeData.address}
    onChange={handleChange}
    required
    minLength={5}
    title="Address must be at least 5 characters long"
  />

  <label>NIC</label>
  <input
    type="text"
    name="nic"
    value={employeeData.nic}
    onChange={handleChange}
    required
    pattern="\d{9}[vVxX]|\d{12}"
    title="NIC must be 9 digits followed by V/X or 12 digits"
  />

  <label>Mobile</label>
  <input
    type="text"
    name="mobile"
    value={employeeData.mobile}
    onChange={handleChange}
    required
    pattern="\d{10}"
    title="Mobile number must be exactly 10 digits"
  />

  <label>Upload Image</label>
  <input
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    title="Upload a profile image"
  />

  <h3>Pets</h3>
  {pets.map((pet, index) => (
    <div key={index} className="pet-fields">
      <input
        type="text"
        placeholder="Pet ID"
        value={pet.petID}
        onChange={(e) => handlePetChange(index, "petID", e.target.value)}
        required
        minLength={1}
        title="Pet ID cannot be empty"
      />
      <input
        type="text"
        placeholder="Pet Name"
        value={pet.petName}
        onChange={(e) => handlePetChange(index, "petName", e.target.value)}
        required
        pattern="[A-Za-z ]+"
        title="Pet Name can only contain letters and spaces"
      />
    </div>
  ))}

  <button type="button" onClick={addPetField} className="add-btn">
    + Add Another Pet
  </button>

  <input type="submit" value="Submit Employee" className="submit-btn" />
</form>

    </div>
  );
};

export default InsertEmployee;
