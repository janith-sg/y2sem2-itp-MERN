const API = "http://localhost:3000/api/upload";

export const uploadService = {
  async uploadFile(file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(API, { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Upload failed");
    // returns { url, ... }
    return data;
  },
};
