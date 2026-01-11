import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// ═══════════════════════════════════════════════════════════════
// PUBLIC PAGES (No auth required)
// ═══════════════════════════════════════════════════════════════
import Index from "./pages/Index";
import Login from "./pages/Login";
import ClaimAccount from "./pages/ClaimAccount";
import ClaimSuccess from "./pages/ClaimSuccess";
import VerifyOTP from "./pages/VerifyOTP";
import Payment from "./pages/Payment";
import PaymentPending from "./pages/PaymentPending";
import CheckInstitution from "./pages/CheckInstitution";
import InstitutionSubmission from "./pages/InstitutionSubmission";
import NotFound from "./pages/NotFound";
import DebugView from "./pages/DebugView";

// ═══════════════════════════════════════════════════════════════
// STATUS PAGES (Auth required, special handling in ProtectedRoute)
// ═══════════════════════════════════════════════════════════════
import VerificationPending from "./pages/VerificationPending";
import Forbidden from "./pages/Forbidden";

// ═══════════════════════════════════════════════════════════════
// PROTECTED DASHBOARDS (Role-gated)
// ═══════════════════════════════════════════════════════════════
import AdminPusatDashboard from "./pages/AdminPusatDashboard"; // Admin Pusat
import RegionalDashboard from "./pages/RegionalDashboard"; // Admin Regional
import MediaDashboard from "./pages/MediaDashboard"; // User
import CrewDashboard from "./pages/CrewDashboard";   // User
import FinanceDashboard from "./pages/FinanceDashboard"; // Admin Pusat
// MajelisMilitanDashboard merged into SuperAdminDashboard
import SuperAdminDashboard from "./pages/SuperAdminDashboard"; // Super Admin (God Mode)
import AdminRegionalDetail from "./pages/AdminRegionalDetail"; // Admin Pusat

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* ══════════════════════════════════════════════════════ */}
            {/* PUBLIC ROUTES - No auth required                      */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<InstitutionSubmission />} />
            <Route path="/check-institution" element={<CheckInstitution />} />
            <Route path="/institution-submission" element={<InstitutionSubmission />} />
            <Route path="/claim-account" element={<ClaimAccount />} />
            <Route path="/legacy-claim" element={<ClaimAccount />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/claim-success" element={<ClaimSuccess />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-pending" element={<PaymentPending />} />
            
            {/* ══════════════════════════════════════════════════════ */}
            {/* DEBUG VIEW - Public audit page (dev only)             */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route path="/debug-view" element={<DebugView />} />
            {/* ══════════════════════════════════════════════════════ */}
            {/* STATUS PAGES - Auth required, special status handling */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route 
              path="/verification-pending" 
              element={
                <ProtectedRoute>
                  <VerificationPending />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/403" 
              element={
                <ProtectedRoute>
                  <Forbidden />
                </ProtectedRoute>
              } 
            />

            {/* ══════════════════════════════════════════════════════ */}
            {/* ADMIN PUSAT ROUTES - role === 'admin_pusat' ONLY      */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route 
              path="/admin-pusat" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <AdminPusatDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-pusat/*" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <AdminPusatDashboard />
                </ProtectedRoute>
              } 
            />
            {/* ══════════════════════════════════════════════════════ */}
            {/* ADMIN FINANCE ROUTES - role === 'admin_finance' ONLY   */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route 
              path="/finance" 
              element={
                <ProtectedRoute allowedRoles={['admin_finance']}>
                  <FinanceDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/finance/*" 
              element={
                <ProtectedRoute allowedRoles={['admin_finance']}>
                  <FinanceDashboard />
                </ProtectedRoute>
              } 
            />
            {/* ══════════════════════════════════════════════════════ */}
            {/* SUPER ADMIN ROUTES - God Mode Dashboard                */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route 
              path="/super-admin" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/super-admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            />
            {/* Majelis Militan merged into SuperAdminDashboard as "Hierarki Data" */}
            <Route 
              path="/admin-pusat/regional/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <AdminRegionalDetail />
                </ProtectedRoute>
              } 
            />
            {/* ══════════════════════════════════════════════════════ */}
            {/* ADMIN REGIONAL ROUTES - role === 'admin_regional' ONLY */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route 
              path="/admin-regional" 
              element={
                <ProtectedRoute allowedRoles={['admin_regional']}>
                  <RegionalDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-regional/*" 
              element={
                <ProtectedRoute allowedRoles={['admin_regional']}>
                  <RegionalDashboard />
                </ProtectedRoute>
              } 
            />

            {/* ══════════════════════════════════════════════════════ */}
            {/* USER ROUTES - role === 'user' ONLY                    */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route 
              path="/user" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <MediaDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/*" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <MediaDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/crew" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <CrewDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/crew/*" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <CrewDashboard />
                </ProtectedRoute>
              } 
            />

            {/* ══════════════════════════════════════════════════════ */}
            {/* 404 - Not Found                                       */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
