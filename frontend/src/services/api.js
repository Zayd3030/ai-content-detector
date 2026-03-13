import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export async function detectText(text) {
  const res = await axios.post(`${API_BASE}/detect/text`, { text });
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

export async function detectVideo(file) {
  const form = new FormData();
  form.append("video", file);

  const res = await axios.post(`${API_BASE}/detect/video`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function health() {
  const res = await axios.get(`${API_BASE}/health`);
  return res.data;
}