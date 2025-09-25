// src/components/InsertAppointment/InsertAppointment.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InsertAppointment.css';

const InsertAppointment = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ownerName: '',
    contactNo: '',
    email: '',
    address: '',
    petName: '',
    species: '',
    breed: '',
    age: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    petImage: '',
    session: '',
    doctorName: ''
  });

  const [takenTimes, setTakenTimes] = useState([]);

  const sessionTimes = {
    Morning: ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00"],
    Evening: ["16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00"]
  };

  const doctors = {
    Morning: "Dr. Mahesh Thilakarathna",
    Evening: "Dr. Sarathchandra Paranavitharana"
  };

  // Auto-fill doctor name when session changes
  useEffect(() => {
    if (formData.session) {
      setFormData(prev => ({
        ...prev,
        doctorName: doctors[formData.session],
        appointmentTime: '' // reset time
      }));
    }
  }, [formData.session]);

  // Fetch booked times for selected date + session
  useEffect(() => {
    if (!formData.appointmentDate || !formData.session) return;

    axios.get(`http://localhost:3000/api/appointments`)
      .then(res => {
        const bookedTimes = res.data.appointments
          .filter(a => 
            a.appointmentDate.slice(0,10) === formData.appointmentDate &&
            a.session === formData.session
          )
          .map(a => a.appointmentTime);
        setTakenTimes(bookedTimes);
      })
      .catch(err => console.error(err));
  }, [formData.appointmentDate, formData.session]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0,10);
    setFormData({...formData, contactNo: value});
  };

  const handleAgeChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    setFormData({...formData, age: value});
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData({...formData, petImage: reader.result});
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!formData.session) { alert("Please select a session"); return false; }
    if (!formData.doctorName) { alert("Doctor name missing"); return false; }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.contactNo)) { alert("Enter valid 10-digit phone"); return false; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { alert("Enter valid email"); return false; }

    if (takenTimes.includes(formData.appointmentTime)) {
      alert("This time is already booked for selected date and session.");
      return false;
    }

    if (!formData.petImage) { alert("Please upload a pet image"); return false; }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post('http://localhost:3000/api/appointments', formData);
      alert('Appointment added! Price: LKR 1000\nNotice: Cancel at least 2 days before.');
      navigate('/appointments');
    } catch (err) {
      console.error(err);
      alert('Failed to add appointment.');
    }
  };

  const availableTimes = formData.session ? sessionTimes[formData.session] : [];

  return (
    <div className="insert-appointment-container">
      <h2>Pet Care+ | Add New Appointment</h2>
      <p className="notice">Price: LKR 1000 | Cancel 2 days before appointment</p>
      <form className="insert-appointment-form" onSubmit={handleSubmit}>

        <input type="text" name="ownerName" placeholder="Owner Name" value={formData.ownerName} onChange={handleChange} required />
        <input type="tel" name="contactNo" placeholder="Contact Number" value={formData.contactNo} onChange={handlePhoneChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <input type="text" name="petName" placeholder="Pet Name" value={formData.petName} onChange={handleChange} required />
        <input type="text" name="species" placeholder="Species" value={formData.species} onChange={handleChange} required />
        <input type="text" name="breed" placeholder="Breed" value={formData.breed} onChange={handleChange} required />
        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleAgeChange} min="0" required />

        <input 
          type="date" 
          name="appointmentDate" 
          min={new Date().toISOString().split("T")[0]} 
          value={formData.appointmentDate} 
          onChange={handleChange} 
          required 
        />

        {/* Session Selection */}
        <select 
          name="session" 
          value={formData.session} 
          onChange={handleChange} 
          required
        >
          <option value="">Select Session</option>
          <option value="Morning">Morning Session (8:00 AM - 12:00 PM)</option>
          <option value="Evening">Evening Session (4:00 PM - 8:00 PM)</option>
        </select>

        {/* 👇 DISPLAY DOCTOR NAME IMMEDIATELY BELOW SESSION */}
        {formData.session && (
          <div style={{ 
            fontSize: '15px', 
            color: '#1976d2', 
            fontWeight: '600', 
            margin: '8px 0',
            padding: '6px',
            backgroundColor: '#f0f8ff',
            borderRadius: '4px'
          }}>
            🩺 Assigned Doctor: {formData.doctorName}
          </div>
        )}

        {/* Time Selection */}
        <select 
          name="appointmentTime" 
          value={formData.appointmentTime} 
          onChange={handleChange} 
          required
          disabled={!formData.session}
        >
          <option value="">Select Time</option>
          {availableTimes.map(time => (
            <option 
              key={time} 
              value={time} 
              disabled={takenTimes.includes(time)}
            >
              {time} {takenTimes.includes(time) ? '(Booked)' : ''}
            </option>
          ))}
        </select>

        <textarea 
          name="reason" 
          placeholder="Reason for Appointment" 
          rows="3" 
          value={formData.reason} 
          onChange={handleChange} 
          required 
        />

        <input type="file" accept="image/*" onChange={handleImageChange} required />
        {formData.petImage && <img src={formData.petImage} alt="Pet" className="preview-image" />}

        <button type="submit">Add Appointment</button>
      </form>
    </div>
  );
};

export default InsertAppointment;