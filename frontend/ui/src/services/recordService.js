const API = "http://localhost:3000/api/records";

// strip server-owned fields
const scrub = (obj = {}) => {
  const { RecordId, _id, id, createdAt, updatedAt, ...rest } = obj || {};
  return rest;
};

export const recordService = {
  // GET /records -> { records: [...] }
  getAll: async () => {
    const res = await fetch(API);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to load records");
    
    // ✅ FIX: Prioritize returning the array inside the 'records' key
    return Array.isArray(data?.records) ? data.records : (Array.isArray(data) ? data : []);
  },

  // GET /records/:id -> { records: {...} } (controller returns plural key)
  getById: async (id) => {
    const res = await fetch(`${API}/${id}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to load record");
    return data?.records ?? data;
  },

  // POST /records -> { records: {...} }
  create: async (payload) => {
    const safe = scrub(payload); // <-- no RecordId
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safe),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to add record");
    return data?.records ?? data;
  },

  // PUT /records/:id -> { records: {...} }
  update: async (id, payload) => {
    const safe = scrub(payload); // don't let client change RecordId/_id
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safe),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to update record");
    return data?.records ?? data;
  },

  // DELETE /records/:id
  remove: async (id) => {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to delete record");
    return true;
  },
};