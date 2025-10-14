// src/pages/LabResults.jsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, FlaskConical, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import "./LabResults.css"

const fmtDate = (d) => {
  if (!d) return "—"
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString()
}

const LabResults = () => {
  const [labResults, setLabResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: swap mock with your service when backend is ready:
    // const data = await labResultService.getAll();
    // setLabResults(Array.isArray(data) ? data : []);
    setLabResults([
      { id: 1, petName: "Buddy",   testType: "Blood Panel", date: "2024-01-15", status: "completed", result: "Normal",   notes: "All values within normal range" },
      { id: 2, petName: "Luna",    testType: "Urinalysis",  date: "2024-01-14", status: "pending",   result: "Pending",  notes: "Results expected within 24 hours" },
      { id: 3, petName: "Charlie", testType: "X-Ray",       date: "2024-01-13", status: "completed", result: "Abnormal", notes: "Minor joint inflammation detected" },
    ])
    setLoading(false)
  }, [])

  const sorted = useMemo(() => {
    return [...labResults].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [labResults])

  return (
    <div className="lab-results-page">
      <div className="lab-results-header">
        <div className="lab-results-title-section">
          <h1 className="lab-results-title">Lab Results</h1>
          <p className="lab-results-subtitle">View and manage laboratory test results</p>
        </div>
        <button className="btn btn-primary" type="button">
          <Plus size={20} />
          Add Lab Result
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading lab results...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted">No lab results found.</p>
        </div>
      ) : (
        <div className="lab-results-list">
          {sorted.map((r) => {
            const key = r._id?.$oid || r._id || r.id || `${r.testType}-${r.petName}-${r.date}`
            const status = String(r.status || "").toLowerCase()
            const resultVal = String(r.result || "").toLowerCase()
            const StatusIcon = status === "completed" ? CheckCircle : AlertCircle

            return (
              <div key={key} className="lab-result-card">
                <div className="lab-result-header">
                  <div className="lab-result-icon">
                    <FlaskConical size={24} />
                  </div>

                  <div className="lab-result-meta">
                    <h3 className="lab-result-title">
                      {r.testType} - {r.petName}
                    </h3>
                    <div className="lab-result-date">
                      <Calendar size={16} />
                      <span>{fmtDate(r.date)}</span>
                    </div>
                  </div>

                  <div className="lab-result-status-container">
                    <span className={`lab-result-status ${status}`}>
                      <StatusIcon size={16} />
                      {status || "unknown"}
                    </span>
                    <span className={`lab-result-value ${resultVal || "unknown"}`}>{r.result || "—"}</span>
                  </div>
                </div>

                <div className="lab-result-content">
                  <p className="lab-result-notes">{r.notes || "—"}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LabResults
