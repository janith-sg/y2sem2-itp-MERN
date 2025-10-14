// src/Components/Prescriptions/PrescriptionList.jsx (FINAL FIXED CODE)
"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { prescriptionService } from "../../services/prescriptionService";
import PrescriptionCard from "./PrescriptionCard";
import PrescriptionModal from "./PrescriptionModal";
import PrescriptionDetailsModal from "./PrescriptionDetailsModal";

const pageStyles = `
.records-page{display:flex;flex-direction:column;gap:1rem}
.toolbar{display:flex;gap:.75rem;align-items:center;justify-content:space-between}
.search{display:flex;align-items:center;gap:.5rem;background:var(--card);border:1px solid var(--border);padding:.5rem .75rem;border-radius:var(--radius)}
.search input{border:none;outline:none;background:transparent;color:var(--foreground);min-width:220px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
.empty{text-align:center;padding:2rem;color:var(--muted-foreground);border:1px dashed var(--border);border-radius:var(--radius-lg)}
`;

const getId = (p) => p?._id?.$oid || p?._id || p?.PrescriptionId || p?.id;

// ✅ MODIFICATION: Updated haystack to use Cost and removed Notes
const haystack = (p) =>
  [
    String(p?.PrescriptionId ?? ""),
    String(p?.RecordId ?? ""),
    String(p?.PetId ?? ""),
    p?.Name ?? "",
    p?.Dose ?? "",
    p?.Duration ?? "",
    String(p?.Cost ?? ""), // ⬅️ NEW: Include Cost in search
  ]
    .join(" ")
    .toLowerCase();

const PrescriptionList = () => {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState(null);

  // NEW: prefill from localStorage (set by RecordList after create)
  const [prefill, setPrefill] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("prefillRx");
      if (raw) {
        const o = JSON.parse(raw);
        // only accept if set in the last 10 minutes
        if (Date.now() - (o.ts || 0) < 10 * 60 * 1000) {
          setPrefill({ RecordId: o.RecordId, PetId: o.PetId });
        }
        localStorage.removeItem("prefillRx");
      }
    } catch (e) {
      // ignore storage errors
      console.warn("Could not read prefillRx:", e);
    }
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await prescriptionService.getAll();
      
      // ✅ Data parsing logic is correct
      const list = resp?.prescriptions || resp || []; 
      
      setItems(Array.isArray(list) ? list : []); 

    } catch (e) {
      console.error(e);
      alert("Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((p) => haystack(p).includes(s)) : items;
  }, [q, items]);

  const openAdd = () => { setEditing(null); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setShowModal(true); };
  const openDetails = (p) => { setDetails(p); setShowDetails(true); };
  const closeAll = () => { setShowModal(false); setEditing(null); setShowDetails(false); setDetails(null); };

  const onSave = async (payload) => {
    try {
      if (editing) {
        const updated = await prescriptionService.update(getId(editing), payload);
        const doc = updated?.prescription || updated;
        setItems((prev) => prev.map((x) => (getId(x) === getId(editing) ? (doc || payload) : x)));
      } else {
        const created = await prescriptionService.create(payload);
        const doc = created?.prescription || created;
        setItems((prev) => [doc || payload, ...prev]);
      }
      closeAll();
    } catch (e) {
      console.error(e);
      alert(e.message || "Save failed");
    }
  };

  const onDelete = async (p) => {
    const name = p?.Name ?? "this prescription";
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await prescriptionService.remove(getId(p));
      setItems((prev) => prev.filter((x) => getId(x) !== getId(p)));
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
    }
  };

  return (
    <>
      <style>{pageStyles}</style>

      <div className="records-page">
        <div className="toolbar">
          <div className="search">
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, dose, duration, IDs, cost…" // ⬅️ Updated placeholder
            />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Prescription
          </button>
        </div>

        {loading ? (
          <div className="empty">Loading prescriptions…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No prescriptions found{q ? ` for “${q}”` : ""}.</div>
        ) : (
          <div className="grid">
            {filtered.map((p) => (
              <PrescriptionCard
                key={getId(p)}
                prescription={p}
                onView={() => openDetails(p)}
                onEdit={() => openEdit(p)}
                onDelete={() => onDelete(p)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <PrescriptionModal
          item={editing}
          isEditing={Boolean(editing)}
          onSave={onSave}
          onClose={closeAll}
          // NEW: pass prefill down so RecordId/PetId are locked if present
          defaults={prefill}
        />
      )}

      {showDetails && (
        <PrescriptionDetailsModal
          prescription={details}
          onEdit={() => { setEditing(details); setShowDetails(false); setShowModal(true); }}
          onClose={closeAll}
        />
      )}
    </>
  );
};

export default PrescriptionList;