const API = "http://localhost:3000/api/prescriptions";

const scrub = (obj = {}) => {
  const { PrescriptionId, _id, id, createdAt, updatedAt, ...rest } = obj || {};
  return rest;
};

export const prescriptionService = {
  // GET /prescriptions -> { prescriptions: [...] }
  getAll: async () => {
    const res = await fetch(API);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to load prescriptions");
    
    // ✅ FIX: Prioritize returning the array inside the 'prescriptions' key
    return Array.isArray(data?.prescriptions)
      ? data.prescriptions
      : (Array.isArray(data) ? data : []);
  },

  // GET /prescriptions/:id -> { prescription: {...} }
  getById: async (id) => {
    const res = await fetch(`${API}/${id}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to load prescription");
    return data?.prescription ?? data;
  },

  // POST /prescriptions -> { prescription: {...} }
  create: async (payload) => {
    const safe = scrub(payload); // <-- no PrescriptionId
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safe),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to add prescription");
    return data?.prescription ?? data;
  },

  // PUT /prescriptions/:id -> { prescription: {...} }
  update: async (id, payload) => {
    const safe = scrub(payload); // prevent client changing PrescriptionId/_id
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safe),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to update prescription");
    return data?.prescription ?? data;
  },

  // DELETE /prescriptions/:id
  remove: async (id) => {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to delete prescription");
    return true;
  },

  // Back-compat alias
  getAllPrescriptions() {
    return this.getAll();
  },
};