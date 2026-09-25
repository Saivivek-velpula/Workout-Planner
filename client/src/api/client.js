import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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

// Response interceptor to handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking auth or on login page
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      const isLoginOrRegister = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthCheck && !isLoginOrRegister) {
        localStorage.removeItem('workout_token');
        localStorage.removeItem('workout_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
