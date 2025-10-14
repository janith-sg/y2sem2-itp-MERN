// src/components/AppointmentList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AppointmentCard from "./AppointmentCard";
import { appointmentService } from "../services/appointmentService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AppointmentList.css";

const AppointmentList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null); // NEW: currently viewed appointment

  const navigate = useNavigate();

  // Helper: get and increment next appointment sequence stored in localStorage
  const getNextAppointmentId = () => {
    try {
      // ensure seq initialized from existing appointments if present
      const storedSeq = Number(localStorage.getItem('lastAppointmentSeq') || 0);
      let seq = storedSeq;

      // If no stored seq, compute from existing appointments in storage
      if (!seq) {
        const existing = JSON.parse(localStorage.getItem('appointments') || '[]');
        let max = 0;
        existing.forEach(a => {
          const m = (a.appointmentId || a.id || "").toString().match(/APT-(\d+)/);
          if (m && m[1]) {
            const n = parseInt(m[1], 10);
            if (!isNaN(n) && n > max) max = n;
          }
        });
        seq = max;
      }

      seq = Number(seq) + 1;
      localStorage.setItem('lastAppointmentSeq', String(seq));
      return `APT-${String(seq).padStart(3, '0')}`;
    } catch (err) {
      console.warn("getNextAppointmentId error:", err);
      // fallback
      const fallback = `APT-${String(Date.now() % 100000).padStart(3,'0')}`;
      return fallback;
    }
  };

  // Function to create sample appointments for testing (use sequential IDs)
  const createSampleAppointments = () => {
    const sampleAppointments = [
      {
        id: getNextAppointmentId(),
        appointmentId: null, // will set below
        petName: "Buddy",
        petType: "Dog",
        petBreed: "Golden Retriever",
        petAge: "3 years",
        petOwnerName: "John Doe",
        ownerId: user?.email || "john@example.com",
        ownerEmail: user?.email || "john@example.com",
        ownerPhone: "+1234567890",
        appointmentDate: "2025-10-15",
        appointmentTime: "10:00",
        serviceType: "Regular Checkup",
        veterinarian: "Dr. Smith",
        symptoms: "Routine health checkup",
        notes: "Annual vaccination due",
        status: "Scheduled"
      },
      {
        id: getNextAppointmentId(),
        appointmentId: null,
        petName: "Whiskers",
        petType: "Cat",
        petBreed: "Persian",
        petAge: "2 years",
        petOwnerName: "Jane Smith",
        ownerId: user?.email || "jane@example.com",
        ownerEmail: user?.email || "jane@example.com",
        ownerPhone: "+1234567891",
        appointmentDate: "2025-10-16",
        appointmentTime: "14:30",
        serviceType: "Dental Cleaning",
        veterinarian: "Dr. Johnson",
        symptoms: "Dental hygiene maintenance",
        notes: "Regular dental cleaning appointment",
        status: "Scheduled"
      },
      {
        id: getNextAppointmentId(),
        appointmentId: null,
        petName: "Charlie",
        petType: "Dog",
        petBreed: "Labrador",
        petAge: "5 years",
        petOwnerName: user?.email?.split('@')[0] || "Admin User",
        ownerId: user?.email || "admin@example.com",
        ownerEmail: user?.email || "admin@example.com",
        ownerPhone: "+1234567892",
        appointmentDate: "2025-10-17",
        appointmentTime: "09:15",
        serviceType: "Emergency Visit",
        veterinarian: "Dr. Brown",
        symptoms: "Limping on left front paw",
        notes: "Urgent consultation needed",
        status: "In-Progress"
      }
    ];

    // set appointmentId same as id for compatibility
    sampleAppointments.forEach(s => { s.appointmentId = s.id; });

    localStorage.setItem('appointments', JSON.stringify(sampleAppointments));
    // ensure lastAppointmentSeq stored (getNextAppointmentId already did)
    console.log('✅ Sample appointments created:', sampleAppointments);
    return sampleAppointments;
  };

  // Load appointments from localStorage
  useEffect(() => {
    const loadAppointments = () => {
      let storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');

      // If no appointments exist, create sample appointments for testing
      if (storedAppointments.length === 0) {
        console.log('� No appointments found, creating sample data...');
        storedAppointments = createSampleAppointments();
      }

      // Initialize lastAppointmentSeq if missing, using max numeric found
      const storedSeq = Number(localStorage.getItem('lastAppointmentSeq') || 0);
      if (!storedSeq) {
        let max = 0;
        storedAppointments.forEach(a => {
          const m = (a.appointmentId || a.id || "").toString().match(/APT-(\d+)/);
          if (m && m[1]) {
            const n = parseInt(m[1], 10);
            if (!isNaN(n) && n > max) max = n;
          }
        });
        if (max > 0) localStorage.setItem('lastAppointmentSeq', String(max));
      }

      console.log('�📅 Loading appointments from localStorage:', storedAppointments);
      console.log('👤 Current user:', user);

      setAppointments(storedAppointments);

      // Filter appointments based on user role
      if (user && user.role !== "admin") {
        // Show only user's own appointments
        const userAppointments = storedAppointments.filter(apt =>
          apt.ownerId === user.email ||
          apt.ownerId === user.id ||
          apt.ownerId === user.employeeID ||
          apt.ownerId === user.userId ||
          apt.ownerEmail === user.email
        );
        console.log('🔍 Filtered user appointments:', userAppointments);
        setFilteredAppointments(userAppointments);
      } else {
        // Admin sees all appointments
        console.log('👑 Admin - showing all appointments:', storedAppointments);
        setFilteredAppointments(storedAppointments);
      }
    };

    if (user) {
      loadAppointments();
    }
  }, [user]);

  // Filter appointments based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Reset to user-filtered appointments
      if (user && user.role !== "admin") {
        const userAppointments = appointments.filter(apt => 
          apt.ownerId === user.email || 
          apt.ownerId === user.id ||
          apt.ownerId === user.employeeID ||
          apt.ownerId === user.userId ||
          apt.ownerEmail === user.email
        );
        setFilteredAppointments(userAppointments);
      } else {
        setFilteredAppointments(appointments);
      }
    } else {
      const baseAppointments = user && user.role !== "admin" 
        ? appointments.filter(apt => 
            apt.ownerId === user.email || 
            apt.ownerId === user.id ||
            apt.ownerId === user.employeeID ||
            apt.ownerId === user.userId ||
            apt.ownerEmail === user.email
          )
        : appointments;

      const filtered = baseAppointments.filter((apt) => {
        const lowerQuery = searchQuery.toLowerCase();
        return (
          apt.appointmentId?.toLowerCase().includes(lowerQuery) ||
          apt.petName?.toLowerCase().includes(lowerQuery) ||
          apt.petOwnerName?.toLowerCase().includes(lowerQuery) ||
          apt.serviceType?.toLowerCase().includes(lowerQuery) ||
          apt.veterinarian?.toLowerCase().includes(lowerQuery) ||
          apt.status?.toLowerCase().includes(lowerQuery)
        );
      });
      setFilteredAppointments(filtered);
    }
  }, [searchQuery, appointments, user]);

  // Delete appointment (robust: accept id or appointmentId)
  const onDeleteClick = (appointmentIdOrId) => {
    const confirmMsg = "Are you sure you want to delete this appointment?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const current = JSON.parse(localStorage.getItem('appointments') || '[]');
      const updatedAppointments = current.filter(apt => !(
        String(apt.id) === String(appointmentIdOrId) ||
        String(apt.appointmentId) === String(appointmentIdOrId)
      ));

      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);

      // update filteredAppointments value in UI depending on role/current filter
      const updatedFiltered = filteredAppointments.filter(apt => !(
        String(apt.id) === String(appointmentIdOrId) ||
        String(apt.appointmentId) === String(appointmentIdOrId)
      ));
      setFilteredAppointments(updatedFiltered);

      // update stored seq if necessary (optional: keep seq as-is so IDs are unique)
      // dispatch update event
      window.dispatchEvent(new Event('appointmentsUpdated'));

      alert("Appointment deleted successfully!");
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Failed to delete appointment. Try again.");
    }
  };

  // Generate PDF for appointments
  const generatePDF = () => {
    if (!user) {
      alert('Please log in to download appointment details.');
      return;
    }

    if (filteredAppointments.length === 0) {
      alert('No appointments available to download.');
      return;
    }

    try {
      const currentDate = new Date().toLocaleDateString();
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Header with user-specific title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      const titleText = user.role === 'admin' ? 'Appointment Management - All Appointments' : 'Appointment Management - My Appointments';
      doc.text(titleText, 20, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated: ${currentDate}`, 20, 30);
      doc.text(`Total Appointments: ${filteredAppointments.length}`, 20, 35);
      
      // Extract name from email for display
      const emailName = user.email.split('@')[0];
      const displayName = emailName.includes('.') 
        ? emailName.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
        : emailName.charAt(0).toUpperCase() + emailName.slice(1);
      
      if (user.role === 'admin') {
        doc.text('Generated by: Administrator', 20, 40);
      } else {
        doc.text(`Generated by: ${displayName} (${user.email})`, 20, 40);
      }

      // Prepare data for table
      const tableData = filteredAppointments.map(apt => [
        apt.appointmentId || apt.id,
        apt.petName || 'N/A',
        apt.petType || 'N/A',
        apt.petOwnerName || 'N/A',
        apt.ownerId || 'N/A',
        new Date(apt.appointmentDate).toLocaleDateString(),
        apt.appointmentTime || 'N/A',
        apt.serviceType || 'N/A',
        apt.veterinarian || 'N/A',
        apt.status || 'Scheduled'
      ]);

      // Add table with appointment data
      autoTable(doc, {
        head: [['Apt ID', 'Pet Name', 'Pet Type', 'Owner', 'Owner ID', 'Date', 'Time', 'Service', 'Veterinarian', 'Status']],
        body: tableData,
        startY: 50,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 15 }, // Apt ID
          1: { cellWidth: 20 }, // Pet Name
          2: { cellWidth: 15 }, // Pet Type
          3: { cellWidth: 25 }, // Owner
          4: { cellWidth: 15 }, // Owner ID
          5: { cellWidth: 20 }, // Date
          6: { cellWidth: 15 }, // Time
          7: { cellWidth: 20 }, // Service
          8: { cellWidth: 20 }, // Veterinarian
          9: { cellWidth: 15 }  // Status
        }
      });

      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }

      // Generate filename based on user role
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = user.role === 'admin' 
        ? `All_Appointments_${timestamp}.pdf`
        : `My_Appointments_${timestamp}.pdf`;

      // Save and download the PDF
      doc.save(filename);

      const successMessage = user.role === 'admin'
        ? `PDF downloaded successfully!\nFile: ${filename}\nTotal Appointments: ${filteredAppointments.length}`
        : `PDF downloaded successfully!\nFile: ${filename}\nYour Appointments: ${filteredAppointments.length}`;

      alert(successMessage);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Show appointment details (reads authoritative data from localStorage)
  const viewAppointment = (appointmentIdOrId) => {
    try {
      const stored = JSON.parse(localStorage.getItem('appointments') || '[]');
      const found = stored.find(a =>
        String(a.id) === String(appointmentIdOrId) || String(a.appointmentId) === String(appointmentIdOrId)
      );
      if (found) {
        setSelectedAppointment(found);
        // scroll into view or focus if needed (optional)
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Appointment not found.');
      }
    } catch (err) {
      console.error('viewAppointment error', err);
      alert('Failed to load appointment details.');
    }
  };

  const closeDetails = () => setSelectedAppointment(null);

  return (
    <div className="appointment-list-container">
      <div className="appointment-content-wrapper">
        {/* Header */}
        <div className="appointment-header">
          <h1 className="appointment-title">📅 Appointment Management</h1>
          
          {/* Action Buttons */}
          <div className="action-buttons">
            {appointments.length === 0 && (
              <button 
                className="btn btn-sample" 
                onClick={() => {
                  const sampleData = createSampleAppointments();
                  setAppointments(sampleData);
                  if (user && user.role !== "admin") {
                    const userAppointments = sampleData.filter(apt => 
                      apt.ownerId === user.email || 
                      apt.ownerId === user.id ||
                      apt.ownerId === user.employeeID ||
                      apt.ownerId === user.userId ||
                      apt.ownerEmail === user.email
                    );
                    setFilteredAppointments(userAppointments);
                  } else {
                    setFilteredAppointments(sampleData);
                  }
                }}
                style={{backgroundColor: '#28a745', color: 'white', marginRight: '10px'}}
              >
                🧪 Create Sample Data
              </button>
            )}

            
           
            <button className="btn btn-download" onClick={generatePDF}>📄 Download PDF</button>
            {/* Schedule New Appointment only for non-admin */}
            {user?.role !== 'admin' && (
              <button className="btn btn-add" onClick={() => navigate("/add-appointment")}>➕ Schedule New Appointment</button>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search by appointment ID, pet name, owner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Appointments Count */}
        <div className="appointments-info">
          <p>
            {user?.role === 'admin' 
              ? `Total Appointments: ${filteredAppointments.length}` 
              : `Your Appointments: ${filteredAppointments.length}`
            }
          </p>
          {/* Debug Information */}
          <div style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
            <p>Debug: Total in localStorage: {appointments.length} | User: {user?.email} | Role: {user?.role}</p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="appointments-grid">
          {filteredAppointments.length === 0 ? (
             <div className="no-appointments">
               <h3>No appointments found!</h3>
               <p>
                 {searchQuery 
                   ? "Try adjusting your search criteria." 
                   : appointments.length === 0 
                     ? "No appointments exist in the system. Click 'Create Sample Data' or 'Schedule New Appointment' to get started."
                     : "No appointments match your user permissions. Please check with an administrator."
                 }
               </p>
               {appointments.length === 0 && (
                 <button 
                   onClick={() => {
                     const sampleData = createSampleAppointments();
                     setAppointments(sampleData);
                     if (user && user.role !== "admin") {
                       const userAppointments = sampleData.filter(apt => 
                         apt.ownerId === user.email || 
                         apt.ownerId === user.id ||
                         apt.ownerId === user.employeeID ||
                         apt.ownerId === user.userId ||
                         apt.ownerEmail === user.email
                       );
                       setFilteredAppointments(userAppointments);
                     } else {
                       setFilteredAppointments(sampleData);
                     }
                   }}
                   style={{
                     backgroundColor: '#007bff',
                     color: 'white',
                     padding: '10px 20px',
                     border: 'none',
                     borderRadius: '5px',
                     cursor: 'pointer',
                     marginTop: '10px'
                   }}
                 >
                   🧪 Create Sample Appointments
                 </button>
               )}
             </div>
           ) : (
             filteredAppointments.map((appointment) => (
               user?.role === 'admin' ? (
                 // Admin: render simple card with View (yellow) and Delete (red)
                 <div key={appointment.id || appointment.appointmentId} className="appointment-card admin-card" style={{background:'#fff', padding:16, borderRadius:12, boxShadow:'0 8px 20px rgba(0,0,0,0.04)', marginBottom:12}}>
                   <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                     <div>
                       <div style={{fontWeight:700}}>{appointment.petName} — {appointment.serviceType}</div>
                       <div style={{color:'#6b7280', fontSize:13}}>{appointment.appointmentDate} {appointment.appointmentTime} • Owner: {appointment.petOwnerName || appointment.ownerEmail}</div>
                     </div>
                     <div style={{display:'flex', gap:8}}>
                       <button
                         onClick={() => viewAppointment(appointment.id || appointment.appointmentId)}
                         style={{background:'#ffc107', border:'none', padding:'8px 12px', borderRadius:8, cursor:'pointer', fontWeight:700}}
                         title="View appointment details"
                       >
                         👁️ View
                       </button>
                       <button
                         onClick={() => { onDeleteClick(appointment.id || appointment.appointmentId); if (selectedAppointment && (selectedAppointment.id === appointment.id || selectedAppointment.appointmentId === appointment.appointmentId)) closeDetails(); }}
                         style={{background:'#dc3545', color:'white', border:'none', padding:'8px 12px', borderRadius:8, cursor:'pointer', fontWeight:700}}
                         title="Delete appointment"
                       >
                         🗑️ Delete
                       </button>
                     </div>
                   </div>
                 </div>
               ) : (
                 // Non-admin: keep original AppointmentCard component (preserves their behavior)
                 <AppointmentCard
                   key={appointment.id || appointment.appointmentId}
                   appointment={appointment}
                   onDelete={onDeleteClick}
                   userRole={user?.role}
                   currentUser={user}
                 />
               )
             ))
           )}
         </div>
{/* Details panel/modal for admin view */}
{selectedAppointment && (
  <div className="appointment-details-panel" style={{
    position: 'fixed', right: 20, top: 80, width: 420, maxHeight: '75vh', overflowY: 'auto',
    background: '#fff', borderRadius: 12, boxShadow: '0 20px 40px rgba(2,6,23,0.12)', padding: 18, zIndex: 1200
  }}>
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
      <h3 style={{margin:0}}>Appointment Details</h3>
      <button onClick={closeDetails} style={{background:'transparent', border:'none', cursor:'pointer', fontSize:18}}>✖</button>
    </div>
    <div style={{fontSize:14, color:'#0f172a', marginBottom:8}}>
      <div><strong>ID:</strong> {selectedAppointment.appointmentId || selectedAppointment.id}</div>
      <div><strong>Pet:</strong> {selectedAppointment.petName || '—'} ({selectedAppointment.petType || '—'})</div>
      <div><strong>Breed/Age:</strong> {selectedAppointment.petBreed || '—'} / {selectedAppointment.petAge || '—'}</div>
      <div><strong>Owner:</strong> {selectedAppointment.petOwnerName || selectedAppointment.ownerEmail || '—'}</div>
      <div><strong>Contact:</strong> {selectedAppointment.ownerPhone || selectedAppointment.ownerEmail || '—'}</div>
      <div><strong>Date / Time:</strong> {selectedAppointment.appointmentDate || '—'} {selectedAppointment.appointmentTime || ''}</div>
      <div><strong>Service:</strong> {selectedAppointment.serviceType || selectedAppointment.service || '—'}</div>
      <div><strong>Veterinarian:</strong> {selectedAppointment.veterinarian || '—'}</div>
      <div style={{marginTop:8}}><strong>Symptoms / Notes:</strong>
        <div style={{marginTop:6, color:'#475569'}}>{selectedAppointment.symptoms || selectedAppointment.notes || '—'}</div>
      </div>
      <div style={{marginTop:8}}><strong>Status:</strong> <span style={{fontWeight:700}}>{selectedAppointment.status || 'Scheduled'}</span></div>
    </div>
    <div style={{display:'flex', gap:8, marginTop:12, justifyContent:'flex-end'}}>
      <button onClick={() => { onDeleteClick(selectedAppointment.id || selectedAppointment.appointmentId); closeDetails(); }} style={{background:'#dc3545', color:'#fff', border:'none', padding:'8px 12px', borderRadius:8, cursor:'pointer'}}>🗑️ Delete</button>
      <button onClick={() => { closeDetails(); }} style={{background:'#e2e8f0', color:'#0b1220', border:'none', padding:'8px 12px', borderRadius:8, cursor:'pointer'}}>Close</button>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default AppointmentList;