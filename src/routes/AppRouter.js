// src/router/AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

// Public
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

// Dashboards
import DashboardSelectionPage from '../pages/DashboardSelectionPage';
import DashboardPage from '../pages/DashboardPage';
import SalesDashboardPage from '../pages/SalesDashboardPage';
import MarketingDashboardPage from '../pages/MarketingDashboardPage';
import SupportDashboardPage from '../pages/SupportDashboardPage';

// Sections
import CrmPage from '../pages/CrmPage';
import CoursesPage from '../pages/CoursesPage';
import FlowsPage from '../pages/FlowsPage';
import UserManagementPage from '../pages/UserManagementPage';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected area */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard/select" element={<DashboardSelectionPage />} />
            <Route path="/dashboard/main" element={<DashboardPage />} />
            <Route path="/dashboard/sales" element={<SalesDashboardPage />} />
            <Route path="/dashboard/marketing" element={<MarketingDashboardPage />} />
            <Route path="/dashboard/support" element={<SupportDashboardPage />} />

            <Route path="/messages" element={<CrmPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/flows" element={<FlowsPage />} />
            <Route path="/users" element={<UserManagementPage />} />

            {/* Protected 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard/select" replace />} />

        {/* Public 404 (fallback if something escapes) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}