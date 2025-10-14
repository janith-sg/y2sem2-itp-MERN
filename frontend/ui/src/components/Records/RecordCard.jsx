"use client";

import { Eye, Edit, Trash2, Calendar, User, PawPrint, FileText, StickyNote } from "lucide-react";
import "./RecordCard.css";

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const RecordCard = ({ record, onView, onEdit, onDelete }) => {
  return (
    <div className="record-card" tabIndex={0}>
      <div className="record-card-header">
        <div className="record-badge">
          <FileText size={16} />
          <span>Record #{record?.RecordId ?? "—"}</span>
        </div>

        <div className="record-card-actions">
          <button type="button" className="record-action-btn" onClick={onView} title="View">
            <Eye size={16} />
          </button>
          <button type="button" className="record-action-btn" onClick={onEdit} title="Edit">
            <Edit size={16} />
          </button>
          <button
            type="button"
            className="record-action-btn delete"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="record-title">{record?.Diagnosis ?? "No diagnosis set"}</div>

      <div className="record-meta">
        <div className="meta-item">
          <Calendar size={16} />
          <span>{formatDate(record?.VisitDate)}</span>
        </div>
        <div className="meta-item">
          <User size={16} />
          <span>Vet ID: {record?.VetId ?? "—"}</span>
        </div>
        <div className="meta-item">
          <PawPrint size={16} />
          <span>Pet ID: {record?.PetId ?? "—"}</span>
        </div>
      </div>

      <div className="record-footer">
        <span className="pill">Treatment: {record?.Treatment ?? "—"}</span>
        <span className="pill" title={record?.Notes || ""}>
          <StickyNote size={14} style={{ marginRight: 6 }} />
          {record?.Notes ? (record.Notes.length > 28 ? record.Notes.slice(0, 28) + "…" : record.Notes) : "No notes"}
        </span>
      </div>
    </div>
  );
};

export default RecordCard;
