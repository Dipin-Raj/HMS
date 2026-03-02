import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleRoute } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { PageLoader } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader message="Authenticating..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleRoute(user.role)} replace />;
  }

  return <>{children}</>;
}
