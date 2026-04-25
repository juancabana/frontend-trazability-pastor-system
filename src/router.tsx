import { Routes, Route, Navigate } from 'react-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { PastorLayout } from '@/components/PastorLayout';
import { SuperAdminLayout } from '@/components/SuperAdminLayout';

import LoginPage from '@/pages/LoginPage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminPastoresPage from '@/pages/admin/AdminPastoresPage';
import AdminConsolidatedPage from '@/pages/admin/AdminConsolidatedPage';
import AdminUsuariosPage from '@/pages/admin/AdminUsuariosPage';
import AdminPastorReportsPage from '@/pages/admin/AdminPastorReportsPage';
import AdminReportDetailPage from '@/pages/admin/AdminReportDetailPage';
import AdminDistritosPage from '@/pages/admin/AdminDistritosPage';
import AdminSendReportPage from '@/pages/admin/AdminSendReportPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import PastorCalendarPage from '@/pages/pastor/PastorCalendarPage';
import PastorConsolidatedPage from '@/pages/pastor/PastorConsolidatedPage';
import PastorReportDetailPage from '@/pages/pastor/PastorReportDetailPage';
import PastorReportEditPage from '@/pages/pastor/PastorReportEditPage';
import SuperAdminDashboardPage from '@/pages/super-admin/SuperAdminDashboardPage';
import SuperAdminAssociationsPage from '@/pages/super-admin/SuperAdminAssociationsPage';
import SuperAdminAssociationDetailPage from '@/pages/super-admin/SuperAdminAssociationDetailPage';
import SuperAdminConsolidatedPage from '@/pages/super-admin/SuperAdminConsolidatedPage';
import SuperAdminPastorReportsPage from '@/pages/super-admin/SuperAdminPastorReportsPage';
import NotFoundPage from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin', 'admin_readonly']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="pastores" element={<AdminPastoresPage />} />
        <Route path="distritos" element={<AdminDistritosPage />} />
        <Route path="consolidated" element={<AdminConsolidatedPage />} />
        <Route path="usuarios" element={<AdminUsuariosPage />} />
        <Route path="send-report" element={<AdminSendReportPage />} />
        <Route path="configuracion" element={<AdminSettingsPage />} />
        <Route path="pastor/:pastorId" element={<AdminPastorReportsPage />} />
        <Route
          path="pastor/:pastorId/report/:date"
          element={<AdminReportDetailPage />}
        />
      </Route>

      <Route
        path="/pastor"
        element={
          <ProtectedRoute roles={['pastor']}>
            <PastorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PastorCalendarPage />} />
        <Route path="consolidated" element={<PastorConsolidatedPage />} />
        <Route path="report/:date" element={<PastorReportDetailPage />} />
        <Route path="report/:date/edit" element={<PastorReportEditPage />} />
      </Route>

      <Route
        path="/super-admin"
        element={
          <ProtectedRoute roles={['super_admin']}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboardPage />} />
        <Route path="associations" element={<SuperAdminAssociationsPage />} />
        <Route path="association/:associationId" element={<SuperAdminAssociationDetailPage />} />
        <Route path="consolidated" element={<SuperAdminConsolidatedPage />} />
        <Route path="pastor/:pastorId" element={<SuperAdminPastorReportsPage />} />
        <Route path="pastor/:pastorId/report/:date" element={<AdminReportDetailPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
