import { createContext, useContext, useState } from "react";

const C = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("qf_user") || "null")
  );

  const login = (role) => {
    const u = {
      id: role + "-1",
      name: role === "teacher" ? "Rahul Professor" : "Aarav Kumar",
      role,
    };

    setUser(u);
    localStorage.setItem("qf_user", JSON.stringify(u));
  };

  const updateProfile = (updates) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const updatedUser = {
        ...currentUser,
        ...updates,
      };

      localStorage.setItem("qf_user", JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("qf_user");
  };

  return (
    <C.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </C.Provider>
  );
}

export const useAuth = () => useContext(C);
