// src/Services/labResultService.js
const API    = "http://localhost:3000/api/labresults";
const UP_API = "http://localhost:3000/api/uploads";

const scrub = (obj = {}) => {
  const { LabResultId, _id, id, createdAt, updatedAt, ...rest } = obj || {};
  return rest;
};

export const labResultService = {
  // ---------- CRUD ----------
  // GET /labresults -> { labResults: [...] }
  getAll: async () => {
    const res = await fetch(API);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to load lab results");
    
    // ✅ FIX: Prioritize returning the array inside the 'labResults' key
    return Array.isArray(data?.labResults)
      ? data.labResults
      : (Array.isArray(data) ? data : []);
  },

  // GET /labresults/:id -> { labResult: {...} }
  getById: async (id) => {
    const res = await fetch(`${API}/${id}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to load lab result");
    return data?.labResult ?? data;
  },

  // POST /labresults -> { labResult: {...} }
  create: async (payload) => {
    const safe = scrub(payload); // no LabResultId/_id from client
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safe),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to add lab result");
    return data?.labResult ?? data;
  },

  // PUT /labresults/:id -> { labResult: {...} }
  update: async (id, payload) => {
    const safe = scrub(payload); // prevent changing IDs/timestamps
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safe),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to update lab result");
    return data?.labResult ?? data;
  },

  // DELETE /labresults/:id
  remove: async (id) => {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to delete lab result");
    return true;
  },

  // ---------- Upload helper ----------
  // POST /uploads/labresult -> { url: "/uploads/<filename>" }
  async uploadFile(file) {
    const fd = new FormData();
    fd.append("file", file);

    const res  = await fetch(`${UP_API}/labresult`, { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Upload failed");

    // Ensure absolute URL for the app
    const abs = data.url?.startsWith("http")
      ? data.url
      : `http://localhost:3000${data.url}`;
    return { url: abs };
  },
};