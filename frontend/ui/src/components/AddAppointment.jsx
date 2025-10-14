// src/components/AddAppointment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import "./AddAppointment.css";

const AddAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [appointmentData, setAppointmentData] = useState({
    petOwnerName: "",
    ownerId: "",
    petName: "",
    petId: "",
    petType: "",
    petBreed: "",
    petAge: "",
    ownerPhone: "",
    ownerEmail: "",
    appointmentDate: "",
    appointmentTime: "",
    serviceType: "",
    customService: "", // new: for "Other"
    veterinarian: "",
    symptoms: "",
    notes: "",
  });

  const [userPets, setUserPets] = useState([]); // Store user's pets for dropdown

  // Auto-generate appointment ID
  const [appointmentId] = useState(() => {
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const nextId = existingAppointments.length + 1;
    return `APT-${nextId.toString().padStart(3, '0')}`;
  });

  // Veterinarians config (only two)
  const vets = [
    {
      id: "mahesh",
      name: "Dr.Mahesh Thilakarathna",
      display: "Dr. Mahesh Thilakarathna (8:00 am - 12:00 pm)",
      startHour: 8,
      endHour: 12
    },
    {
      id: "sarath",
      name: "Dr.Sarathchandra Paranavithana",
      display: "Dr. Sarathchandra Paranavithana (4:00 pm - 8:00 pm)",
      startHour: 16,
      endHour: 20
    }
  ];

  // Available times for selected vet & date (derived)
  const [availableTimes, setAvailableTimes] = useState([]);

  // Load user data and pets on component mount
  useEffect(() => {
    if (user) {
      // Get the real user data from localStorage to access employeeID
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const currentUser = registeredUsers.find(u => 
        u.email && user?.email && 
        u.email.toLowerCase().trim() === user.email.toLowerCase().trim()
      );

      console.log("=== OWNER INFORMATION DEBUG ===");
      console.log("Auth user object:", user);
      console.log("Auth user email:", user?.email);
      console.log("Found registered user:", currentUser);
      console.log("All registered users:", registeredUsers.map(u => ({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName })));

      let displayName = "";
      let userId = "";

      if (currentUser) {
        // Use real user data if found
        displayName = `${currentUser.firstName} ${currentUser.lastName}`;
        userId = currentUser.id; // This should be the real employeeID like U-04
        console.log("Using real user data:");
        console.log("- Name:", displayName);
        console.log("- Employee ID:", userId);
      } else {
        // Fallback: Extract name from email for display
        const emailName = user.email.split('@')[0];
        displayName = emailName.includes('.') 
          ? emailName.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
          : emailName.charAt(0).toUpperCase() + emailName.slice(1);

        // Generate consistent Owner ID based on user email as fallback
        const generateOwnerID = (email) => {
          let hash = 0;
          for (let i = 0; i < email.length; i++) {
            const char = email.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
          }
          const idNumber = Math.abs(hash % 99) + 1;
          return `U-${idNumber.toString().padStart(2, '0')}`;
        };

        userId = generateOwnerID(user.email);
        console.log("Using fallback data:");
        console.log("- Name:", displayName);
        console.log("- Generated ID:", userId);
      }

      console.log("=== FINAL OWNER INFO ===");
      console.log("Owner Name:", displayName);
      console.log("Owner ID:", userId);
      console.log("========================");

      // Set owner information from logged user
      setAppointmentData(prev => ({
        ...prev,
        petOwnerName: displayName,
        ownerId: userId,
        ownerEmail: user.email
      }));

      // Fetch user's pets
      fetchUserPets();
    }
  }, [user]);

  // Fetch pets belonging to the logged-in user
  const fetchUserPets = async () => {
    try {
      console.log("Fetching user's pets...");
      const response = await axios.get("http://localhost:3000/api/pets");
      const allPets = response.data;
      
      // Get the real user data from localStorage to access employeeID
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const currentUser = registeredUsers.find(u => 
        u.email && user?.email && 
        u.email.toLowerCase().trim() === user.email.toLowerCase().trim()
      );

      let currentUserOwnerId = "";
      
      if (currentUser) {
        // Use real employee ID
        currentUserOwnerId = currentUser.id;
        console.log("Using real employee ID for pet filtering:", currentUserOwnerId);
      } else {
        // Fallback to generated ID
        const generateOwnerID = (email) => {
          let hash = 0;
          for (let i = 0; i < email.length; i++) {
            const char = email.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
          }
          const idNumber = Math.abs(hash % 99) + 1;
          return `U-${idNumber.toString().padStart(2, '0')}`;
        };
        currentUserOwnerId = generateOwnerID(user.email);
        console.log("Using generated ID for pet filtering:", currentUserOwnerId);
      }

      console.log("Looking for pets with ownerId:", currentUserOwnerId);
      console.log("Also checking email:", user.email);
      console.log("All pets:", allPets.map(p => ({ name: p.name, ownerId: p.ownerId })));
      
      // Filter pets by owner (match real owner ID, user email, or existing IDs)
      const ownerPets = allPets.filter(pet => 
        pet.ownerId === currentUserOwnerId ||
        pet.ownerId === user?.email || 
        pet.ownerId === user?.id ||
        pet.ownerId === user?.employeeID
      );
      
      console.log("User's pets found:", ownerPets);
      setUserPets(ownerPets);
    } catch (error) {
      console.error("Error fetching user pets:", error);
      setUserPets([]);
    }
  };

  // Handle pet selection to auto-fill pet details
  const handlePetSelection = (e) => {
    const selectedPetId = e.target.value;
    const selectedPet = userPets.find(pet => pet.petId === selectedPetId);
    
    if (selectedPet) {
      setAppointmentData(prev => ({
        ...prev,
        petId: selectedPetId,
        petName: selectedPet.name,
        petType: selectedPet.species,
        petBreed: selectedPet.breed || "",
        petAge: selectedPet.age || ""
      }));
    } else {
      // Clear pet fields if no pet selected
      setAppointmentData(prev => ({
        ...prev,
        petId: "",
        petName: "",
        petType: "",
        petBreed: "",
        petAge: ""
      }));
    }
  };

  // Helper: generate 30-min slots between startHour and endHour (end exclusive for slot start)
  const generateSlots = (startHour, endHour) => {
    const slots = [];
    for (let h = startHour; h < endHour; h++) {
      // two slots per hour: :00 and :30
      const hh = String(h).padStart(2, "0");
      slots.push(`${hh}:00`);
      slots.push(`${hh}:30`);
    }
    return slots;
  };
  
  // Update available times when vet or date changes
  useEffect(() => {
    const { veterinarian, appointmentDate } = appointmentData;
    if (!veterinarian || !appointmentDate) {
      setAvailableTimes([]);
      return;
    }

    const vet = vets.find(v => v.id === veterinarian);
    if (!vet) {
      setAvailableTimes([]);
      return;
    }

    // generate all possible slots for vet
    let slots = generateSlots(vet.startHour, vet.endHour);

    // Remove slots already booked for this vet on that date
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const booked = appointments
      .filter(a => {
        // match vet by exact name string used in saved appointments (we use vet.name)
        const sameVet = (a.veterinarian || "").toLowerCase().includes(vet.name.split(' ')[1].toLowerCase()) || (a.veterinarian || "") === vet.name || (a.veterinarian || "").toLowerCase().includes(vet.id);
        return sameVet && a.appointmentDate === appointmentDate;
      })
      .map(a => a.appointmentTime);

    // filter out booked times
    const freeSlots = slots.filter(s => !booked.includes(s));
    setAvailableTimes(freeSlots);
  }, [appointmentData.veterinarian, appointmentData.appointmentDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // if user edits customService, keep serviceType = 'Other'
    if (name === 'customService') {
      setAppointmentData(prev => ({ ...prev, customService: value, serviceType: 'Other' }));
      return;
    }
    setAppointmentData({
      ...appointmentData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation for pet selection
    if (!appointmentData.petId) {
      alert("Please select a pet for the appointment!");
      return;
    }

    // Require vet selection
    if (!appointmentData.veterinarian) {
      alert("Please select a veterinarian.");
      return;
    }

    // If serviceType is Other require customService
    if (appointmentData.serviceType === "Other" && !appointmentData.customService.trim()) {
      alert("Please enter the service type when 'Other' is selected.");
      return;
    }

    // Validation for date and time
    if (!appointmentData.appointmentDate || !appointmentData.appointmentTime) {
      alert("Please select appointment date and time.");
      return;
    }

    const selectedDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`);
    const currentDateTime = new Date();

    if (selectedDateTime <= currentDateTime) {
      alert("Please select a future date and time for the appointment!");
      return;
    }

    // Ensure selected time is within vet's allowed slots
    const vet = vets.find(v => v.id === appointmentData.veterinarian);
    if (!vet) {
      alert("Selected veterinarian is not valid.");
      return;
    }
    const allowedSlots = generateSlots(vet.startHour, vet.endHour);
    if (!allowedSlots.includes(appointmentData.appointmentTime)) {
      alert("Selected time is not within the working hours of the selected veterinarian.");
      return;
    }

    // Check time conflict against local storage appointments (this prevents race before saving)
    const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const conflict = existingAppointments.find(apt =>
      apt.appointmentDate === appointmentData.appointmentDate &&
      apt.appointmentTime === appointmentData.appointmentTime &&
      (apt.veterinarian === vet.name || apt.veterinarian === vet.display || apt.veterinarian === appointmentData.veterinarian)
    );
    if (conflict) {
      alert("Selected time slot is already booked. Please choose another time.");
      return;
    }

    // Compose final serviceType value (use custom if Other)
    const finalServiceType = appointmentData.serviceType === "Other" ? appointmentData.customService.trim() : appointmentData.serviceType;

    // Create appointment object
    const newAppointment = {
      id: appointmentId,
      appointmentId: appointmentId,
      petOwnerName: appointmentData.petOwnerName,
      ownerId: appointmentData.ownerId,
      petName: appointmentData.petName,
      petId: appointmentData.petId,
      petType: appointmentData.petType,
      petBreed: appointmentData.petBreed,
      petAge: appointmentData.petAge,
      ownerPhone: appointmentData.ownerPhone,
      ownerEmail: appointmentData.ownerEmail,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      serviceType: finalServiceType,
      veterinarian: vet.name, // save canonical vet name
      symptoms: appointmentData.symptoms,
      notes: appointmentData.notes,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    };

    // Add new appointment
    const updatedAppointments = [...JSON.parse(localStorage.getItem('appointments') || '[]'), newAppointment];
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

    alert(`✅ Appointment scheduled successfully!\n\nAppointment ID: ${appointmentId}\nPet: ${appointmentData.petName}\nDate: ${appointmentData.appointmentDate}\nTime: ${appointmentData.appointmentTime}\nVeterinarian: ${vet.name}`);

    // Reset pet/time/service inputs but keep owner
    setAppointmentData({
      petOwnerName: appointmentData.petOwnerName,
      ownerId: appointmentData.ownerId,
      ownerEmail: appointmentData.ownerEmail,
      ownerPhone: appointmentData.ownerPhone,
      petName: "",
      petId: "",
      petType: "",
      petBreed: "",
      petAge: "",
      appointmentDate: "",
      appointmentTime: "",
      serviceType: "",
      customService: "",
      veterinarian: "",
      symptoms: "",
      notes: "",
    });

    // Redirect or ask user
    const nextAction = confirm("Appointment scheduled successfully! Would you like to view all appointments? (Cancel to schedule another appointment)");
    if (nextAction) {
      navigate('/appointments');
    }
  };

  return (
    <div className="add-appointment-wrap">
      <div className="add-appointment-container">
        <h2>Schedule New Appointment</h2>

        <form className="add-appointment-form" onSubmit={handleSubmit}>
          {/* Appointment ID - Read Only */}
          <div className="form-group">
            <label>Appointment ID</label>
            <input
              type="text"
              value={appointmentId}
              readOnly
              className="readonly-field"
            />
          </div>

          {/* Owner Information */}
          <div className="section-title">Owner Information</div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Owner Name</label>
              <input
                type="text"
                name="petOwnerName"
                value={appointmentData.petOwnerName}
                onChange={handleChange}
                placeholder="Auto-filled from logged user"
                readOnly
                className="readonly-field"
              />
            </div>
            <div className="form-group">
              <label>Owner ID</label>
              <input
                type="text"
                name="ownerId"
                value={appointmentData.ownerId}
                readOnly
                className="readonly-field"
                placeholder="Auto-filled from logged user"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Owner Email *</label>
              <input
                type="email"
                name="ownerEmail"
                value={appointmentData.ownerEmail}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="ownerPhone"
                value={appointmentData.ownerPhone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Pet Information */}
          <div className="section-title">Pet Information</div>
          
          <div className="form-group">
            <label>Pet ID *</label>
            <select
              name="petId"
              value={appointmentData.petId}
              onChange={handlePetSelection}
              required
            >
              <option value="">Select Your Pet</option>
              {userPets.map(pet => (
                <option key={pet._id} value={pet.petId}>
                  {pet.petId} - {pet.name}
                </option>
              ))}
            </select>
            {userPets.length === 0 && (
              <small style={{ color: '#6c757d', marginTop: '5px' }}>
                💡 No pets found. Please add a pet first before scheduling an appointment.
              </small>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Pet Name</label>
              <input
                type="text"
                name="petName"
                value={appointmentData.petName}
                placeholder="Auto-filled when pet is selected"
                readOnly
                className="readonly-field"
              />
            </div>
            <div className="form-group">
              <label>Pet Type</label>
              <input
                type="text"
                name="petType"
                value={appointmentData.petType}
                placeholder="Auto-filled when pet is selected"
                readOnly
                className="readonly-field"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Breed</label>
              <input
                type="text"
                name="petBreed"
                value={appointmentData.petBreed}
                placeholder="Auto-filled when pet is selected"
                readOnly
                className="readonly-field"
              />
            </div>
            <div className="form-group">
              <label>Age (years)</label>
              <input
                type="text"
                name="petAge"
                value={appointmentData.petAge}
                placeholder="Auto-filled when pet is selected"
                readOnly
                className="readonly-field"
              />
            </div>
          </div>

          {/* Appointment Details */}
          <div className="section-title">Appointment Details</div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Appointment Date *</label>
              <input
                type="date"
                name="appointmentDate"
                value={appointmentData.appointmentDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label>Veterinarian *</label>
              <select
                name="veterinarian"
                value={appointmentData.veterinarian}
                onChange={handleChange}
                required
              >
                <option value="">Select Veterinarian</option>
                {vets.map(v => (
                  <option key={v.id} value={v.id}>{v.display}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time slot selection — dynamically generated, disabled until date & vet chosen */}
          <div className="form-row">
            <div className="form-group">
              <label>Appointment Time *</label>
              <select
                name="appointmentTime"
                value={appointmentData.appointmentTime}
                onChange={handleChange}
                required
                disabled={!appointmentData.veterinarian || !appointmentData.appointmentDate}
              >
                <option value="">{!appointmentData.veterinarian || !appointmentData.appointmentDate ? 'Select vet and date first' : 'Select a time'}</option>
                {availableTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              <small style={{ color: '#6c757d', marginTop: '5px' }}>
                Times are 30-minute slots. Booked slots are not shown.
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Service Type *</label>
              <select
                name="serviceType"
                value={appointmentData.serviceType}
                onChange={handleChange}
                required
              >
                <option value="">Select Service</option>
                <option value="Laboratory and Diagnostic Services">Laboratory and Diagnostic Services</option>
                <option value="Surgical Services">Surgical Services</option>
                <option value="Grooming and Hygiene">Grooming and Hygiene</option>
                <option value="Diagnosis and Treatment">Diagnosis and Treatment</option>
                <option value="General Health Checkups">General Health Checkups</option>
                <option value="Other">Other</option>
              </select>
              {appointmentData.serviceType === "Other" && (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    name="customService"
                    value={appointmentData.customService}
                    onChange={handleChange}
                    placeholder="Enter service type"
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Veterinarian (confirmation)</label>
              <input
                type="text"
                value={appointmentData.veterinarian ? (vets.find(v=>v.id===appointmentData.veterinarian)?.name || '') : ''}
                readOnly
                className="readonly-field"
                placeholder="Selected veterinarian"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="section-title">Additional Information</div>
          
          <div className="form-group">
            <label>Symptoms/Reason for Visit *</label>
            <textarea
              name="symptoms"
              value={appointmentData.symptoms}
              onChange={handleChange}
              required
              placeholder="Describe symptoms or reason for the appointment..."
              rows="3"
            />
          </div>

          {/* Buttons */}
          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              Schedule Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointment;