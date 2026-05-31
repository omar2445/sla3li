import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

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
