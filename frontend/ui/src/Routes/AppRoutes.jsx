// src/Routes/AppRoutes.jsx (Modification Required)
"use client"

import { Routes, Route, Navigate } from "react-router-dom"

// ❌ OLD/INCORRECT import (likely):
// import DashboardPage from "../Components/Dashboard/DashboardPage"

// ✅ NEW/CORRECT import:
// The path must be relative from src/Routes/ to src/Components/Dashboard/
import DashboardPage from "../components/Dashboard/DashboardPage" 

// Modules (lists)
import RecordList from "../components/Records/RecordList"
// ... (other imports)

const AppRoutes = () => {
  return (
    <Routes>
      {/* This line is throwing the error: */}
      <Route path="/" element={<DashboardPage />} /> 
      {/* ... */}
    </Routes>
  )
}

export default AppRoutes