"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { labResultService } from "../../services/labResultService";

const normalizeDate = (val) => {
  if (!val) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return new Date(val);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const [dd, mm, yyyy] = val.split("/");
    return new Date(`${yyyy}-${mm}-${dd}`);
  }
  const dt = new Date(val);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
};

const LabResultModal = ({ item, isEditing, onSave, onClose, defaults }) => {
  // 🛑 MODIFICATION 1: Added Cost to the form state
  const [form, setForm] = useState({
    RecordId: "",
    PetId: "",
    Type: "",
    Notes: "",
    Date: "",
    Cost: "", // 💰 NEW FIELD
  });
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);          // <-- NEW
  const [uploadBusy, setUploadBusy] = useState(false);

  useEffect(() => {
    if (item && isEditing) {
      setForm({
        RecordId: item.RecordId ?? "",
        PetId: item.PetId ?? "",
        Type: item.Type ?? "",
        Notes: item.Notes ?? "",
        Date: item.Date ? new Date(item.Date).toISOString().slice(0, 10) : "",
        // 🛑 MODIFICATION 2: Read Cost field when editing
        Cost: item.Cost ?? "",
      });
      setFile(null); // do not auto-load existing file
    } else {
      setForm({
        RecordId: defaults?.RecordId ?? "",
        PetId: defaults?.PetId ?? "",
        Type: "",
        Notes: "",
        Date: "",
        // 🛑 MODIFICATION 3: Initialize Cost
        Cost: "",
      });
      setFile(null);
    }
  }, [item, isEditing, defaults]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!String(form.RecordId).trim()) e.RecordId = "Record ID is required";
    if (!String(form.PetId).trim()) e.PetId = "Pet ID is required";
    if (!form.Type.trim()) e.Type = "Type is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      setUploadBusy(true);

      let fileUrl; // optional
      if (file) {
        const { url } = await labResultService.uploadFile(file);
        fileUrl = url; // absolute URL
      }

      const payload = {
        RecordId: Number(form.RecordId),
        // 🛑 MODIFICATION 4: PetId is sent as String (e.g., "P-017")
        PetId: form.PetId.trim(), 
        
        Type: form.Type.trim(),
        Notes: form.Notes?.trim() || undefined,
        Date: normalizeDate(form.Date),
        // 🛑 MODIFICATION 5: Add Cost to payload
        Cost: Number(form.Cost) || 0,
        // Only include FileUrl if a file was uploaded this time.
        ...(fileUrl ? { FileUrl: fileUrl } : {}),
      };

      await onSave(payload);
    } catch (err) {
      alert(err.message || "Save failed");
    } finally {
      setUploadBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? "Edit Lab Result" : "Add Lab Result"}</h2>
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

          <div className="two-col">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <input
                className={`input ${errors.Type ? "error" : ""}`}
                value={form.Type}
                onChange={(e) => setField("Type", e.target.value)}
                placeholder="lab | xray | image"
              />
              {errors.Type && <span className="form-error">{errors.Type}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Date (optional)</label>
              <input
                type="date"
                className="input"
                value={form.Date}
                onChange={(e) => setField("Date", e.target.value)}
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
              placeholder="e.g. 1500.00"
              min="0"
            />
          </div>

          {/* FILE PICKER ONLY (no manual URL) */}
          <div className="form-group">
            <label className="form-label">Attach file (PDF/Image/Video)</label>
            <input
              type="file"
              className="input"
              accept=".pdf,image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <small className="hint">Max 25MB. If you leave this empty on edit, the existing file stays.</small>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={form.Notes}
              onChange={(e) => setField("Notes", e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={uploadBusy}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploadBusy}>
              {uploadBusy ? "Uploading…" : isEditing ? "Update Lab Result" : "Add Lab Result"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabResultModal;