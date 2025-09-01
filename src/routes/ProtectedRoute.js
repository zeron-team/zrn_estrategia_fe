// routes/ProtectedRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (!user) {
    // Si no hay usuario, redirigir a la página de login
    return <Navigate to="/login" />;
  }

  // Si hay usuario, renderizar el contenido de la ruta (Dashboard, etc.)
  return <Outlet />;
};

export default ProtectedRoute;