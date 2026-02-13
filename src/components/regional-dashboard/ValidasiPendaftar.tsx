import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-client";
import LatePaymentFollowUp from "./LatePaymentFollowUp";

interface PesantrenClaim {
  id: string;
  pesantren_name: string;
  nama_pengelola: string | null;
  no_wa_pendaftar: string | null;
  jenis_pengajuan: "klaim" | "pesantren_baru";
  created_at: string;
}

interface ValidasiPendaftarProps {
  isDebugMode?: boolean;
}

const ValidasiPendaftar = ({ isDebugMode = false }: ValidasiPendaftarProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<PesantrenClaim[]>([]);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const loadClaims = async () => {
    if (isDebugMode) {
      setClaims([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest<{ claims: PesantrenClaim[] }>("/api/regional/pending-claims");
      setClaims(data.claims || []);
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [isDebugMode]);

  const approveClaim = async (id: string) => {
    try {
      await apiRequest(`/api/regional/claims/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
      toast({ title: "Berhasil", description: "Pengajuan disetujui regional" });
      await loadClaims();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  const openReject = (id: string) => {
    setSelectedClaimId(id);
    setRejectReason("");
    setRejectOpen(true);
  };

  const rejectClaim = async () => {
    if (!selectedClaimId || !rejectReason.trim()) return;
    try {
      await apiRequest(`/api/regional/claims/${selectedClaimId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      toast({ title: "Berhasil", description: "Pengajuan ditolak" });
      setRejectOpen(false);
      setSelectedClaimId(null);
      await loadClaims();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Validasi Pendaftar</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          ) : claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada pengajuan pending.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pesantren</TableHead>
                  <TableHead>Pengelola</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>{claim.pesantren_name}</TableCell>
                    <TableCell>{claim.nama_pengelola || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{claim.jenis_pengajuan}</Badge>
                    </TableCell>
                    <TableCell>{new Date(claim.created_at).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => approveClaim(claim.id)}>Setujui</Button>
                      <Button size="sm" variant="destructive" onClick={() => openReject(claim.id)}>Tolak</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LatePaymentFollowUp isDebugMode={isDebugMode} />

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alasan Penolakan</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Masukkan alasan penolakan"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={rejectClaim} disabled={!rejectReason.trim()}>
              Konfirmasi Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidasiPendaftar;