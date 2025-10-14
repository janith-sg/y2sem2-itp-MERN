// src/USER/Pages/Prescriptions.jsx (FINAL LIVE DATA VERSION)
"use client"

import { useState, useEffect, useMemo } from "react"
import { Pill, Calendar, User, Heart, Search, DollarSign } from "lucide-react" 
import "../../Pages/Prescriptions.css"
// ⬅️ NEW IMPORT: Must import the service for live data
import { prescriptionService } from "../../Services/prescriptionService";

const fmtDate = (d) => {
  if (!d) return "—"
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString()
}

// ⬇️ FIX: Add the missing getId utility function
const getId = (p) => p?._id?.$oid || p?._id || p?.PrescriptionId || p?.id;

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

const UserPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  // ⬇️ Get the Pet ID
  const currentPetId = getCurrentPetId();

  useEffect(() => {
    if (!currentPetId) {
        setLoading(false);
        return;
    }
    
    const fetchPrescriptions = async () => {
        try {
            const resp = await prescriptionService.getAll();
            const allPrescriptions = resp?.prescriptions || resp || [];

            // 2. Filter the live data by the current Pet ID
            // 🛑 FIX: Filter logic now uses the string ID (e.g., p.PetId === "P-017")
            const filteredByPet = allPrescriptions.filter(p => p.PetId === currentPetId);
            
            setPrescriptions(filteredByPet);
        } catch (e) {
            console.error("User prescriptions data fetch failed:", e);
            alert("Failed to load prescriptions. Check backend.");
            setPrescriptions([]);
        } finally {
            setLoading(false);
        }
    };
    fetchPrescriptions();
  }, [currentPetId])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return prescriptions
    return prescriptions.filter((p) => {
      // Adjusted search fields for live data (Name, Dose, Duration, IDs, COST)
      const searchText = [
          p.Name, p.Dose, p.Duration, 
          String(p.PrescriptionId ?? ''), 
          String(p.RecordId ?? ''),
          String(p.Cost ?? '') 
      ].join(" ").toLowerCase()
      return searchText.includes(query)
    })
  }, [prescriptions, searchQuery])

  const sorted = useMemo(() => [...filtered].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)), [filtered])

  return (
    <div className="prescriptions-page">
      <div className="prescriptions-header">
        <div className="prescriptions-title-section">
          <h1 className="prescriptions-title">Prescriptions</h1>
          {/* ⬇️ Display the currently filtered Pet ID */}
          <p className="prescriptions-subtitle">Viewing prescriptions for Pet ID: {currentPetId ?? 'N/A'}</p>
        </div>
      </div>

      <div className="search" style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
        <Search size={16} />
        <input
          value={searchQuery}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search prescriptions..."
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
          <p>Loading prescriptions...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted">No prescriptions found for Pet ID {currentPetId}.</p>
        </div>
      ) : (
        <div className="prescriptions-grid">
          {sorted.map((p) => {
            const key = getId(p)
            return (
              <div key={key} className="prescription-card">
                <div className="prescription-header">
                  <div className="prescription-icon">
                    <Pill size={24} />
                  </div>
                  <div className="prescription-date">
                    <Calendar size={16} />
                    <span>{fmtDate(p.createdAt || p.date)}</span>
                  </div>
                </div>

                <div className="prescription-content">
                  <h3 className="prescription-medication">{p.Name || p.medication || "—"}</h3>

                  <div className="prescription-details">
                    <div className="prescription-detail">
                      <span className="detail-label">Dosage:</span>
                      <span className="detail-value">{p.Dose || p.dosage || "—"}</span>
                    </div>
                    <div className="prescription-detail">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{p.Duration || p.duration || "—"}</span>
                    </div>
                  </div>

                  <div className="prescription-footer">
                    {/* 💰 NEW: DISPLAY COST IN FOOTER */}
                    <div className="prescription-pet" style={{ color: 'var(--success)', fontWeight: '600' }}>
                        <DollarSign size={16} />
                        <span>Cost: {fmtCost(p.Cost)}</span>
                    </div>
                    {/* Existing Record/Pet IDs */}
                    <div className="prescription-vet">
                      <User size={16} />
                      <span>Record ID: {p.RecordId}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UserPrescriptions