import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-client";
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import LatePaymentFollowUp from "./LatePaymentFollowUp";
import { DetailPendaftarDialog, type PendaftarDetail as PesantrenClaim } from "./DetailPendaftarDialog";

// Interface replaced by import
// interface PesantrenClaim { ... }

interface PricingPackage {
  id: string;
  name: string;
  category: string;
  harga_paket: number;
  harga_diskon: number | null;
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

  // Detail Dialog State
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<PesantrenClaim | null>(null);

  // Approve dialog state
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveClaimId, setApproveClaimId] = useState<string | null>(null);
  const [approveClaim, setApproveClaim] = useState<PesantrenClaim | null>(null);
  const [pricingPackages, setPricingPackages] = useState<PricingPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [approving, setApproving] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

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

  const loadPricingPackages = async () => {
    setLoadingPackages(true);
    try {
      const data = await apiRequest<{ packages: PricingPackage[] }>("/api/regional/pricing-packages");
      setPricingPackages(data.packages || []);
      if (data.packages?.length > 0) {
        setSelectedPackageId(data.packages[0].id);
      }
    } catch (error: any) {
      toast({ title: "Gagal memuat paket harga", description: error.message, variant: "destructive" });
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [isDebugMode]);

  const openApproveDialog = (claim: PesantrenClaim) => {
    setApproveClaimId(claim.id);
    setApproveClaim(claim);
    setSelectedPackageId("");
    setApproveOpen(true);

    // Only load packages for pesantren_baru (needs payment)
    if (claim.jenis_pengajuan === "pesantren_baru") {
      loadPricingPackages();
    }
  };

  const confirmApprove = async () => {
    if (!approveClaimId) return;

    setApproving(true);
    try {
      const body: any = {};
      if (approveClaim?.jenis_pengajuan === "pesantren_baru" && selectedPackageId) {
        body.pricingPackageId = selectedPackageId;
      }

      await apiRequest(`/api/regional/claims/${approveClaimId}/approve`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast({ title: "Berhasil", description: "Pengajuan disetujui regional" });
      setApproveOpen(false);
      setApproveClaimId(null);
      setApproveClaim(null);
      await loadClaims();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setApproving(false);
    }
  };

  const openDetail = (claim: PesantrenClaim) => {
    setDetailData(claim);
    setDetailOpen(true);
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

  const selectedPkg = pricingPackages.find((p) => p.id === selectedPackageId);

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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetail(claim)}
                        className="gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openApproveDialog(claim)}
                        className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openReject(claim.id)}
                        className="gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Tolak
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LatePaymentFollowUp isDebugMode={isDebugMode} />

      {/* Approve Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Pengajuan</DialogTitle>
            <DialogDescription>
              Konfirmasi persetujuan pengajuan untuk{" "}
              <span className="font-semibold">{approveClaim?.pesantren_name}</span>
            </DialogDescription>
          </DialogHeader>

          {approveClaim?.jenis_pengajuan === "pesantren_baru" && (
            <div className="space-y-3 py-2">
              <Label>Paket Harga</Label>
              {loadingPackages ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat paket harga...
                </div>
              ) : pricingPackages.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                  ⚠️ Belum ada paket harga aktif. Hubungi Finance untuk menambahkan paket terlebih dahulu.
                </p>
              ) : (
                <>
                  <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih paket harga..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingPackages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} — {formatCurrency(pkg.harga_diskon ?? pkg.harga_paket)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPkg && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Harga Paket:</span>
                        <span className="font-mono font-bold">{formatCurrency(selectedPkg.harga_paket)}</span>
                      </div>
                      {selectedPkg.harga_diskon && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Harga Diskon:</span>
                          <span className="font-mono font-bold text-emerald-600">
                            {formatCurrency(selectedPkg.harga_diskon)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span className="text-muted-foreground">Total Tagihan:</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {formatCurrency(selectedPkg.harga_diskon ?? selectedPkg.harga_paket)} + kode unik
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {approveClaim?.jenis_pengajuan === "klaim" && (
            <p className="text-sm text-muted-foreground py-2">
              Pengajuan klaim akan langsung mengaktifkan akun tanpa pembayaran.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={approving}>
              Batal
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={
                approving ||
                (approveClaim?.jenis_pengajuan === "pesantren_baru" &&
                  pricingPackages.length > 0 &&
                  !selectedPackageId)
              }
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {approving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Konfirmasi Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
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

      <DetailPendaftarDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        data={detailData}
      />
    </div>
  );
};

export default ValidasiPendaftar;