import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, Home, MessageCircle, Loader2, XCircle, RefreshCw } from "lucide-react";
import logoMpj from "@/assets/logo-mpj.png";
import { apiRequest } from "@/lib/api-client";

type PaymentStatus = "pending_payment" | "pending_verification" | "verified" | "rejected";

interface PaymentData {
  status: PaymentStatus;
  rejectionReason?: string | null;
}

const POLL_INTERVAL = 10_000; // Poll every 10 seconds

const PaymentPending = () => {
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending_verification");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkPaymentStatus = useCallback(async (silent = true) => {
    if (!silent) setIsChecking(true);
    try {
      const data = await apiRequest<{
        payment?: PaymentData;
        redirectTo?: string;
      }>("/api/payments/current");

      setLastChecked(new Date());

      // Check payment status first (takes priority over redirectTo)
      if (data.payment) {
        setPaymentStatus(data.payment.status);

        if (data.payment.status === "verified") {
          // Payment verified! Show success state then redirect
          setTimeout(() => navigate("/user", { replace: true }), 2000);
          return;
        }

        if (data.payment.status === "rejected") {
          setRejectionReason(data.payment.rejectionReason || null);
          return;
        }

        // If still pending_verification, stay on this page
        if (data.payment.status === "pending_verification") {
          return;
        }
      }

      // Only follow redirectTo if no payment data or for non-self redirects
      if (data.redirectTo && data.redirectTo !== "/payment-pending") {
        navigate(data.redirectTo, { replace: true });
        return;
      }
    } catch {
      // Silently fail — will retry on next poll
    } finally {
      setIsChecking(false);
    }
  }, [navigate]);

  // Initial check + polling
  useEffect(() => {
    checkPaymentStatus(false);

    const interval = setInterval(() => {
      checkPaymentStatus(true);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [checkPaymentStatus]);

  const isVerified = paymentStatus === "verified";
  const isRejected = paymentStatus === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/20 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={logoMpj} alt="Media Pondok Jawa Timur" className="h-14 object-contain" />
          </div>

          {/* Status Icon */}
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

          {/* Header */}
          {isVerified ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Pembayaran Dikonfirmasi ✅
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                Selamat! Akun Anda telah aktif. Mengalihkan ke dashboard...
              </p>
            </>
          ) : isRejected ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Pembayaran Ditolak ❌
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                {rejectionReason || "Pembayaran Anda ditolak oleh Admin. Silakan hubungi admin untuk info lebih lanjut."}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Menunggu Konfirmasi ⏳
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                Bukti pembayaran Anda sedang diverifikasi oleh Admin Pusat
              </p>
            </>
          )}

          {/* Status Card */}
          <Card className="bg-muted/30 border-border/50 mb-6">
            <CardContent className="p-4 space-y-3">
              {/* Step 1: Bukti Terkirim — always done */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Bukti Transfer Terkirim</p>
                  <p className="text-xs text-muted-foreground">Selesai</p>
                </div>
              </div>

              {/* Step 2: Verifikasi Admin */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isVerified
                  ? "bg-emerald-500"
                  : isRejected
                    ? "bg-red-500"
                    : "bg-amber-500 animate-pulse"
                  }`}>
                  {isVerified ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : isRejected ? (
                    <XCircle className="h-4 w-4 text-white" />
                  ) : (
                    <Clock className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Verifikasi Admin</p>
                  <p className="text-xs text-muted-foreground">
                    {isVerified ? "Disetujui" : isRejected ? "Ditolak" : "Dalam proses (1x24 jam)"}
                  </p>
                </div>
              </div>

              {/* Step 3: Akun Aktif */}
              <div className={`flex items-center gap-3 ${isVerified ? "" : "opacity-50"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isVerified ? "bg-emerald-500" : "bg-muted"
                  }`}>
                  <CheckCircle className={`h-4 w-4 ${isVerified ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Akun Aktif</p>
                  <p className="text-xs text-muted-foreground">
                    {isVerified ? "Aktif" : "Menunggu"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          {isVerified ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                <p className="text-sm text-foreground font-medium">
                  Mengalihkan ke dashboard...
                </p>
              </div>
            </div>
          ) : isRejected ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-foreground">
                Silakan upload ulang bukti pembayaran atau hubungi admin untuk informasi lebih lanjut.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-foreground">
                Setelah pembayaran dikonfirmasi, Anda akan mendapat notifikasi dan dapat mengakses fitur lengkap MPJ Apps termasuk <span className="font-semibold">E-ID Card</span>.
              </p>
              {lastChecked && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  {isChecking ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  Terakhir dicek: {lastChecked.toLocaleTimeString("id-ID")}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {isRejected ? (
              <Link to="/payment">
                <Button className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                  Upload Ulang Bukti Pembayaran
                </Button>
              </Link>
            ) : isVerified ? (
              <Link to="/user">
                <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  <Home className="mr-2 h-4 w-4" />
                  Masuk ke Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/user">
                <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  <Home className="mr-2 h-4 w-4" />
                  Ke Dashboard
                </Button>
              </Link>
            )}

            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20ingin%20konfirmasi%20pembayaran%20MPJ%20Apps"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full h-11 rounded-xl border-border/50 mt-3">
                <MessageCircle className="mr-2 h-4 w-4" />
                Hubungi Admin via WhatsApp
              </Button>
            </a>
          </div>

          {/* Manual check button */}
          {!isVerified && !isRejected && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => checkPaymentStatus(false)}
                disabled={isChecking}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Mengecek status...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Cek status sekarang
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Login Link */}
          {!isVerified && (
            <p className="text-center mt-6 text-sm text-muted-foreground">
              Sudah dikonfirmasi?{" "}
              <Link to="/login" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
                Masuk ke Akun
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;