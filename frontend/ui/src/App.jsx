// src/App.jsx - FINAL COMPLETE VERSION
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Home page
import HomePage from "./components/HomePage";

// Employee components
import EmployeeList from "./components/EmployeeList";
import InsertEmployee from "./components/InsertEmployee";
import ShowEmployeeDetail from "./components/ShowEmployeeDetails";
import UpdateEmployee from "./components/UpdateEmployee";

// Pet components
import PetList from "./components/PetList";
import InsertPet from "./components/InsertPet";
import ShowPetDetails from "./components/ShowPetDetails";
import UpdatePet from "./components/UpdatePet";

// Appointment components (Team Member 1)
import AppointmentList from "./components/Appointment/AppointmentList";
import InsertAppointment from "./components/InsertAppointment/InsertAppointment";
import EditAppointmentForm from "./components/EditAppointment/EditAppointmentForm";
import AppointmentDetails from "./components/Appointment/AppointmentDetails";

// Doctor Session components (Team Member 1)
import DoctorSessionList from "./components/DoctorSession/DoctorSessionList";
import InsertDoctorSession from "./components/DoctorSession/InsertDoctorSession";
import EditDoctorSession from "./components/DoctorSession/EditDoctorSession";

// Payment components (Team Member 2)
import AddUser from "./components/AddUser/AddUser";
import Users from "./components/Userdetails/Users";
import UpdateUser from "./components/UpdateUser/UpdateUser";

// Other pages
import ContactUs from "./components/ContactUs";
import AboutUs from "./components/AboutUs";

// Auth
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Home */}
          <Route path="/" element={<HomePage />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Employees */}
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/insert" element={<InsertEmployee />} />
          <Route path="/showdetails/:id" element={<ShowEmployeeDetail />} />
          <Route path="/updatedetails/:id" element={<UpdateEmployee />} />

          {/* Pets */}
          <Route path="/pets" element={<PetList />} />
          <Route path="/insertpet" element={<InsertPet />} />
          <Route path="/showpet/:id" element={<ShowPetDetails />} />
          <Route path="/updatepet/:id" element={<UpdatePet />} />

          {/* Appointments (Team Member 1) */}
          <Route path="/appointments" element={<AppointmentList />} />
          <Route path="/add-appointment" element={<InsertAppointment />} />
          <Route path="/edit-appointment/:id" element={<EditAppointmentForm />} />
          <Route path="/appointment-details/:id" element={<AppointmentDetails />} />

          {/* Doctor Sessions (Team Member 1) */}
          <Route path="/doctor-sessions" element={<DoctorSessionList />} />
          <Route path="/add-doctor-session" element={<InsertDoctorSession />} />
          <Route path="/edit-doctor-session/:id" element={<EditDoctorSession />} />

          {/* Payments (Team Member 2) */}
          <Route path="/payments" element={<Users />} />
          <Route path="/add-payment" element={<AddUser />} />
          <Route path="/update-payment/:id" element={<UpdateUser />} />
          {/* Legacy / alternate routes used by other components */}
          <Route path="/userdetails" element={<Users />} />
          <Route path="/userdetails/:id" element={<UpdateUser />} />

          {/* Contact + About */}
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />

          {/* Admin (protected) */}
          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;