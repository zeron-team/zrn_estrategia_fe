//src/routes/AppRouter.js

import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import NotesDashboardsTabsPage from '../pages/NotesDashboardsTabsPage';

// Eager (small, public)
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

// Lazy (heavier)
const DashboardSelectionPage  = lazy(() => import('../pages/DashboardSelectionPage'));
const DashboardPage           = lazy(() => import('../pages/DashboardPage'));
const SalesDashboardPage      = lazy(() => import('../pages/SalesDashboardPage'));
const MarketingDashboardPage  = lazy(() => import('../pages/MarketingDashboardPage'));
const SupportDashboardPage    = lazy(() => import('../pages/SupportDashboardPage'));
const NotesAnalyticsPage      = lazy(() => import('../pages/NotesAnalyticsPage'));
const PredictiveDashboardPage = lazy(() => import('../pages/PredictiveDashboardPage'));

const CrmPage                 = lazy(() => import('../pages/CrmPage'));
const CoursesPage             = lazy(() => import('../pages/CoursesPage'));
const FlowsPage               = lazy(() => import('../pages/FlowsPage'));
const UserManagementPage      = lazy(() => import('../pages/UserManagementPage'));
const ExamDebtDashboardPage   = lazy(() => import('../pages/ExamDebtDashboardPage'));


function PageLoader() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Dashboards */}
              <Route path="/dashboard/select"            element={<DashboardSelectionPage />} />
              <Route path="/dashboard/main"              element={<DashboardPage />} />
              <Route path="/dashboard/sales"             element={<SalesDashboardPage />} />
              <Route path="/dashboard/marketing"         element={<MarketingDashboardPage />} />
              <Route path="/dashboard/support"           element={<SupportDashboardPage />} />
              <Route path="/dashboard/notes-analytics"   element={<NotesAnalyticsPage />} />
              <Route path="/dashboard/predictive"        element={<PredictiveDashboardPage />} />
              <Route path="/dashboard/exam-debt"         element={<ExamDebtDashboardPage />} />
              <Route path="/notes"                       element={<NotesDashboardsTabsPage />} />

              {/* Sections */}
              <Route path="/messages" element={<CrmPage />} />
              <Route path="/courses"  element={<CoursesPage />} />
              <Route path="/flows"    element={<FlowsPage />} />
              <Route path="/users"    element={<UserManagementPage />} />

              {/* Protected 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard/select" replace />} />

          {/* Public 404 fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}