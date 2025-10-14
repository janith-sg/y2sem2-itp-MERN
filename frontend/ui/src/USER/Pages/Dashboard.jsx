"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Syringe, FlaskConical, Pill } from "lucide-react"; 
import StatsCard from "../../Components/Dashboard/StatsCard"; 
import "../../Pages/Dashboard.css";

import { recordService } from "../../Services/recordService";
import { vaccinationService } from "../../Services/vaccinationService";
import { labResultService } from "../../Services/labResultService";
import { prescriptionService } from "../../Services/prescriptionService";

// 🛑 FIX: Updated helper to return Pet ID as a string, not number
const getCurrentPetId = () => {
  const id = localStorage.getItem("currentPetId");
  // FIX: Return the ID as a string, not a number (for P-017 compatibility)
  return id ? String(id).trim() : null;
};

const safeDate = (d) => {
    const x = d ? new Date(d) : null;
    return x && !Number.isNaN(x.getTime()) ? x : null;
};

const parseResponse = (resp, key) => {
    return Array.isArray(resp?.[key]) ? resp[key] : (Array.isArray(resp) ? resp : []);
};


export default function UserDashboard() {
  const currentPetId = getCurrentPetId();

  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ records: 0, vaccinations: 0, labResults: 0, prescriptions: 0 });
  
  useEffect(() => {
    if (!currentPetId) {
        setLoading(false);
        return;
    }

    (async () => {
      setLoading(true);

      let records = [];
      let vax = [];
      let labs = [];
      let rx = [];
      
      try {
        // --- 1. Fetch All Data ---
        records = parseResponse(await recordService.getAll(), 'records');
        vax = parseResponse(await vaccinationService.getAll(), 'vaccinations');
        labs = parseResponse(await labResultService.getAll(), 'labResults');
        rx = parseResponse(await prescriptionService.getAll(), 'prescriptions');
      } catch (e) {
        console.error("[User Dashboard] Data load failed:", e);
      }

      // --- 2. Filter Data to Current Pet ID (Uses string comparison) ---
      const petRecords = (records || []).filter(r => r.PetId === currentPetId);
      const petVax = (vax || []).filter(v => v.PetId === currentPetId);
      const petLabs = (labs || []).filter(l => l.PetId === currentPetId);
      const petRx = (rx || []).filter(p => p.PetId === currentPetId);
      
      // --- 3. Update Counts ---
      
      setCounts({
        records: petRecords.length,
        vaccinations: petVax.length,
        labResults: petLabs.length,
        prescriptions: petRx.length,
      });

      setLoading(false);
    })();
  }, [currentPetId]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Pet's Summary</h1> 
        <p className="dashboard-subtitle">Viewing medical summary for Pet ID: {currentPetId ?? 'N/A'}</p> 
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <StatsCard
          title="Medical Records"
          value={loading ? "…" : counts.records}
          icon={FileText}
          color="success"
        />
        <StatsCard
          title="Vaccinations"
          value={loading ? "…" : counts.vaccinations}
          icon={Syringe}
          color="secondary"
        />
        <StatsCard
          title="Prescriptions"
          value={loading ? "…" : counts.prescriptions}
          icon={Pill}
          color="accent"
        />
        <StatsCard
          title="Lab Results"
          value={loading ? "…" : counts.labResults}
          icon={FlaskConical}
          color="warning"
        />
      </div>
      
      {/* The bottom content (Activity/Alerts) is now removed, simplifying the page */}
    </div>
  );
}