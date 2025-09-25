// src/components/Appointment/AppointmentListcard.js

import React from 'react';
import axios from 'axios';
import './AppointmentListcard.css';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

const AppointmentListcard = ({ appointment }) => {
  const navigate = useNavigate();

  const onDeleteClick = () => {
    axios.delete(`http://localhost:3000/api/appointments/${appointment._id}`)
      .then(() => window.location.reload())
      .catch(err => alert("Failed to delete appointment"));
  };

  return (
    // ✅ Removed Grid from here — now just the Card
    <Card className="appointment-card">
      <CardMedia
        className="appointment-image"
        image={appointment.petImage || "https://t3.ftcdn.net/jpg/08/28/49/30/360_F_828493018_Ntaia2HBMK7UHVFyP8jv0UrTcD7Fk7pw.jpg"}
        title={appointment.petName}
      />
      <CardContent className="appointment-content">
        <Typography gutterBottom variant="h5">{appointment.petName}</Typography>
        <Typography variant="body2"><strong>Owner:</strong> {appointment.ownerName}</Typography>
        <Typography variant="body2"><strong>Session:</strong> {appointment.session}</Typography>
        <Typography variant="body2"><strong>Doctor:</strong> {appointment.doctorName}</Typography>
        <Typography variant="body2"><strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</Typography>
        <Typography variant="body2"><strong>Time:</strong> {appointment.appointmentTime}</Typography>
        <Typography variant="body2"><strong>Reason:</strong> {appointment.reason}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" onClick={() => navigate(`/edit-appointment/${appointment._id}`)}>Edit</Button>
        <Button size="small" color="error" onClick={onDeleteClick}>Delete</Button>
        <Button size="small" color="secondary" onClick={() => navigate(`/appointment-details/${appointment._id}`)}>Details</Button>
      </CardActions>
    </Card>
  );
};

export default AppointmentListcard;