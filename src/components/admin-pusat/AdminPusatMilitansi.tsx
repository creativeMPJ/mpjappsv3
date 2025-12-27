import { Medal, Lock, Zap, Star, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminPusatMilitansi = () => {
  const { toast } = useToast();

  const handleLockedFeature = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `Fitur "${feature}" akan tersedia di update selanjutnya.`,
      variant: "default",
    });
  };

  // XP Formula mockup
  const xpFormula = [
    { action: "Hadir Event Regional", xp: 10, icon: Star },
    { action: "Hadir Event Nasional", xp: 25, icon: Award },
    { action: "Upload Konten Dakwah", xp: 5, icon: Zap },
    { action: "Menyelesaikan Misi Bulanan", xp: 50, icon: Medal },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Militansi</h1>
          <p className="text-slate-500 mt-1">Kelola sistem XP dan gamifikasi</p>
        </div>
        <Button 
          onClick={() => handleLockedFeature("XP Config")}
          className="bg-slate-300 text-slate-600 cursor-not-allowed"
          disabled
        >
          <Lock className="h-4 w-4 mr-2" />
          Edit XP Config
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex items-center gap-3">
          <Lock className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            Konfigurasi XP sedang dalam pengembangan. Saat ini Anda hanya dapat melihat formula XP.
          </p>
        </CardContent>
      </Card>

      {/* XP Formula Preview */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 font-semibold flex items-center gap-2">
            <Medal className="h-5 w-5 text-[#166534]" />
            Formula XP (Preview)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {xpFormula.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-slate-200 rounded-lg flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-[#166534]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{item.action}</h3>
                  <p className="text-sm text-slate-500">Reward</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#166534]">+{item.xp}</span>
                  <p className="text-xs text-slate-500">XP</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-4 text-center">
            * Formula XP dapat dikonfigurasi setelah fitur tersedia
          </p>
        </CardContent>
      </Card>

      {/* Level Thresholds */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 font-semibold">
            Level Thresholds (Preview)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-600">Basic</span>
              <span className="text-slate-500">0 - 99 XP</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="font-medium text-gray-700">Silver</span>
              <span className="text-gray-500">100 - 499 XP</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium text-yellow-700">Gold</span>
              <span className="text-yellow-600">500 - 999 XP</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-purple-700">Platinum</span>
              <span className="text-purple-600">1000+ XP</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPusatMilitansi;
