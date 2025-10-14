"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { labResultService } from "../../services/labResultService";

import LabResultCard from "./LabResultCard";
import LabResultDetailsModal from "./LabResultDetailsModal";
import LabResultModal from "./LabResultModal";
import LabResultPreviewModal from "./LabResultPreviewModal"; // ⬅️ NEW

const pageStyles = `
.page { display:flex; flex-direction:column; gap:1rem; }
.toolbar { display:flex; gap:.75rem; align-items:center; justify-content:space-between; }
.search { display:flex; align-items:center; gap:.5rem; background:var(--card); border:1px solid var(--border); padding:.5rem .75rem; border-radius: var(--radius); }
.search input { border:none; outline:none; background:transparent; color:var(--foreground); min-width:220px; }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1rem; }
.empty { text-align:center; padding:2rem; color: var(--muted-foreground); border:1px dashed var(--border); border-radius: var(--radius-lg); }
`;
const getId = (x)=>x?._id?.$oid || x?._id || x?.id || x?.LabResultId;

// ✅ FIX: Added Cost to the haystack search array
const hay=(r)=>[
  String(r?.LabResultId ?? ""), String(r?.RecordId ?? ""), String(r?.PetId ?? ""),
  r?.Type ?? "", r?.FileUrl ?? "", r?.Notes ?? "", r?.Date ?? "",
  String(r?.Cost ?? ""), // ⬅️ NEW: Include Cost in search string
].join(" ").toLowerCase();


const LabResultList = () => {
  const [list,setList]=useState([]);
  const [loading,setLoading]=useState(true);
  const [q,setQ]=useState("");

  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [showDetails,setShowDetails]=useState(false);
  const [details,setDetails]=useState(null);

  // Prefill RecordId/PetId (from RecordList stash)
  const [prefill, setPrefill] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("prefillLab");
      if (raw) {
        const o = JSON.parse(raw);
        if (Date.now() - (o.ts || 0) < 10 * 60 * 1000) {
          setPrefill({ RecordId: o.RecordId, PetId: o.PetId });
        }
        localStorage.removeItem("prefillLab");
      }
    } catch (e) {
      console.warn("Could not read prefillLab:", e);
    }
  }, []);

  // ⬅️ NEW: preview modal state
  const [previewUrl, setPreviewUrl] = useState(null);

  const load=async()=>{
    try{
      setLoading(true);
      const resp = await labResultService.getAll();
      
      // ✅ FIX: Robust parsing for { labResults: [...] }
      const list = resp?.labResults || resp || []; 
      
      setList(Array.isArray(list) ? list : []); 
      
    }catch(e){
      console.error(e);
      alert("Failed to load lab results. Check /labresults endpoint.");
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const filtered = useMemo(()=>{
    const s=q.trim().toLowerCase();
    if(!s) return list;
    return list.filter(r=>hay(r).includes(s));
  },[q,list]);

  const openAdd=()=>{ setEditing(null); setShowForm(true); };
  const openEdit=(r)=>{ setEditing(r); setShowForm(true); };
  const openDetails=(r)=>{ setDetails(r); setShowDetails(true); };
  const closeModals=()=>{ setShowForm(false); setEditing(null); setShowDetails(false); setDetails(null); };

  const handleSave=async(payload)=>{
    try{
      if(editing){
        const updated = await labResultService.update(getId(editing), payload);
        const doc = updated?.labResult || updated;
        setList(prev=>prev.map(x=>getId(x)===getId(editing)?(doc || payload):x));
      }else{
        const created = await labResultService.create(payload);
        const doc = created?.labResult || created;
        setList(prev=>[doc || payload, ...prev]);
      }
      closeModals();
    }catch(e){
      console.error(e);
      alert("Save failed.");
    }
  };

  const handleDelete=async(r)=>{
    const name = r?.Type ? `"${r.Type}"` : `#${r?.LabResultId}`;
    if(!window.confirm(`Delete lab result ${name}?`)) return;
    try{
      await labResultService.remove(getId(r));
      setList(prev=>prev.filter(x=>getId(x)!==getId(r)));
    }catch(e){
      console.error(e);
      alert("Delete failed.");
    }
  };

  return (
    <>
      <style>{pageStyles}</style>
      <div className="page">
        <div className="toolbar">
          <div className="search">
            <Search size={16}/>
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search type, notes, IDs, cost…" aria-label="Search lab results"/>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16}/> Add Lab Result</button>
        </div>

        {loading ? <div className="empty">Loading lab results…</div> :
         filtered.length===0 ? <div className="empty">No lab results{q?` for “${q}”`:""}.</div> :
         <div className="grid">
           {filtered.map(lr=>(
             <LabResultCard
               key={getId(lr) || lr.LabResultId}
               lr={lr}
               onView={()=>openDetails(lr)}
               onEdit={()=>openEdit(lr)}
               onDelete={()=>handleDelete(lr)}
               onPreview={() => setPreviewUrl(lr?.FileUrl)} // ⬅️ NEW
             />
           ))}
         </div>}
      </div>

      {showForm && (
        <LabResultModal
          item={editing}
          isEditing={Boolean(editing)}
          onSave={handleSave}
          onClose={closeModals}
          defaults={prefill}
        />
      )}

      {showDetails && (
        <LabResultDetailsModal
          lr={details}
          onEdit={()=>{ setEditing(details); setShowDetails(false); setShowForm(true); }}
          onClose={closeModals}
        />
      )}

      {previewUrl && ( // ⬅️ NEW
        <LabResultPreviewModal url={previewUrl} onClose={()=>setPreviewUrl(null)} />
      )}
    </>
  );
};

export default LabResultList;