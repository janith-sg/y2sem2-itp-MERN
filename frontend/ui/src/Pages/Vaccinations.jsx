// src/pages/Vaccinations.jsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Syringe, Calendar, Shield, Heart } from "lucide-react"
import "./Vaccinations.css"

const fmtDate = (d) => {
  if (!d) return "—"
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString()
}

const Vaccinations = () => {
  const [vaccinations, setVaccinations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: replace with vaccinationService.getAll() when backend is ready
    setVaccinations([
      { id: 1, petName: "Buddy",   vaccine: "Rabies", date: "2024-01-15", nextDue: "2025-01-15", status: "completed" },
      { id: 2, petName: "Luna",    vaccine: "FVRCP",  date: "2024-01-10", nextDue: "2024-04-10", status: "completed" },
      { id: 3, petName: "Charlie", vaccine: "DHPP",   date: "2023-12-20", nextDue: "2024-02-01", status: "due" },
    ])
    setLoading(false)
  }, [])

  // sort newest last dose first; if tie, nextDue desc
  const sorted = useMemo(() => {
    return [...vaccinations].sort((a, b) => {
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      if (db !== da) return db - da
      const na = new Date(a.nextDue).getTime()
      const nb = new Date(b.nextDue).getTime()
      return nb - na
    })
  }, [vaccinations])

  return (
    <div className="vaccinations-page">
      <div className="vaccinations-header">
        <div className="vaccinations-title-section">
          <h1 className="vaccinations-title">Vaccinations</h1>
          <p className="vaccinations-subtitle">Track vaccination schedules and history</p>
        </div>
        <button className="btn btn-primary" type="button">
          <Plus size={20} />
          Record Vaccination
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading vaccinations...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted">No vaccinations found.</p>
        </div>
      ) : (
        <div className="vaccinations-grid">
          {sorted.map((v) => {
            const key = v._id?.$oid || v._id || v.id || `${v.vaccine}-${v.petName}-${v.date}`
            const status = String(v.status || "").toLowerCase() // for className safety
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
                  <h3 className="vaccination-vaccine">{v.vaccine || "—"}</h3>

                  <div className="vaccination-pet">
                    <Heart size={16} />
                    <span>{v.petName || "—"}</span>
                  </div>

                  <div className="vaccination-dates">
                    <div className="vaccination-date">
                      <Calendar size={16} />
                      <span>Last: {fmtDate(v.date)}</span>
                    </div>
                    <div className="vaccination-date">
                      <Shield size={16} />
                      <span>Next: {fmtDate(v.nextDue)}</span>
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

export default Vaccinations
