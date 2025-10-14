import React, { useState, useEffect } from "react";
import "./InsertEmployee.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const InsertEmployee = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeedata] = useState({
    employeeID: "",
    name: "",
    address: "",
    nic: "",
    mobile: "",
    email: "",
    firstName: "",
    lastName: "",
    city: "",
    image: null,
  });

  const [pets, setPets] = useState([{ petID: "", petName: "" }]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-generate next employee ID on component mount
  useEffect(() => {
    generateNextEmployeeID();
  }, []);

  const generateNextEmployeeID = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/employees/users');
      const existingUsers = response.data;
      
      // Find the highest existing ID number
      let maxIdNumber = 0;
      existingUsers.forEach(user => {
        if (user.employeeID && user.employeeID.startsWith('U-')) {
          const idNumber = parseInt(user.employeeID.substring(2));
          if (!isNaN(idNumber) && idNumber > maxIdNumber) {
            maxIdNumber = idNumber;
          }
        }
      });
      
      // Generate next ID (U-01, U-02, U-03, etc.)
      const nextIdNumber = maxIdNumber + 1;
      const nextEmployeeID = `U-${nextIdNumber.toString().padStart(2, '0')}`;
      
      console.log("Generated next Employee ID:", nextEmployeeID);
      
      setEmployeedata(prev => ({
        ...prev,
        employeeID: nextEmployeeID
      }));
    } catch (error) {
      console.error("Error generating employee ID:", error);
      // Fallback to U-01 if there's an error
      setEmployeedata(prev => ({
        ...prev,
        employeeID: "U-01"
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeedata({
      ...employeeData,
      [name]: value,
    });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (e) => {
    setEmployeedata({
      ...employeeData,
      image: e.target.files[0],
    });
    
    // Clear image validation error
    if (validationErrors.image) {
      setValidationErrors(prev => ({
        ...prev,
        image: ""
      }));
    }
  };

  const handlePetChange = (index, field, value) => {
    const newPets = [...pets];
    newPets[index][field] = value;
    setPets(newPets);
  };

  const addPetField = () => {
    setPets([...pets, { petID: "", petName: "" }]);
  };

  const removePetField = (index) => {
    if (pets.length > 1) {
      const newPets = pets.filter((_, i) => i !== index);
      setPets(newPets);
    }
  };

  // Simplified validation function
  const validateForm = () => {
    console.log("=== Starting Form Validation ===");
    console.log("Current employeeData:", employeeData);
    
    const errors = {};
    
    // Employee ID validation (auto-generated, should always be valid)
    if (!employeeData.employeeID || employeeData.employeeID.trim() === "") {
      errors.employeeID = "Employee ID is required";
      console.log("❌ Employee ID missing");
    } else {
      console.log("✅ Employee ID valid:", employeeData.employeeID);
    }
    
    // Name validation - REQUIRED
    if (!employeeData.name || employeeData.name.trim() === "") {
      errors.name = "Full name is required";
      console.log("❌ Name missing");
    } else if (employeeData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
      console.log("❌ Name too short");
    } else {
      console.log("✅ Name valid:", employeeData.name);
    }
    
    // Address validation - REQUIRED
    if (!employeeData.address || employeeData.address.trim() === "") {
      errors.address = "Address is required";
      console.log("❌ Address missing");
    } else if (employeeData.address.trim().length < 5) {
      errors.address = "Address must be at least 5 characters";
      console.log("❌ Address too short");
    } else {
      console.log("✅ Address valid:", employeeData.address);
    }
    
    // NIC validation - REQUIRED
    if (!employeeData.nic || employeeData.nic.trim() === "") {
      errors.nic = "NIC is required";
      console.log("❌ NIC missing");
    } else {
      console.log("✅ NIC valid:", employeeData.nic);
    }
    
    // Mobile validation - REQUIRED
    if (!employeeData.mobile || employeeData.mobile.trim() === "") {
      errors.mobile = "Mobile number is required";
      console.log("❌ Mobile missing");
    } else if (employeeData.mobile.trim().length !== 10) {
      errors.mobile = "Mobile number must be 10 digits";
      console.log("❌ Mobile wrong length");
    } else {
      console.log("✅ Mobile valid:", employeeData.mobile);
    }
    
    console.log("Final validation errors:", errors);
    console.log("Validation result:", Object.keys(errors).length === 0 ? "✅ PASSED" : "❌ FAILED");
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("=== FORM SUBMISSION ATTEMPT ===");
    console.log("Employee Data:", employeeData);
    console.log("Employee ID:", employeeData.employeeID);
    console.log("Name:", employeeData.name);
    console.log("Address:", employeeData.address);
    console.log("NIC:", employeeData.nic);
    console.log("Mobile:", employeeData.mobile);

    // Run validations
    const isValid = validateForm();
    console.log("Form validation result:", isValid);
    
    if (!isValid) {
      console.log("❌ VALIDATION FAILED - Current validation errors:", validationErrors);
      alert("Please fix the following errors:\n" + Object.values(validationErrors).join("\n"));
      return;
    }

    console.log("✅ VALIDATION PASSED - Proceeding with submission...");

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("employeeID", employeeData.employeeID);
      formData.append("name", employeeData.name);
      formData.append("firstName", employeeData.firstName || "");
      formData.append("lastName", employeeData.lastName || "");
      formData.append("email", employeeData.email || "");
      formData.append("address", employeeData.address);
      formData.append("nic", employeeData.nic);
      formData.append("mobile", employeeData.mobile);
      formData.append("city", employeeData.city || "");
      
      if (employeeData.image) {
        formData.append("image", employeeData.image);
      }
      
      // Only include pets that have both ID and Name
      const completePets = pets.filter(pet => pet.petID.trim() && pet.petName.trim());
      formData.append("pets", JSON.stringify(completePets));

      console.log("Sending form data to backend...");
      const response = await axios.post("http://localhost:3000/api/employees", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ BACKEND RESPONSE:", response.data);
      alert(`✅ Employee ${employeeData.employeeID} added successfully!`);
      
      // Redirect to users page to show the newly added employee
      navigate('/users');
      
    } catch (err) {
      console.error("❌ SUBMISSION ERROR:", err);
      if (err.response?.data?.msg) {
        alert(`❌ Failed to add employee: ${err.response.data.msg}`);
      } else {
        alert("❌ Failed to add employee. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="employee-form">
        <h2>Employee Registration</h2>
        
        {loading && <p className="loading-message">⏳ Loading...</p>}

        {/* Employee ID - Auto-generated and read-only */}
        <div className="form-group">
          <label>Employee ID *</label>
          <input
            type="text"
            name="employeeID"
            value={employeeData.employeeID}
            readOnly
            disabled
            style={{
              backgroundColor: '#f5f5f5',
              cursor: 'not-allowed',
              fontWeight: 'bold',
              color: '#333'
            }}
            title="Employee ID is auto-generated and cannot be changed"
          />
          <small className="help-text">🔒 Auto-generated - Cannot be modified</small>
          {validationErrors.employeeID && (
            <span className="error-message">❌ {validationErrors.employeeID}</span>
          )}
        </div>


        {/* First Name */}
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={employeeData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
          />
          {validationErrors.firstName && (
            <span className="error-message">❌ {validationErrors.firstName}</span>
          )}
        </div>

        {/* Last Name */}
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={employeeData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
          />
          {validationErrors.lastName && (
            <span className="error-message">❌ {validationErrors.lastName}</span>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={employeeData.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
          {validationErrors.email && (
            <span className="error-message">❌ {validationErrors.email}</span>
          )}
        </div>

        {/* Address */}
        <div className="form-group">
          <label>Address *</label>
          <input
            type="text"
            name="address"
            value={employeeData.address}
            onChange={handleChange}
            required
            placeholder="Enter full address"
            title="Address must be at least 5 characters long"
          />
          {validationErrors.address && (
            <span className="error-message">❌ {validationErrors.address}</span>
          )}
        </div>

        {/* City */}
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={employeeData.city}
            onChange={handleChange}
            placeholder="Enter city"
          />
          {validationErrors.city && (
            <span className="error-message">❌ {validationErrors.city}</span>
          )}
        </div>

        {/* NIC */}
        <div className="form-group">
          <label>NIC *</label>
          <input
            type="text"
            name="nic"
            value={employeeData.nic}
            onChange={handleChange}
            required
            placeholder="9 digits + V/X or 12 digits"
            title="NIC must be 9 digits followed by V/X or 12 digits"
          />
          <small className="help-text">Format: 123456789V or 123456789012</small>
          {validationErrors.nic && (
            <span className="error-message">❌ {validationErrors.nic}</span>
          )}
        </div>

        {/* Mobile */}
        <div className="form-group">
          <label>Mobile *</label>
          <input
            type="text"
            name="mobile"
            value={employeeData.mobile}
            onChange={handleChange}
            required
            placeholder="0771234567"
            title="Mobile number must be exactly 10 digits"
          />
          <small className="help-text">10 digits without spaces</small>
          {validationErrors.mobile && (
            <span className="error-message">❌ {validationErrors.mobile}</span>
          )}
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            title="Upload a profile image (optional)"
          />
          <small className="help-text">📷 Optional - Upload JPG, PNG, or GIF</small>
          {validationErrors.image && (
            <span className="error-message">❌ {validationErrors.image}</span>
          )}
        </div>

       

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => {
              console.log("=== TESTING VALIDATION ===");
              console.log("Current form data:", employeeData);
              const result = validateForm();
              console.log("Validation result:", result);
              if (result) {
                alert("✅ Form validation passed! Ready to submit.");
              } else {
                alert("❌ Form validation failed. Check console for details.");
              }
            }}
            className="test-btn"
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            🔍 Test Validation
          </button>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "⏳ Adding Employee..." : "✅ Submit Employee"}
          </button>
        </div>

        <div className="required-note">
          <small>* Required fields</small>
        </div>
      </form>
    </div>
  );
};

export default InsertEmployee;
