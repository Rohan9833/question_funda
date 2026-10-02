import client from "./client";

const getRefreshToken = () => localStorage.getItem("qf_refresh_token");

export const loginApi = async (identifier, password, device = "web") => {
  const response = await client.post("/auth/login", {
    identifier,
    password,
    device,
  });
  return response.data;
};

export const registerApi = async (payload) => {
  const response = await client.post("/auth/register", payload);
  return response.data;
};

export const refreshApi = async (refreshToken = getRefreshToken()) => {
  const response = await client.post("/auth/refresh", {
    refreshToken,
  });
  return response.data;
};

export const meApi = async () => {
  const response = await client.get("/auth/me");
  return response.data;
};

export const logoutApi = async (refreshToken = getRefreshToken()) => {
  const response = await client.post("/auth/logout", {
    refreshToken,
  });
  return response.data;
};

export const logoutAllApi = async () => {
  const response = await client.post("/auth/logout-all", {});
  return response.data;
};

export const updateProfileApi = async (payload) => {
  const response = await client.put("/auth/profile", payload);
  return response.data;
};

// Backward-compatible object API for existing imports.
export const authApi = {
  login: (data) =>
    loginApi(data.identifier || data.email, data.password, data.device),
  me: meApi,
  register: registerApi,
  refresh: refreshApi,
  logout: logoutApi,
  logoutAll: logoutAllApi,
  updateProfile: updateProfileApi,
};
