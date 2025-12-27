import { ShieldX, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logoMPJ from "@/assets/logo-mpj.png";

/**
 * FORBIDDEN (403) PAGE
 * 
 * Terminal page.
 * No dashboard auto-redirect.
 * Only Back / Logout allowed.
 */
const Forbidden = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  // Format role for display
  const formatRole = (role: string | undefined) => {
    if (!role) return 'User';
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <img src={logoMPJ} alt="MPJ Logo" className="h-10" />
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
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
            </p>

            {/* Role Info - Read-only */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Peran Anda:</span>
                <span className="font-medium">
                  {formatRole(profile?.role)}
                </span>
              </div>
            </div>

            {/* Error Code */}
            <div className="text-6xl font-bold text-slate-200">403</div>

            {/* Actions - Only Back and Logout allowed */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                variant="outline"
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
