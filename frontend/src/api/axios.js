import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Convert a stored /uploads/... path to a full URL in production
export const imgUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_BASE.replace(/\/api$/, '') + path;
};

api.interceptors.response.use(
  res => res,
  err => {
    // Only redirect to login if there was an existing token (expired session),
    // not during a fresh login attempt where 401 means wrong credentials.
    if (err.response?.status === 401 && localStorage.getItem('sla3li_token')) {
      localStorage.removeItem('sla3li_token');
      localStorage.removeItem('sla3li_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
