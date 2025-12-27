import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import ClaimAccount from "./pages/ClaimAccount";
import VerifyOTP from "./pages/VerifyOTP";
import Payment from "./pages/Payment";
import PaymentPending from "./pages/PaymentPending";
import CheckInstitution from "./pages/CheckInstitution";
import InstitutionSubmission from "./pages/InstitutionSubmission";
import NotFound from "./pages/NotFound";

// Status pages
import Pending from "./pages/Pending";
import Rejected from "./pages/Rejected";
import Forbidden from "./pages/Forbidden";

// Protected dashboards
import Dashboard from "./pages/Dashboard";
import RegionalDashboard from "./pages/RegionalDashboard";
import MediaDashboard from "./pages/MediaDashboard";
import CrewDashboard from "./pages/CrewDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import MajelisMilitanDashboard from "./pages/MajelisMilitanDashboard";
import AdminRegionalDetail from "./pages/AdminRegionalDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes - no auth required */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/check-institution" element={<CheckInstitution />} />
            <Route path="/institution-submission" element={<InstitutionSubmission />} />
            <Route path="/claim-account" element={<ClaimAccount />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-pending" element={<PaymentPending />} />

            {/* Status pages - auth required but special handling in ProtectedRoute */}
            <Route 
              path="/pending" 
              element={
                <ProtectedRoute>
                  <Pending />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rejected" 
              element={
                <ProtectedRoute>
                  <Rejected />
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

            {/* Admin Pusat routes - only admin_pusat role */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Regional routes - only admin_regional role */}
            <Route 
              path="/regional-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin_regional']}>
                  <RegionalDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/regional-dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['admin_regional']}>
                  <RegionalDashboard />
                </ProtectedRoute>
              } 
            />

            {/* User routes - only user role */}
            <Route 
              path="/media-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <MediaDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/media-dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <MediaDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/crew-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <CrewDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/crew-dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <CrewDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Finance routes - admin_pusat can access */}
            <Route 
              path="/finance" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <FinanceDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/finance/*" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <FinanceDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Majelis Militan routes - admin_pusat can access */}
            <Route 
              path="/majelis-militan" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <MajelisMilitanDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/majelis-militan/*" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <MajelisMilitanDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin detail page - admin_pusat only */}
            <Route 
              path="/admin/regional/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin_pusat']}>
                  <AdminRegionalDetail />
                </ProtectedRoute>
              } 
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
