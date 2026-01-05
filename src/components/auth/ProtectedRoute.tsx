import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

/**
 * TWO-LAYER GLOBAL ACCESS GATE
 * 
 * DEBUG MODE BYPASS:
 * - If location.state.isDebugMode === true, skip all auth checks
 * - This allows /debug-view to navigate to dashboards with mock data
 * 
 * LAYER 1 - STATUS GATE (Global):
 * - NOT authenticated → /login
 * - status = 'pending' → /verification-pending
 * - status = 'rejected' → LOGOUT + Alert
 * 
 * LAYER 2 - ROLE GATE (Prefix-based):
 * - /admin-pusat/* → role === 'admin_pusat'
 * - /admin-regional/* → role === 'admin_regional'
 * - /user/* → role === 'user'
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, profile, isLoading, signOut } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const hasHandledRejection = useRef(false);

  // Check for debug mode bypass from /debug-view
  const locationState = location.state as { isDebugMode?: boolean } | null;
  const isDebugMode = locationState?.isDebugMode === true;

  // Handle rejected status with logout
  useEffect(() => {
    // Skip rejection handling in debug mode
    if (isDebugMode) return;
    
    if (
      profile?.status_account === 'rejected' && 
      !hasHandledRejection.current &&
      location.pathname !== '/login'
    ) {
      hasHandledRejection.current = true;
      
      toast({
        title: "Akun Ditolak",
        description: "Akun Anda telah ditolak. Silakan hubungi Admin untuk informasi lebih lanjut.",
        variant: "destructive",
        duration: 6000,
      });
      
      signOut();
    }
  }, [profile?.status_account, signOut, toast, location.pathname, isDebugMode]);

  // Reset rejection handler when user changes
  useEffect(() => {
    if (!user) {
      hasHandledRejection.current = false;
    }
  }, [user]);

  // ═══════════════════════════════════════════════════════════════
  // DEBUG MODE BYPASS: Skip all auth checks when coming from /debug-view
  // ═══════════════════════════════════════════════════════════════
  if (isDebugMode) {
    return <>{children}</>;
  }

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

  // Status = pending → redirect to verification-pending page
  if (profile.status_account === 'pending') {
    // Allow access to verification-pending page itself
    if (location.pathname === '/verification-pending') {
      return <>{children}</>;
    }
    return <Navigate to="/verification-pending" replace />;
  }

  // Status = rejected → handled by useEffect (logout + alert)
  // Return null while logout is processing
  if (profile.status_account === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-destructive border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Memproses...</p>
        </div>
      </div>
    );
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
