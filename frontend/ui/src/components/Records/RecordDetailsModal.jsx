"use client";

import { useCallback, useEffect } from "react";
import {
  X,
  Calendar,
  User,
  PawPrint,
  ClipboardList,
  StickyNote,
  Download,
} from "lucide-react";
import "./RecordDetailsModal.css";

const fmt = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
};

// Normalize id: supports {_id}, {_id:{$oid}}, {id}, {RecordId}
const getId = (rec) => {
  if (!rec) return null;
  const raw =
    rec?._id?.$oid ??
    rec?._id ??
    rec?.id ??
    rec?.RecordId ??
    null;
  return raw ?? null;
};

// Base URL for API (no trailing /)
const RAW_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:3000/api";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

const RecordDetailsModal = ({ record, onClose, onEdit }) => {
  if (!record) return null;

  const id = getId(record);
  const pdfUrl = id ? `${API_BASE}/records/${id}/report.pdf` : null;

  const downloadPdf = useCallback(() => {
    if (!pdfUrl) {
      alert("Cannot determine record id to download PDF.");
      return;
    }
    try {
      // Try opening in a new tab…
      const w = window.open(pdfUrl, "_blank");
      // …if blocked, fallback to same-tab navigation.
      if (!w || w.closed || typeof w.closed === "undefined") {
        window.location.href = pdfUrl;
      }
    } catch (e) {
      console.error("PDF download failed:", e);
      alert("Failed to generate/download PDF. Check console for details.");
    }
  }, [pdfUrl]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content record-details-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2 className="modal-title">Record Details</h2>

          <div className="modal-header-actions">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={downloadPdf}
              title="Download report as PDF"
              disabled={!id}
              aria-disabled={!id}
            >
              <Download size={16} style={{ marginRight: 6 }} />
              Download PDF
            </button>

            <button className="btn btn-secondary" type="button" onClick={onEdit}>
              Edit
            </button>

            <button
              className="modal-close"
              type="button"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="record-details-content">
          <div className="details-header">
            <div>
              <h3 className="details-title">{record.Diagnosis ?? "No diagnosis"}</h3>
              <p className="details-sub">Record #{record.RecordId ?? "—"}</p>
            </div>
          </div>

          <div className="infobox">
            <div className="infocard">
              <div className="label">Visit Date</div>
              <div className="value">
                <Calendar size={14} /> {fmt(record.VisitDate)}
              </div>
            </div>
            <div className="infocard">
              <div className="label">Pet ID</div>
              <div className="value">
                <PawPrint size={14} /> {record.PetId ?? "—"}
              </div>
            </div>
            <div className="infocard">
              <div className="label">Vet ID</div>
              <div className="value">
                <User size={14} /> {record.VetId ?? "—"}
              </div>
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">
              <ClipboardList size={18} /> Clinical Summary
            </h4>
            <div className="kv">
              <div className="key">Diagnosis</div>
              <div className="val">{record.Diagnosis ?? "—"}</div>
              <div className="key">Treatment</div>
              <div className="val">{record.Treatment ?? "—"}</div>
            </div>
          </div>

          <div className="section">
            <h4 className="section-title">
              <StickyNote size={18} /> Notes
            </h4>
            <div className="notes-box">{record.Notes?.trim() || "No notes"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailsModal;
