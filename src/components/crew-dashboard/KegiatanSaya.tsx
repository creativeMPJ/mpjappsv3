import { Award, Download, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { isPaymentActive } from "@/features/v4/utils";

const KegiatanSaya = () => {
  const { profile } = useAuth();
  const paymentActive = isPaymentActive(profile?.status_payment);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sertifikat & Event Saya</h1>
        <p className="text-muted-foreground">Klaim dan kelola sertifikat pribadi Anda</p>
      </div>

      <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4">Klaim Sertifikat Baru</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-200" />
              <Input
                value=""
                readOnly
                disabled
                className="pl-10 bg-white/20 border-white/30 text-white"
              />
            </div>
            <Button
              disabled
              className="bg-slate-400 hover:bg-slate-400 text-white font-semibold cursor-not-allowed"
            >
              <Award className="h-4 w-4 mr-2" />
              {paymentActive ? "Segera Hadir" : "Aktifkan akun terlebih dahulu"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Daftar Sertifikat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-10 text-center">
            <Award className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-foreground">Belum ada sertifikat</p>
            <p className="mt-1 text-sm text-muted-foreground">Sertifikat akan tampil setelah diterbitkan</p>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="mt-4 border-slate-300 text-slate-400 cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-1" />
              {paymentActive ? "Segera Hadir" : "Aktifkan akun terlebih dahulu"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KegiatanSaya;
