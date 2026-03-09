import { Navigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/features/auth/domain/entities/user-role';

interface ProtectedRouteProps {
  role: UserRole;
  children: React.ReactNode;
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    const redirect = userRole === 'admin' ? '/admin' : '/pastor';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
