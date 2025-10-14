// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (!raw) return null;
      const parsed = JSON.parse(raw);

      // Normalize stored user: lowercase/trim email, ensure employeeID exists
      if (parsed.email) parsed.email = parsed.email.toLowerCase().trim();
      if (!parsed.employeeID && (parsed.id || parsed.userId)) {
        parsed.employeeID = parsed.id || parsed.userId;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [user]);

  // Accept a full user object and normalize it so other components can rely on email/id
  const login = (userObj) => {
    if (!userObj) return;
    const normalized = { ...userObj };

    if (normalized.email) normalized.email = normalized.email.toLowerCase().trim();

    // Canonical id fields
    const idValue = normalized.id || normalized.employeeID || normalized.userId;
    if (idValue) {
      normalized.id = idValue;
      normalized.employeeID = normalized.employeeID || idValue;
      normalized.userId = normalized.userId || idValue;
    }

    // Ensure role exists (fallback to 'user')
    normalized.role = normalized.role || "user";

    setUser(normalized);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easier access
export const useAuth = () => useContext(AuthContext);
