import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, MessageCircle, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import logoMpj from "@/assets/logo-mpj.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * CLAIM SUCCESS PAGE
 * 
 * Shown after successful OTP verification for account claim.
 * Provides WhatsApp link to contact Admin Regional for faster verification.
 */
const ClaimSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [adminPhone, setAdminPhone] = useState<string | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  const { pesantren_name, nama_pengaju } = (location.state as {
    pesantren_name?: string;
    nama_pengaju?: string;
  }) || {};

  // Fetch admin regional phone number based on user's region
  useEffect(() => {
    const fetchAdminPhone = async () => {
      if (!profile?.region_id) {
        setLoadingAdmin(false);
        return;
      }

      try {
        // Get admin regional for the user's region
        const { data: adminData } = await supabase
          .from('profiles')
          .select('no_wa_pendaftar')
          .eq('region_id', profile.region_id)
          .eq('role', 'admin_regional')
          .not('no_wa_pendaftar', 'is', null)
          .limit(1)
          .single();

        if (adminData?.no_wa_pendaftar) {
          setAdminPhone(adminData.no_wa_pendaftar);
        }
      } catch (error) {
        console.error('Error fetching admin phone:', error);
      } finally {
        setLoadingAdmin(false);
      }
    };

    fetchAdminPhone();
  }, [profile?.region_id]);

  const handleContactAdmin = () => {
    const phone = adminPhone?.replace(/^0/, '62') || '6281234567890';
    const message = encodeURIComponent(
      `Assalamu'alaikum,\n\nSaya *${nama_pengaju || 'Pengaju'}* ingin melaporkan klaim akun untuk *${pesantren_name || 'Pesantren'}*.\n\nMohon bantuannya untuk verifikasi.\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // Redirect if no state (direct access)
  useEffect(() => {
    if (!pesantren_name) {
      navigate('/verification-pending', { replace: true });
    }
  }, [pesantren_name, navigate]);

  if (!pesantren_name) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-emerald-50/50 dark:from-emerald-950/20 dark:via-background dark:to-emerald-950/10 p-4">
      {/* Logo */}
      <div className="mb-6">
        <img src={logoMpj} alt="MPJ Logo" className="h-14 w-auto" />
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md shadow-lg border-emerald-200 dark:border-emerald-800">
        <CardHeader className="text-center pb-4">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          <CardTitle className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            Klaim Berhasil Dikirim!
          </CardTitle>
          <CardDescription className="text-base">
            Akun Anda sedang dalam antrean verifikasi Regional
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Pesantren Info */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center">
            <p className="text-sm text-muted-foreground mb-1">Pesantren yang diklaim:</p>
            <p className="font-semibold text-foreground text-lg">{pesantren_name}</p>
          </div>

          {/* Status Info */}
          <div className="p-4 bg-muted/50 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Menunggu Verifikasi
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Untuk mempercepat proses verifikasi, silakan hubungi Admin Regional melalui WhatsApp.
            </p>
          </div>

          {/* Contact Admin Button */}
          <div className="space-y-3">
            <Button
              onClick={handleContactAdmin}
              disabled={loadingAdmin}
              className="w-full h-12 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loadingAdmin ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memuat...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Lapor via WhatsApp
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Klik untuk menghubungi Admin Regional agar segera diverifikasi
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-semibold text-foreground">Tahapan Selanjutnya:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">✓</span>
                </div>
                <span className="text-sm text-foreground">Klaim akun berhasil dikirim</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">2</span>
                </div>
                <span className="text-sm text-foreground font-medium">Verifikasi Admin Regional</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-bold">3</span>
                </div>
                <span className="text-sm text-muted-foreground">Pembayaran & Aktivasi Akun</span>
              </div>
            </div>
          </div>

          {/* Home Button */}
          <div className="pt-2">
            <Link to="/">
              <Button variant="ghost" className="w-full h-11 gap-2">
                <Home className="w-4 h-4" />
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimSuccess;
