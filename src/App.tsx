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
import ForgotPassword from "./pages/ForgotPassword";
import DebugView from "./pages/DebugView";
import PublicPesantrenProfile from "./pages/PublicPesantrenProfile";
import PublicCrewProfile from "./pages/PublicCrewProfile";
import PublicDirektori from "./pages/PublicDirektori";

// ═══════════════════════════════════════════════════════════════
// STATUS PAGES (Auth required, special handling in ProtectedRoute)
// ═══════════════════════════════════════════════════════════════
import VerificationPending from "./pages/VerificationPending";
import AccountRejected from "./pages/AccountRejected";
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
            {/* PUBLIC VERIFICATION PROFILES - QR Code verification   */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route path="/direktori" element={<PublicDirektori />} />
            <Route path="/pesantren/:nip" element={<PublicPesantrenProfile />} />
            <Route path="/pesantren/:nip/crew/:niamSuffix" element={<PublicCrewProfile />} />

            {/* ══════════════════════════════════════════════════════ */}
            {/* DEBUG VIEW - Public audit page (dev only)             */}
            {/* ══════════════════════════════════════════════════════ */}
            <Route path="/debug-view" element={<DebugView />} />
            {/* ══════════════════════════════════════════════════════ */}
            {/* STATUS PAGES */}
            <Route path="/verification-pending" element={<VerificationPending />} />
            <Route path="/account-rejected" element={<AccountRejected />} />
            <Route path="/403" element={<Forbidden />} />

            {/* ADMIN PUSAT */}
            <Route path="/admin-pusat" element={<AdminPusatDashboard />} />
            <Route path="/admin-pusat/*" element={<AdminPusatDashboard />} />

            {/* ADMIN FINANCE */}
            <Route path="/finance" element={<FinanceDashboard />} />
            <Route path="/finance/*" element={<FinanceDashboard />} />

            {/* SUPER ADMIN */}
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/*" element={<SuperAdminDashboard />} />
            <Route path="/admin-pusat/regional/:id" element={<AdminRegionalDetail />} />

            {/* ADMIN REGIONAL */}
            <Route path="/admin-regional" element={<RegionalDashboard />} />
            <Route path="/admin-regional/*" element={<RegionalDashboard />} />

            {/* USER */}
            <Route path="/user" element={<MediaDashboard />} />
            <Route path="/user/*" element={<MediaDashboard />} />
            <Route path="/user/crew" element={<CrewDashboard />} />
            <Route path="/user/crew/*" element={<CrewDashboard />} />

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
