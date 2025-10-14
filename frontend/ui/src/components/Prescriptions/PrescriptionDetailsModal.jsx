"use client";

import { X, Pill, Calendar, Hash, FileText, PawPrint, DollarSign } from "lucide-react"; // ⬅️ IMPORTED DollarSign
import "./PrescriptionDetailsModal.css";

const pick = (p) => ({
  id: p?.PrescriptionId ?? p?._id ?? p?.id,
  recordId: p?.RecordId ?? p?.recordId,
  petId: p?.PetId ?? p?.petId,
  name: p?.Name ?? p?.name ?? p?.drugName ?? p?.medicine ?? "Prescription",
  dose: p?.Dose ?? p?.dose ?? p?.dosage ?? "",
  duration: p?.Duration ?? p?.duration ?? "",
  // 💰 NEW FIELD: Include Cost in the picker
  cost: p?.Cost ?? p?.cost ?? "", 
  
  // 🛑 REMOVED: Notes field (as it was replaced by Cost in the modal)
  
  createdAt: p?.createdAt,
  updatedAt: p?.updatedAt,
});
const fmt = (d) => {
  if (!d) return "—";
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? "—" : x.toLocaleString();
};

const PrescriptionDetailsModal = ({ prescription, onClose, onEdit }) => {
  if (!prescription) return null;
  const v = pick(prescription);

  // Helper to format cost
  const fmtCost = (val) => {
      const num = Number(val);
      if (isNaN(num) || num <= 0) return "—";
      // Assuming currency format
      return `${num.toFixed(2)} LKR/USD`; 
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content record-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Prescription Details</h2>
          <div className="modal-header-actions">
            <button className="btn btn-secondary" type="button" onClick={onEdit}>Edit</button>
            <button className="modal-close" type="button" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        <div className="record-details-content">
          <div className="details-header">
            <div>
              <h3 className="details-title">{v.name}</h3>
              <p className="details-sub">Prescription #{v.id ?? "—"}</p>
            </div>
          </div>

          <div className="infobox">
            <div className="infocard"><div className="label">Created</div><div className="value"><Calendar size={14}/> {fmt(v.createdAt)}</div></div>
            <div className="infocard"><div className="label">Dose</div><div className="value"><Pill size={14}/> {v.dose || "—"}</div></div>
            <div className="infocard"><div className="label">Duration</div><div className="value"><Pill size={14}/> {v.duration || "—"}</div></div>
            
            {/* 💰 NEW: UNIT COST CARD */}
            <div className="infocard" style={{ gridColumn: 'span 3', border: '1px solid var(--success)' }}>
                <div className="label">Unit Cost</div>
                <div className="value" style={{ color: 'var(--success)' }}>
                    <DollarSign size={14} /> {fmtCost(v.cost)}
                </div>
            </div>
            
            <div className="infocard"><div className="label">Record ID</div><div className="value"><Hash size={14}/> {v.recordId ?? "—"}</div></div>
            <div className="infocard"><div className="label">Pet ID</div><div className="value"><PawPrint size={14}/> {v.petId ?? "—"}</div></div>
          </div>

          {/* 🛑 REMOVED: The section for v.notes is removed since the input modal no longer supports it. */}
          {/* If the Notes field is brought back later, this section would need to be restored. */}

        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetailsModal;