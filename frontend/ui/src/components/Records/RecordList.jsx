"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { recordService } from "../../services/recordService";

import RecordCard from "./RecordCard";
import RecordDetailsModal from "./RecordDetailsModal";
import RecordModal from "./RecordModal";

// service adapters
const svc = {
  getAll: () => (recordService.getAllRecords?.() || recordService.getAll?.()),
  create: (p) => (recordService.createRecord?.(p) || recordService.create?.(p)),
  update: (id, p) =>
    (recordService.updateRecord?.(id, p) || recordService.update?.(id, p)),
  remove: (id) =>
    (recordService.deleteRecord?.(id) || recordService.remove?.(id)),
};

const pageStyles = `
.records-page { display:flex; flex-direction:column; gap:1rem; }
.toolbar { display:flex; gap:.75rem; align-items:center; justify-content:space-between; }
.search { display:flex; align-items:center; gap:.5rem; background:var(--card); border:1px solid var(--border); padding:.5rem .75rem; border-radius: var(--radius); }
.search input { border:none; outline:none; background:transparent; color: var(--foreground); min-width:220px; }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1rem; }
.empty { text-align:center; padding:2rem; color: var(--muted-foreground); border:1px dashed var(--border); border-radius: var(--radius-lg); }
`;

const getId = (rec) => rec?._id?.$oid || rec?._id || rec?.id || rec?.RecordId;

const RecordList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // Modals
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingRec, setEditingRec] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsRec, setDetailsRec] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await svc.getAll(); 
      
      // ✅ FIX: Robust parsing for { records: [...] }
      const list = resp?.records || resp || []; 
      
      setRecords(Array.isArray(list) ? list : []); 
      
    } catch (e) {
      console.error("Error loading records:", e);
      alert("Failed to load records. Check the /records endpoint + console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Search (no more rx/vax fields)
  const makeHaystack = (r) => {
    return [
      String(r?.RecordId ?? ""),
      String(r?.PetId ?? ""),
      String(r?.VetId ?? ""),
      r?.Diagnosis ?? "",
      r?.Treatment ?? "",
      r?.Notes ?? "",
    ].join(" ").toLowerCase();
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return records;
    return records.filter((r) => makeHaystack(r).includes(s));
  }, [q, records]);

  const openAdd = () => { setEditingRec(null); setShowAddEdit(true); };
  const openEdit = (rec) => { setEditingRec(rec); setShowAddEdit(true); };
  const openDetails = (rec) => { setDetailsRec(rec); setShowDetails(true); };

  const closeAll = () => {
    setShowAddEdit(false);
    setEditingRec(null);
    setShowDetails(false);
    setDetailsRec(null);
  };

  const handleSave = async (payload) => {
    try {
      if (editingRec) {
        const id = getId(editingRec);
        const updated = await svc.update(id, payload);
        setRecords((prev) =>
          prev.map((r) => (getId(r) === id ? (updated?.records || updated || payload) : r))
        );
      } else {
        const created = await svc.create(payload);
        const doc = created?.records || created;

        // Stash linkage defaults for other create screens (10-min window recommended in consumer)
        try {
          if (doc?.RecordId && doc?.PetId) {
            const stash = JSON.stringify({ RecordId: doc.RecordId, PetId: doc.PetId, ts: Date.now() });
            localStorage.setItem("prefillRx", stash);   // prescriptions
            localStorage.setItem("prefillVac", stash);  // vaccinations
            localStorage.setItem("prefillLab", stash);  // lab results
          }
        } catch (e) {
          // localStorage may be blocked (SSR, private mode); ignore
          console.warn("Could not write prefill stash:", e);
        }

        setRecords((prev) => [doc || payload, ...prev]);

        // If you want an immediate jump to prescriptions after creating a record, uncomment:
        // window.location.href = "/prescriptions";
      }
      closeAll();
    } catch (e) {
      console.error("Save failed:", e);
      alert("Save failed. Check console and backend response.");
    }
  };

  const handleDelete = async (rec) => {
    const name = rec?.Diagnosis ? `"${rec.Diagnosis}"` : `#${rec?.RecordId}`;
    const warn =
  `🩺 Remove medical record ${name}?\n\n` +
  `⚠️ This action is permanent and cannot be undone.`;

    if (!window.confirm(warn)) return;

    try {
      await svc.remove(getId(rec));
      setRecords((prev) => prev.filter((r) => getId(r) !== getId(rec)));
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Delete failed. Check console for details.");
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
              placeholder="Search diagnosis, treatment, notes, IDs…"
              aria-label="Search records"
            />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> New Record
          </button>
        </div>

        {loading ? (
          <div className="empty">Loading records…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            No records{q ? ` for “${q}”` : ""}. Click “New Record” to create one.
          </div>
        ) : (
          <div className="grid">
            {filtered.map((rec) => (
              <RecordCard
                key={getId(rec) || rec.RecordId}
                record={rec}
                onView={() => openDetails(rec)}
                onEdit={() => openEdit(rec)}
                onDelete={() => handleDelete(rec)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddEdit && (
        <RecordModal
          record={editingRec}
          isEditing={Boolean(editingRec)}
          onSave={handleSave}
          onClose={closeAll}
          // If you ever have context (e.g., chosen Vet/Pet upstream), pass:
          // defaults={{ PetId: 123, VetId: 456 }}
        />
      )}

      {showDetails && (
        <RecordDetailsModal
          record={detailsRec}
          onEdit={() => {
            setEditingRec(detailsRec);
            setShowDetails(false);
            setShowAddEdit(true);
          }}
          onClose={closeAll}
        />
      )}
    </>
  );
};

export default RecordList;