import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/appointments/${id}`)
      .then(res => setAppointment(res.data.appointment))
      .catch(err => alert("Failed to fetch appointment"));
  }, [id]);

  if (!appointment) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <CardMedia
          component="img"
          height="250"
          image={appointment.petImage || "https://t3.ftcdn.net/jpg/08/28/49/30/360_F_828493018_Ntaia2HBMK7UHVFyP8jv0UrTcD7Fk7pw.jpg"}
          alt={appointment.petName}
        />
        <CardContent>
          <Typography variant="h4">{appointment.petName}</Typography>
          <Typography><strong>Owner:</strong> {appointment.ownerName}</Typography>
          <Typography><strong>Contact:</strong> {appointment.contactNo}</Typography>
          <Typography><strong>Email:</strong> {appointment.email}</Typography>
          <Typography><strong>Address:</strong> {appointment.address}</Typography>
          <Typography><strong>Species:</strong> {appointment.species}</Typography>
          <Typography><strong>Breed:</strong> {appointment.breed}</Typography>
          <Typography><strong>Age:</strong> {appointment.age}</Typography>
          <Typography><strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</Typography>
          // Inside CardContent
<Typography><strong>Session:</strong> {appointment.session}</Typography>
<Typography><strong>Doctor:</strong> {appointment.doctorName}</Typography>
          <Typography><strong>Time:</strong> {appointment.appointmentTime}</Typography>
          <Typography><strong>Reason:</strong> {appointment.reason}</Typography>
        </CardContent>
      </Card>
      <Button style={{ marginTop: '20px' }} variant="contained" onClick={() => navigate('/appointments')}>Back to Appointments</Button>
    </div>
  );
};

export default AppointmentDetails;
