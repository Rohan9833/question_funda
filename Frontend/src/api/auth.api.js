const BASE_URL = import.meta.env.VITE_BASE_URL;
const AUTH_BASE = `${BASE_URL}/api/auth`;

const getAccessToken = () => localStorage.getItem("qf_access_token");
const getRefreshToken = () => localStorage.getItem("qf_refresh_token");

const request = async (path, options = {}, authenticated = false) => {
  const token = getAccessToken();

  const response = await fetch(`${AUTH_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authenticated && token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const loginApi = (email, password, device = "web") =>
  request("/login", {
    method: "POST",
    body: JSON.stringify({ email, password, device }),
  });

export const registerApi = (payload) =>
  request("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const refreshApi = (refreshToken = getRefreshToken()) =>
  request("/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

export const meApi = () => request("/me", {}, true);

export const logoutApi = (refreshToken = getRefreshToken()) =>
  request(
    "/logout",
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    },
    true
  );

export const logoutAllApi = () =>
  request(
    "/logout-all",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
    true
  );

export const updateProfileApi = (payload) =>
  request(
    "/profile",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true
  );

// Backward-compatible object API for existing imports.
export const authApi = {
  login: (data) => loginApi(data.email, data.password, data.device),
  me: meApi,
  register: registerApi,
  refresh: refreshApi,
  logout: logoutApi,
  logoutAll: logoutAllApi,
  updateProfile: updateProfileApi,
};
