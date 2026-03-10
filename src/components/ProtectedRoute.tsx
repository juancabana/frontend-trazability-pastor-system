import { Navigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/features/auth/domain/entities/user-role';

interface ProtectedRouteProps {
  role: UserRole;
  children: React.ReactNode;
}

function getRoleRedirect(role: UserRole | null): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
      return '/admin';
    case 'pastor':
      return '/pastor';
    default:
      return '/login';
  }
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    return <Navigate to={getRoleRedirect(userRole)} replace />;
  }

  return <>{children}</>;
}
