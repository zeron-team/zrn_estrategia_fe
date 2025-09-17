import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import CoursesPage from '../pages/CoursesPage';
import FlowsPage from '../pages/FlowsPage';
import CrmPage from '../pages/CrmPage';
import UserManagementPage from '../pages/UserManagementPage';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/messages" element={<CrmPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/flows" element={<FlowsPage />} />
          <Route path="/users" element={<UserManagementPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
