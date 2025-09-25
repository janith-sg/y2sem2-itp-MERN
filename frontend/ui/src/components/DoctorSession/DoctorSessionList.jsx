import React, { useEffect, useState } from 'react';
import DoctorSessionCard from './DoctorSessionCard';
import Grid from '@mui/material/Grid';
import './DoctorSessionList.css';

const DoctorSessionList = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/sessions')
      .then(res => res.json())
      .then(data => setSessions(data.sessions || []))
      .catch(err => {
        console.error(err);
        alert("Failed to fetch sessions. Is backend running?");
      });
  }, []);

  return (
    <div className="doctor-session-list">
      <h2>All Doctor Sessions</h2>
      <Grid container spacing={2} alignItems="stretch">
        {sessions.map(session => (
          <Grid item xs={12} sm={6} md={4} key={session._id}>
            <DoctorSessionCard session={session} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default DoctorSessionList;
