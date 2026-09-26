import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let accessToken = null;
let refreshPromise = null;
export const setAccessToken = (token) => { accessToken = token; };

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const isAuthRequest = original.url?.includes('/auth/login') || original.url?.includes('/auth/refresh') || original.url?.includes('/auth/logout');
    if (error.response?.status !== 401 || original._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      refreshPromise ||= axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true }).finally(() => { refreshPromise = null; });
      const refreshResponse = await refreshPromise;
      setAccessToken(refreshResponse.data.token);
      const nextUser = refreshResponse.data.user;
      if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser));
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
      return api(original);
    } catch (refreshError) {
      setAccessToken(null);
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

export default api;
