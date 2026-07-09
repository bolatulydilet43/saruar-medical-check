import { createContext, useContext, useState } from 'react';
import { api, setAuthRole } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login(role, phone, password) {
    const { user } = await api.login(role, phone, password);
    setAuthRole(user.role);
    setUser(user);
    return user;
  }

  function logout() {
    setAuthRole(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
