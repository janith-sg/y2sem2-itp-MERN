// src/components/UpdateAppointment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './UpdateAppointment.css';

const UpdateAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    petBreed: '',
    petAge: '',
    petId: '',
    ownerId: '',
    petOwnerName: '',
    ownerEmail: '',
    ownerPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    serviceType: '',
    veterinarian: '',
    symptoms: '',
    notes: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    console.log('Current user in UpdateAppointment:', user);

    // Get appointment from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const foundAppointment = appointments.find(apt => apt.id === id);
    
    console.log('Found appointment:', foundAppointment);
    
    if (!foundAppointment) {
      alert('Appointment not found!');
      navigate('/appointments');
      return;
    }

    // Check permissions - admin can edit all, users can only edit their own
    const canEdit = user.role === 'admin' || 
                   foundAppointment.ownerId === user.email || 
                   foundAppointment.ownerId === user.id ||
                   foundAppointment.ownerId === user.employeeID ||
                   foundAppointment.ownerId === user.userId ||
                   foundAppointment.ownerEmail === user.email;
    
    console.log('Permission check result:', {
      userRole: user.role,
      appointmentOwnerId: foundAppointment.ownerId,
      appointmentOwnerEmail: foundAppointment.ownerEmail,
      userEmail: user.email,
      userId: user.id,
      userEmployeeID: user.employeeID,
      userUserId: user.userId,
      canEdit: canEdit
    });
    
    if (!canEdit) {
      alert('You can only edit your own appointments!');
      navigate('/appointments');
      return;
    }

    setAppointment(foundAppointment);
    
    // Convert date for input field (YYYY-MM-DD format)
    const appointmentDate = new Date(foundAppointment.appointmentDate);
    const formattedDate = appointmentDate.toISOString().split('T')[0];
    
    setFormData({
      petName: foundAppointment.petName || '',
      petType: foundAppointment.petType || '',
      petBreed: foundAppointment.petBreed || '',
      petAge: foundAppointment.petAge || '',
      petId: foundAppointment.petId || '',
      ownerId: foundAppointment.ownerId || '',
      petOwnerName: foundAppointment.petOwnerName || '',
      ownerEmail: foundAppointment.ownerEmail || '',
      ownerPhone: foundAppointment.ownerPhone || '',
      appointmentDate: formattedDate,
      appointmentTime: foundAppointment.appointmentTime || '',
      serviceType: foundAppointment.serviceType || '',
      veterinarian: foundAppointment.veterinarian || '',
      symptoms: foundAppointment.symptoms || '',
      notes: foundAppointment.notes || ''
    });
    
    setLoading(false);
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Validation for date and time
      const selectedDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      const currentDateTime = new Date();

      if (selectedDateTime <= currentDateTime) {
        alert("Please select a future date and time for the appointment!");
        setUpdating(false);
        return;
      }

      // Validation for pet age
      if (parseInt(formData.petAge) < 0 || parseInt(formData.petAge) > 50) {
        alert("Please enter a valid pet age (0-50 years)!");
        setUpdating(false);
        return;
      }

      // Get existing appointments
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const appointmentIndex = appointments.findIndex(apt => apt.id === id);
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }

      // Update the appointment with all the form data
      const updatedAppointment = {
        ...appointments[appointmentIndex],
        petName: formData.petName,
        petType: formData.petType,
        petBreed: formData.petBreed,
        petAge: formData.petAge,
        petId: formData.petId,
        petOwnerName: formData.petOwnerName,
        ownerId: formData.ownerId,
        ownerEmail: formData.ownerEmail,
        ownerPhone: formData.ownerPhone,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        serviceType: formData.serviceType,
        veterinarian: formData.veterinarian,
        symptoms: formData.symptoms,
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      };

      appointments[appointmentIndex] = updatedAppointment;
      
      // Save back to localStorage
      localStorage.setItem('appointments', JSON.stringify(appointments));
      
      alert('Appointment updated successfully!');
      navigate('/appointments'); // Redirect to appointments list
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const updatedAppointments = appointments.filter(apt => apt.id !== id);
        localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
        alert("Appointment deleted successfully!");
        navigate('/appointments'); // Redirect to appointments list
      } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("Error deleting appointment. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="update-appointment-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="update-appointment-container">
        <div className="error">
          <h2>Appointment Not Found</h2>
          <p>The appointment you're looking for doesn't exist.</p>
          <button 
            className="btn-back"
            onClick={() => navigate('/appointments')}
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="update-appointment-container">
      <div className="update-appointment-wrapper">
        {/* Header */}
        <div className="update-header">
          <div className="header-content">
            <h1 className="update-title">Edit Appointment</h1>
           
          </div>
        </div>

        {/* Form */}
        <div className="update-form-card">
          <form onSubmit={handleSubmit} className="update-form">
            {/* Pet Information */}
            <div className="form-section">
              <h3 className="section-title">🐾 Pet Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="petName">Pet Name *</label>
                  <input
                    type="text"
                    id="petName"
                    name="petName"
                    value={formData.petName}
                    onChange={handleChange}
                    required
                    placeholder="Enter pet name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="petType">Pet Type *</label>
                  <select
                    id="petType"
                    name="petType"
                    value={formData.petType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select pet type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Fish">Fish</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Hamster">Hamster</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="petBreed">Pet Breed</label>
                  <input
                    type="text"
                    id="petBreed"
                    name="petBreed"
                    value={formData.petBreed}
                    onChange={handleChange}
                    placeholder="Enter pet breed"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="petAge">Pet Age *</label>
                  <input
                    type="number"
                    id="petAge"
                    name="petAge"
                    value={formData.petAge}
                    onChange={handleChange}
                    required
                    min="0"
                    max="50"
                    placeholder="Enter pet age"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="petId">Pet ID</label>
                  <input
                    type="text"
                    id="petId"
                    name="petId"
                    value={formData.petId}
                    onChange={handleChange}
                    placeholder="Enter pet ID (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="form-section">
              <h3 className="section-title">👤 Owner Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="ownerId">Owner ID</label>
                  <input
                    type="text"
                    id="ownerId"
                    name="ownerId"
                    value={formData.ownerId}
                    readOnly
                    className="readonly"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="petOwnerName">Owner Name *</label>
                  <input
                    type="text"
                    id="petOwnerName"
                    name="petOwnerName"
                    value={formData.petOwnerName}
                    onChange={handleChange}
                    required
                    placeholder="Enter owner name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ownerEmail">Email Address *</label>
                  <input
                    type="email"
                    id="ownerEmail"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ownerPhone">Phone Number *</label>
                  <input
                    type="tel"
                    id="ownerPhone"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    required
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Information */}
            <div className="form-section">
              <h3 className="section-title">📅 Appointment Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="appointmentDate">Appointment Date *</label>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="appointmentTime">Appointment Time *</label>
                  <input
                    type="time"
                    id="appointmentTime"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="serviceType">Service Type *</label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select service type</option>
                    <option value="Routine Checkup">Routine Checkup</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Dental Care">Dental Care</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Grooming">Grooming</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="veterinarian">Veterinarian</label>
                  <input
                    type="text"
                    id="veterinarian"
                    name="veterinarian"
                    value={formData.veterinarian}
                    onChange={handleChange}
                    placeholder="Enter veterinarian name"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h3 className="section-title">📝 Additional Information</h3>
              <div className="form-group">
                <label htmlFor="symptoms">Symptoms/Reason for Visit</label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Describe symptoms or reason for appointment..."
                  rows="3"
                />
              </div>
             
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-update"
                disabled={updating}
              >
                {updating ? (
                  <>
                    <div className="button-spinner"></div>
                    Updating...
                  </>
                ) : (
                  '✓ Update Appointment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateAppointment;