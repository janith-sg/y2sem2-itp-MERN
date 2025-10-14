// src/components/AppointmentDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./AppointmentDetails.css";

const AppointmentDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  // accept many possible param names, fallback to the first param value
  const paramId = params.id ?? params.appointmentId ?? params.appId ?? Object.values(params)[0];

  useEffect(() => {
    const load = () => {
      try {
        const list = JSON.parse(localStorage.getItem("appointments") || "[]");
        const found = list.find(a =>
          String(a.id) === String(paramId) || String(a.appointmentId) === String(paramId)
        );
        if (found) {
          setAppointment(found);
        } else {
          setAppointment(null);
        }
      } catch (err) {
        console.error("Error loading appointment:", err);
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [paramId]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "—";
    const [hours, minutes] = (timeString || "").split(':');
    const hour = parseInt(hours || "0");
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes || '00'} ${ampm}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case 'scheduled': return '#28a745';
      case 'completed': return '#007bff';
      case 'cancelled': return '#dc3545';
      case 'in-progress': return '#ffc107';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="appointment-details-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="appointment-details-container">
        <div className="error">
          <h3>Appointment not found</h3>
          <button onClick={() => navigate("/appointments")} className="btn-back">
            ← Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  // Determine permissions only after appointment exists
  const meId = (user?.email || user?.id || user?.employeeID || "").toString();
  const ownerIds = [(appointment.ownerId || ""), (appointment.ownerEmail || ""), (appointment.petOwnerName || "")].map(v => v.toString());
  const isOwner = meId && ownerIds.includes(meId);
  const isAdmin = user?.role === "admin";

  const handleEdit = () => {
    // navigate to the edit route expected by EditAppointment component
    const target = appointment.id || appointment.appointmentId || paramId;
    navigate(`/appointments/${target}/edit`);
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updatedAppointments = appointments.filter(apt =>
        !(String(apt.id) === String(appointment.id) || String(apt.appointmentId) === String(appointment.appointmentId))
      );
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      window.dispatchEvent(new Event("appointmentsUpdated"));
      alert("Appointment deleted successfully!");
      navigate("/appointments");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Error deleting appointment. Please try again.");
    }
  };

  // Render only the relevant appointment data
  return (
    <div className="appointment-details-container">
      <div className="appointment-details-wrapper">
        {/* Header */}
        <div className="appointment-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="appointment-title">🏥 Appointment Details</h1>
              <div className="appointment-subtitle">
                <span className="appointment-code">#{appointment.appointmentId || appointment.id}</span>
              </div>
            </div>
            <div className="header-buttons">
              <button onClick={() => navigate("/appointments")} className="btn-back">← Back to List</button>
            </div>
          </div>
        </div>

        {/* Appointment Info Card */}
        <div className="appointment-card">
          {/* Status Banner */}
          <div className="status-banner" style={{ backgroundColor: getStatusColor(appointment.status) }}>
            <div className="status-content">
              <span className="status-icon">
                {appointment.status === 'scheduled' && '📅'}
                {appointment.status === 'completed' && '✅'}
                {appointment.status === 'cancelled' && '❌'}
                {appointment.status === 'in-progress' && '⏳'}
                {!appointment.status && '📅'}
              </span>
              <span className="status-text">{appointment.status || 'Scheduled'}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="card-content">
            {/* Quick Overview Section */}
            <div className="quick-overview">
              <div className="overview-item">
                <div className="overview-icon">🐾</div>
                <div className="overview-content">
                  <div className="overview-label">Pet</div>
                  <div className="overview-value">{appointment.petName}</div>
                  <div className="overview-subtext">{appointment.petId || '—'} • {appointment.petAge || 'N/A'}</div>
                </div>
              </div>
              <div className="overview-item">
                <div className="overview-icon">👤</div>
                <div className="overview-content">
                  <div className="overview-label">Owner</div>
                  <div className="overview-value">{appointment.petOwnerName}</div>
                  <div className="overview-subtext">{appointment.ownerId}</div>
                </div>
              </div>
              <div className="overview-item">
                <div className="overview-icon">🏥</div>
                <div className="overview-content">
                  <div className="overview-label">Service</div>
                  <div className="overview-value">{appointment.serviceType}</div>
                  <div className="overview-subtext">Dr. {appointment.veterinarian || 'TBD'}</div>
                </div>
              </div>
            </div>
            {/* Pet Information */}
            <div className="info-section">
              <h3 className="section-title">
                <span className="section-icon">🐾</span>
                Pet Details
              </h3>
              <div className="detail-cards">
                <div className="detail-card">
                  <div className="detail-icon">🏷️</div>
                  <div className="detail-content">
                    <div className="detail-label">Pet Name</div>
                    <div className="detail-value">{appointment.petName}</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">🆔</div>
                  <div className="detail-content">
                    <div className="detail-label">Pet ID</div>
                    <div className="detail-value">{appointment.petId || 'Not Assigned'}</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">🐕</div>
                  <div className="detail-content">
                    <div className="detail-label">Type & Breed</div>
                    <div className="detail-value">{appointment.petType}</div>
                    <div className="detail-subvalue">{appointment.petBreed || 'Mixed Breed'}</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">🎂</div>
                  <div className="detail-content">
                    <div className="detail-label">Age</div>
                    <div className="detail-value">{appointment.petAge || 'Unknown'} years</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="info-section">
              <h3 className="section-title">
                <span className="section-icon">👤</span>
                Owner Information
              </h3>
              <div className="detail-cards">
                <div className="detail-card">
                  <div className="detail-icon">👨‍💼</div>
                  <div className="detail-content">
                    <div className="detail-label">Owner Name</div>
                    <div className="detail-value">{appointment.petOwnerName}</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">🆔</div>
                  <div className="detail-content">
                    <div className="detail-label">Owner ID</div>
                    <div className="detail-value">{appointment.ownerId}</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">📞</div>
                  <div className="detail-content">
                    <div className="detail-label">Phone Number</div>
                    <div className="detail-value">{appointment.ownerPhone || 'Not Provided'}</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">📧</div>
                  <div className="detail-content">
                    <div className="detail-label">Email Address</div>
                    <div className="detail-value">{appointment.ownerEmail}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Information */}
            <div className="info-section">
              <h3 className="section-title">
                <span className="section-icon">📅</span>
                Appointment Schedule
              </h3>
              <div className="detail-cards">
                <div className="detail-card highlight">
                  <div className="detail-icon">📅</div>
                  <div className="detail-content">
                    <div className="detail-label">Appointment Date</div>
                    <div className="detail-value">{formatDate(appointment.appointmentDate)}</div>
                  </div>
                </div>
                <div className="detail-card highlight">
                  <div className="detail-icon">⏰</div>
                  <div className="detail-content">
                    <div className="detail-label">Appointment Time</div>
                    <div className="detail-value">{formatTime(appointment.appointmentTime)}</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">🏥</div>
                  <div className="detail-content">
                    <div className="detail-label">Service Type</div>
                    <div className="detail-value">{appointment.serviceType}</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">👨‍⚕️</div>
                  <div className="detail-content">
                    <div className="detail-label">Veterinarian</div>
                    <div className="detail-value">Dr. {appointment.veterinarian || 'To Be Assigned'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(appointment.symptoms || appointment.notes) && (
              <div className="info-section">
                <h3 className="section-title">
                  <span className="section-icon">📝</span>
                  Additional Information
                </h3>
                <div className="notes-section">
                  {appointment.symptoms && (
                    <div className="note-card">
                      <div className="note-header">
                        <span className="note-icon">🩺</span>
                        <span className="note-title">Symptoms & Reason for Visit</span>
                      </div>
                      <div className="note-content">{appointment.symptoms}</div>
                    </div>
                  )}
                  {appointment.notes && (
                    <div className="note-card">
                      <div className="note-header">
                        <span className="note-icon">📋</span>
                        <span className="note-title">Additional Notes</span>
                      </div>
                      <div className="note-content">{appointment.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="info-section">
              <h3 className="section-title">
                <span className="section-icon">ℹ️</span>
                Appointment Information
              </h3>
              <div className="metadata-section">
                <div className="metadata-item">
                  <span className="metadata-icon">📅</span>
                  <div className="metadata-content">
                    <span className="metadata-label">Created On</span>
                    <span className="metadata-value">{new Date(appointment.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="metadata-item">
                  <span className="metadata-icon">🏷️</span>
                  <div className="metadata-content">
                    <span className="metadata-label">Current Status</span>
                    <span className="metadata-value status-badge" style={{ backgroundColor: getStatusColor(appointment.status) }}>
                      {appointment.status || 'Scheduled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              {/* Edit allowed only for owner */}
              {isOwner && (
                <button onClick={handleEdit} className="btn-edit">
                  ✏️ Edit Appointment
                </button>
              )}

              {/* Delete allowed for owner and admin */}
              {(isOwner || isAdmin) && (
                <button onClick={handleDelete} className="btn-delete">
                  🗑️ Delete Appointment
                </button>
              )}

              <button onClick={() => navigate("/appointments")} className="btn-back">
                ← Back to Appointments
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;