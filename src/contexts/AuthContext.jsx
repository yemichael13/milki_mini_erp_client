/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../lib/api';

const AuthContext = createContext(null);
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used within AuthProvider'); return value; };
export const normalizeRole = (role) => {
  if (!role) return role;
  if (role === 'admin') return 'system_admin'; if (role === 'manager') return 'general_manager';
  return role.endsWith('_officer') ? role.split('_')[0] : role;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => { try { const saved = localStorage.getItem('user'); return saved ? JSON.parse(saved) : null; } catch { return null; } });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.post('/auth/refresh').then(({ data }) => { setAccessToken(data.token); const next = { ...data.user, role: normalizeRole(data.user.role) }; setUser(next); localStorage.setItem('user', JSON.stringify(next)); }).catch(() => { setAccessToken(null); localStorage.removeItem('user'); setUser(null); }).finally(() => setLoading(false));
  }, []);
  const login = async (email, password) => { const { data } = await api.post('/auth/login', { email, password }); setAccessToken(data.token); const next = { ...data.user, role: normalizeRole(data.user.role) }; setUser(next); localStorage.setItem('user', JSON.stringify(next)); return next; };
  const logout = async () => { try { await api.post('/auth/logout'); } finally { setAccessToken(null); localStorage.removeItem('user'); setUser(null); } };
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};
