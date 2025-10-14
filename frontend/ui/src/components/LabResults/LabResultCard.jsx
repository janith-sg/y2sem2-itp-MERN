// src/Components/LabResults/LabResultCard.jsx
"use client";

import { Eye, Edit, Trash2, FileText, Calendar, Hash, Link2, PawPrint, DollarSign } from "lucide-react"; // ⬅️ IMPORTED DollarSign
import "./LabResultCard.css";

const fmt = (d) => {
  if (!d) return "—";
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString();
};

// Helper to format cost for display
const fmtCost = (val) => {
    const num = Number(val);
    // Display $X.XX format or '—' if 0/undefined
    return (isNaN(num) || num <= 0) ? "—" : `${num.toFixed(2)} LKR/USD`; 
};

// treat as link if http(s) or site-relative path
const isHttp = (u) => /^https?:\/\//i.test(u || "");
const isPath = (u) => (u || "").startsWith("/");

const LabResultCard = ({ lr, onView, onEdit, onDelete /* onPreview removed */ }) => {
  const uRaw = lr?.FileUrl?.trim();
  const showLink = isHttp(uRaw) || isPath(uRaw);

  return (
    <div className="labresult-card" tabIndex={0}>
      <div className="labresult-card-header">
        <div className="labresult-badge">
          <FileText size={16} />
          <span>Lab Result #{lr?.LabResultId ?? "—"}</span>
        </div>
        <div className="labresult-card-actions">
          <button type="button" className="labresult-action-btn" onClick={onView} title="View">
            <Eye size={16} />
          </button>
          <button type="button" className="labresult-action-btn" onClick={onEdit} title="Edit">
            <Edit size={16} />
          </button>
          <button type="button" className="labresult-action-btn delete" onClick={onDelete} title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="labresult-title">{lr?.Type ?? "Unknown type"}</div>

      <div className="labresult-meta">
        <div className="meta-item">
          <Calendar size={16} />
          <span>Date: {fmt(lr?.Date)}</span>
        </div>
        <div className="meta-item">
          <Hash size={16} />
          <span>Record ID: {lr?.RecordId ?? "—"}</span>
        </div>
        <div className="meta-item">
          <PawPrint size={16} />
          <span>Pet ID: {lr?.PetId ?? "—"}</span>
        </div>

        {/* 💰 NEW: Cost Display Item */}
        <div className="meta-item" style={{ color: 'var(--success)' }}>
          <DollarSign size={16} />
          <span>Cost: {fmtCost(lr?.Cost)}</span>
        </div>
        
        {/* File Link Section */}
        {showLink ? (
          <div className="meta-item">
            <Link2 size={16} />
            <a
              href={uRaw}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open in new tab"
            >
              Open file
            </a>
          </div>
        ) : (
          <div className="meta-item">
            <Link2 size={16} />
            <span>No file</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabResultCard;