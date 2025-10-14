"use client";

import { Syringe, Eye, Edit, Trash2, Calendar, Hash, PawPrint, FileText } from "lucide-react";
import "./VaccinationCard.css";

const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
};

const VaccinationCard = ({ vaccination, onView, onEdit, onDelete }) => {
  const id = vaccination?._id?.$oid || vaccination?._id || vaccination?.VaccinationId || "—";
  return (
    <div className="record-card" tabIndex={0}>
      <div className="record-card-header">
        <div className="record-badge">
          <Syringe size={16} />
          <span>Vaccination #{vaccination?.VaccinationId ?? "—"}</span>
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

      <div className="record-title">{vaccination?.VaccineName ?? "No vaccine name"}</div>

      <div className="record-meta">
        <div className="meta-item">
          <Calendar size={16} />
          <span>Given: {formatDate(vaccination?.DateGiven)}</span>
        </div>
        <div className="meta-item">
          <Calendar size={16} />
          <span>Next Due: {formatDate(vaccination?.NextDueDate)}</span>
        </div>
        <div className="meta-item">
          <Hash size={16} />
          <span>Record ID: {vaccination?.RecordId ?? "—"}</span>
        </div>
        <div className="meta-item">
          <PawPrint size={16} />
          <span>Pet ID: {vaccination?.PetId ?? "—"}</span>
        </div>
      </div>

      <div className="record-footer">
        <span className="pill" title={vaccination?.Notes || ""}>
          <FileText size={14} style={{ marginRight: 6 }} />
          {vaccination?.Notes ? (vaccination.Notes.length > 24 ? vaccination.Notes.slice(0, 24) + "…" : vaccination.Notes) : "No notes"}
        </span>
        <span className="pill">ID: {id}</span>
      </div>
    </div>
  );
};

export default VaccinationCard;
