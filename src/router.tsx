import { Routes, Route, Navigate } from 'react-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { PastorLayout } from '@/components/PastorLayout';

import LoginPage from '@/pages/LoginPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminPastoresPage from '@/pages/admin/AdminPastoresPage';
import AdminConsolidatedPage from '@/pages/admin/AdminConsolidatedPage';
import AdminUsuariosPage from '@/pages/admin/AdminUsuariosPage';
import AdminPastorReportsPage from '@/pages/admin/AdminPastorReportsPage';
import AdminReportDetailPage from '@/pages/admin/AdminReportDetailPage';
import PastorCalendarPage from '@/pages/pastor/PastorCalendarPage';
import PastorConsolidatedPage from '@/pages/pastor/PastorConsolidatedPage';
import PastorReportDetailPage from '@/pages/pastor/PastorReportDetailPage';
import PastorReportEditPage from '@/pages/pastor/PastorReportEditPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="pastores" element={<AdminPastoresPage />} />
        <Route path="consolidated" element={<AdminConsolidatedPage />} />
        <Route path="usuarios" element={<AdminUsuariosPage />} />
        <Route path="pastor/:pastorId" element={<AdminPastorReportsPage />} />
        <Route
          path="pastor/:pastorId/report/:date"
          element={<AdminReportDetailPage />}
        />
      </Route>

      <Route
        path="/pastor"
        element={
          <ProtectedRoute role="pastor">
            <PastorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PastorCalendarPage />} />
        <Route path="consolidated" element={<PastorConsolidatedPage />} />
        <Route path="report/:date" element={<PastorReportDetailPage />} />
        <Route path="report/:date/edit" element={<PastorReportEditPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
