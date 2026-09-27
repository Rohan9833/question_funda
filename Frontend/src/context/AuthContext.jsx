import { createContext, useContext, useEffect, useState } from "react";
import { loginApi, logoutApi, meApi, refreshApi, updateProfileApi } from "../api/auth.api";

const C = createContext();
const ACCESS_TOKEN_KEY = "qf_access_token";
const REFRESH_TOKEN_KEY = "qf_refresh_token";
const USER_KEY = "qf_user";

const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || "null"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!accessToken && !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        let response;
        try {
          response = accessToken ? await meApi() : await refreshApi(refreshToken);
          if (!accessToken) {
            localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
            response = await meApi();
          }
        } catch {
          response = await refreshApi(refreshToken);
          localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
          response = await meApi();
        }
        setUser(response.data);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await loginApi(email, password);
    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response.data.user;
  };

  const updateProfile = async (updates) => {
    const response = await updateProfileApi(updates);
    setUser(response.data);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  };

  const logout = async () => {
    try {
      if (localStorage.getItem(ACCESS_TOKEN_KEY)) await logoutApi();
    } catch {
      // The local session is cleared even if the server session has expired.
    } finally {
      clearSession();
      setUser(null);
    }
  };

  return (
    <C.Provider value={{ user, login, logout, updateProfile, isAuthenticated: !!user, loading }}>
      {children}
    </C.Provider>
  );
}

export const useAuth = () => useContext(C);
