import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('workout_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from token on load
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('workout_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data?.success && res.data?.data?.user) {
            setUser(res.data.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to verify existing session:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data?.success && res.data?.data) {
      const { user: userData, token: jwtToken } = res.data.data;
      localStorage.setItem('workout_token', jwtToken);
      localStorage.setItem('workout_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    if (res.data?.success && res.data?.data) {
      const { user: userData, token: jwtToken } = res.data.data;
      localStorage.setItem('workout_token', jwtToken);
      localStorage.setItem('workout_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('workout_token');
    localStorage.removeItem('workout_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
