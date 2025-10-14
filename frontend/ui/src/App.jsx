// src/App.jsx
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

import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const hideNavbarRoutes = ["/login", "/signup"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  // Redirect to login if not authenticated (except for login and signup pages)
  if (!user && location.pathname !== "/login" && location.pathname !== "/signup") {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
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
        <Footer />
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
