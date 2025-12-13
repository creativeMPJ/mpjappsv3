import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Download, QrCode, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EIDCardProps {
  isGold: boolean;
}

const EIDCard = ({ isGold }: EIDCardProps) => {
  const handleDownload = () => {
    toast({
      title: "Download Dimulai",
      description: "ID Card sedang diproses via Node.js API...",
    });
  };

  if (!isGold) {
    // Locked State for Basic Users
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">E-ID Card</h1>
          <p className="text-slate-500">Digital ID Card untuk lembaga dan kru Anda</p>
        </div>

        <div className="flex items-center justify-center min-h-[500px]">
          <Card className="w-full max-w-md bg-slate-100 relative overflow-hidden">
            {/* Blurred Preview */}
            <div className="blur-md opacity-50 pointer-events-none">
              <CardContent className="p-8">
                <div className="aspect-[3/4] bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-6 text-white">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">MPJ APPS</h2>
                    <p className="text-sm text-emerald-200">Media Pondok Jawa Timur</p>
                  </div>
                  <div className="h-24 w-24 mx-auto bg-white/20 rounded-full mb-4" />
                  <div className="text-center space-y-2">
                    <div className="h-4 bg-white/20 rounded w-3/4 mx-auto" />
                    <div className="h-3 bg-white/20 rounded w-1/2 mx-auto" />
                  </div>
                  <div className="mt-8 h-20 w-20 mx-auto bg-white/20 rounded" />
                </div>
              </CardContent>
            </div>

            {/* Lock Overlay */}
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

  // Unlocked State for Gold Users
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">E-ID Card</h1>
          <p className="text-slate-500">Digital ID Card untuk lembaga dan kru Anda</p>
        </div>
        <Button onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="h-4 w-4 mr-2" />
          Download PNG
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ID Card Preview */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-8">
            <div className="aspect-[3/4] bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl">
              {/* Wave Pattern */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3">
                <svg viewBox="0 0 400 150" className="w-full h-full opacity-20">
                  <path
                    d="M0 50 Q100 0 200 50 T400 50 L400 150 L0 150 Z"
                    fill="white"
                  />
                  <path
                    d="M0 70 Q100 20 200 70 T400 70 L400 150 L0 150 Z"
                    fill="white"
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold tracking-wide">MPJ APPS</h2>
                  <p className="text-sm text-emerald-200">Media Pondok Jawa Timur</p>
                </div>

                <div className="h-28 w-28 mx-auto bg-white rounded-full mb-4 flex items-center justify-center text-emerald-700 text-3xl font-bold shadow-lg">
                  AF
                </div>

                <div className="text-center space-y-1 mb-6">
                  <h3 className="text-xl font-bold">Ahmad Fauzi</h3>
                  <p className="text-emerald-200">Koordinator Media</p>
                  <p className="text-sm text-emerald-300">PP. Nurul Huda</p>
                </div>

                <div className="flex justify-center mb-4">
                  <div className="bg-white p-3 rounded-lg shadow-lg">
                    <QrCode className="h-16 w-16 text-emerald-700" />
                  </div>
                </div>

                <p className="text-center text-xs text-emerald-300">
                  ID: MPJ-2024-001234
                </p>
              </div>

              {/* Gold Badge */}
              <div className="absolute top-4 right-4">
                <div className="bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  GOLD
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Informasi ID Card</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-medium text-amber-600">Gold Member</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Berlaku Hingga</span>
                  <span className="font-medium">31 Desember 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Card Number</span>
                  <span className="font-medium">MPJ-2024-001234</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Cara Penggunaan</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Tunjukkan QR Code saat registrasi event</li>
                <li>• Gunakan sebagai identitas resmi media</li>
                <li>• Download dan cetak untuk keperluan offline</li>
                <li>• Scan QR untuk verifikasi data lembaga</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EIDCard;
