// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al cargar la app, intenta recuperar el token para mantener la sesión
    const token = localStorage.getItem('authToken');
    if (token) {
      setUser({ isAuthenticated: true }); // En una app real, validarías el token aquí
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // FastAPI espera los datos de login en un formato de formulario
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await apiClient.post('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = response.data;
    localStorage.setItem('authToken', access_token);
    setUser({ isAuthenticated: true });
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