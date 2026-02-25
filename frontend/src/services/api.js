import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000",
  timeout: 30000,
});

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export async function detectText(text) {
  const res = await api.post("/detect/text", { text });
  return res.data;
}

export async function health() {
  const res = await api.get("/health");
  return res.data;
}

export async function detectImage(file) {
  const form = new FormData();
  form.append("image", file);

  const res = await axios.post(`${API_BASE}/detect/image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export default api;
