import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClaimAccount from "./pages/ClaimAccount";
import VerifyOTP from "./pages/VerifyOTP";
import Payment from "./pages/Payment";
import PaymentPending from "./pages/PaymentPending";
import Dashboard from "./pages/Dashboard";
import RegionalDashboard from "./pages/RegionalDashboard";
import MediaDashboard from "./pages/MediaDashboard";
import CrewDashboard from "./pages/CrewDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/claim-account" element={<ClaimAccount />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-pending" element={<PaymentPending />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/regional-dashboard" element={<RegionalDashboard />} />
          <Route path="/regional-dashboard/*" element={<RegionalDashboard />} />
          <Route path="/media-dashboard" element={<MediaDashboard />} />
          <Route path="/media-dashboard/*" element={<MediaDashboard />} />
          <Route path="/crew-dashboard" element={<CrewDashboard />} />
          <Route path="/crew-dashboard/*" element={<CrewDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
