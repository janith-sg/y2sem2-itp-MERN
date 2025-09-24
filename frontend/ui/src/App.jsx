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
import ShowPetDetails from "./components/ShowPetDetails";
import UpdatePet from "./components/UpdatePet";

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
