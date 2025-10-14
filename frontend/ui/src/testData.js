// Test script to add sample appointment data
// Run this in browser console to add test data

// Sample appointment data
const sampleAppointments = [
  {
    id: "APT-001",
    appointmentId: "APT-001",
    petName: "Buddy",
    petId: "PET-001",
    petType: "Dog",
    petBreed: "Golden Retriever",
    petAge: "5",
    petOwnerName: "John Doe",
    ownerId: "U-09",
    ownerPhone: "+1234567890",
    ownerEmail: "john.doe@example.com",
    appointmentDate: "2025-10-15",
    appointmentTime: "10:30",
    serviceType: "Routine Checkup",
    veterinarian: "Dr. Smith",
    symptoms: "Regular health checkup",
    notes: "Annual vaccination due",
    status: "Scheduled",
    createdAt: new Date().toISOString()
  },
  {
    id: "APT-002",
    appointmentId: "APT-002",
    petName: "Whiskers",
    petId: "PET-002",
    petType: "Cat",
    petBreed: "Persian",
    petAge: "3",
    petOwnerName: "Jane Smith",
    ownerId: "U-10",
    ownerPhone: "+1234567891",
    ownerEmail: "jane.smith@example.com",
    appointmentDate: "2025-10-16",
    appointmentTime: "14:00",
    serviceType: "Vaccination",
    veterinarian: "Dr. Johnson",
    symptoms: "None",
    notes: "First vaccination series",
    status: "Scheduled",
    createdAt: new Date().toISOString()
  },
  {
    id: "APT-003",
    appointmentId: "APT-003",
    petName: "Max",
    petId: "PET-003",
    petType: "Dog",
    petBreed: "German Shepherd",
    petAge: "7",
    petOwnerName: "Mike Wilson",
    ownerId: "U-11",
    ownerPhone: "+1234567892",
    ownerEmail: "mike.wilson@example.com",
    appointmentDate: "2025-10-17",
    appointmentTime: "09:15",
    serviceType: "Emergency",
    veterinarian: "Dr. Brown",
    symptoms: "Limping, loss of appetite",
    notes: "Urgent examination needed",
    status: "Scheduled",
    createdAt: new Date().toISOString()
  }
];

// Add to localStorage
localStorage.setItem('appointments', JSON.stringify(sampleAppointments));

console.log('Sample appointments added to localStorage:');
console.log(sampleAppointments);

// Also add a sample user for testing
const sampleUser = {
  id: 1,
  userId: "U-09",
  email: "john.doe@example.com",
  name: "John Doe",
  role: "user"
};

localStorage.setItem('currentUser', JSON.stringify(sampleUser));

console.log('Sample user added to localStorage:');
console.log(sampleUser);