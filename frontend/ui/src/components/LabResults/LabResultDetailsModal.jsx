"use client";

import { X, FileText, Calendar, Hash, Link2, StickyNote, PawPrint, DollarSign } from "lucide-react"; // ⬅️ IMPORTED DollarSign
import "./LabResultDetailsModal.css";

const fmt = (d) => {
  if (!d) return "—";
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString();
};

const LabResultDetailsModal = ({ lr, onClose, onEdit }) => {
  if (!lr) return null;
  
  // Helper to format cost for display
  const fmtCost = (val) => {
      const num = Number(val);
      if (isNaN(num) || num <= 0) return "—";
      return `${num.toFixed(2)} LKR/USD`; 
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content labresult-details-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">Lab Result Details</h2>
          <div className="modal-header-actions">
            <button className="btn btn-secondary" type="button" onClick={onEdit}>
              Edit
            </button>
            <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="lr-details">
          <div className="section">
            <h4 className="section-title">
              <FileText size={18} /> Lab Result #{lr?.LabResultId ?? "—"}
            </h4>
            <div className="kv">
              <div className="key">Type</div>
              <div className="val">{lr?.Type ?? "—"}</div>

              <div className="key">Date</div>
              <div className="val">
                <Calendar size={14} /> {fmt(lr?.Date)}
              </div>
              
              {/* 💰 NEW FIELD: COST */}
              <div className="key">Cost</div>
              <div className="val" style={{ color: 'var(--success)' }}>
                <DollarSign size={14} /> {fmtCost(lr?.Cost)}
              </div>

              <div className="key">Record ID</div>
              <div className="val">
                <Hash size={14} /> {lr?.RecordId ?? "—"}
              </div>

              <div className="key">Pet ID</div>
              <div className="val">
                <PawPrint size={14} /> {lr?.PetId ?? "—"}
              </div>

              <div className="key">File</div>
              <div className="val">
                {lr?.FileUrl ? (
                  <a href={lr.FileUrl} target="_blank" rel="noreferrer">
                    <Link2 size={14} /> Open file
                  </a>
                ) : (
                  "—"
                )}
              </div>

              <div className="key">Notes</div>
              <div className="val">
                <StickyNote size={14} /> {lr?.Notes ?? "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabResultDetailsModal;