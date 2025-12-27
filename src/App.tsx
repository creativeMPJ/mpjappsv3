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
import VerifyOTP from "./pages/VerifyOTP";
import Payment from "./pages/Payment";
import PaymentPending from "./pages/PaymentPending";
import CheckInstitution from "./pages/CheckInstitution";
import InstitutionSubmission from "./pages/InstitutionSubmission";
import NotFound from "./pages/NotFound";

// ═══════════════════════════════════════════════════════════════
// STATUS PAGES (Auth required, special handling in ProtectedRoute)
// ═══════════════════════════════════════════════════════════════
import VerificationPending from "./pages/VerificationPending";
import Forbidden from "./pages/Forbidden";

// ═══════════════════════════════════════════════════════════════
// PROTECTED DASHBOARDS (Role-gated)
// ═══════════════════════════════════════════════════════════════
import Dashboard from "./pages/Dashboard";           // Admin Pusat
import RegionalDashboard from "./pages/RegionalDashboard"; // Admin Regional
import MediaDashboard from "./pages/MediaDashboard"; // User
import CrewDashboard from "./pages/CrewDashboard";   // User
import FinanceDashboard from "./pages/FinanceDashboard"; // Admin Pusat
import MajelisMilitanDashboard from "./pages/MajelisMilitanDashboard"; // Admin Pusat
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
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-pending" element={<PaymentPending />} />

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
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-pusat/*" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <Dashboard />
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
            {/* SUPER ADMIN ROUTES - Majelis Militan Dashboard         */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route 
              path="/super-admin" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <MajelisMilitanDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/super-admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <MajelisMilitanDashboard />
                </ProtectedRoute>
              } 
            />
            {/* Legacy redirect from majelis-militan to super-admin */}
            <Route 
              path="/majelis-militan" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <MajelisMilitanDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-pusat/majelis-militan" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <MajelisMilitanDashboard />
                </ProtectedRoute>
              } 
            />
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
            {/* LEGACY REDIRECTS (to be removed after migration)      */}
            {/* ══════════════════════════════════════════════════════ */}
            {/* These are kept temporarily for backward compatibility */}

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
