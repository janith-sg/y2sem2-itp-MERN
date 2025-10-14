"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./PrescriptionModal.css";

/**
 * Props:
 * - item (object | null)
 * - isEditing (boolean)
 * - onSave (fn)
 * - onClose (fn)
 * - defaults (optional) { RecordId?, PetId? } ← prefill & lock when provided
 */
// MODIFICATION 1: Change Notes to Cost in the initial state definition
const init = { RecordId: "", PetId: "", Name: "", Dose: "", Duration: "", Cost: "" };

const PrescriptionModal = ({ item, isEditing, onSave, onClose, defaults }) => {
  const [form, setForm] = useState(init);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item && isEditing) {
      setForm({
        RecordId: item.RecordId ?? "",
        PetId: item.PetId ?? "",
        Name: item.Name ?? item.name ?? "",
        Dose: item.Dose ?? item.dose ?? "",
        Duration: item.Duration ?? item.duration ?? "",
        // MODIFICATION 2: Read Cost
        Cost: item.Cost ?? "",
      });
    } else {
      setForm({
        RecordId: defaults?.RecordId ?? "",
        PetId: defaults?.PetId ?? "",
        Name: "",
        Dose: "",
        Duration: "",
        // MODIFICATION 3: Initialize Cost
        Cost: "",
      });
    }
  }, [item, isEditing, defaults]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!String(form.RecordId).trim()) e.RecordId = "Required";
    if (!String(form.PetId).trim()) e.PetId = "Required";
    if (!form.Name.trim()) e.Name = "Required";
    if (!form.Dose.trim()) e.Dose = "Required";
    if (!form.Duration.trim()) e.Duration = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      // RecordId is sent as Number (correct for visit ID)
      RecordId: Number(form.RecordId), 
      // 🛑 FIX 1: PetId is sent as String (correct for P-017 format)
      PetId: form.PetId.trim(),
      Name: form.Name.trim(),
      Dose: form.Dose.trim(),
      Duration: form.Duration.trim(),
      // MODIFICATION 5: Send Cost value
      Cost: Number(form.Cost) || 0,
    };
    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? "Edit Prescription" : "Add Prescription"}</h2>
          <button className="modal-close" type="button" onClick={onClose}><X size={20} /></button>
        </div>

        <form className="record-form" onSubmit={submit}>
          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Record ID *</label>
              <input
                type="number" // Remains 'number' since RecordId is numeric
                className={`input ${errors.RecordId ? "error" : ""}`}
                value={form.RecordId}
                readOnly={Boolean(defaults?.RecordId)}
                onChange={(e)=>set("RecordId", e.target.value)}
                placeholder="e.g. 10001"
              />
              {errors.RecordId && <span className="form-error">{errors.RecordId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Pet ID *</label>
              <input
                // 🛑 FIX 2: Change type from "number" to "text"
                type="text" 
                className={`input ${errors.PetId ? "error" : ""}`}
                value={form.PetId}
                readOnly={Boolean(defaults?.PetId)}
                onChange={(e)=>set("PetId", e.target.value)}
                placeholder="e.g. P-017" // ⬅️ Updated placeholder
              />
              {errors.PetId && <span className="form-error">{errors.PetId}</span>}
            </div>
          </div>

          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                className={`input ${errors.Name ? "error" : ""}`}
                value={form.Name}
                onChange={(e)=>set("Name", e.target.value)}
                placeholder="e.g. Amoxicillin"
              />
              {errors.Name && <span className="form-error">{errors.Name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Dose *</label>
              <input
                className={`input ${errors.Dose ? "error" : ""}`}
                value={form.Dose}
                onChange={(e)=>set("Dose", e.target.value)}
                placeholder="e.g. 250mg bid"
              />
              {errors.Dose && <span className="form-error">{errors.Dose}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Duration *</label>
            <input
              className={`input ${errors.Duration ? "error" : ""}`}
              value={form.Duration}
              onChange={(e)=>set("Duration", e.target.value)}
              placeholder="e.g. 7 days"
            />
            {errors.Duration && <span className="form-error">{errors.Duration}</span>}
          </div>

          {/* MODIFICATION 6: Cost input field */}
          <div className="form-group">
            <label className="form-label">Unit Cost (LKR/USD) *</label>
            <input
              type="number"
              className={`input`}
              value={form.Cost}
              onChange={(e)=>set("Cost", e.target.value)}
              placeholder="e.g. 1500.00"
              min="0"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEditing ? "Update" : "Add Prescription"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;