import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, profile, role, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while fetching auth data
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

  // Not authenticated → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // No profile found → something is wrong, redirect to login
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // Status = pending → redirect to pending page
  if (profile.status_account === 'pending') {
    // Allow access to pending page itself
    if (location.pathname === '/pending') {
      return <>{children}</>;
    }
    return <Navigate to="/pending" replace />;
  }

  // Status = rejected → redirect to rejected page
  if (profile.status_account === 'rejected') {
    // Allow access to rejected page itself
    if (location.pathname === '/rejected') {
      return <>{children}</>;
    }
    return <Navigate to="/rejected" replace />;
  }

  // Status is active - now check role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/403" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
