import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Search, Info, Plus, MapPin, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Mock data pesantren terdaftar (will be replaced with real data later)
const registeredPesantren = [
  { id: 1, name: "Darul Ulum Jombang", region: "Jombang", alamat: "Jl. Raya Peterongan, Jombang" },
  { id: 2, name: "Darul Ulum Peterongan", region: "Jombang", alamat: "Jl. Peterongan No. 10, Jombang" },
  { id: 3, name: "Tebuireng Jombang", region: "Jombang", alamat: "Jl. Irian Jaya No. 10, Jombang" },
  { id: 4, name: "Lirboyo Kediri", region: "Kediri", alamat: "Jl. KH. Abdul Karim, Kediri" },
  { id: 5, name: "Sidogiri Pasuruan", region: "Pasuruan", alamat: "Jl. Sidogiri, Pasuruan" },
  { id: 6, name: "PeTIK Jombang", region: "Jombang", alamat: "Jl. Raya Diwek, Jombang" },
];

const CheckInstitution = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPesantren, setSelectedPesantren] = useState<typeof registeredPesantren[0] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(true);

  /**
   * GLOBAL GUARD: Check if user already has an approved pesantren claim
   * If yes, block access and redirect to dashboard
   */
  useEffect(() => {
    const checkPesantrenOwnership = async () => {
      if (authLoading) return;
      
      // If user is logged in, check their claim status
      if (user) {
        try {
          const { data: claim, error } = await supabase
            .from('pesantren_claims')
            .select('status, pesantren_name')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error checking ownership:', error);
            setIsCheckingOwnership(false);
            return;
          }

          if (claim && (claim.status === 'approved' || claim.status === 'pusat_approved')) {
            // LOCK: User already has an approved pesantren
            toast({
              title: "Akses Ditolak",
              description: `Akun Anda sudah terdaftar sebagai pengelola "${claim.pesantren_name}". Satu akun hanya boleh mengelola satu pesantren.`,
              variant: "destructive",
            });
            navigate('/user', { replace: true });
            return;
          }

          // If user has pending claim, redirect to verification
          if (claim && (claim.status === 'pending' || claim.status === 'regional_approved')) {
            navigate('/verification-pending', { replace: true });
            return;
          }
        } catch (error) {
          console.error('Error in ownership check:', error);
        }
      }
      
      setIsCheckingOwnership(false);
    };

    checkPesantrenOwnership();
  }, [user, authLoading, navigate, toast]);

  const filteredPesantren = registeredPesantren.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPesantren = (pesantren: typeof registeredPesantren[0]) => {
    setSelectedPesantren(pesantren);
    setSearchQuery(pesantren.name);
    setShowDropdown(false);
  };

  const handleClaimAccount = () => {
    if (selectedPesantren) {
      navigate("/claim-account", { 
        state: { 
          pesantrenId: selectedPesantren.id,
          pesantrenName: selectedPesantren.name,
          fromSearch: true 
        } 
      });
    }
  };

  const handleNewSubmission = () => {
    navigate("/institution-submission", { 
      state: { searchedName: searchQuery.trim() } 
    });
  };

  const showNotFoundState = searchQuery.length > 0 && filteredPesantren.length === 0;

  // Show loading while checking ownership
  if (authLoading || isCheckingOwnership) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Memeriksa status kepemilikan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Cari Pesantren</h1>
          <p className="text-muted-foreground text-sm">Jadi bagian dari MPJ</p>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Label */}
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Building2 className="w-5 h-5" />
            <span>Pilih Pesantren</span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari nama pesantren..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedPesantren(null);
                  setShowDropdown(e.target.value.length > 0);
                }}
                onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Dropdown Results */}
            {showDropdown && filteredPesantren.length > 0 && !selectedPesantren && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredPesantren.map((pesantren) => (
                  <button
                    key={pesantren.id}
                    onClick={() => handleSelectPesantren(pesantren)}
                    className="w-full px-4 py-3 text-left hover:bg-muted flex items-center justify-between border-b border-border last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{pesantren.name}</p>
                      <p className="text-sm text-muted-foreground">{pesantren.region}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Pesantren Card - FOUND STATE */}
          {selectedPesantren && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{selectedPesantren.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedPesantren.alamat}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleClaimAccount}
                  className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Klaim Akun Ini
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Not Found State */}
          {showNotFoundState && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">Pesantren tidak ditemukan</p>
              <p className="text-muted-foreground text-sm mb-4">"{searchQuery}" belum terdaftar di sistem</p>
              <Button
                onClick={handleNewSubmission}
                className="w-full h-12 font-semibold rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajukan Pesantren & Buat Akun
              </Button>
            </div>
          )}

          {/* Quick Add Link */}
          {!selectedPesantren && !showNotFoundState && (
            <button
              onClick={handleNewSubmission}
              className="w-full text-primary font-semibold text-sm flex items-center justify-center gap-1 py-2 hover:underline"
            >
              <Plus className="w-4 h-4" />
              Ajukan Pesantren Baru
            </button>
          )}
        </div>

        {/* Warning Box */}
        <div className="mt-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
          <div className="flex-shrink-0">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          </div>
          <div>
            <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
              <span className="font-semibold">Catatan:</span> Sebelum mengajukan pesantren baru, pastikan untuk memeriksa daftar terlebih dahulu. Ajukan hanya jika pesantren Anda benar-benar belum terdaftar.
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Sudah punya akun?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary font-semibold hover:underline"
            >
              Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckInstitution;