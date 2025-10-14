// src/components/SignUp.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./SignUp.css";
import axios from "axios";

const SignUp = () => {
  // Get authentication functions
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nicNo: "",
    address: "",
    city: "",
    password: "",
    confirmPassword: "",
    profileImage: null
  });

  // NEW: userId state computed asynchronously
  const [userId, setUserId] = useState(null);
  const [isComputingId, setIsComputingId] = useState(true);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [imageValidationMessage, setImageValidationMessage] = useState("");
  const [imageValidationError, setImageValidationError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // helper: convert File -> base64 dataURL (used if profileImage is a File)
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // NEW: compute next unique U- ID by checking localStorage and backend
  useEffect(() => {
    let cancelled = false;
    const computeNextId = async () => {
      setIsComputingId(true);
      try {
        // Start with local users
        const local = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        let max = 0;
        local.forEach(u => {
          const id = (u.id || u.employeeID || u.userId || "").toString();
          if (id.startsWith('U-')) {
            const num = parseInt(id.split('-')[1], 10);
            if (!isNaN(num) && num > max) max = num;
          }
        });

        // Try backend employees (if available)
        try {
          const res = await axios.get("http://localhost:3000/api/employees/users");
          const dbUsers = res.data || [];
          dbUsers.forEach(u => {
            const id = (u.employeeID || u.id || "").toString();
            if (id.startsWith('U-')) {
              const num = parseInt(id.split('-')[1], 10);
              if (!isNaN(num) && num > max) max = num;
            }
          });
        } catch (err) {
          // Backend may be unavailable; that's fine — we already used local
          console.warn("Could not fetch backend users for ID generation, using local data only.", err);
        }

        const next = max + 1;
        const newId = `U-${next.toString().padStart(2, '0')}`;
        if (!cancelled) setUserId(newId);
      } catch (err) {
        console.error("Error computing next user ID:", err);
        // fallback to local count if anything goes wrong
        const local = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const fallbackId = `U-${(local.length + 1).toString().padStart(2, '0')}`;
        if (!cancelled) setUserId(fallbackId);
      } finally {
        if (!cancelled) setIsComputingId(false);
      }
    };

    computeNextId();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Special handling for profile image upload
    if (type === 'file' && name === 'profileImage') {
      const file = files[0];
      
      // Clear previous validation messages
      setImageValidationMessage("");
      setImageValidationError(false);
      
      if (file) {
        // Validate file type (only images)
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          setImageValidationMessage("❌ Please select a valid image file (JPEG, PNG, GIF, WebP)");
          setImageValidationError(true);
          e.target.value = '';
          setProfileImagePreview(null);
          setFormData({
            ...formData,
            [name]: null,
          });
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setImageValidationMessage("❌ File size must be less than 5MB");
          setImageValidationError(true);
          e.target.value = '';
          setProfileImagePreview(null);
          setFormData({
            ...formData,
            [name]: null,
          });
          return;
        }
        
        // Success message and preview
        setImageValidationMessage("✅ Image uploaded successfully!");
        setImageValidationError(false);
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setProfileImagePreview(previewUrl);
        
        // Store File now; we'll convert to base64 on submit to ensure sync
        setFormData({
          ...formData,
          [name]: file,
        });
      } else {
        // No file selected
        setProfileImagePreview(null);
        setFormData({
          ...formData,
          [name]: null,
        });
      }
      return;
    }
    
    // Special handling for phone number - only allow digits and max 10 characters
    if (name === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 10 digits maximum
      const limitedDigits = digitsOnly.slice(0, 10);
      
      setFormData({
        ...formData,
        [name]: limitedDigits,
      });
      return;
    }
    
    // Special handling for NIC number - allow digits and V/X at the end
    if (name === 'nicNo') {
      // Allow digits and V/X characters, limit to 12 characters
      const nicValue = value.replace(/[^0-9VXvx]/g, '').toUpperCase().slice(0, 12);
      
      setFormData({
        ...formData,
        [name]: nicValue,
      });
      return;
    }
    
    // For all other fields, use normal handling
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ensure userId ready
    if (userId === null || isComputingId) {
      alert("Please wait while the system generates a unique user ID.");
      return;
    }

    // Check if userId is null (limit reached)
    if (userId === null) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long!");
      setIsSubmitting(false);
      return;
    }

    // Phone number validation - must be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Phone number must be exactly 10 digits! Please enter a valid phone number.");
      setIsSubmitting(false);
      return;
    }

    // NIC validation
    const nicOldRegex = /^\d{9}[VXvx]$/;
    const nicNewRegex = /^\d{12}$/;
    if (!nicOldRegex.test(formData.nicNo) && !nicNewRegex.test(formData.nicNo)) {
      alert("NIC number must be in valid Sri Lankan format! (9 digits + V/X or 12 digits)");
      setIsSubmitting(false);
      return;
    }

    if (!formData.address.trim()) {
      alert("Address is required!");
      setIsSubmitting(false);
      return;
    }
    if (!formData.city.trim()) {
      alert("City is required!");
      setIsSubmitting(false);
      return;
    }
    if (!formData.profileImage) {
      setImageValidationMessage("❌ Profile image is required! Please upload your profile picture.");
      setImageValidationError(true);
      document.getElementById('profileImage').scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsSubmitting(false);
      return;
    }

    // Re-check against both local and backend to avoid race: ensure email unique and ID still unique
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const normalizedEmail = (formData.email || "").toLowerCase().trim();
    const emailExistsLocal = existingUsers.some(user => (user.email || "").toLowerCase().trim() === normalizedEmail);
    if (emailExistsLocal) {
      alert("Email already registered! Please use a different email.");
      setIsSubmitting(false);
      return;
    }

    // Also check backend for same ID or email if possible
    try {
      const res = await axios.get("http://localhost:3000/api/employees/users");
      const dbUsers = res.data || [];
      const emailExistsDb = dbUsers.some(u => ((u.email || "").toLowerCase().trim() === normalizedEmail));
      const idExistsDb = dbUsers.some(u => ((u.employeeID || u.id || "").toString() === userId));
      if (emailExistsDb) {
        alert("Email already registered in system (server). Please use a different email.");
        setIsSubmitting(false);
        return;
      }
      if (idExistsDb) {
        // race - regenerate id then ask user to retry
        alert("ID conflict detected, regenerating. Please try creating account again in a moment.");
        // recompute id once
        let max = 0;
        existingUsers.forEach(u => {
          const id = (u.id || u.employeeID || "").toString();
          if (id.startsWith('U-')) {
            const num = parseInt(id.split('-')[1], 10);
            if (!isNaN(num) && num > max) max = num;
          }
        });
        dbUsers.forEach(u => {
          const id = (u.employeeID || u.id || "").toString();
          if (id.startsWith('U-')) {
            const num = parseInt(id.split('-')[1], 10);
            if (!isNaN(num) && num > max) max = num;
          }
        });
        const next = max + 1;
        setUserId(`U-${next.toString().padStart(2, '0')}`);
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      // ignore backend errors here, local check is primary
      console.warn("Could not re-check backend for conflicts, proceeding with local checks only.", err);
    }

    // Prepare profileImage as base64 if it's a File
    let profileImgData = formData.profileImage;
    try {
      if (formData.profileImage && typeof formData.profileImage !== 'string') {
        profileImgData = await fileToDataUrl(formData.profileImage);
      }
    } catch (err) {
      console.warn('Failed to convert profile image:', err);
      profileImgData = null;
    }

    const userData = {
      id: userId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: normalizedEmail,
      phone: formData.phone,
      nicNo: formData.nicNo,
      address: formData.address,
      city: formData.city,
      password: formData.password,
      profileImage: profileImgData,
      createdAt: new Date().toISOString()
    };

    // Save locally
    const updatedUsers = [...existingUsers, userData];
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    // Login and redirect
    const authUserObj = {
      id: userData.id,
      employeeID: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: "user",
      profileImage: userData.profileImage,
      createdAt: userData.createdAt
    };
    try { login(authUserObj); } catch (err) { console.warn('login failed', err); }

    alert(`Account created successfully! Welcome ${formData.firstName}!\nYour user ID is ${userId}. Total users: ${updatedUsers.length}/100.`);

    // Reset and navigate
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nicNo: "",
      address: "",
      city: "",
      password: "",
      confirmPassword: "",
      profileImage: null
    });
    setProfileImagePreview(null);
    setImageValidationMessage("");
    setImageValidationError(false);

    setIsSubmitting(false);
    navigate("/"); // Redirect to home page
  };

  // If user limit reached, show message
  if (userId === null) {
    return (
      <div className="signup-wrap">
        <div className="signup-form">
          <h2>Registration Closed</h2>
          <p style={{textAlign: 'center', color: '#e74c3c', fontSize: '18px', margin: '20px 0'}}>
            Maximum user limit reached (100 users). No more registrations allowed.
          </p>
          <div className="signup-footer">
            <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-wrap">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        {/* Auto-generated ID - Read only */}
        <label>ID</label>
        <input
          type="text"
          value={userId ? userId : (isComputingId ? "Generating ID..." : "U-01")}
          readOnly
          className="readonly-field"
          placeholder="Auto-generated"
        />

        {/* Profile Image Upload - Required */}
        <label>Profile Image *</label>
        <div className="profile-image-upload">
          <input
            type="file"
            name="profileImage"
            onChange={handleChange}
            accept="image/*"
            required
            className="file-input"
            id="profileImage"
          />
          <label htmlFor="profileImage" className={`file-input-label ${imageValidationError ? 'error' : ''}`}>
            {profileImagePreview ? (
              <div className="image-preview">
                <img src={profileImagePreview} alt="Profile Preview" />
                <span className="change-image">Click to change image</span>
              </div>
            ) : (
              <div className="upload-placeholder">
                <i className="fas fa-camera"></i>
                <span>Click to upload profile image</span>
                <small>JPG, PNG, GIF, WebP (Max 5MB)</small>
              </div>
            )}
          </label>
          
          {/* Validation Message */}
          {imageValidationMessage && (
            <div className={`validation-message ${imageValidationError ? 'error' : 'success'}`}>
              {imageValidationMessage}
            </div>
          )}
        </div>

        {/* First Name and Last Name in same row */}
        <div className="name-row">
          <div className="name-field">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required
            />
          </div>
          <div className="name-field">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
            />
          </div>
        </div>

        {/* Email */}
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@gmail.com"
          required
        />

        {/* Phone Number */}
        <label>Phone No</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="0771234567"
          pattern="[0-9]{10}"
          maxLength="10"
          title="Please enter exactly 10 digits"
          required
        />
        <small style={{color: '#666', fontSize: '12px', marginTop: '5px'}}>
          Enter exactly 10 digits (e.g., 0771234567)
        </small>

        {/* NIC Number */}
        <label>NIC No</label>
        <input
          type="text"
          name="nicNo"
          value={formData.nicNo}
          onChange={handleChange}
          placeholder="123456789V or 200012345678"
          maxLength="12"
          title="Enter Sri Lankan NIC (9 digits + V/X or 12 digits)"
          required
        />
        <small style={{color: '#666', fontSize: '12px', marginTop: '5px'}}>
          Old format: 9 digits + V/X (e.g., 123456789V) | New format: 12 digits (e.g., 200012345678)
        </small>

        {/* Address */}
        <label>Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="No 123, Main Street"
          required
        />

        {/* City */}
        <label>City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Colombo"
          required
        />

        {/* Password */}
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          minLength="6"
        />

        {/* Confirm Password */}
        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          minLength="6"
        />

        <button className="signup-btn" type="submit" disabled={isSubmitting || isComputingId}>
          {isSubmitting ? 'Creating account...' : (isComputingId ? 'Please wait...' : 'Create Account')}
        </button>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
