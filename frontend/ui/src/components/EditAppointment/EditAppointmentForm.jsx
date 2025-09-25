// EditAppointmentForm.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditAppointmentForm.css';

const EditAppointmentForm = () => {
  const { id } = useParams();
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

  const sessionTimes = {
    Morning: ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00"],
    Evening: ["16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00"]
  };

  const doctors = {
    Morning: "Dr. Mahesh Thilakarathna",
    Evening: "Dr. Sarathchandra Paranavitharana"
  };

  useEffect(() => {
    if (formData.session) {
      setFormData(prev => ({ ...prev, doctorName: doctors[formData.session] }));
    }
  }, [formData.session]);

  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:3000/api/appointments/${id}`)
      .then(res => {
        if (res.data && res.data.appointment) {
          setFormData(res.data.appointment);
        } else {
          alert('Appointment not found');
        }
      })
      .catch(err => {
        console.error("Fetch error:", err.response?.data || err.message);
        alert("Failed to load appointment details");
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const validateForm = () => {
    if (!formData.session) { alert("Select session"); return false; }

    const now = new Date();
    const selectedDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
    if (selectedDateTime < now) {
      alert("You cannot select a past date or time.");
      return false;
    }

    if (!sessionTimes[formData.session]?.includes(formData.appointmentTime)) {
      alert("Invalid time for selected session.");
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.contactNo)) {
      alert("Please enter a valid 10-digit phone number.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    axios.put(`http://localhost:3000/api/appointments/${id}`, formData)
      .then(() => {
        alert('Appointment updated successfully!');
        navigate('/appointments');
      })
      .catch(err => {
        console.error('Update error:', err);
        alert('Failed to update appointment');
      });
  };

  const availableTimes = formData.session ? sessionTimes[formData.session] : [];

  return (
    <div className="edit-appointment-container">
      <h2>Edit Appointment</h2>
      <form className="edit-appointment-form" onSubmit={handleSubmit}>
        <input type="text" name="ownerName" placeholder="Owner Name" value={formData.ownerName} onChange={handleChange} required />
        <input type="tel" name="contactNo" placeholder="Contact Number" value={formData.contactNo} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <input type="text" name="petName" placeholder="Pet Name" value={formData.petName} onChange={handleChange} required />
        <input type="text" name="species" placeholder="Species" value={formData.species} onChange={handleChange} required />
        <input type="text" name="breed" placeholder="Breed" value={formData.breed} onChange={handleChange} required />
        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} min="0" required />

        <input
          type="date"
          name="appointmentDate"
          min={new Date().toISOString().split("T")[0]}
          value={formData.appointmentDate ? formData.appointmentDate.slice(0,10) : ''}
          onChange={handleChange}
          required
        />

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

        <select 
          name="appointmentTime" 
          value={formData.appointmentTime} 
          onChange={handleChange} 
          required
          disabled={!formData.session}
        >
          <option value="">Select Time</option>
          {availableTimes.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>

        <textarea name="reason" placeholder="Reason for Appointment" rows="3" value={formData.reason} onChange={handleChange} required />
        
        <button type="submit">Update Appointment</button>
      </form>
    </div>
  );
};

export default EditAppointmentForm;