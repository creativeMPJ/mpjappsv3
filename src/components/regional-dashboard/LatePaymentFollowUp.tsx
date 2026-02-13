import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-client";

interface LatePaymentClaim {
  id: string;
  pesantren_name: string;
  nama_pengelola: string | null;
  no_wa_pendaftar: string | null;
  days_overdue: number;
}

interface LatePaymentFollowUpProps {
  isDebugMode?: boolean;
}

const LatePaymentFollowUp = ({ isDebugMode = false }: LatePaymentFollowUpProps) => {
  const { toast } = useToast();
  const [claims, setClaims] = useState<LatePaymentClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (isDebugMode) {
      setClaims([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest<{ claims: LatePaymentClaim[] }>("/api/regional/late-payments");
      setClaims(data.claims || []);
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDebugMode]);

  const handleFollowUp = async (claim: LatePaymentClaim) => {
    const phone = (claim.no_wa_pendaftar || "").replace(/^0/, "62");
    const text = encodeURIComponent(
      `Assalamu'alaikum. Reminder pembayaran untuk ${claim.pesantren_name}. Mohon segera menyelesaikan pembayaran.`
    );
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    }

    try {
      await apiRequest(`/api/regional/late-payments/${claim.id}/follow-up`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      toast({ title: "Tercatat", description: "Follow-up WhatsApp dicatat." });
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow-up Pembayaran Terlambat</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        ) : claims.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada keterlambatan pembayaran.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pesantren</TableHead>
                <TableHead>Pengelola</TableHead>
                <TableHead>Keterlambatan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.pesantren_name}</TableCell>
                  <TableCell>{claim.nama_pengelola || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={claim.days_overdue > 14 ? "destructive" : "secondary"}>
                      {claim.days_overdue} hari
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleFollowUp(claim)} className="gap-1">
                      <MessageCircle className="h-4 w-4" /> Follow-up
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default LatePaymentFollowUp;