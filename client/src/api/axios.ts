import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("sb-rbgpndbfywmdrnfttzdp-auth-token");
    if (raw) {
      const session = JSON.parse(raw);
      const accessToken = session?.access_token;

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
  } catch (err) {
    console.warn("Supabase token parse edilemedi", err);
  }

  return config;
});

export default api;
