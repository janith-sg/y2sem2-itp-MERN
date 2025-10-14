// src/pages/Prescriptions.jsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Pill, Calendar, User, Heart } from "lucide-react"
import "./Prescriptions.css"

const fmtDate = (d) => {
  if (!d) return "—"
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString()
}

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: replace with service call when backend is ready
    // const data = await prescriptionService.getAll();
    // setPrescriptions(Array.isArray(data) ? data : []);
    setPrescriptions([
      {
        id: 1,
        petName: "Buddy",
        ownerName: "John Smith",
        medication: "Amoxicillin",
        dosage: "250mg twice daily",
        duration: "7 days",
        date: "2024-01-15",
        vetName: "Dr. Sarah Wilson",
      },
      {
        id: 2,
        petName: "Luna",
        ownerName: "Sarah Johnson",
        medication: "Prednisolone",
        dosage: "5mg once daily",
        duration: "10 days",
        date: "2024-01-14",
        vetName: "Dr. Michael Chen",
      },
    ])
    setLoading(false)
  }, [])

  const sorted = useMemo(
    () => [...prescriptions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [prescriptions]
  )

  return (
    <div className="prescriptions-page">
      <div className="prescriptions-header">
        <div className="prescriptions-title-section">
          <h1 className="prescriptions-title">Prescriptions</h1>
          <p className="prescriptions-subtitle">Manage medication prescriptions for pets</p>
        </div>
        <button className="btn btn-primary" type="button">
          <Plus size={20} />
          New Prescription
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading prescriptions...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted">No prescriptions found.</p>
        </div>
      ) : (
        <div className="prescriptions-grid">
          {sorted.map((p) => {
            const key = p._id?.$oid || p._id || p.id || `${p.medication}-${p.petName}-${p.date}`
            return (
              <div key={key} className="prescription-card">
                <div className="prescription-header">
                  <div className="prescription-icon">
                    <Pill size={24} />
                  </div>
                  <div className="prescription-date">
                    <Calendar size={16} />
                    <span>{fmtDate(p.date)}</span>
                  </div>
                </div>

                <div className="prescription-content">
                  <h3 className="prescription-medication">{p.medication || "—"}</h3>

                  <div className="prescription-details">
                    <div className="prescription-detail">
                      <span className="detail-label">Dosage:</span>
                      <span className="detail-value">{p.dosage || "—"}</span>
                    </div>
                    <div className="prescription-detail">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{p.duration || "—"}</span>
                    </div>
                  </div>

                  <div className="prescription-footer">
                    <div className="prescription-pet">
                      <Heart size={16} />
                      <span>{p.petName || "—"}</span>
                    </div>
                    <div className="prescription-vet">
                      <User size={16} />
                      <span>{p.vetName || "—"}</span>
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

export default Prescriptions
