import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditDoctorSession.css';

const EditDoctorSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const doctors = [
    "Dr. Mahesh Thilakarathna",
    "Dr. Sarathchandra Paranavitharana"
  ];
  const sessions = ["Morning","Evening"];

  const [formData, setFormData] = useState({
    doctorName: '',
    sessionType: '',
    sessionDate: '',
    specialNotice: '',
    status: 'Upcoming'
  });

  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:3000/api/sessions/${id}`)
      .then(res => {
        const s = res.data.session;
        setFormData({
          doctorName: s.doctorName || '',
          sessionType: s.sessionType || '',
          sessionDate: s.sessionDate ? s.sessionDate.slice(0,10) : '',
          specialNotice: s.specialNotice || '',
          status: s.status || 'Upcoming'
        });
      })
      .catch(err => {
        console.error(err);
        alert("Failed to load session");
      });
  }, [id]);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const validate = () => {
    if (!formData.doctorName || !formData.sessionType || !formData.sessionDate) {
      alert("All fields required");
      return false;
    }
    if (formData.specialNotice && formData.specialNotice.length > 200) {
      alert("Special notice too long");
      return false;
    }
    const today = new Date(); today.setHours(0,0,0,0);
    const sel = new Date(formData.sessionDate); sel.setHours(0,0,0,0);
    if (sel < today) { alert("Session date must be today or future"); return false; }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      doctorName: formData.doctorName,
      sessionType: formData.sessionType,
      sessionDate: formData.sessionDate,
      specialNotice: formData.specialNotice,
      status: formData.status
    };

    axios.put(`http://localhost:3000/api/sessions/${id}`, payload)
      .then(() => {
        alert("Session updated");
        navigate('/doctor-sessions');
      })
      .catch(err => {
        console.error(err);
        alert(err.response?.data?.message || "Update failed");
      });
  };

  const getTimeSlot = (type) => {
    if (type === "Morning") return "08:00 AM – 12:00 PM";
    if (type === "Evening") return "04:00 PM – 08:00 PM";
    return "";
  };

  return (
    <div className="edit-session-container">
      <h2>Edit Doctor Session</h2>
      <form className="edit-session-form" onSubmit={handleSubmit}>
        <select name="doctorName" value={formData.doctorName} onChange={handleChange} required>
          <option value="">Select Doctor</option>
          {doctors.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select name="sessionType" value={formData.sessionType} onChange={handleChange} required>
          <option value="">Select Session</option>
          {sessions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {formData.sessionType && <div style={{padding:8, background:'#f0f8ff', borderRadius:4}}>🕒 {getTimeSlot(formData.sessionType)}</div>}

        <input type="date" name="sessionDate" min={new Date().toISOString().split("T")[0]} value={formData.sessionDate} onChange={handleChange} required />

        <textarea placeholder="Special Notice (optional)" value={formData.specialNotice} onChange={(e)=>setFormData({...formData, specialNotice: e.target.value})} maxLength={200} rows="2" />

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button type="submit">Update Session</button>
      </form>
    </div>
  );
};

export default EditDoctorSession;
