import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = '/auth/login'
}) => {
  const { isAuthenticated, hasAnyRole, isLoading, getDefaultDashboard } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

 
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to={getDefaultDashboard()} replace />;
  }

  return <>{children}</>;
};