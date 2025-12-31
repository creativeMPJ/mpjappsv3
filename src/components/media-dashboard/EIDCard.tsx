import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import EIDCardGenerator from "@/components/shared/EIDCardGenerator";

interface EIDCardProps {
  isGold: boolean;
}

const EIDCard = ({ isGold }: EIDCardProps) => {
  const { profile } = useAuth();

  if (!isGold) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">E-ID Card</h1>
          <p className="text-slate-500">Digital ID Card untuk lembaga dan kru Anda</p>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md bg-slate-100 relative overflow-hidden">
            <div className="blur-md opacity-50 pointer-events-none">
              <CardContent className="p-8">
                <div className="aspect-[1.6/1] bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-6" />
              </CardContent>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60">
              <div className="bg-white rounded-full p-4 mb-4 shadow-lg">
                <Lock className="h-12 w-12 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Fitur Terkunci</h3>
              <p className="text-slate-300 text-center mb-6 px-8">
                Upgrade ke status Gold untuk mengakses E-ID Card
              </p>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                <Shield className="h-4 w-4 mr-2" />
                Upgrade to Gold
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">E-ID Card</h1>
        <p className="text-slate-500">Digital ID Card untuk lembaga Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EIDCardGenerator
          type="lembaga"
          nomorId={profile?.nip || "25.00.000"}
          nama={profile?.nama_pesantren || "Pesantren Anda"}
          profileLevel={(profile?.profile_level as any) || "basic"}
        />

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-slate-800">Informasi ID Card</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">NIP</span>
                <span className="font-mono font-medium">{profile?.nip || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-amber-600">Gold Member</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-medium text-slate-800 mb-2">Cara Penggunaan</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• Tunjukkan QR Code saat registrasi event</li>
                <li>• Scan QR untuk verifikasi data lembaga</li>
                <li>• Download dan cetak untuk keperluan offline</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EIDCard;
