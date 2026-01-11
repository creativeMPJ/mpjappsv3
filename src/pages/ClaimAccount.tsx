import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Check, ArrowLeft, MapPin, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Mask name function for privacy
const maskName = (name: string) => {
  if (!name) return "***";
  const parts = name.split(" ");
  return parts.map(part => {
    if (part.length <= 2) return part;
    return part.slice(0, 3) + "**" + (part.length > 4 ? part.slice(-2) : "");
  }).join(" ");
};

interface PesantrenData {
  id: string;
  pesantren_name: string;
  kecamatan: string | null;
  nama_pengelola: string | null;
  email_pengelola: string | null;
  region_id: string | null;
  user_id: string;
  status: string;
}

type Step = "search" | "preview";

const ClaimAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data dari CheckInstitution
  const pesantrenFromSearch = location.state?.pesantrenName || null;
  const pesantrenIdFromSearch = location.state?.pesantrenId || null;
  const fromSearch = location.state?.fromSearch || false;

  const [step, setStep] = useState<Step>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [foundData, setFoundData] = useState<PesantrenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<PesantrenData[]>([]);

  // Auto-search jika datang dari CheckInstitution dengan pesantren terpilih
  useEffect(() => {
    if (fromSearch && pesantrenFromSearch) {
      searchPesantren(pesantrenFromSearch);
    }
  }, [fromSearch, pesantrenFromSearch]);

  const searchPesantren = async (query: string) => {
    setIsLoading(true);
    try {
      // Search pesantren_claims for unclaimed/pending institutions
      // Only show pesantren that are NOT yet approved (can be claimed)
      const { data, error } = await supabase
        .from("pesantren_claims")
        .select("*")
        .or(`pesantren_name.ilike.%${query}%,email_pengelola.ilike.%${query}%`)
        .not("status", "in", "(approved,pusat_approved)")
        .limit(10);

      if (error) {
        console.error("Search error:", error);
        toast({
          title: "Error Pencarian",
          description: "Terjadi kesalahan saat mencari data",
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        setSearchResults(data);
        if (data.length === 1) {
          setFoundData(data[0]);
          setStep("preview");
          toast({
            title: "Data Ditemukan!",
            description: "Silakan verifikasi data Anda",
          });
        }
      } else {
        toast({
          title: "Data Tidak Ditemukan",
          description: "Tidak ada pesantren yang cocok dengan pencarian",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Search error:", err);
      toast({
        title: "Error",
        description: "Terjadi kesalahan sistem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Input diperlukan",
        description: "Masukkan nama pesantren atau email pengelola",
        variant: "destructive",
      });
      return;
    }
    searchPesantren(searchQuery.trim());
  };

  const handleSelectPesantren = (pesantren: PesantrenData) => {
    setFoundData(pesantren);
    setStep("preview");
    setSearchResults([]);
  };

  const handleConfirm = async () => {
    if (!foundData) return;

    setIsLoading(true);

    try {
      // Get phone number from profiles table if available
      const { data: profileData } = await supabase
        .from("profiles")
        .select("no_wa_pendaftar")
        .eq("id", foundData.user_id)
        .single();

      const phone = profileData?.no_wa_pendaftar || "";

      if (!phone) {
        toast({
          title: "Nomor Tidak Ditemukan",
          description: "Nomor WhatsApp tidak tersedia untuk akun ini",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Call OTP send edge function
      const { data: otpResponse, error: otpError } = await supabase.functions.invoke("otp-send", {
        body: {
          phone: phone,
          pesantren_claim_id: foundData.id,
        },
      });

      if (otpError) {
        throw otpError;
      }

      toast({
        title: "OTP Terkirim!",
        description: otpResponse?.message || "Kode OTP telah dikirim ke nomor WhatsApp yang terdaftar",
      });

      // Navigate to OTP verification
      navigate("/verify-otp", {
        state: {
          type: "claim",
          phone: phone,
          pesantren_claim_id: foundData.id,
          otp_id: otpResponse?.otp_id,
          pesantren_name: foundData.pesantren_name,
          nama_pengaju: foundData.nama_pengelola,
        },
      });
    } catch (err: any) {
      console.error("OTP send error:", err);
      toast({
        title: "Gagal Mengirim OTP",
        description: err.message || "Terjadi kesalahan saat mengirim kode OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "preview") {
      setStep("search");
      setFoundData(null);
      return;
    }
    if (fromSearch) {
      navigate("/check-institution");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-primary/90 to-primary">
      {/* Header */}
      <div className="flex-shrink-0 pt-6 pb-4 px-4 safe-area-top">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-primary-foreground/80 text-sm mb-4 active:opacity-70 touch-manipulation"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </button>
        <div>
          <h1 className="text-xl font-bold text-primary-foreground">Klaim Akun</h1>
          <p className="text-xs text-primary-foreground/70">Migrasi Khodim Lama</p>
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-card rounded-t-3xl px-5 pt-5 pb-8 safe-area-bottom">
        {/* Pesantren Info dari CheckInstitution */}
        {fromSearch && pesantrenFromSearch && (
          <div className="mb-5 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pesantren Terpilih</p>
                <p className="font-semibold text-foreground">{pesantrenFromSearch}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Search */}
        {step === "search" && (
          <div className="space-y-5">
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                {fromSearch
                  ? "Verifikasi identitas Anda untuk mengklaim akun pesantren ini"
                  : "Masukkan nama pesantren atau email pengelola yang terdaftar"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm text-foreground">
                Nama Pesantren atau Email
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Nama pesantren atau email@example.com"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-12 rounded-xl border-border pr-12 bg-muted/30 focus:border-primary focus:ring-primary"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold touch-manipulation active:scale-[0.98] transition-transform"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mencari...
                </>
              ) : (
                "Cari Data Saya"
              )}
            </Button>

            {/* Search Results List */}
            {searchResults.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Pilih Pesantren:</p>
                {searchResults.map((pesantren) => (
                  <Card
                    key={pesantren.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectPesantren(pesantren)}
                  >
                    <CardContent className="p-3">
                      <p className="font-medium text-foreground">{pesantren.pesantren_name}</p>
                      {pesantren.kecamatan && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {pesantren.kecamatan}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Belum pernah terdaftar?{" "}
              <Link to="/check-institution" className="text-primary font-semibold">
                Daftar Baru
              </Link>
            </p>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && foundData && (
          <div className="space-y-5">
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="h-7 w-7 text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">Data Ditemukan</h2>
              <p className="text-sm text-muted-foreground">Apakah ini data Anda?</p>
            </div>

            <Card className="bg-muted/30 border-border">
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nama Pesantren</p>
                  <p className="text-sm font-semibold text-foreground">{foundData.pesantren_name}</p>
                </div>

                {foundData.kecamatan && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Kecamatan</p>
                      <p className="text-sm text-foreground">{foundData.kecamatan}</p>
                    </div>
                  </div>
                )}

                {foundData.nama_pengelola && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Nama Pengelola</p>
                    <p className="text-sm font-medium text-foreground">
                      {maskName(foundData.nama_pengelola)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      *Nama disamarkan untuk keamanan
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("search");
                  setFoundData(null);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="flex-1 h-12 rounded-xl border-border text-foreground hover:bg-muted touch-manipulation active:scale-[0.98] transition-transform"
              >
                Bukan, Cari Lagi
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground touch-manipulation active:scale-[0.98] transition-transform"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Ya, Kirim OTP"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimAccount;
