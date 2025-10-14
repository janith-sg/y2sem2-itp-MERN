// USER/Routes/UserRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom"

// User Pages (view-only)
import UserDashboard from "../USER/Pages/Dashboard"
import UserRecords from "../USER/Pages/Records"
import UserPrescriptions from "../USER/Pages/Prescriptions"
import UserVaccinations from "../USER/Pages/Vaccinations"
import UserLabResults from "../USER/Pages/LabResults"

const UserRoutes = () => {
  return (
    <Routes>
      {/* User Dashboard */}
      <Route path="/user" element={<UserDashboard />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />

      {/* User Records */}
      <Route path="/user/records" element={<UserRecords />} />

      {/* User Prescriptions, Vaccinations, Lab Results */}
      <Route path="/user/prescriptions" element={<UserPrescriptions />} />
      <Route path="/user/vaccinations" element={<UserVaccinations />} />
      <Route path="/user/labresults" element={<UserLabResults />} />
      <Route path="/user/lab-results" element={<UserLabResults />} />

      {/* Fallback → User Dashboard */}
      <Route path="/user/*" element={<Navigate to="/user/dashboard" replace />} />
    </Routes>
  )
}

export default UserRoutes
