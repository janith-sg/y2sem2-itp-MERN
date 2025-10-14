const API = "http://localhost:3000/api/vaccinations";

const scrub = (obj = {}) => {
  const { VaccinationId, _id, id, createdAt, updatedAt, ...rest } = obj || {};
  return rest;
};

export const vaccinationService = {
  // GET /vaccinations -> { vaccinations: [...] }
  getAll: async () => {
    const res = await fetch(API);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to load vaccinations");
    
    // ✅ FIX: Prioritize returning the array inside the 'vaccinations' key
    return Array.isArray(data?.vaccinations)
      ? data.vaccinations
      : (Array.isArray(data) ? data : []);
  },

  // GET /vaccinations/:id -> { vaccination: {...} }
  getById: async (id) => {
    const res = await fetch(`${API}/${id}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to load vaccination");
    return data?.vaccination ?? data;
  },

  // POST /vaccinations -> { vaccination: {...} }
  create: async (payload) => {
    const safe = scrub(payload); // <-- no VaccinationId
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safe),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to add vaccination");
    return data?.vaccination ?? data;
  },

  // PUT /vaccinations/:id -> { vaccination: {...} }
  update: async (id, payload) => {
    const safe = scrub(payload); // prevent client changing VaccinationId/_id
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safe),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to update vaccination");
    return data?.vaccination ?? data;
  },

  // DELETE /vaccinations/:id
  remove: async (id) => {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Unable to delete vaccination");
    return true;
  },
};