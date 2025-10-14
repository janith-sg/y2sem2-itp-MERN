// src/USER/Pages/Records.jsx (FINAL LIVE DATA VERSION)
"use client"

import { useState, useEffect, useMemo } from "react"
import { FileText, Calendar, User, Heart, Search } from "lucide-react"
import "../../Pages/Records.css"
// ⬅️ NEW IMPORT: Must import the service for live data
import { recordService } from "../../Services/recordService"; 

const fmtDate = (d) => {
  if (!d) return "—"
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString()
}

const safeLower = (v, fallback = "unknown") => String(v || fallback).toLowerCase()

// ⬇️ MODIFICATION 1: Update HELPER TO GET PET ID AS STRING
const getCurrentPetId = () => {
  const id = localStorage.getItem("currentPetId");
  // 🛑 FIX: Return the ID as a string, not a number, for alphanumeric compatibility
  return id ? String(id).trim() : null; 
};

const UserRecords = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  // ⬇️ Get the Pet ID upon component load
  const currentPetId = getCurrentPetId();

  useEffect(() => {
    // Skip loading if no Pet ID is set (handled by RequirePetId)
    if (!currentPetId) {
        setLoading(false);
        return;
    }
    
    const fetchRecords = async () => {
        try {
            // 1. Fetch live data from the backend
            const resp = await recordService.getAll(); 
            // Use robust parsing to get the array (records: [...])
            const allRecords = resp?.records || resp || [];

            // 2. Filter the live data by the current Pet ID
            // 🛑 FIX: Filter logic now uses the string ID (e.g., r.PetId === "P-017")
            const filteredByPet = allRecords.filter(r => r.PetId === currentPetId);
            
            setRecords(filteredByPet);
        } catch (e) {
            console.error("User records data fetch failed:", e);
            alert("Failed to load records. Check backend.");
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };
    fetchRecords();
  }, [currentPetId]) // Reruns if the pet ID changes

  const filtered = useMemo(() => {
    const s = searchQuery.trim().toLowerCase()
    if (!s) return records
    return records.filter((record) => {
      // 🛑 FIX: Include VetId and PetId in search haystack as strings
      const searchText = [
          String(record.PetId ?? ''), 
          String(record.VetId ?? ''),
          record.Diagnosis, 
          record.Treatment, 
          String(record.RecordId ?? '')
      ]
        .join(" ")
        .toLowerCase()
      return searchText.includes(s)
    })
  }, [records, searchQuery])

  // 🛑 MODIFICATION 3: Sort logic restored to original functionality (no change needed for IDs here)
  const sorted = useMemo(() => [...filtered].sort((a, b) => new Date(b.VisitDate || b.date) - new Date(a.VisitDate || a.date)), [filtered]);


  return (
    <div className="records-page">
      <div className="records-header">
        <div className="records-title-section">
          <h1 className="records-title">Medical Records</h1>
          {/* ⬇️ Display the currently filtered Pet ID */}
          <p className="records-subtitle">Viewing records for Pet ID: {currentPetId ?? 'N/A'}</p> 
        </div>
      </div>

      <div className="search" style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
        <Search size={16} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search records..."
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
          <p>Loading records...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted">No records found for Pet ID {currentPetId}.</p>
        </div>
      ) : (
        <div className="records-list">
          {sorted.map((record) => {
            const key = record._id?.$oid || record._id || record.id || `${record.PetId}-${record.RecordId}`
            const typeClass = safeLower(record.type)

            return (
              <div key={key} className="record-card">
                <div className="record-header">
                  <div className="record-icon">
                    <FileText size={24} />
                  </div>

                  <div className="record-meta">
                    <h3 className="record-title">
                      {record.Diagnosis || "No Diagnosis"}
                    </h3>
                    <div className="record-date">
                      <Calendar size={16} />
                      <span>{fmtDate(record.VisitDate)}</span>
                    </div>
                  </div>

                  <span className={`record-type-badge ${typeClass}`}>{record.Diagnosis || "Unknown"}</span>
                </div>

                <div className="record-content">
                  <p className="record-diagnosis">{record.Diagnosis || "—"}</p>
                  <div className="record-details">
                    <div className="record-detail">
                      <User size={16} />
                      <span>Vet ID: {record.VetId || "—"}</span>
                    </div>
                    <div className="record-detail">
                      <Heart size={16} />
                      <span>Pet ID: {record.PetId || "—"}</span>
                    </div>
                    <div className="record-detail">
                      <FileText size={16} />
                      <span>Record ID: {record.RecordId || "—"}</span>
                    </div>
                    {/* Owner Name removed as it's not present in the RecordModel */}
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

export default UserRecords