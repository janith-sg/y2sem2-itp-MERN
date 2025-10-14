// src/Components/Vaccinations/VaccinationDetailsModal.jsx
"use client";

import { X, Syringe, Calendar, Hash, PawPrint, FileText, DollarSign } from "lucide-react"; // ⬅️ IMPORTED DollarSign
import "./VaccinationDetailsModal.css";

const fmt = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
};

const VaccinationDetailsModal = ({ vaccination, onClose, onEdit }) => {
  if (!vaccination) return null;
  
  // Helper to format cost for display
  const fmtCost = (val) => {
      const num = Number(val);
      if (isNaN(num) || num <= 0) return "—";
      return `${num.toFixed(2)} LKR/USD`; 
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content record-details-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">Vaccination Details</h2>
          <div className="modal-header-actions">
            <button className="btn btn-secondary" type="button" onClick={onEdit}>
              Edit
            </button>
            <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="record-details-content">
          <div className="details-header">
            <div>
              <h3 className="details-title">{vaccination.VaccineName ?? "No vaccine name"}</h3>
              <p className="details-sub">Vaccination #{vaccination.VaccinationId ?? "—"}</p>
            </div>
          </div>

          <div className="infobox">
            <div className="infocard">
              <div className="label">Date Given</div>
              <div className="value">
                <Calendar size={14} /> {fmt(vaccination.DateGiven)}
              </div>
            </div>
            <div className="infocard">
              <div className="label">Next Due</div>
              <div className="value">
                <Calendar size={14} /> {fmt(vaccination.NextDueDate)}
              </div>
            </div>
            {/* 💰 NEW: COST DISPLAY CARD */}
            <div className="infocard" style={{ gridColumn: 'span 3', border: '1px solid var(--accent)' }}>
                <div className="label">Unit Cost</div>
                <div className="value" style={{ color: 'var(--accent)' }}>
                    <DollarSign size={14} /> {fmtCost(vaccination.Cost)}
                </div>
            </div>
            {/* End NEW COST */}

            <div className="infocard">
              <div className="label">Record ID</div>
              <div className="value">
                <Hash size={14} /> {vaccination.RecordId ?? "—"}
              </div>
            </div>
            <div className="infocard">
              <div className="label">Pet ID</div>
              <div className="value">
                <PawPrint size={14} /> {vaccination.PetId ?? "—"}
              </div>
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">
              <Syringe size={18} /> Summary
            </h4>
            <div className="kv">
              <div className="key">Vaccine</div>
              <div className="val">{vaccination.VaccineName ?? "—"}</div>
              <div className="key">Cost</div>
              <div className="val">{fmtCost(vaccination.Cost)}</div> {/* Added cost here too */}
              <div className="key">Given</div>
              <div className="val">{fmt(vaccination.DateGiven)}</div>
              <div className="key">Next Due</div>
              <div className="val">{fmt(vaccination.NextDueDate)}</div>
              <div className="key">Linked Record</div>
              <div className="val">{vaccination.RecordId ?? "—"}</div>
              <div className="key">Pet</div>
              <div className="val">{vaccination.PetId ?? "—"}</div>
              <div className="key">Notes</div>
              <div className="val">{vaccination.Notes?.trim() || "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationDetailsModal;