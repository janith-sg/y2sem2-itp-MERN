import React from 'react';
import axios from 'axios';
import './DoctorSessionCard.css';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

const DoctorSessionCard = ({ session }) => {
  const navigate = useNavigate();

  const onDeleteClick = async () => {
    if (!window.confirm("Delete this session? This cannot be undone.")) return;
    try {
      const id = session._id;
      if (!id) throw new Error("Session ID missing");
      await axios.delete(`http://localhost:3000/api/sessions/${id}`);
      alert("Session deleted");
      window.location.reload();
    } catch (err) {
      console.error("Delete session error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to delete session";
      alert(msg);
    }
  };

  return (
    <Card className="session-card">
      <CardContent>
        <Typography variant="h6">{session.doctorName}</Typography>
        <Typography><strong>Date:</strong> {new Date(session.sessionDate).toLocaleDateString()}</Typography>
        <Typography><strong>Session:</strong> {session.sessionType}</Typography>
        <Typography><strong>Status:</strong> {session.status}</Typography>
        {session.specialNotice && <Typography><strong>Notice:</strong> {session.specialNotice}</Typography>}
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" onClick={() => navigate(`/edit-doctor-session/${session._id}`)}>Edit</Button>
        <Button size="small" color="error" onClick={onDeleteClick}>Delete</Button>
      </CardActions>
    </Card>
  );
};

export default DoctorSessionCard;
