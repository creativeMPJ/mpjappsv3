import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, Home, Loader2, MessageCircle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api-client";
import { getPaymentStateLabel, getPaymentStatus, type PaymentReadinessState } from "@/features/v4/utils";
import logoMpj from "@/assets/logo-mpj.png";

interface PaymentData {
  status?: string | null;
  rejectionReason?: string | null;
}

const POLL_INTERVAL = 10_000;
const DASHBOARD_ROUTE = "/cms/user-beranda";

const PaymentPending = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<PaymentReadinessState>("pending");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkPaymentStatus = useCallback(async (silent = true) => {
    if (!silent) setIsChecking(true);
    try {
      const data = await apiRequest<{
        payment?: PaymentData | null;
        redirectTo?: string;
      }>("/api/payments/current");

      setLastChecked(new Date());

      if (data.payment) {
        const normalized = getPaymentStatus(data.payment);
        setPaymentStatus(normalized);

        if (normalized === "verified") {
          await refreshAuth();
          setTimeout(() => navigate(DASHBOARD_ROUTE, { replace: true }), 2000);
          return;
        }

        if (normalized === "rejected") {
          setRejectionReason(data.payment.rejectionReason || null);
          return;
        }

        if (normalized === "pending") {
          return;
        }
      } else {
        setPaymentStatus("inactive");
      }

      if (data.redirectTo && data.redirectTo !== "/payment-pending") {
        navigate(data.redirectTo === "/user" ? DASHBOARD_ROUTE : data.redirectTo, { replace: true });
      }
    } catch {
      // Retry on next poll.
    } finally {
      setIsChecking(false);
    }
  }, [navigate, refreshAuth]);

  useEffect(() => {
    checkPaymentStatus(false);
    const interval = setInterval(() => checkPaymentStatus(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkPaymentStatus]);

  const isVerified = paymentStatus === "verified";
  const isRejected = paymentStatus === "rejected";
  const statusLabel = getPaymentStateLabel(paymentStatus);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/20 text-center">
          <div className="flex justify-center mb-4">
            <img src={logoMpj} alt="Media Pondok Jawa Timur" className="h-14 object-contain" />
          </div>

          {isVerified ? (
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
          ) : isRejected ? (
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
          )}

          <h1 className="text-2xl font-bold text-foreground mb-2">{statusLabel}</h1>
          <p className="text-muted-foreground text-sm mb-6">
            {isVerified
              ? "Akun Anda telah aktif. Mengalihkan ke dashboard..."
              : isRejected
                ? rejectionReason || "Pembayaran Anda ditolak. Silakan unggah ulang bukti pembayaran."
                : "Bukti pembayaran Anda sedang menunggu verifikasi pembayaran."}
          </p>

          <Card className="bg-muted/30 border-border/50 mb-6">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Bukti Transfer Terkirim</p>
                  <p className="text-xs text-muted-foreground">Selesai</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isVerified ? "bg-emerald-500" : isRejected ? "bg-red-500" : "bg-amber-500 animate-pulse"}`}>
                  {isVerified ? <CheckCircle className="h-4 w-4 text-white" /> : isRejected ? <XCircle className="h-4 w-4 text-white" /> : <Clock className="h-4 w-4 text-white" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Verifikasi Pembayaran</p>
                  <p className="text-xs text-muted-foreground">{statusLabel}</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 ${isVerified ? "" : "opacity-50"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isVerified ? "bg-emerald-500" : "bg-muted"}`}>
                  <CheckCircle className={`h-4 w-4 ${isVerified ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Aktivasi Akun</p>
                  <p className="text-xs text-muted-foreground">{isVerified ? "Terverifikasi" : "Menunggu verifikasi pembayaran"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className={`${isRejected ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"} border rounded-xl p-4 mb-6`}>
            {isVerified ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                <p className="text-sm text-foreground font-medium">Mengalihkan ke dashboard...</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground">
                  {isRejected ? "Silakan unggah ulang bukti pembayaran." : "Data akan diperbarui otomatis setelah verifikasi pembayaran selesai."}
                </p>
                {lastChecked && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                    {isChecking ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Terakhir dicek: {lastChecked.toLocaleTimeString("id-ID")}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="space-y-3">
            {isRejected ? (
              <Link to="/payment">
                <Button className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                  Upload Ulang Bukti Pembayaran
                </Button>
              </Link>
            ) : (
              <Link to={DASHBOARD_ROUTE}>
                <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  <Home className="mr-2 h-4 w-4" />
                  {isVerified ? "Masuk ke Dashboard" : "Ke Dashboard"}
                </Button>
              </Link>
            )}

            <Button variant="outline" className="w-full h-11 rounded-xl border-border/50 mt-3" disabled>
              <MessageCircle className="mr-2 h-4 w-4" />
              Fitur akan segera tersedia
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
