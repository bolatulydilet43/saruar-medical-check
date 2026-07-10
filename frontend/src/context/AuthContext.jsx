import { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken, setUnauthorizedHandler } from '../api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'saruar-session';

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    setAuthToken(session.token);
    return session.user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);

  async function login(role, phone, password) {
    const { user, token } = await api.login(role, phone, password);
    setAuthToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    setUser(user);
    return user;
  }

  function logout() {
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  // Sessions expire after 12h — if the backend rejects a token, drop back to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
