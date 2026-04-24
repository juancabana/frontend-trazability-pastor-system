import { Navigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/features/auth/domain/entities/user-role';

interface ProtectedRouteProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export function getRoleRedirect(role: UserRole | null): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
    case 'admin_readonly':
      return '/admin';
    case 'pastor':
      return '/pastor';
    default:
      return '/login';
  }
}

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { isAuthenticated, role: userRole, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (!userRole || !roles.includes(userRole)) {
    return <Navigate to={getRoleRedirect(userRole)} replace />;
  }

  return <>{children}</>;
}
