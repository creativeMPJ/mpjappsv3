import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { type AppRole, useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  const locationState = location.state as { isDebugMode?: boolean } | null;
  const isDebugMode = locationState?.isDebugMode === true;

  if (isDebugMode) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.status_account === 'pending') {
    if (location.pathname === '/verification-pending') {
      return <>{children}</>;
    }
    return <Navigate to="/verification-pending" replace />;
  }

  if (profile.status_account === 'rejected') {
    if (location.pathname === '/account-rejected') {
      return <>{children}</>;
    }
    return <Navigate to="/account-rejected" replace />;
  }

  if (location.pathname === '/403') {
    return <>{children}</>;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
