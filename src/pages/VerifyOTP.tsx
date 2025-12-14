import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, RefreshCw, CheckCircle, Mail, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { type, email, phone } = (location.state as { type: string; email?: string; phone?: string }) || {};

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedValue.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedValue.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      toast({
        title: "Kode OTP tidak lengkap",
        description: "Masukkan 6 digit kode OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate OTP verification (accept any 6-digit code for demo)
    setTimeout(() => {
      setIsLoading(false);

      // Update registration/claim status
      if (type === "register") {
        const pendingData = localStorage.getItem("mpj_pending_registration");
        if (pendingData) {
          const data = JSON.parse(pendingData);
          data.status = "verified_pending_payment";
          data.verifiedAt = new Date().toISOString();
          
          const registrations = JSON.parse(localStorage.getItem("mpj_registrations") || "[]");
          registrations.push(data);
          localStorage.setItem("mpj_registrations", JSON.stringify(registrations));
          localStorage.removeItem("mpj_pending_registration");
        }
      } else if (type === "claim") {
        const pendingData = localStorage.getItem("mpj_pending_claim");
        if (pendingData) {
          const data = JSON.parse(pendingData);
          data.status = "verified_pending_payment";
          data.verifiedAt = new Date().toISOString();
          
          const claims = JSON.parse(localStorage.getItem("mpj_claims") || "[]");
          claims.push(data);
          localStorage.setItem("mpj_claims", JSON.stringify(claims));
          localStorage.removeItem("mpj_pending_claim");
        }
      }

      toast({
        title: "Verifikasi Berhasil! 🎉",
        description: "Silakan lanjutkan ke pembayaran",
      });
      
      navigate("/payment", { state: { type } });
    }, 1500);
  };

  const handleResend = () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);
    toast({
      title: "OTP Terkirim Ulang",
      description: "Kode baru telah dikirim ke nomor Anda",
    });
  };

  const getTagihan = () => {
    return type === "claim" ? "Rp 20.000" : "Rp 50.000";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/20">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={logoMpj} alt="Media Pondok Jawa Timur" className="h-14 object-contain" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verifikasi OTP 🔢
            </h1>
            <p className="text-muted-foreground text-sm">
              Masukkan kode 6 digit yang dikirim ke
            </p>
            {email && (
              <p className="text-sm text-foreground font-medium flex items-center justify-center gap-2 mt-2">
                <Mail className="h-4 w-4" />
                {email}
              </p>
            )}
            {phone && (
              <p className="text-sm text-foreground font-medium flex items-center justify-center gap-2 mt-1">
                <Smartphone className="h-4 w-4" />
                {phone}
              </p>
            )}
          </div>

          {/* Type indicator */}
          <div className="mb-6 p-3 bg-muted/30 rounded-xl text-center">
            <p className="text-xs text-muted-foreground">
              {type === "claim" ? "Klaim Akun Legacy" : "Pendaftaran Baru"}
            </p>
            <p className="text-sm font-semibold text-foreground">
              Tagihan: {getTagihan()}
            </p>
          </div>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-border/50 focus:border-emerald-500 bg-background"
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={isLoading || otp.join("").length !== 6}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {isLoading ? "Memverifikasi..." : "Verifikasi OTP"}
            {!isLoading && <CheckCircle className="ml-2 h-4 w-4" />}
          </Button>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Tidak menerima kode?
            </p>
            {canResend ? (
              <Button
                variant="ghost"
                onClick={handleResend}
                className="text-amber-500 hover:text-amber-400"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Kirim Ulang OTP
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Kirim ulang dalam <span className="font-bold text-foreground">{resendTimer}s</span>
              </p>
            )}
          </div>

          {/* Demo Note */}
          <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-xs text-center text-muted-foreground">
              <span className="font-semibold">Demo Mode:</span> Masukkan kode 6 digit apapun untuk melanjutkan
            </p>
          </div>

          {/* Back Link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors">
              ← Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;