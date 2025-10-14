// src/pages/Records.jsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, FileText, Calendar, User, Heart } from "lucide-react"
import "./Records.css"

const fmtDate = (d) => {
  if (!d) return "—"
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString()
}

const safeLower = (v, fallback = "unknown") =>
  String(v || fallback).toLowerCase()

const Records = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    
    setRecords([
      {
        id: 1,
        petName: "Buddy",
        ownerName: "John Smith",
        date: "2024-01-15",
        type: "Checkup",
        diagnosis: "Healthy - Annual checkup completed",
        vetName: "Dr. Sarah Wilson",
      },
      {
        id: 2,
        petName: "Luna",
        ownerName: "Sarah Johnson",
        date: "2024-01-14",
        type: "Treatment",
        diagnosis: "Ear infection - Prescribed antibiotics",
        vetName: "Dr. Michael Chen",
      },
      {
        id: 3,
        petName: "Charlie",
        ownerName: "Mike Brown",
        date: "2024-01-13",
        type: "Surgery",
        diagnosis: "Successful spay surgery",
        vetName: "Dr. Emily Rodriguez",
      },
    ])
    setLoading(false)
  }, [])

  const sorted = useMemo(
    () => [...records].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [records]
  )

  return (
    <div className="records-page">
      <div className="records-header">
        <div className="records-title-section">
          <h1 className="records-title">Medical Records</h1>
          <p className="records-subtitle">Track and manage pet medical history</p>
        </div>
        <button className="btn btn-primary" type="button">
          <Plus size={20} />
          New Record
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading records...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted">No records found.</p>
        </div>
      ) : (
        <div className="records-list">
          {sorted.map((record) => {
            const key =
              record._id?.$oid ||
              record._id ||
              record.id ||
              `${record.petName}-${record.type}-${record.date}`
            const typeClass = safeLower(record.type)

            return (
              <div key={key} className="record-card">
                <div className="record-header">
                  <div className="record-icon">
                    <FileText size={24} />
                  </div>

                  <div className="record-meta">
                    <h3 className="record-title">
                      {record.petName} - {record.type}
                    </h3>
                    <div className="record-date">
                      <Calendar size={16} />
                      <span>{fmtDate(record.date)}</span>
                    </div>
                  </div>

                  <span className={`record-type-badge ${typeClass}`}>
                    {record.type || "Unknown"}
                  </span>
                </div>

                <div className="record-content">
                  <p className="record-diagnosis">{record.diagnosis || "—"}</p>
                  <div className="record-details">
                    <div className="record-detail">
                      <User size={16} />
                      <span>Owner: {record.ownerName || "—"}</span>
                    </div>
                    <div className="record-detail">
                      <Heart size={16} />
                      <span>Vet: {record.vetName || "—"}</span>
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

export default Records
