import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InsertDoctorSession.css';

const InsertDoctorSession = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doctorName: '',
    sessionType: '',
    sessionDate: '',
    specialNotice: ''
  });

  const doctors = [
    "Dr. Mahesh Thilakarathna",
    "Dr. Sarathchandra Paranavitharana"
  ];

  // session mapping - auto select based on doctor
  const mapDoctorToSession = (doctorName) => {
    if (doctorName === "Dr. Mahesh Thilakarathna") return "Morning";
    if (doctorName === "Dr. Sarathchandra Paranavitharana") return "Evening";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // if doctor changes, auto-set sessionType
    if (name === "doctorName") {
      const sessionType = mapDoctorToSession(value);
      setFormData({ ...formData, doctorName: value, sessionType });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    if (!formData.doctorName || !formData.sessionType || !formData.sessionDate) {
      alert("Doctor, session type and date are required.");
      return false;
    }
    if (!["Morning","Evening"].includes(formData.sessionType)) {
      alert("Invalid session type");
      return false;
    }
    if (formData.specialNotice && formData.specialNotice.length > 200) {
      alert("Special notice must be under 200 characters.");
      return false;
    }
    const today = new Date(); today.setHours(0,0,0,0);
    const sel = new Date(formData.sessionDate); sel.setHours(0,0,0,0);
    if (sel < today) {
      alert("Session date must be today or in the future.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch('http://localhost:3000/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Failed to add session: ${data.message || 'Unknown error'}`);
        console.error("Server error:", data);
        return;
      }
      alert('Doctor session added successfully!');
      navigate('/doctor-sessions');
    } catch (err) {
      console.error("Network error:", err);
      alert('Failed to connect to server. Is backend running?');
    }
  };

  // helper to show timeslot
  const getTimeSlot = (sessionType) => {
    if (sessionType === "Morning") return "08:00 AM – 12:00 PM";
    if (sessionType === "Evening") return "04:00 PM – 08:00 PM";
    return "";
  };

  return (
    <div className="insert-session-container">
      <h2>Add Doctor Session</h2>
      <form className="insert-session-form" onSubmit={handleSubmit}>
        <select name="doctorName" value={formData.doctorName} onChange={handleChange} required>
          <option value="">Select Doctor</option>
          {doctors.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <input 
          type="date"
          name="sessionDate"
          min={new Date().toISOString().split("T")[0]}
          value={formData.sessionDate}
          onChange={handleChange}
          required
        />

        {/* show sessionType (auto-selected) */}
        <div style={{ marginBottom: 10 }}>
          <strong>Session:</strong> {formData.sessionType || '—'}
          {formData.sessionType && (
            <div style={{ marginTop: 6, background: '#f0f8ff', padding: 6, borderRadius: 4 }}>
              🕒 {getTimeSlot(formData.sessionType)}
            </div>
          )}
        </div>

        <textarea
          name="specialNotice"
          placeholder="Special Notice (optional, max 200 chars)"
          value={formData.specialNotice}
          onChange={(e) => setFormData({...formData, specialNotice: e.target.value})}
          maxLength={200}
          rows="2"
        />

        <button type="submit">Add Session</button>
      </form>
    </div>
  );
};

export default InsertDoctorSession;
