import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function detectText(text) {
  const res = await axios.post(`${API_BASE_URL}/detect/text`, { text });
  return res.data;
}