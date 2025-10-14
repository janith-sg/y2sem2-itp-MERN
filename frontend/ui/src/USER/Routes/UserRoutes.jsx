// src/USER/Routes/UserRoutes.jsx (FINAL, CLEANED VERSION)

import { Routes, Route, Navigate } from "react-router-dom"
import UserDashboard from "../Pages/Dashboard"
import UserRecords from "../Pages/Records"
import UserPrescriptions from "../Pages/Prescriptions"
import UserVaccinations from "../Pages/Vaccinations"
import UserLabResults from "../Pages/LabResults"
// 🛑 REMOVE: import PetIdGate from "../Pages/PetIdGate" 

// ⬇️ RequirePetId logic is correct and remains the same
const RequirePetId = ({ children }) => {
  const petId = localStorage.getItem("currentPetId");
  if (!petId) {
    // 🛑 CRITICAL FIX: Redirect to the full absolute path of the gate
    // This forces the top-level router in App.jsx to handle the full-screen render.
    return <Navigate to="/user/petid-gate" replace />; 
  }
  return children;
};

const UserRoutes = () => {
  return (
    <Routes>
      {/* 🛑 REMOVED GATE ROUTES: These are handled by App.jsx now! */}
      {/* <Route path="/" element={<Navigate to="/petid-gate" replace />} /> */}
      {/* <Route path="/petid-gate" element={<PetIdGate />} /> */}
      
      {/* 1. Dashboard: Requires Pet ID to view */}
      <Route path="/" element={<RequirePetId><UserDashboard /></RequirePetId>} />
      <Route path="/dashboard" element={<RequirePetId><UserDashboard /></RequirePetId>} />
      
      {/* 2. PROTECTED ROUTES */}
      <Route path="/records" element={<RequirePetId><UserRecords /></RequirePetId>} />
      <Route path="/prescriptions" element={<RequirePetId><UserPrescriptions /></RequirePetId>} />
      <Route path="/vaccinations" element={<RequirePetId><UserVaccinations /></RequirePetId>} />
      <Route path="/labresults" element={<RequirePetId><UserLabResults /></RequirePetId>} />
      <Route path="/lab-results" element={<RequirePetId><UserLabResults /></RequirePetId>} />

      {/* Fallback → If Pet ID exists, go to dashboard. If not, RequirePetId will redirect to the gate. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default UserRoutes