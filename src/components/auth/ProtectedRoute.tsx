import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

/**
 * TWO-LAYER GLOBAL ACCESS GATE
 * 
 * LAYER 1 - STATUS GATE (Global):
 * - NOT authenticated → /login
 * - status = 'pending' → /pending
 * - status = 'rejected' → /rejected
 * 
 * LAYER 2 - ROLE GATE (Prefix-based):
 * - /admin-pusat/* → role === 'admin_pusat'
 * - /admin-regional/* → role === 'admin_regional'
 * - /user/* → role === 'user'
 * 
 * All enforcement happens BEFORE render, not after.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, profile, isLoading } = useAuth();
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

  // ═══════════════════════════════════════════════════════════════
  // LAYER 1: STATUS GATE (executes BEFORE any role logic)
  // ═══════════════════════════════════════════════════════════════

  // Not authenticated → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // No profile found → redirect to login
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

  // ═══════════════════════════════════════════════════════════════
  // LAYER 2: ROLE GATE (executes ONLY after status is 'active')
  // ═══════════════════════════════════════════════════════════════

  // Allow access to /403 page for active users
  if (location.pathname === '/403') {
    return <>{children}</>;
  }

  // Check role authorization if allowedRoles specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(profile.role)) {
      // Role mismatch → redirect to /403
      // Do NOT infer or redirect to other dashboards
      return <Navigate to="/403" replace />;
    }
  }

  // All gates passed - render children
  return <>{children}</>;
};

export default ProtectedRoute;
