{/* NOT USING THIS PAGE  */}
// src/pages/Dashboard.jsx
"use client";

import { useState, useEffect } from "react";
import { FileText, AlertCircle } from "lucide-react";
import StatsCard from "../components/Dashboard/StatsCard";
import RecentActivity from "../components/Dashboard/RecentActivity";
import QuickActions from "../components/Dashboard/QuickActions";
import "./Dashboard.css";

const Dashboard = () => {
  console.log("[v0] Dashboard component rendering");

  const [stats, setStats] = useState({
    totalRecords: 0,
  });

  const [recentActivities] = useState([
    { id: 2, type: "vaccination", message: "Rabies vaccination completed for Luna", time: "4 hours ago" },
    { id: 3, type: "prescription", message: "New prescription added for Max", time: "6 hours ago" },
    { id: 4, type: "lab", message: "Lab results available for Bella", time: "1 day ago" },
  ]);

  useEffect(() => {
    console.log("[v0] Dashboard useEffect running");
    // Simulated fetch — replace with real API if needed
    setStats({ totalRecords: 342 });
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        {/* NOT USING THIS PAGE  */}
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening at your clinic today.</p>
      </div>

      <div className="stats-grid">
        <StatsCard title="Medical Records" value={stats.totalRecords} icon={FileText} color="success" trend="+24%" />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          {/* Appointments block kept commented to preserve UI + CSS */}
          {/* <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Calendar size={20} />
                Today's Appointments
              </h3>
            </div>
            <div className="appointments-list">...</div>
          </div> */}
          <RecentActivity activities={recentActivities} />
        </div>

        <div className="dashboard-sidebar">
          <QuickActions />
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <AlertCircle size={20} />
                Alerts & Reminders
              </h3>
            </div>
            <div className="alerts-list">
              <div className="alert-item warning">
                <div className="alert-content">
                  <h4>Vaccination Due</h4>
                  <p>3 pets need vaccination this week</p>
                </div>
              </div>
              <div className="alert-item info">
                <div className="alert-content">
                  <h4>Lab Results</h4>
                  <p>2 lab results pending review</p>
                </div>
              </div>
              {/* <div className="alert-item success">
                <div className="alert-content">
                  <h4>Inventory</h4>
                  <p>All medications in stock</p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
