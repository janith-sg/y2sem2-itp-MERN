// src/Components/Vaccinations/VaccinationList.jsx (FINAL FIXED CODE)
"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { vaccinationService } from "../../services/vaccinationService";
import VaccinationCard from "./VaccinationCard";
import VaccinationModal from "./VaccinationModal";
import VaccinationDetailsModal from "./VaccinationDetailsModal";

const pageStyles = `
.records-page { display:flex; flex-direction:column; gap:1rem; }
.toolbar { display:flex; gap:.75rem; align-items:center; justify-content:space-between; }
.search { display:flex; align-items:center; gap:.5rem; background:var(--card); border:1px solid var(--border); padding:.5rem .75rem; border-radius: var(--radius); }
.search input { border:none; outline:none; background:transparent; color:var(--foreground); min-width:220px; }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1rem; }
.empty { text-align:center; padding:2rem; color: var(--muted-foreground); border:1px dashed var(--border); border-radius: var(--radius-lg); }
`;

const getId = (v) => v?._id?.$oid || v?._id || v?.id || v?.VaccinationId;

// ✅ FIX: Added Cost to the haystack search array
const makeHaystack = (v) =>
  [
    String(v?.VaccinationId ?? ""),
    String(v?.RecordId ?? ""),
    String(v?.PetId ?? ""),
    v?.VaccineName ?? "",
    v?.DateGiven ?? "",
    v?.NextDueDate ?? "",
    v?.Notes ?? "",
    String(v?.Cost ?? ""), // ⬅️ NEW: Include Cost in search string
  ]
    .join(" ")
    .toLowerCase();

const VaccinationList = () => {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editing, setEditing] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState(null);

  // NEW: read prefill (from RecordList stash) on mount
  const [prefill, setPrefill] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("prefillVac");
      if (raw) {
        const o = JSON.parse(raw);
        if (Date.now() - (o.ts || 0) < 10 * 60 * 1000) {
          setPrefill({ RecordId: o.RecordId, PetId: o.PetId });
        }
        localStorage.removeItem("prefillVac");
      }
    } catch (e) {
      console.warn("Could not read prefillVac:", e);
    }
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await vaccinationService.getAll();
      
      // ✅ Data parsing logic is correct
      const list = resp?.vaccinations || resp || []; 
      
      setItems(Array.isArray(list) ? list : []); 

    } catch (e) {
      console.error(e);
      alert("Failed to load vaccinations. Check /vaccinations endpoint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((v) => makeHaystack(v).includes(s)) : items;
  }, [q, items]);

  const openAdd = () => { setEditing(null); setShowAddEdit(true); };
  const openEdit = (v) => { setEditing(v); setShowAddEdit(true); };
  const openDetails = (v) => { setDetails(v); setShowDetails(true); };
  const closeModals = () => { setShowAddEdit(false); setEditing(null); setShowDetails(false); setDetails(null); };

  const handleSave = async (payload) => {
    try {
      if (editing) {
        const updated = await vaccinationService.update(getId(editing), payload);
        const doc = updated?.vaccination || updated;
        setItems((prev) => prev.map((x) => (getId(x) === getId(editing) ? (doc || payload) : x)));
      } else {
        const created = await vaccinationService.create(payload);
        const doc = created?.vaccination || created;
        setItems((prev) => [doc || payload, ...prev]);
      }
      closeModals();
    } catch (e) {
      console.error(e);
      alert(e.message || "Save failed");
    }
  };

  const handleDelete = async (v) => {
    const name = v?.VaccineName ? `"${v.VaccineName}"` : `#${v?.VaccinationId}`;
    if (!window.confirm(`Delete vaccination ${name}? This cannot be undone.`)) return;
    try {
      await vaccinationService.remove(getId(v));
      setItems((prev) => prev.filter((x) => getId(x) !== getId(v)));
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
              placeholder="Search vaccine, dates, IDs, cost…" // ⬅️ Updated placeholder for clarity
              aria-label="Search vaccinations"
            />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Vaccination
          </button>
        </div>

        {loading ? (
          <div className="empty">Loading vaccinations…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            No vaccinations found{q ? ` for “${q}”` : ""}. Click “Add Vaccination” to create one.
          </div>
        ) : (
          <div className="grid">
            {filtered.map((v) => (
              <VaccinationCard
                key={getId(v) || v.VaccinationId}
                vaccination={v}
                onView={() => openDetails(v)}
                onEdit={() => openEdit(v)}
                onDelete={() => handleDelete(v)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddEdit && (
        <VaccinationModal
          vaccination={editing}
          isEditing={Boolean(editing)}
          onSave={handleSave}
          onClose={closeModals}
          // NEW: pass RecordId/PetId prefill so inputs are readOnly when present
          defaults={prefill}
        />
      )}

      {showDetails && (
        <VaccinationDetailsModal
          vaccination={details}
          onEdit={() => {
            setEditing(details);
            setShowDetails(false);
            setShowAddEdit(true);
          }}
          onClose={closeModals}
        />
      )}
    </>
  );
};

export default VaccinationList;