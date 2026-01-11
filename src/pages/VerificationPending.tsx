import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, LogOut, Home, MessageCircle, CheckCircle, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

interface ClaimData {
  pesantren_name: string;
  nama_pengelola: string | null;
  region_id: string | null;
  status: string;
}

interface RegionData {
  name: string;
  admin_phone?: string;
}

/**
 * VERIFICATION PENDING PAGE
 * 
 * Shown for users with pending claim status.
 * Features:
 * - Progress tracker showing verification stages
 * - Region-specific admin contact via WhatsApp
 * - Auto-refresh to check status updates
 * - Logout option
 */
const VerificationPending = () => {
  const navigate = useNavigate();
  const { signOut, user, profile } = useAuth();
  const { toast } = useToast();
  
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [regionData, setRegionData] = useState<RegionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchClaimData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch user's claim data
      const { data: claim, error: claimError } = await supabase
        .from('pesantren_claims')
        .select('pesantren_name, nama_pengelola, region_id, status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (claimError) {
        console.error('Error fetching claim:', claimError);
        return;
      }

      if (claim) {
        setClaimData(claim);

        // If status changed to approved, redirect to dashboard
        if (claim.status === 'approved' || claim.status === 'pusat_approved') {
          toast({
            title: "Akun Terverifikasi! ✅",
            description: "Selamat! Akun Anda telah aktif.",
          });
          navigate('/user', { replace: true });
          return;
        }

        // Fetch region data for admin contact
        if (claim.region_id) {
          const { data: region, error: regionError } = await supabase
            .from('regions')
            .select('name')
            .eq('id', claim.region_id)
            .maybeSingle();

          if (!regionError && region) {
            // Default admin contact - in production, fetch from admin_access table
            setRegionData({
              name: region.name,
              admin_phone: '6281234567890' // Default admin phone
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchClaimData:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    fetchClaimData();
  }, [fetchClaimData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        fetchClaimData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchClaimData, isRefreshing]);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    await fetchClaimData();
    toast({
      title: "Status Diperbarui",
      description: "Data status telah dimuat ulang.",
    });
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Berhasil Keluar",
      description: "Sampai jumpa kembali!",
    });
    navigate("/login", { replace: true });
  };

  const handleContactAdmin = () => {
    const pengaju = claimData?.nama_pengelola || 'Pengaju';
    const pesantren = claimData?.pesantren_name || 'Pesantren';
    const phone = regionData?.admin_phone || '6281234567890';
    
    const message = encodeURIComponent(
      `Assalamu'alaikum Admin,\n\nSaya ${pengaju} ingin menanyakan status verifikasi klaim untuk ${pesantren}.\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-8 text-center">
            <img src={logoMpj} alt="MPJ Logo" className="h-12 w-auto mx-auto mb-4" />
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Permohonan Anda Sedang Kami Verifikasi
            </h1>
            <p className="text-emerald-100 text-sm">
              Mohon tunggu konfirmasi dari Admin Regional
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800 leading-relaxed">
                Alhamdulillah, data pesantren <span className="font-semibold">{claimData?.pesantren_name || 'Anda'}</span> telah masuk ke sistem kami. 
                {regionData?.name && (
                  <> Saat ini Admin Regional <span className="font-semibold">{regionData.name}</span> sedang melakukan pengecekan berkas untuk menjaga keaslian data.</>
                )}
              </p>
            </div>

            {/* Progress Tracker */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground mb-4">Tahapan Verifikasi</h3>
              
              {/* Step 1: Data Terkirim */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-0.5 h-8 bg-emerald-300 mt-1" />
                </div>
                <div className="pt-2">
                  <p className="text-sm font-medium text-foreground">Data Terkirim</p>
                  <p className="text-xs text-muted-foreground">Berkas klaim telah diterima</p>
                </div>
              </div>

              {/* Step 2: Verifikasi Admin */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                </div>
                <div className="pt-2">
                  <p className="text-sm font-medium text-amber-700">Verifikasi Admin Regional</p>
                  <p className="text-xs text-muted-foreground">Dalam proses pengecekan</p>
                </div>
              </div>

              {/* Step 3: Akun Aktif */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="pt-2 opacity-50">
                  <p className="text-sm font-medium text-foreground">Akun Aktif & NIAM Terbit</p>
                  <p className="text-xs text-muted-foreground">Menunggu verifikasi selesai</p>
                </div>
              </div>
            </div>

            {/* Estimation Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-muted-foreground text-center">
                ⏱️ Proses ini biasanya memakan waktu <span className="font-medium text-foreground">1x24 jam</span> pada hari kerja.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Refresh Status */}
              <Button
                variant="outline"
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="w-full h-11 gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Memperbarui...' : 'Cek Status Terbaru'}
              </Button>

              {/* Contact Admin */}
              <Button
                onClick={handleContactAdmin}
                className="w-full h-11 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi Admin Regional
              </Button>

              {/* Secondary Actions */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="flex-1 h-10 gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Home className="w-4 h-4" />
                  Beranda
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex-1 h-10 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Halaman otomatis memperbarui setiap 30 detik
        </p>
      </div>
    </div>
  );
};

export default VerificationPending;
