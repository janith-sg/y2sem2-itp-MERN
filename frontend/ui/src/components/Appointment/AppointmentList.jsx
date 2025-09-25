// src/components/Appointment/AppointmentList.js

import React, { useEffect, useState } from 'react';
import AppointmentListcard from './AppointmentListcard';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data.appointments))
      .catch(err => console.error(err));
  }, []);

  const filteredAppointments = appointments.filter(app => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const petName = app.petName || '';
    const ownerName = app.ownerName || '';
    const doctorName = app.doctorName || '';
    const session = app.session || '';
    const reason = app.reason || '';
    const appointmentTime = app.appointmentTime || '';

    const matchesPet = petName.toLowerCase().includes(term);
    const matchesOwner = ownerName.toLowerCase().includes(term);
    const matchesDoctor = doctorName.toLowerCase().includes(term);
    const matchesSession = session.toLowerCase().includes(term);
    const matchesReason = reason.toLowerCase().includes(term);
    const matchesTime = appointmentTime.toLowerCase().includes(term);

    let dateMatches = false;
    if (app.appointmentDate) {
      const isoDate = app.appointmentDate.split('T')[0].toLowerCase();
      const formattedDate = new Date(app.appointmentDate).toLocaleDateString('en-GB').toLowerCase();
      dateMatches = isoDate.includes(term) || formattedDate.includes(term);
    }

    return matchesPet || matchesOwner || matchesDoctor || 
           matchesSession || matchesReason || matchesTime || dateMatches;
  });

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Appointments - Pet Care+</h2>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <TextField
          label="Search by pet, owner, date, time, doctor, or session"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={() => setSearchTerm('')}>Clear</Button>
      </div>
      {/* ✅ Wrap in Grid container */}
      <Grid container spacing={2} alignItems="stretch">
        {filteredAppointments.map(app => (
          <Grid item xs={12} sm={6} md={4} key={app._id}>
            <AppointmentListcard appointment={app} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default AppointmentList;