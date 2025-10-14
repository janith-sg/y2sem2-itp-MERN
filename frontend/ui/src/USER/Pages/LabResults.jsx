// src/USER/Pages/LabResults.jsx (FINAL LIVE DATA VERSION with Cost)
"use client"

import { useState, useEffect, useMemo } from "react"
import { FlaskConical, Calendar, AlertCircle, CheckCircle, Search, DollarSign } from "lucide-react" 
import "../../Pages/LabResults.css"
// ⬅️ NEW IMPORT: Must import the service for live data
import { labResultService } from "../../Services/labResultService";


const fmtDate = (d) => {
  if (!d) return "—"
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString()
}

// ⬇️ FIX: Add the missing getId utility function
const getId = (r) => r?._id?.$oid || r?._id || r?.LabResultId || r?.id;


// ⬇️ HELPER TO GET PET ID FROM LOCAL STORAGE
const getCurrentPetId = () => {
  const id = localStorage.getItem("currentPetId");
  // 🛑 FIX: Return the ID as a string, not a number, for alphanumeric compatibility
  return id ? String(id).trim() : null;
};

// Helper to format cost for display
const fmtCost = (val) => {
    const num = Number(val);
    // Display $X.XX format or '—' if 0/undefined
    return (isNaN(num) || num <= 0) ? "—" : `${num.toFixed(2)} LKR/USD`; 
};

const UserLabResults = () => {
  const [labResults, setLabResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  // ⬇️ Get the Pet ID
  const currentPetId = getCurrentPetId();

  useEffect(() => {
    if (!currentPetId) { setLoading(false); return; }
    
    const fetchLabResults = async () => {
        try {
            const resp = await labResultService.getAll();
            const allLabResults = resp?.labResults || resp || [];
            
            // 2. Filter the live data by the current Pet ID
            // 🛑 FIX: Filter logic now uses the string ID (e.g., r.PetId === "P-017")
            const filteredByPet = allLabResults.filter(r => r.PetId === currentPetId);
            
            setLabResults(filteredByPet);
        } catch (e) {
            console.error("User lab results data fetch failed:", e);
            alert("Failed to load lab results. Check backend.");
            setLabResults([]);
        } finally {
            setLoading(false);
        }
    };
    fetchLabResults();
  }, [currentPetId])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return labResults
    return labResults.filter((r) => {
      // Adjusted search fields for live data (Type, Notes, IDs, COST)
      const searchText = [r.Type, r.Notes, String(r.LabResultId ?? ''), String(r.RecordId ?? ''), String(r.Cost ?? '')].join(" ").toLowerCase()
      return searchText.includes(query)
    })
  }, [labResults, searchQuery])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(b.Date || b.createdAt) - new Date(a.Date || a.createdAt))
  }, [filtered])

  return (
    <div className="lab-results-page">
      <div className="lab-results-header">
        <div className="lab-results-title-section">
          <h1 className="lab-results-title">Lab Results</h1>
          {/* ⬇️ Display the currently filtered Pet ID */}
          <p className="lab-results-subtitle">Viewing results for Pet ID: {currentPetId ?? 'N/A'}</p>
        </div>
      </div>

      <div className="search" style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
        <Search size={16} />
        <input
          value={searchQuery}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search lab results..."
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--foreground)",
            minWidth: "220px",
          }}
        />
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading lab results...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted">No lab results found for Pet ID {currentPetId}.</p>
        </div>
      ) : (
        <div className="lab-results-list">
          {sorted.map((r) => {
            const key = getId(r)
            const status = String(r.Date ? "completed" : "pending").toLowerCase()
            const StatusIcon = status === "completed" ? CheckCircle : AlertCircle
            // Cleaned up result logic
            const resultLabel = r.Notes?.trim() ? 'Result Available' : 'Pending Review'; 
            const resultVal = String(r.Notes).toLowerCase().includes('normal') ? 'normal' : 'abnormal';

            return (
              <div key={key} className="lab-result-card">
                <div className="lab-result-header">
                  <div className="lab-result-icon">
                    <FlaskConical size={24} />
                  </div>

                  <div className="lab-result-meta">
                    <h3 className="lab-result-title">
                      {r.Type} - Pet ID: {r.PetId}
                    </h3>
                    <div className="lab-result-date">
                      <Calendar size={16} />
                      <span>{fmtDate(r.Date || r.createdAt)}</span>
                    </div>
                  </div>

                  <div className="lab-result-status-container">
                    {/* Primary Status Badge */}
                    <span className={`lab-result-status ${status}`}>
                      <StatusIcon size={16} />
                      {status}
                    </span>
                    
                    {/* Secondary Result Text */}
                    <span className={`lab-result-value ${resultVal}`}>{resultLabel}</span>
                  </div>
                </div>

                <div className="lab-result-content">
                  {/* 💰 NEW: DISPLAY COST (Always render this section now) */}
                  <p className="lab-result-notes" style={{ color: 'var(--success)', fontWeight: '600', marginBottom: '0.5rem' }}>
                    <DollarSign size={14} style={{ marginRight: 5 }} />
                    Cost: {fmtCost(r.Cost)}
                  </p>
                  <p className="lab-result-notes">{r.Notes || "No notes provided"}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UserLabResults