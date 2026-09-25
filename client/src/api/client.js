import axios from 'axios';

// Determine the API baseURL dynamically:
// 1. If VITE_API_URL is explicitly set, use it.
// 2. In local development (localhost / 127.0.0.1), use relative '/api' (Vite proxy).
// 3. In production deployment (e.g. Vercel), default directly to the deployed Render backend API.
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const raw = import.meta.env.VITE_API_URL;
    return raw.startsWith('http')
      ? (raw.endsWith('/api') ? raw : `${raw.replace(/\/+$/, '')}/api`)
      : raw;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return '/api';
    }
  }

  // Deployed Render backend URL
  return 'https://workout-planner-afh0.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('workout_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginOrRegister =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');

      if (!isLoginOrRegister) {
        localStorage.removeItem('workout_token');
        localStorage.removeItem('workout_user');
        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register'
        ) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
