// src/USER/Pages/Vaccinations.jsx (FINAL LIVE DATA VERSION)
"use client"

import { useState, useEffect, useMemo } from "react"
import { Syringe, Calendar, Shield, Heart, Search, DollarSign } from "lucide-react" 
import "../../Pages/Vaccinations.css"
// ⬅️ NEW IMPORT: Must import the service for live data
import { vaccinationService } from "../../Services/vaccinationService";

const fmtDate = (d) => {
  if (!d) return "—"
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString()
}

// ⬇️ FIX: Add the missing getId utility function
const getId = (v) => v?._id?.$oid || v?._id || v?.VaccinationId || v?.id;

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

const UserVaccinations = () => {
  const [vaccinations, setVaccinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  // ⬇️ Get the Pet ID
  const currentPetId = getCurrentPetId();

  useEffect(() => {
    if (!currentPetId) { setLoading(false); return; }

    const fetchVaccinations = async () => {
        try {
            const resp = await vaccinationService.getAll();
            const allVaccinations = resp?.vaccinations || resp || [];

            // 2. Filter the live data by the current Pet ID
            // 🛑 FIX: Filter logic now uses the string ID (e.g., v.PetId === "P-017")
            const filteredByPet = allVaccinations.filter(v => v.PetId === currentPetId);
            
            setVaccinations(filteredByPet);
        } catch (e) {
            console.error("User vaccinations data fetch failed:", e);
            alert("Failed to load vaccinations. Check backend.");
            setVaccinations([]);
        } finally {
            setLoading(false);
        }
    };
    fetchVaccinations();
  }, [currentPetId])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return vaccinations
    return vaccinations.filter((v) => {
      // Adjusted search fields for live data (VaccineName, IDs, COST)
      const searchText = [v.VaccineName, String(v.VaccinationId ?? ''), String(v.RecordId ?? ''), String(v.Cost ?? '')].join(" ").toLowerCase()
      return searchText.includes(query)
    })
  }, [vaccinations, searchQuery])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const da = new Date(b.DateGiven || b.createdAt).getTime()
      const db = new Date(a.DateGiven || a.createdAt).getTime()
      return da - db; // Sort by DateGiven descending
    })
  }, [filtered])

  return (
    <div className="vaccinations-page">
      <div className="vaccinations-header">
        <div className="vaccinations-title-section">
          <h1 className="vaccinations-title">Vaccinations</h1>
          {/* ⬇️ Display the currently filtered Pet ID */}
          <p className="vaccinations-subtitle">Viewing schedules for Pet ID: {currentPetId ?? 'N/A'}</p>
        </div>
      </div>

      <div className="search" style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
        <Search size={16} />
        <input
          value={searchQuery}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vaccinations..."
          aria-label="Search vaccinations"
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
          <p>Loading vaccinations...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted">No vaccinations found for Pet ID {currentPetId}.</p>
        </div>
      ) : (
        <div className="vaccinations-grid">
          {sorted.map((v) => {
            const key = getId(v)
            const status = String(v.NextDueDate && new Date(v.NextDueDate) > new Date() ? "due" : "completed").toLowerCase()
            const label = status === "completed" ? "Up to Date" : "Due Soon"

            return (
              <div key={key} className="vaccination-card">
                <div className="vaccination-header">
                  <div className="vaccination-icon">
                    <Syringe size={24} />
                  </div>
                  <span className={`vaccination-status ${status}`}>{label}</span>
                </div>

                <div className="vaccination-content">
                  <h3 className="vaccination-vaccine">{v.VaccineName || "—"}</h3>

                  {/* 💰 NEW: DISPLAY COST IN CARD */}
                  {v.Cost > 0 && (
                      <div className="vaccination-pet">
                          <DollarSign size={16} />
                          <span>Cost: {fmtCost(v.Cost)}</span>
                      </div>
                  )}

                  <div className="vaccination-pet">
                    <Heart size={16} />
                    <span>Pet ID: {v.PetId}</span>
                  </div>

                  <div className="vaccination-dates">
                    <div className="vaccination-date">
                      <Calendar size={16} />
                      <span>Given: {fmtDate(v.DateGiven)}</span>
                    </div>
                    <div className="vaccination-date">
                      <Shield size={16} />
                      <span>Next Due: {fmtDate(v.NextDueDate)}</span>
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

export default UserVaccinations