import axios from "axios";
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});
client.interceptors.request.use((c) => {
  const u = JSON.parse(localStorage.getItem("qf_user") || "null");
  if (u?.id) c.headers["X-User-Id"] = u.id;
  return c;
});
export default client;
