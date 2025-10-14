"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./RecordModal.css";

const toLocalDT = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Props:
 * - record (object | null)
 * - isEditing (boolean)
 * - onSave (fn(payload))
 * - onClose (fn)
 * - defaults (optional) { PetId?, VetId? }  ← prefill + lock when provided
 */
const RecordModal = ({ record, isEditing, onSave, onClose, defaults }) => {
  const [form, setForm] = useState({
    PetId: "",
    VetId: "",
    VisitDate: "",
    Diagnosis: "",
    Treatment: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && record) {
      setForm({
        PetId: record.PetId ?? "",
        VetId: record.VetId ?? "",
        VisitDate: toLocalDT(record.VisitDate),
        Diagnosis: record.Diagnosis ?? "",
        Treatment: record.Treatment ?? "",
      });
    } else {
      setForm({
        PetId: defaults?.PetId ?? "",
        VetId: defaults?.VetId ?? "",
        VisitDate: "",
        Diagnosis: "",
        Treatment: "",
      });
    }
  }, [isEditing, record, defaults]);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const validate = () => {
    const e = {};
    if (!String(form.PetId).trim()) e.PetId = "Pet ID is required";
    if (!String(form.VetId).trim()) e.VetId = "Vet ID is required";
    if (!String(form.VisitDate).trim()) e.VisitDate = "Visit date is required";
    if (!form.Diagnosis.trim()) e.Diagnosis = "Diagnosis is required";
    if (!form.Treatment.trim()) e.Treatment = "Treatment is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      // RecordId is server-generated; not sent
      // 🛑 MODIFICATION 1: PetId sent as String (e.g., "P-017")
      PetId: form.PetId.trim(), 
      // 🛑 MODIFICATION 2: VetId sent as String (e.g., "V-301")
      VetId: form.VetId.trim(), 
      
      VisitDate: new Date(form.VisitDate).toISOString(),
      Diagnosis: form.Diagnosis.trim(),
      Treatment: form.Treatment.trim(),
    };

    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? "Edit Record" : "Add Record"}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form className="record-form" onSubmit={submit}>
          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Visit Date & Time *</label>
              <input
                type="datetime-local"
                className={`input ${errors.VisitDate ? "error" : ""}`}
                value={form.VisitDate}
                onChange={(e) => setField("VisitDate", e.target.value)}
              />
              {errors.VisitDate && <span className="form-error">{errors.VisitDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Pet ID *</label>
              <input
                // 🛑 MODIFICATION 3: Change type from "number" to "text"
                type="text" 
                className={`input ${errors.PetId ? "error" : ""}`}
                value={form.PetId}
                readOnly={Boolean(defaults?.PetId)}
                onChange={(e) => setField("PetId", e.target.value)}
                placeholder="e.g. P-017" // ⬅️ Updated placeholder
              />
              {errors.PetId && <span className="form-error">{errors.PetId}</span>}
            </div>
          </div>

          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Vet ID *</label>
              <input
                // 🛑 MODIFICATION 4: Change type from "number" to "text"
                type="text" 
                className={`input ${errors.VetId ? "error" : ""}`}
                value={form.VetId}
                readOnly={Boolean(defaults?.VetId)}
                onChange={(e) => setField("VetId", e.target.value)}
                placeholder="e.g. V-301" // ⬅️ Updated placeholder
              />
              {errors.VetId && <span className="form-error">{errors.VetId}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Diagnosis *</label>
            <input
              type="text"
              className={`input ${errors.Diagnosis ? "error" : ""}`}
              value={form.Diagnosis}
              onChange={(e) => setField("Diagnosis", e.target.value)}
              placeholder="Enter diagnosis"
            />
            {errors.Diagnosis && <span className="form-error">{errors.Diagnosis}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Treatment *</label>
            <textarea
              className={`input ${errors.Treatment ? "error" : ""}`}
              value={form.Treatment}
              onChange={(e) => setField("Treatment", e.target.value)}
              placeholder="Enter treatment details"
              rows={3}
            />
            {errors.Treatment && <span className="form-error">{errors.Treatment}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Update Record" : "Add Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordModal;