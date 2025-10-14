"use client";

import { Pill, Eye, Edit, Trash2, Calendar, Hash } from "lucide-react";
import "./PrescriptionCard.css";

const pick = (p) => ({
  id: p?.PrescriptionId ?? p?._id ?? p?.id,
  recordId: p?.RecordId ?? p?.recordId,
  petId: p?.PetId ?? p?.petId,
  name: p?.Name ?? p?.name ?? p?.drugName ?? p?.medicine ?? "Prescription",
  dose: p?.Dose ?? p?.dose ?? p?.dosage ?? "",
  duration: p?.Duration ?? p?.duration ?? "",
  createdAt: p?.createdAt, // from mongoose timestamps
});

const fmt = (d) => {
  if (!d) return "—";
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? "—" : x.toLocaleDateString();
};

const PrescriptionCard = ({ prescription, onView, onEdit, onDelete }) => {
  const v = pick(prescription);

  return (
    <div className="record-card" tabIndex={0}>
      <div className="record-card-header">
        <div className="record-badge">
          <Pill size={16} />
          <span>Prescription #{v.id ?? "—"}</span>
        </div>

        <div className="record-card-actions">
          <button type="button" className="record-action-btn" onClick={onView} title="View">
            <Eye size={16} />
          </button>
          <button type="button" className="record-action-btn" onClick={onEdit} title="Edit">
            <Edit size={16} />
          </button>
          <button type="button" className="record-action-btn delete" onClick={onDelete} title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="record-title">
        {v.name}
        {v.dose ? <span className="pill" style={{ marginLeft: 8 }}>{v.dose}</span> : null}
      </div>

      <div className="record-meta">
        <div className="meta-item"><Calendar size={16} /><span>{fmt(v.createdAt)}</span></div>
        <div className="meta-item"><Hash size={16} /><span>Record ID: {v.recordId ?? "—"}</span></div>
        <div className="meta-item"><Hash size={16} /><span>Pet ID: {v.petId ?? "—"}</span></div>
      </div>

      <div className="record-footer">
        <span className="pill">Duration: {v.duration || "—"}</span>
      </div>
    </div>
  );
};

export default PrescriptionCard;
