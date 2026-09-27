import axios from "axios";

const baseUrl = (import.meta.env.VITE_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const client = axios.create({
  baseURL: `${baseUrl}/api`,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("qf_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default client;
