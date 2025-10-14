// src/components/AppointmentCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./AppointmentCard.css";

const AppointmentCard = ({ appointment, onDelete, userRole, currentUser }) => {
  const navigate = useNavigate();

  // Check if current user can edit/delete this appointment
  const canModify = userRole === "admin" || 
                   appointment.ownerId === currentUser?.email || 
                   appointment.ownerId === currentUser?.id ||
                   appointment.ownerId === currentUser?.employeeID ||
                   appointment.ownerId === currentUser?.userId ||
                   appointment.ownerEmail === currentUser?.email;

  const handleViewDetails = () => {
    navigate(`/appointment-details/${appointment.id}`);
  };

  const handleEdit = () => {
    navigate(`/edit-appointment/${appointment.id}`);
  };

  const handleDelete = () => {
    onDelete(appointment.id);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return '#28a745';
      case 'completed': return '#007bff';
      case 'cancelled': return '#dc3545';
      case 'in-progress': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div className="appointment-card">
      {/* Header with Appointment ID and Status */}
      <div className="appointment-card-header">
        <div className="appointment-id">
          <strong>{appointment.appointmentId || appointment.id}</strong>
        </div>
        <div 
          className="appointment-status"
          style={{ backgroundColor: getStatusColor(appointment.status) }}
        >
          {appointment.status || 'Scheduled'}
        </div>
      </div>

      {/* Pet and Owner Information */}
      <div className="appointment-info">
        <div className="info-row">
          <span className="label">🐾 Pet:</span>
          <span className="value">{appointment.petName}</span>
        </div>
        <div className="info-row">
          <span className="label">🏷️ Pet Type:</span>
          <span className="value">{appointment.petType}</span>
        </div>
        <div className="info-row">
          <span className="label">👤 Owner:</span>
          <span className="value">{appointment.petOwnerName}</span>
        </div>
        <div className="info-row">
          <span className="label">🆔 Owner ID:</span>
          <span className="value">{appointment.ownerId}</span>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="appointment-details">
        <div className="detail-row">
          <span className="label">📅 Date:</span>
          <span className="value">{formatDate(appointment.appointmentDate)}</span>
        </div>
        <div className="detail-row">
          <span className="label">⏰ Time:</span>
          <span className="value">{formatTime(appointment.appointmentTime)}</span>
        </div>
        <div className="detail-row">
          <span className="label">🏥 Service:</span>
          <span className="value">{appointment.serviceType}</span>
        </div>
        <div className="detail-row">
          <span className="label">👨‍⚕️ Vet:</span>
          <span className="value">{appointment.veterinarian}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="appointment-actions">
        <button 
          className="btn-action btn-details"
          onClick={handleViewDetails}
          title="View Details"
        >
          👁️ Details
        </button>
        
        {canModify && (
          <>
            <button 
              className="btn-action btn-edit"
              onClick={handleEdit}
              title="Edit Appointment"
            >
              ✏️ Edit
            </button>
            <button 
              className="btn-action btn-delete"
              onClick={handleDelete}
              title="Delete Appointment"
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;