import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RefreshCw, CheckCircle, Smartphone } from "lucide-react";
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

  const { type, phone } = (location.state as { type: string; phone?: string }) || {};

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
        title: "Kode tidak lengkap",
        description: "Masukkan 6 digit kode OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

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
        title: "Verifikasi Berhasil!",
        description: "Lanjutkan ke pembayaran",
      });
      
      navigate("/payment", { state: { type } });
    }, 1200);
  };

  const handleResend = () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);
    toast({
      title: "OTP Terkirim Ulang",
      description: "Kode baru telah dikirim",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
      {/* Header */}
      <div className="flex-shrink-0 pt-6 pb-4 px-4">
        <Link to="/login" className="inline-flex items-center text-emerald-200/80 text-sm mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Link>
        <div className="flex items-center gap-3">
          <img src={logoMpj} alt="MPJ" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-white">Verifikasi OTP</h1>
            <p className="text-xs text-emerald-200/70">Konfirmasi nomor Anda</p>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-card rounded-t-3xl px-5 pt-6 pb-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="h-7 w-7 text-emerald-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            Masukkan kode 6 digit yang dikirim ke
          </p>
          {phone && (
            <p className="text-sm font-semibold text-foreground mt-1">
              {phone}
            </p>
          )}
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
              className="w-11 h-12 text-center text-xl font-bold rounded-xl border-border/50 focus:border-emerald-500 bg-muted/30"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          disabled={isLoading || otp.join("").length !== 6}
          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          {isLoading ? "Memverifikasi..." : "Verifikasi"}
          {!isLoading && <CheckCircle className="ml-2 h-4 w-4" />}
        </Button>

        {/* Resend */}
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
              Kirim Ulang
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Kirim ulang dalam <span className="font-bold text-foreground">{resendTimer}s</span>
            </p>
          )}
        </div>

        {/* Demo Note */}
        <div className="mt-6 p-3 bg-muted/30 rounded-xl">
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-semibold">Demo:</span> Masukkan 6 digit apapun untuk lanjut
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;