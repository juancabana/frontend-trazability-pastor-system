import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { PastorLayout } from '@/components/PastorLayout';
import { SuperAdminLayout } from '@/components/SuperAdminLayout';
import { OwnerLayout } from '@/components/OwnerLayout';
import { PageLoader } from '@/components/atoms/PageLoader';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ChangePasswordPage = lazy(() => import('@/pages/ChangePasswordPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminPastoresPage = lazy(() => import('@/pages/admin/AdminPastoresPage'));
const AdminConsolidatedPage = lazy(() => import('@/pages/admin/AdminConsolidatedPage'));
const AdminUsuariosPage = lazy(() => import('@/pages/admin/AdminUsuariosPage'));
const AdminPastorReportsPage = lazy(() => import('@/pages/admin/AdminPastorReportsPage'));
const AdminReportDetailPage = lazy(() => import('@/pages/admin/AdminReportDetailPage'));
const AdminDistritosPage = lazy(() => import('@/pages/admin/AdminDistritosPage'));
const AdminSendReportPage = lazy(() => import('@/pages/admin/AdminSendReportPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminPescaRubricasPage = lazy(() => import('@/pages/admin/AdminPescaRubricasPage'));
const PastorCalendarPage = lazy(() => import('@/pages/pastor/PastorCalendarPage'));
const PastorConsolidatedPage = lazy(() => import('@/pages/pastor/PastorConsolidatedPage'));
const PastorReportDetailPage = lazy(() => import('@/pages/pastor/PastorReportDetailPage'));
const PastorReportEditPage = lazy(() => import('@/pages/pastor/PastorReportEditPage'));
const SuperAdminDashboardPage = lazy(() => import('@/pages/super-admin/SuperAdminDashboardPage'));
const SuperAdminAssociationsPage = lazy(() => import('@/pages/super-admin/SuperAdminAssociationsPage'));
const SuperAdminAssociationDetailPage = lazy(() => import('@/pages/super-admin/SuperAdminAssociationDetailPage'));
const SuperAdminConsolidatedPage = lazy(() => import('@/pages/super-admin/SuperAdminConsolidatedPage'));
const SuperAdminPastorReportsPage = lazy(() => import('@/pages/super-admin/SuperAdminPastorReportsPage'));
const OwnerAuditLogsPage = lazy(() => import('@/pages/owner/OwnerAuditLogsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route path="rubricas-pescar" element={<AdminPescaRubricasPage />} />
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

      <Route
        path="/owner"
        element={
          <ProtectedRoute roles={['owner']}>
            <OwnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="audit-logs" replace />} />
        <Route path="audit-logs" element={<OwnerAuditLogsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  );
}
