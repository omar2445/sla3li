import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('sla3li_token');
    // Set the header immediately — before any component renders or useEffect runs.
    // Without this, dashboard API calls fire before the header is set → 401 → redirect loop.
    if (saved) api.defaults.headers.common['Authorization'] = `Bearer ${saved}`;
    return saved || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('sla3li_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    localStorage.setItem('sla3li_token', data.token);
    localStorage.setItem('sla3li_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const isFormData = formData instanceof FormData;
    const { data } = await api.post('/auth/register', formData, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    localStorage.setItem('sla3li_token', data.token);
    localStorage.setItem('sla3li_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    localStorage.removeItem('sla3li_token');
    localStorage.removeItem('sla3li_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
