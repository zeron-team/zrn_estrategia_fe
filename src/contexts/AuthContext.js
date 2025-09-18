// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import { getMe } from '../services/userApi'; // Import getMe

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Validate token and fetch user data
          const userResponse = await getMe();
          setUser({ isAuthenticated: true, ...userResponse.data });
        } catch (error) {
          console.error("Failed to fetch user data with existing token:", error);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await apiClient.post('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = response.data;
    localStorage.setItem('authToken', access_token);
    
    // Fetch user details after successful login
    const userResponse = await getMe();
    setUser({ isAuthenticated: true, ...userResponse.data });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = { user, loading, login, logout };

  if (loading) {
    return <div>Cargando...</div>; // O un spinner de carga
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};