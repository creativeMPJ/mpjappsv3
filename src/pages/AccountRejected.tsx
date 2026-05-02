import { useNavigate } from "react-router-dom";
import { XCircle, MessageCircle, Home, RefreshCw, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

/**
 * ACCOUNT REJECTED PAGE
 * 
 * Shown for users with status_account = 'rejected'.
 * Features:
 * - Clear rejection notification
 * - Guidance for next steps
 * - Contact admin guidance
 * - Option to re-register
 */
const AccountRejected = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Berhasil Keluar",
      description: "Silakan hubungi admin jika membutuhkan bantuan.",
    });
    navigate("/login", { replace: true });
  };

  const handleContactAdmin = () => {
    toast({
      title: "Kontak Admin",
      description: "Hubungi admin MPJ melalui kanal resmi jika membutuhkan bantuan.",
    });
  };

  const handleReRegister = async () => {
    await signOut();
    navigate("/check-institution", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-center">
            <img src={logoMpj} alt="MPJ Logo" className="h-12 w-auto mx-auto mb-4" />
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Pengajuan Ditolak
            </h1>
            <p className="text-red-100 text-sm">
              Mohon maaf, pengajuan akun Anda tidak dapat diproses
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Rejection Info */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">
                    Alasan Penolakan
                  </p>
                  <p className="text-sm text-red-700 leading-relaxed">
                    Pengajuan Anda ditolak karena dokumen pendukung tidak memenuhi persyaratan atau data yang diajukan tidak valid. Silakan hubungi Admin untuk informasi lebih detail.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Langkah Selanjutnya
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Hubungi Admin</span> untuk mengetahui alasan penolakan secara detail
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Perbaiki dokumen</span> sesuai dengan persyaratan yang ditentukan
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Daftar ulang</span> dengan dokumen yang sudah diperbaiki
                  </p>
                </div>
              </div>
            </div>

            {/* Requirements Reminder */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">Dokumen yang diperlukan:</span><br />
                - SK Pesantren / Surat Tugas Pengelola<br />
                - Ukuran file maksimal 1MB<br />
                - Format: PDF, JPG, PNG, atau WebP
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Contact Admin */}
              <Button
                onClick={handleContactAdmin}
                className="w-full h-11 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi Admin MPJ
              </Button>

              {/* Re-register */}
              <Button
                variant="outline"
                onClick={handleReRegister}
                className="w-full h-11 gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <RefreshCw className="w-4 h-4" />
                Daftar Ulang dengan Akun Baru
              </Button>

              {/* Home */}
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="w-full h-10 gap-2 text-muted-foreground hover:text-foreground"
              >
                <Home className="w-4 h-4" />
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Butuh bantuan? Hubungi admin MPJ melalui kanal resmi.
        </p>
      </div>
    </div>
  );
};

export default AccountRejected;
