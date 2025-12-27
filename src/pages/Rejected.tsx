import { XCircle, Phone, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import logoMPJ from "@/assets/logo-mpj.png";

const Rejected = () => {
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <img src={logoMPJ} alt="MPJ Logo" className="h-10" />
        <Button variant="ghost" onClick={handleLogout}>
          Keluar
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader className="pb-4">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">
              Pendaftaran Ditolak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Maaf, pendaftaran akun Anda tidak dapat disetujui. 
              Silakan hubungi Admin Regional untuk informasi lebih lanjut.
            </p>

            {/* Status Info */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-red-800 mb-2">Detail Penolakan</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-red-600 capitalize">
                    Ditolak
                  </span>
                </div>
                {profile?.nama_pesantren && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pesantren:</span>
                    <span className="font-medium">{profile.nama_pesantren}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-left">
              <p className="text-muted-foreground">
                Kemungkinan alasan penolakan:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Data tidak lengkap atau tidak valid</li>
                <li>Dokumen pendukung tidak sesuai</li>
                <li>Pesantren tidak terdaftar di wilayah</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                className="w-full"
                asChild
              >
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20menanyakan%20alasan%20penolakan%20akun%20saya."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Hubungi Admin untuk Klarifikasi
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link to="/institution-submission">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Ajukan Pendaftaran Ulang
                </Link>
              </Button>
              <Link to="/">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Rejected;
