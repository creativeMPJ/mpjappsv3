import { useState } from "react";
import { Award, Download, KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getPaymentStateLabel, isPaymentActive } from "@/features/v4/utils";

const CrewSertifikatPage = () => {
  const { profile } = useAuth();
  const [token, setToken] = useState("");
  const paymentActive = isPaymentActive(profile?.status_payment);
  const paymentLabel = getPaymentStateLabel(profile?.status_payment);

  const handleClaimToken = () => {
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
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Klaim Sertifikat</h3>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Masukkan Token Sertifikat"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleClaimToken}
                disabled={!paymentActive}
                className={paymentActive ? "bg-primary hover:bg-primary/90 px-6" : "bg-slate-400 hover:bg-slate-400 px-6 cursor-not-allowed"}
              >
                {paymentActive ? "Klaim" : "Aktifkan akun terlebih dahulu"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Fitur akan segera tersedia.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Koleksi Sertifikat (0)</h3>
          <Button variant="outline" size="sm" disabled onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <Card className="border-dashed">
            <CardContent className="py-14 text-center">
              <Award className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium text-foreground">Belum ada data</p>
              <p className="mt-1 text-sm text-muted-foreground">Data akan tampil setelah tersedia</p>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CrewSertifikatPage;
