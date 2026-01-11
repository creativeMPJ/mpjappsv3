import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, RefreshCw, CheckCircle, Smartphone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    type,
    phone,
    pesantren_claim_id,
    otp_id,
    pesantren_name,
  } = (location.state as {
    type: string;
    phone?: string;
    pesantren_claim_id?: string;
    otp_id?: string;
    pesantren_name?: string;
  }) || {};

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Handle paste
    if (value.length > 1) {
      const pastedValue = value.replace(/\D/g, "").slice(0, 6).split("");
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

    // Only allow digits
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

  const handleVerify = async () => {
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

    try {
      // Call OTP verify edge function
      const { data, error } = await supabase.functions.invoke("otp-verify", {
        body: {
          phone: phone,
          otp_code: otpCode,
          otp_id: otp_id,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        if (data.expired) {
          toast({
            title: "Kode Kadaluarsa",
            description: "Kode OTP sudah tidak berlaku. Silakan minta kode baru.",
            variant: "destructive",
          });
        } else if (data.max_attempts) {
          toast({
            title: "Terlalu Banyak Percobaan",
            description: "Silakan minta kode OTP baru.",
            variant: "destructive",
          });
          setAttemptsRemaining(0);
        } else {
          toast({
            title: "Kode Salah",
            description: `${data.error}. Sisa percobaan: ${data.attempts_remaining}`,
            variant: "destructive",
          });
          setAttemptsRemaining(data.attempts_remaining);
        }
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      // Success
      toast({
        title: "Verifikasi Berhasil!",
        description: "Klaim berhasil. Akun Anda sedang dalam antrean verifikasi Regional.",
      });

      // Navigate based on type
      if (type === "claim") {
        navigate("/claim-success", {
          state: {
            pesantren_name: pesantren_name,
            nama_pengaju: (location.state as any)?.nama_pengaju || "Pengaju",
          },
          replace: true,
        });
      } else if (type === "register") {
        navigate("/payment", { state: { type }, replace: true });
      } else {
        navigate("/verification-pending", { replace: true });
      }
    } catch (err: any) {
      console.error("OTP verify error:", err);
      toast({
        title: "Gagal Memverifikasi",
        description: err.message || "Terjadi kesalahan saat memverifikasi OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !phone) return;

    setIsResending(true);

    try {
      const { data, error } = await supabase.functions.invoke("otp-send", {
        body: {
          phone: phone,
          pesantren_claim_id: pesantren_claim_id,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "OTP Terkirim Ulang",
        description: data?.message || "Kode baru telah dikirim ke nomor WhatsApp Anda",
      });

      setCanResend(false);
      setResendTimer(60);
      setAttemptsRemaining(5);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      console.error("Resend error:", err);
      toast({
        title: "Gagal Mengirim Ulang",
        description: err.message || "Terjadi kesalahan saat mengirim ulang OTP",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-primary/90 to-primary">
      {/* Header */}
      <div className="flex-shrink-0 pt-6 pb-4 px-4">
        <Link
          to="/login"
          className="inline-flex items-center text-primary-foreground/80 text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-foreground">Verifikasi OTP</h1>
          <p className="text-xs text-primary-foreground/70">Konfirmasi nomor Anda</p>
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
            <p className="text-sm font-semibold text-foreground mt-1">{phone}</p>
          )}
          {pesantren_name && (
            <p className="text-xs text-muted-foreground mt-2">
              untuk klaim: <span className="font-medium">{pesantren_name}</span>
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
              disabled={attemptsRemaining === 0}
            />
          ))}
        </div>

        {/* Attempts remaining warning */}
        {attemptsRemaining < 5 && attemptsRemaining > 0 && (
          <p className="text-center text-sm text-amber-600 mb-4">
            Sisa percobaan: {attemptsRemaining}
          </p>
        )}

        <Button
          onClick={handleVerify}
          disabled={isLoading || otp.join("").length !== 6 || attemptsRemaining === 0}
          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold touch-manipulation active:scale-[0.98] transition-transform"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memverifikasi...
            </>
          ) : (
            <>
              Verifikasi
              <CheckCircle className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {/* Resend */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Tidak menerima kode?</p>
          {canResend ? (
            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={isResending}
              className="text-amber-500 hover:text-amber-400"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Kirim Ulang
                </>
              )}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Kirim ulang dalam{" "}
              <span className="font-bold text-foreground">{resendTimer}s</span>
            </p>
          )}
        </div>

        {/* Info Note */}
        <div className="mt-6 p-3 bg-muted/30 rounded-xl">
          <p className="text-xs text-center text-muted-foreground">
            Kode OTP berlaku selama 10 menit dan hanya dapat digunakan satu kali.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
