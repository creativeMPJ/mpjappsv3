import { useState } from "react";
import { Award, Download, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getPaymentStateLabel, isPaymentActive } from "@/features/v4/utils";

const KegiatanSaya = () => {
  const { profile } = useAuth();
  const [token, setToken] = useState("");
  const { toast } = useToast();
  const paymentActive = isPaymentActive(profile?.status_payment);
  const paymentLabel = getPaymentStateLabel(profile?.status_payment);

  const handleClaimCertificate = () => {
    if (!paymentActive) {
      toast({
        title: paymentLabel,
        description: "Aktifkan akun terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Fitur akan segera tersedia",
      description: "Klaim sertifikat akan tersedia setelah layanan event aktif.",
    });
    setToken("");
  };

  const handleDownload = () => {
    if (!paymentActive) {
      toast({
        title: paymentLabel,
        description: "Aktifkan akun terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Fitur akan segera tersedia",
      description: "Download sertifikat akan tersedia setelah data sertifikat tersedia.",
    });
  };

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
                placeholder="Masukkan Token Acara"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-emerald-200"
              />
            </div>
            <Button
              onClick={handleClaimCertificate}
              disabled={!paymentActive}
              className={paymentActive ? "bg-amber-500 hover:bg-amber-600 text-white font-semibold" : "bg-slate-400 hover:bg-slate-400 text-white font-semibold cursor-not-allowed"}
            >
              <Award className="h-4 w-4 mr-2" />
              {paymentActive ? "Klaim Sertifikat" : "Aktifkan akun terlebih dahulu"}
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
            <p className="font-medium text-foreground">Belum ada data</p>
            <p className="mt-1 text-sm text-muted-foreground">Data akan tampil setelah tersedia</p>
            <Button
              variant="outline"
              size="sm"
              disabled={!paymentActive}
              className={paymentActive ? "mt-4 border-emerald-600 text-emerald-600 hover:bg-emerald-50" : "mt-4 border-slate-300 text-slate-400 cursor-not-allowed"}
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              {paymentActive ? "Download PDF" : "Aktifkan akun terlebih dahulu"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KegiatanSaya;
