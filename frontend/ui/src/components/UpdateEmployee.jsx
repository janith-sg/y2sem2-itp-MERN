import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./UpdateEmployee.css";
import { useAuth } from "../contexts/AuthContext";

function UpdateEmployee() {
  const [employee, setEmployee] = useState({
    employeeID: "",
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    nic: "",
    mobile: "",
    city: "",
    role: "user",
    image: null,
    profileImage: null,
    isLocalStorageUser: false
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // Helper to update auth info in localStorage and notify app (fallback when context has no updater)
  const updateAuthStorage = (authUpdate) => {
    try {
      // keep shape minimal (your app may expect different keys)
      localStorage.setItem('user', JSON.stringify(authUpdate));
      // notify other parts of the app that auth changed
      window.dispatchEvent(new Event('authUpdated'));
    } catch (err) {
      console.warn('Failed to update auth storage', err);
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    if (!email || email.trim() === '') {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address with @';
    }
    return '';
  };

  const validatePhoneNumber = (phone) => {
    if (!phone || phone.trim() === '') {
      return 'Phone number is required';
    }
    if (phone.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return 'Phone number must contain only digits';
    }
    return '';
  };

  const validateNIC = (nic) => {
    if (!nic || nic.trim() === '') {
      return 'NIC is required';
    }
    const nicRegex = /^(\d{12}|\d{9}[Vv])$/;
    if (!nicRegex.test(nic)) {
      return 'NIC must be either 12 digits or 9 digits followed by V';
    }
    return '';
  };

  const validateForm = () => {
    const errors = {};

    // Only validate when employee is loaded
    if (!employee.employeeID) {
      // If not loaded, treat as invalid
      errors.general = 'User data not loaded';
      setValidationErrors(errors);
      return false;
    }

    if (!employee.firstName || employee.firstName.trim() === '') {
      errors.firstName = 'First name is required';
    }

    if (!employee.lastName || employee.lastName.trim() === '') {
      errors.lastName = 'Last name is required';
    }

    const emailError = validateEmail(employee.email);
    if (emailError) {
      errors.email = emailError;
    }

    const phoneError = validatePhoneNumber(employee.mobile);
    if (phoneError) {
      errors.mobile = phoneError;
    }

    // NIC: require only for localStorage users (NIC is read-only for local users)
    if (employee.isLocalStorageUser) {
      const nicError = validateNIC(employee.nic);
      if (nicError) {
        errors.nic = nicError;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // helper: convert File -> base64 dataURL
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Load existing employee data — but ONLY for the logged-in user.
  useEffect(() => {
    const normalize = v => (v || "").toString().toLowerCase().trim();

    if (!authUser) {
      // if not logged in, redirect to login
      navigate('/login');
      return;
    }

    // Prefer authUser identity — always show logged-in user's own profile
    const loadLoggedUser = async () => {
      // Try to find a matching localStorage user first
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const localUser = registeredUsers.find(u =>
        (u.email && normalize(u.email) === normalize(authUser.email)) ||
        (u.id && normalize(u.id) === normalize(authUser.employeeID)) ||
        (u.id && normalize(u.id) === normalize(authUser.id))
      );

      if (localUser) {
        setEmployee({
          employeeID: localUser.id,
          firstName: localUser.firstName || "",
          lastName: localUser.lastName || "",
          name: `${localUser.firstName || ''} ${localUser.lastName || ''}`.trim(),
          email: localUser.email || "",
          phoneNumber: "",
          address: localUser.address || "",
          nic: localUser.nicNo || "",
          mobile: localUser.phone || "",
          city: localUser.city || "",
          role: localUser.role || "user",
          image: localUser.profileImage || null,
          profileImage: localUser.profileImage || null,
          isLocalStorageUser: true
        });
        if (localUser.profileImage) setImagePreview(localUser.profileImage);
        setValidationErrors({});
        return;
      }

      // Not a local user — try to load from backend using authUser id (prefer employeeID then id)
      const userId = authUser.employeeID || authUser.id || routeId;
      if (userId) {
        try {
          const res = await axios.get("http://localhost:3000/api/employees/" + userId);
          const data = res.data || {};
          setEmployee({
            _id: data._id,
            employeeID: data.employeeID,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            name: data.name || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
            nic: data.nic || "",
            mobile: data.mobile || "",
            city: data.city || "",
            role: data.role || "user",
            image: data.image || null,
            profileImage: data.profileImage || null,
            isLocalStorageUser: false
          });
          if (data.image) setImagePreview(data.image.startsWith("http") ? data.image : `http://localhost:3000${data.image}`);
        } catch (err) {
          console.error("Error loading database user:", err);
          // Fallback: populate from minimal authUser fields
          setEmployee(prev => ({
            ...prev,
            firstName: authUser.firstName || "",
            lastName: authUser.lastName || "",
            name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim(),
            email: authUser.email || "",
            role: authUser.role || "user",
            employeeID: authUser.employeeID || authUser.id || prev.employeeID
          }));
        }
      } else {
        // No id available; populate from authUser minimal data
        setEmployee(prev => ({
          ...prev,
          firstName: authUser.firstName || "",
          lastName: authUser.lastName || "",
          name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim(),
          email: authUser.email || "",
          role: authUser.role || "user",
          employeeID: authUser.employeeID || authUser.id || prev.employeeID
        }));
      }
    };

    loadLoggedUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const onChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      if (file) {
        setEmployee({ ...employee, image: file });
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
      }
    } else {
      setEmployee({ ...employee, [e.target.name]: e.target.value });
      if (validationErrors[e.target.name]) {
        setValidationErrors({
          ...validationErrors,
          [e.target.name]: ''
        });
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const errorMessages = Object.values(validationErrors);
      if (errorMessages.length > 0) {
        alert(`Please fix the following errors:\n${errorMessages.join('\n')}`);
      } else {
        alert('Please ensure all required fields are filled correctly.');
      }
      return;
    }

    // Save for localStorage users
    if (employee.isLocalStorageUser) {
      try {
        const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = localUsers.findIndex(u =>
          (u.id && u.id === employee.employeeID) ||
          (u.email && u.email.toLowerCase().trim() === (employee.email || "").toLowerCase().trim())
        );

        if (userIndex !== -1) {
          // If a new file was uploaded (employee.image is File), convert to base64
          let profileImg = localUsers[userIndex].profileImage || null;
          if (employee.image && typeof employee.image !== 'string') {
            try {
              profileImg = await fileToDataUrl(employee.image);
            } catch (err) {
              console.error("Error converting image to dataURL:", err);
            }
          } else if (typeof employee.image === 'string') {
            profileImg = employee.image;
          } else if (employee.profileImage) {
            profileImg = employee.profileImage;
          }

          localUsers[userIndex] = {
            ...localUsers[userIndex],
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.mobile,
            nicNo: employee.nic,
            address: employee.address,
            city: employee.city,
            profileImage: profileImg,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('registeredUsers', JSON.stringify(localUsers));

          // Update auth storage so UI reflects updated logged-in user
          const authUpdate = {
            id: localUsers[userIndex].id,
            employeeID: localUsers[userIndex].id,
            email: localUsers[userIndex].email,
            firstName: localUsers[userIndex].firstName,
            lastName: localUsers[userIndex].lastName,
            role: localUsers[userIndex].role || 'user',
            profileImage: localUsers[userIndex].profileImage
          };
          // Use storage helper (fallback) to propagate changes
          updateAuthStorage(authUpdate);

          alert('Profile updated successfully!');
          navigate('/users');
        } else {
          alert('Error: User not found in local storage.');
        }
      } catch (err) {
        console.error("Error updating localStorage user:", err);
        alert('Error saving profile locally.');
      }
      return;
    }

    // Save for database users
    try {
      const formData = new FormData();
      formData.append("employeeID", employee.employeeID);
      formData.append("firstName", employee.firstName);
      formData.append("lastName", employee.lastName);
      formData.append("email", employee.email);
      formData.append("phoneNumber", employee.phoneNumber || "");
      formData.append("address", employee.address || "");
      formData.append("nic", employee.nic || "");
      formData.append("mobile", employee.mobile || "");
      formData.append("city", employee.city || "");
      formData.append("role", employee.role || "user");

      if (employee.image && typeof employee.image !== 'string') {
        formData.append("image", employee.image);
      }

      const userId = authUser?.employeeID || authUser?.id || employee._id;
      await axios.put("http://localhost:3000/api/employees/" + userId, formData);

      // update auth storage (fallback)
      const authUpdate = {
        id: userId,
        employeeID: userId,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role
      };
      updateAuthStorage(authUpdate);

      alert('Employee updated successfully!');
      navigate('/users');
    } catch (err) {
      console.error("❌ Error updating database user:", err);
      alert('Error updating employee');
    }
  };

  return (
    <div className="update-employee">
      <div className="container">
        <div className="row">
          <div className="col-md-8 m-auto">
            <br />
            <Link to="/users" className="btn btn-outline-warning float-left">
              Show User List
            </Link>
          </div>
        </div>

        <div className="col-md-8 m-auto">
          <form noValidate onSubmit={onSubmit}>
            <div className="form-group">
              <label>User ID (Auto-generated)</label>
              <input
                type="text"
                name="employeeID"
                className="form-control"
                value={employee.employeeID}
                disabled
                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
              />
              <small className="form-text text-muted">User ID is auto-generated and cannot be changed</small>
            </div>
            <br />

            <div className="form-group">
              <label>Profile Image</label>
              <input
                type="file"
                name="image"
                className="form-control"
                onChange={onChange}
                accept="image/*"
              />
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: "2px solid #ddd"
                    }}
                  />
                </div>
              )}
            </div>
            <br />

            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                className={"form-control " + (validationErrors.firstName ? 'is-invalid' : '')}
                value={employee.firstName}
                onChange={onChange}
                placeholder="Enter first name"
                required
              />
              {validationErrors.firstName && (
                <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                  {validationErrors.firstName}
                </div>
              )}
            </div>
            <br />

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                className={"form-control " + (validationErrors.lastName ? 'is-invalid' : '')}
                value={employee.lastName}
                onChange={onChange}
                placeholder="Enter last name"
                required
              />
              {validationErrors.lastName && (
                <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                  {validationErrors.lastName}
                </div>
              )}
            </div>
            <br />

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                className={"form-control " + (validationErrors.email ? 'is-invalid' : '')}
                value={employee.email}
                onChange={onChange}
                placeholder="Enter valid email with @"
                required
              />
              {validationErrors.email && (
                <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                  {validationErrors.email}
                </div>
              )}
            </div>
            <br />

            <div className="form-group">
              <label>Mobile Phone *</label>
              <input
                type="text"
                name="mobile"
                className={"form-control " + (validationErrors.mobile ? 'is-invalid' : '')}
                value={employee.mobile}
                onChange={onChange}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
                required
              />
              {validationErrors.mobile && (
                <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                  {validationErrors.mobile}
                </div>
              )}
            </div>
            <br />

            <div className="form-group">
              <label>NIC Number {employee.isLocalStorageUser ? '*' : ''} </label>
              <input
                type="text"
                name="nic"
                className="form-control"
                value={employee.nic}
                placeholder="NIC Number from Registration"
                maxLength="12"
                readOnly={employee.isLocalStorageUser}
                disabled={employee.isLocalStorageUser}
                style={{
                  backgroundColor: employee.isLocalStorageUser ? '#f8f9fa' : undefined,
                  color: employee.isLocalStorageUser ? '#6c757d' : undefined,
                  cursor: employee.isLocalStorageUser ? 'not-allowed' : undefined
                }}
              />
              <small className="form-text text-muted">
                {employee.isLocalStorageUser ? 'NIC is read-only and set during registration' : 'NIC can be managed by admin (if applicable)'}
              </small>
              {validationErrors.nic && (
                <div style={{ color: '#dc3545', marginTop: '5px' }}>{validationErrors.nic}</div>
              )}
            </div>
            <br />

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={employee.address}
                onChange={onChange}
                placeholder="Enter your address"
              />
            </div>
            <br />

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                className="form-control"
                value={employee.city}
                onChange={onChange}
                placeholder="Enter your city"
              />
            </div>
            <br />

            <div className="form-group">
              <button
                type="submit"
                className="btn btn-block mt-4"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  backgroundColor: '#ffc107', /* yellow */
                  color: '#212529',
                  fontWeight: '700',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 6px 18px rgba(255,193,7,0.12)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e0a800';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 22px rgba(224,168,0,0.18)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffc107';
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(255,193,7,0.12)';
                }}
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateEmployee;
