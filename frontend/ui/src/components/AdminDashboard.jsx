// src/components/AdminDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin! Manage your system efficiently.</p>
      </header>

      <main className="dashboard-actions container">
        <div className="grid">
          <Link to="/employees">
            <Button fullWidth className="btn primary">Manage Employees</Button>
          </Link>
          <Link to="/pets">
            <Button fullWidth className="btn primary">Manage Pets</Button>
          </Link>
          <Link to="/inventory">
            <Button fullWidth className="btn primary">Manage Inventory</Button>
          </Link>
          <Link to="/appointments">
            <Button fullWidth className="btn primary">Add Appointments</Button>
          </Link>
          <Link to="/appointments">
            <Button fullWidth className="btn primary">Doctor Session</Button>
          </Link>
          <Link to="/medical-records">
            <Button fullWidth className="btn primary">Medical Records</Button>
          </Link>
          <Link to="/payments">
            <Button fullWidth className="btn primary">Payments</Button>
          </Link>
          <Link to="/feedback">
            <Button fullWidth className="btn primary">Feedback</Button>
          </Link>
          <Link to="/logout">
            <Button fullWidth className="btn danger">Logout</Button>
          </Link>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>© {new Date().getFullYear()} PetCare+ · Admin Dashboard</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
