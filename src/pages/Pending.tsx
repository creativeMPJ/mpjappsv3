import { Clock, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import logoMPJ from "@/assets/logo-mpj.png";

const Pending = () => {
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
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
            <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-amber-800">
              Menunggu Verifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Akun Anda sedang dalam proses verifikasi oleh Admin Regional.
              Anda akan mendapat notifikasi setelah akun diaktifkan.
            </p>

            {/* Status Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-amber-800 mb-2">Status Akun</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-amber-600 capitalize">
                    {profile?.status_account || 'Pending'}
                  </span>
                </div>
                {profile?.nama_pesantren && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pesantren:</span>
                    <span className="font-medium">{profile.nama_pesantren}</span>
                  </div>
                )}
                {profile?.nama_media && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Media:</span>
                    <span className="font-medium">{profile.nama_media}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <span className="text-sm">Pendaftaran Terkirim</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-amber-700">Verifikasi Admin</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-muted-foreground/30 rounded-full" />
                </div>
                <span className="text-sm text-muted-foreground">Akun Aktif</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20menanyakan%20status%20verifikasi%20akun%20saya."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Hubungi Admin via WhatsApp
                </a>
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

export default Pending;
