// src/Components/Vaccinations/VaccinationModal.jsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./VaccinationModal.css";

/**
 * Props:
 * - vaccination (object | null)
 * - isEditing (boolean)
 * - onSave (fn(payload))
 * - onClose (fn)
 * - defaults (optional) { RecordId?, PetId? }  ← prefill & lock when provided
 */
const VaccinationModal = ({ vaccination, isEditing, onSave, onClose, defaults }) => {
  // 🛑 MODIFICATION 1: Added Cost to the form state
  const [form, setForm] = useState({
    RecordId: "",
    PetId: "",
    VaccineName: "",
    DateGiven: "",
    NextDueDate: "",
    Notes: "",
    Cost: "", // 💰 NEW FIELD
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vaccination && isEditing) {
      setForm({
        RecordId: vaccination.RecordId ?? "",
        PetId: vaccination.PetId ?? "",
        VaccineName: vaccination.VaccineName ?? "",
        DateGiven: vaccination.DateGiven ? new Date(vaccination.DateGiven).toISOString().slice(0, 10) : "",
        NextDueDate: vaccination.NextDueDate ? new Date(vaccination.NextDueDate).toISOString().slice(0, 10) : "",
        Notes: vaccination.Notes ?? "",
        // 🛑 MODIFICATION 2: Read Cost field when editing
        Cost: vaccination.Cost ?? "", 
      });
    } else {
      setForm({
        RecordId: defaults?.RecordId ?? "",
        PetId: defaults?.PetId ?? "",
        VaccineName: "",
        DateGiven: "",
        NextDueDate: "",
        Notes: "",
        // 🛑 MODIFICATION 3: Initialize Cost
        Cost: "", 
      });
    }
  }, [vaccination, isEditing, defaults]);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const validate = () => {
    const e = {};
    if (!String(form.RecordId).trim()) e.RecordId = "Record ID is required";
    if (!String(form.PetId).trim()) e.PetId = "Pet ID is required";
    if (!form.VaccineName.trim()) e.VaccineName = "Vaccine name is required";
    if (!String(form.DateGiven).trim()) e.DateGiven = "Date given is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      // RecordId is numeric (retains type="number")
      RecordId: Number(form.RecordId),
      // 🛑 MODIFICATION 4: PetId is sent as String (e.g., "P-017")
      PetId: form.PetId.trim(), 
      
      VaccineName: form.VaccineName.trim(),
      DateGiven: new Date(form.DateGiven),
      NextDueDate: form.NextDueDate ? new Date(form.NextDueDate) : undefined,
      Notes: form.Notes?.trim() || undefined,
      // 🛑 MODIFICATION 5: Add Cost to payload
      Cost: Number(form.Cost) || 0, 
    };

    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? "Edit Vaccination" : "Add Vaccination"}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form className="record-form" onSubmit={submit}>
          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Record ID *</label>
              <input
                type="number" // Retained as 'number' for numeric RecordId
                className={`input ${errors.RecordId ? "error" : ""}`}
                value={form.RecordId}
                readOnly={Boolean(defaults?.RecordId)}
                onChange={(e) => setField("RecordId", e.target.value)}
                placeholder="e.g. 10001"
              />
              {errors.RecordId && <span className="form-error">{errors.RecordId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Pet ID *</label>
              <input
                // 🛑 MODIFICATION 6: Change type from "number" to "text"
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

          <div className="form-group">
            <label className="form-label">Vaccine Name *</label>
            <input
              className={`input ${errors.VaccineName ? "error" : ""}`}
              value={form.VaccineName}
              onChange={(e) => setField("VaccineName", e.target.value)}
              placeholder="e.g. Rabies"
            />
            {errors.VaccineName && <span className="form-error">{errors.VaccineName}</span>}
          </div>

          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Date Given *</label>
              <input
                type="date"
                className={`input ${errors.DateGiven ? "error" : ""}`}
                value={form.DateGiven}
                onChange={(e) => setField("DateGiven", e.target.value)}
              />
              {errors.DateGiven && <span className="form-error">{errors.DateGiven}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Next Due (optional)</label>
              <input
                type="date"
                className="input"
                value={form.NextDueDate}
                onChange={(e) => setField("NextDueDate", e.target.value)}
              />
            </div>
          </div>

          {/* 💰 NEW FIELD: Unit Cost for Malith's billing */}
          <div className="form-group">
            <label className="form-label">Unit Cost (LKR/USD) *</label>
            <input
              type="number"
              className="input"
              value={form.Cost}
              onChange={(e) => setField("Cost", e.target.value)}
              placeholder="e.g. 2500.00"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <input
              className="input"
              value={form.Notes}
              onChange={(e) => setField("Notes", e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Update Vaccination" : "Add Vaccination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaccinationModal;