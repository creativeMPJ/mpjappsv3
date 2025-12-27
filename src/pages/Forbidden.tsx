import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import logoMPJ from "@/assets/logo-mpj.png";

const Forbidden = () => {
  const { role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  // Determine correct dashboard based on role
  const getDashboardPath = () => {
    switch (role) {
      case 'admin_pusat':
        return '/dashboard';
      case 'admin_regional':
        return '/regional-dashboard';
      case 'user':
      default:
        return '/media-dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
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
            <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="w-10 h-10 text-slate-600" />
            </div>
            <CardTitle className="text-2xl text-slate-800">
              Akses Ditolak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Anda tidak memiliki izin untuk mengakses halaman ini.
              Silakan kembali ke dashboard yang sesuai dengan peran Anda.
            </p>

            {/* Role Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Peran Anda:</span>
                <span className="font-medium capitalize">
                  {role?.replace('_', ' ') || 'User'}
                </span>
              </div>
            </div>

            {/* Error Code */}
            <div className="text-6xl font-bold text-slate-200">403</div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                className="w-full"
                onClick={() => navigate(getDashboardPath())}
              >
                <Home className="mr-2 h-4 w-4" />
                Ke Dashboard Saya
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Forbidden;
