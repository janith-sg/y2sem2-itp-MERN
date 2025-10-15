"use client";
import "./App.css";
import "./CSS/index.css"; 
import "./CSS/App.css";

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
import ShowPet from "./components/ShowPet";
import UpdatePet from "./components/UpdatePet";

// Other pages
import ContactUs from "./components/ContactUs";
import AboutUs from "./components/AboutUs";

// Auth
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import UsersList from "./components/UsersList";
import AddInventory from "./components/AddInventory";
import InventoryList from "./components/InventoryList";
import InventoryDetails from "./components/InventoryDetails";
import UpdateInventory from "./components/UpdateInventory";
import AddAppointment from "./components/AddAppointment";
import AppointmentList from "./components/AppointmentList";
import AppointmentDetails from "./components/AppointmentDetails";
import UpdateAppointment from "./components/UpdateAppointment";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// Cart and Checkout components
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Orders from "./components/Orders";

// Medical Records Components (Teammate's System)
import Layout from "./Components/Layout/Layout";
import UserRoutes from "./USER/Routes/UserRoutes";
import PetIdGate from "./USER/Pages/PetIdGate";

// Admin Medical Records Components
import DashboardPage from "./Components/Dashboard/DashboardPage";
import RecordList from "./Components/Records/RecordList";
import PrescriptionList from "./Components/Prescriptions/PrescriptionList";
import VaccinationList from "./Components/Vaccinations/VaccinationList";
import LabResultList from "./Components/LabResults/LabResultList";

import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

// Doctor Session components (Team Member 1)
import DoctorSessionList from "./components/DoctorSession/DoctorSessionList";
import InsertDoctorSession from "./components/DoctorSession/InsertDoctorSession";
import EditDoctorSession from "./components/DoctorSession/EditDoctorSession";

// Payment components (Team Member 2)
import AddUser from "./components/AddUser/AddUser";
import Users from "./components/Userdetails/Users";
import UpdateUser from "./components/UpdateUser/UpdateUser";

// Medical Records Wrappers
const AdminMedicalRecords = () => (
  <Layout pathPrefix="">
    <div className="App">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/records" element={<RecordList />} />
        <Route path="/prescriptions" element={<PrescriptionList />} />
        <Route path="/vaccinations" element={<VaccinationList />} />
        <Route path="/labresults" element={<LabResultList />} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </div>
  </Layout>
);

const UserMedicalRecords = () => (
  <Layout pathPrefix="/user">
    <div className="App">
      <UserRoutes />
    </div>
  </Layout>
);

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const hideNavbarRoutes = ["/login", "/signup", "/user/petid-gate"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  // Redirect to login if not authenticated (except for login and signup pages)
  if (!user && location.pathname !== "/login" && location.pathname !== "/signup") {
    return <Navigate to="/login" replace />;
  }

  // Special handling for petid-gate - no navbar
  if (location.pathname.endsWith('/petid-gate')) {
    return (
      <Routes>
        <Route path="/user/petid-gate" element={<PetIdGate />} />
      </Routes>
    );
  }

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* Medical Records Routes */}
        {/* Admin Medical Records - Direct Routes */}
        <Route path="/medical-records" element={
          <Layout pathPrefix="">
            <DashboardPage />
          </Layout>
        } />
        <Route path="/records" element={
          <Layout pathPrefix="">
            <RecordList />
          </Layout>
        } />
        <Route path="/prescriptions" element={
          <Layout pathPrefix="">
            <PrescriptionList />
          </Layout>
        } />
        <Route path="/vaccinations" element={
          <Layout pathPrefix="">
            <VaccinationList />
          </Layout>
        } />
        <Route path="/labresults" element={
          <Layout pathPrefix="">
            <LabResultList />
          </Layout>
        } />

        {/* User Medical Records */}
        <Route path="/user/medical-records/*" element={<UserMedicalRecords />} />

        {/* Medical Records Gate */}
        <Route path="/user/petid-gate" element={<PetIdGate />} />

        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Sign Up */}
        <Route path="/signup" element={<SignUp />} />

        {/* Users List */}
        <Route path="/users" element={<UsersList />} />

        {/* Add Inventory - Admin Only */}
        <Route
          path="/add-inventory"
          element={
            <ProtectedRoute requiredRole="admin">
              <AddInventory />
            </ProtectedRoute>
          }
        />

        {/* View Inventory */}
        <Route path="/inventory" element={<InventoryList />} />

        {/* Inventory Details */}
        <Route path="/inventory/:id/details" element={<InventoryDetails />} />

        {/* Update Inventory */}
        <Route path="/inventory/:id/edit" element={<UpdateInventory />} />

        {/* Cart and Checkout */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />

        {/* Add Appointment */}
        <Route path="/add-appointment" element={<AddAppointment />} />

        {/* View Appointments */}
        <Route path="/appointments" element={<AppointmentList />} />

        {/* Appointment Details */}
        <Route path="/appointment-details/:id" element={<AppointmentDetails />} />

        {/* Edit Appointment */}
        <Route path="/edit-appointment/:id" element={<UpdateAppointment />} />

        {/* Employees */}
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/insert" element={<InsertEmployee />} />
        <Route path="/showdetails/:id" element={<ShowEmployeeDetail />} />
        <Route path="/updatedetails/:id" element={<UpdateEmployee />} />

        {/* Users (same components as employees but with different routes) */}
        <Route path="/insert-employee" element={<InsertEmployee />} />
        <Route path="/show-employee-details/:id" element={<ShowEmployeeDetail />} />
        <Route path="/update-employee/:id" element={<UpdateEmployee />} />

        {/* Pets */}
        <Route path="/pets" element={<PetList />} />
        <Route path="/insertpet" element={<InsertPet />} />
        <Route path="/showpet/:petId" element={<ShowPet />} />
        <Route path="/updatepet/:id" element={<UpdatePet />} />

        {/* Contact + About */}
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />

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

        {/* Admin (protected) */}
        <Route
          path="/admindashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all other routes and redirect to login if not authenticated */}
        <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
      </Routes>
      {shouldShowNavbar && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;