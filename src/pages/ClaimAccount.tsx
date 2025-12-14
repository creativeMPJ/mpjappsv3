import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Check, ArrowRight, Gift, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

// Mock legacy data for simulation
const mockLegacyData = [
  { id: 1, email: "alhikmah@mpj.com", phone: "081234567890", pesantren: "PP Al Hikmah", namaMedia: "Media Al Hikmah" },
  { id: 2, email: "annur@mpj.com", phone: "082345678901", pesantren: "PP An Nur", namaMedia: "Media An Nur" },
  { id: 3, email: "darussalam@mpj.com", phone: "083456789012", pesantren: "PP Darussalam", namaMedia: "Darussalam Media" },
];

type Step = "search" | "preview" | "confirm";

const ClaimAccount = () => {
  const [step, setStep] = useState<Step>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [foundData, setFoundData] = useState<typeof mockLegacyData[0] | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mask data for preview
  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
  };

  const maskPhone = (phone: string) => {
    return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Input diperlukan",
        description: "Masukkan email atau nomor HP yang terdaftar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API search
    setTimeout(() => {
      const found = mockLegacyData.find(
        (item) => item.email === searchQuery || item.phone === searchQuery
      );

      if (found) {
        setFoundData(found);
        setStep("preview");
        toast({
          title: "Data Ditemukan! ✅",
          description: "Silakan verifikasi data Anda",
        });
      } else {
        toast({
          title: "Data Tidak Ditemukan",
          description: "Email/No. HP tidak terdaftar di database legacy. Silakan daftar baru.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleConfirm = () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Password diperlukan",
        description: "Buat password minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Save claim data with origin_source
    const claimData = {
      ...foundData,
      newPassword,
      origin_source: "claim",
      tagihan: 20000,
      status: "pending_otp",
      claimedAt: new Date().toISOString(),
    };
    localStorage.setItem("mpj_pending_claim", JSON.stringify(claimData));

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Konfirmasi Berhasil! ✅",
        description: "OTP akan dikirim ke nomor Anda",
      });
      navigate("/verify-otp", { state: { type: "claim", email: foundData?.email, phone: foundData?.phone } });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-4 py-8">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/20">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={logoMpj} alt="Media Pondok Jawa Timur" className="h-14 object-contain" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Klaim Akun Khodim Lama 🔐
            </h1>
            <p className="text-muted-foreground text-sm">
              Aktivasi ulang akun legacy Anda dengan diskon
            </p>
          </div>

          {/* Discount Banner */}
          <div className="mb-6 p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Tarif Aktivasi: Rp 20.000</p>
              <p className="text-xs text-muted-foreground">Hemat Rp 30.000 dari tarif normal!</p>
            </div>
          </div>

          {/* Step 1: Search */}
          {step === "search" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-foreground">Email atau No. HP Terdaftar</Label>
                <div className="relative">
                  <Input
                    id="search"
                    type="text"
                    placeholder="email@example.com atau 08xxx"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 rounded-xl border-border/50 focus:border-primary pr-12 bg-background"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {isLoading ? "Mencari..." : "Cari Data Saya"}
                {!isLoading && <Search className="ml-2 h-4 w-4" />}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                * Gunakan email atau nomor HP yang terdaftar pada sistem MPJ sebelumnya
              </p>
            </div>
          )}

          {/* Step 2: Preview Data */}
          {step === "preview" && foundData && (
            <div className="space-y-4">
              <Card className="bg-muted/30 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Data Ditemukan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pesantren</span>
                    <span className="text-sm font-medium text-foreground">{foundData.pesantren}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nama Media</span>
                    <span className="text-sm font-medium text-foreground">{foundData.namaMedia}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm font-medium text-foreground">{maskEmail(foundData.email)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">No. HP</span>
                    <span className="text-sm font-medium text-foreground">{maskPhone(foundData.phone)}</span>
                  </div>
                </CardContent>
              </Card>

              <p className="text-sm text-center text-foreground">
                Apakah ini data Anda?
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("search");
                    setFoundData(null);
                    setSearchQuery("");
                  }}
                  className="flex-1 h-11 rounded-xl border-border/50"
                >
                  Bukan, Cari Lagi
                </Button>
                <Button
                  onClick={() => setStep("confirm")}
                  className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Ya, Ini Saya
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Set New Password */}
          {step === "confirm" && foundData && (
            <div className="space-y-4">
              <Card className="bg-emerald-500/10 border-emerald-500/30">
                <CardContent className="pt-4">
                  <p className="text-sm text-center text-foreground">
                    Mengaktifkan: <span className="font-bold">{foundData.pesantren}</span>
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">Buat Password Baru</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 rounded-xl border-border/50 focus:border-primary pr-12 bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                {isLoading ? "Memproses..." : "Konfirmasi & Kirim OTP"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setStep("preview")}
                className="w-full text-muted-foreground"
              >
                Kembali
              </Button>
            </div>
          )}

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Belum pernah terdaftar?{" "}
              <Link to="/register" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
                Daftar Baru
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimAccount;