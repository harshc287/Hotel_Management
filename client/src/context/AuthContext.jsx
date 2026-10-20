import { createContext, useEffect, useState } from 'react';
import { authService } from '../services/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rms_token');
    if (!token) return setLoading(false);
    authService.me().then(setUser).catch(() => localStorage.removeItem('rms_token')).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { user: u, accessToken } = await authService.login(email, password);
    localStorage.setItem('rms_token', accessToken);
    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const { user: u, accessToken } = await authService.register(payload);
    localStorage.setItem('rms_token', accessToken);
    setUser(u);
    return u;
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem('rms_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}