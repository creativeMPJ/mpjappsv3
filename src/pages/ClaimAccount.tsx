import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Check, ArrowLeft, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

// Mock legacy data with demo account
const mockLegacyData = [
  { 
    id: 1, 
    email: "alhikmah@mpj.com", 
    phone: "081234567890", 
    pesantren: "PP Al Hikmah",
    alamat: "Jl. Raya Karangbesuki No. 123, Malang",
    pendaftar: "Ahmad Fauzi"
  },
  { 
    id: 2, 
    email: "demo@mpj.com", 
    phone: "082345678901", 
    pesantren: "PP An Nur Bululawang",
    alamat: "Jl. Raya Bululawang No. 45, Kabupaten Malang",
    pendaftar: "Muhammad Ridwan"
  },
  { 
    id: 3, 
    email: "darussalam@mpj.com", 
    phone: "083456789012", 
    pesantren: "PP Darussalam Gontor",
    alamat: "Jl. Raya Gontor, Ponorogo",
    pendaftar: "Abdul Karim"
  },
];

// Mask name function
const maskName = (name: string) => {
  const parts = name.split(" ");
  return parts.map(part => {
    if (part.length <= 2) return part;
    return part.slice(0, 3) + "**" + (part.length > 4 ? part.slice(-2) : "");
  }).join(" ");
};

type Step = "search" | "preview";

const ClaimAccount = () => {
  const [step, setStep] = useState<Step>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [foundData, setFoundData] = useState<typeof mockLegacyData[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Input diperlukan",
        description: "Masukkan email atau nomor HP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const found = mockLegacyData.find(
        (item) => item.email === searchQuery || item.phone === searchQuery
      );

      if (found) {
        setFoundData(found);
        setStep("preview");
        toast({
          title: "Data Ditemukan!",
          description: "Silakan verifikasi data Anda",
        });
      } else {
        toast({
          title: "Data Tidak Ditemukan",
          description: "Email/No. HP tidak terdaftar di database legacy",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleConfirm = () => {
    setIsLoading(true);

    // Save claim data
    const claimData = {
      ...foundData,
      origin_source: "claim",
      status: "pending_otp",
      claimedAt: new Date().toISOString(),
    };
    localStorage.setItem("mpj_pending_claim", JSON.stringify(claimData));

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Konfirmasi Berhasil!",
        description: "OTP akan dikirim ke nomor Anda",
      });
      navigate("/verify-otp", { state: { type: "claim", phone: foundData?.phone } });
    }, 800);
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
            <h1 className="text-lg font-bold text-white">Klaim Akun</h1>
            <p className="text-xs text-emerald-200/70">Migrasi Khodim Lama</p>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-card rounded-t-3xl px-5 pt-5 pb-8">
        {/* Step 1: Search */}
        {step === "search" && (
          <div className="space-y-5">
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                Masukkan email atau nomor HP yang terdaftar pada sistem MPJ sebelumnya
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm">Email atau No. HP Terdaftar</Label>
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="email@example.com atau 08xxx"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-xl border-border/50 pr-12 bg-muted/30"
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
            </Button>

            {/* Demo Account Info */}
            <div className="p-3 bg-muted/30 rounded-xl">
              <p className="text-xs text-center text-muted-foreground mb-1 font-medium">Demo Akun Legacy:</p>
              <p className="text-xs text-center text-muted-foreground">demo@mpj.com atau 082345678901</p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Belum pernah terdaftar?{" "}
              <Link to="/register" className="text-emerald-500 font-semibold">
                Daftar Baru
              </Link>
            </p>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && foundData && (
          <div className="space-y-5">
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="h-7 w-7 text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">Data Ditemukan</h2>
              <p className="text-sm text-muted-foreground">Apakah ini data Anda?</p>
            </div>

            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nama Pesantren</p>
                  <p className="text-sm font-semibold text-foreground">{foundData.pesantren}</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Alamat</p>
                    <p className="text-sm text-foreground">{foundData.alamat}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Nama Pendaftar</p>
                  <p className="text-sm font-medium text-foreground">{maskName(foundData.pendaftar)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">*Nama disamarkan untuk keamanan</p>
                </div>
              </CardContent>
            </Card>

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
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isLoading ? "Memproses..." : "Ya, Kirim OTP"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimAccount;