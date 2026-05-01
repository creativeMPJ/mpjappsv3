import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Clock, Eye, FileImage, Loader2, RefreshCw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-client";
import { getPaymentStateLabel, getPaymentStatus } from "@/features/v4/utils";

interface PaymentItem {
  id: string;
  user_id: string;
  pesantren_claim_id: string;
  base_amount: number;
  unique_code: number;
  total_amount: number;
  proof_file_url: string | null;
  status: string;
  created_at: string;
  rejection_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
  pesantren_claims: {
    pesantren_name: string;
    nama_pengelola: string;
    jenis_pengajuan: string;
    region_id: string | null;
    mpj_id_number: string | null;
  };
  profiles: {
    no_wa_pendaftar: string | null;
  };
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Terjadi kesalahan";

const FinanceVerifikasi = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ payments: PaymentItem[] }>("/api/admin/payments");
      setPayments(data.payments ?? []);
    } catch (error) {
      toast({ title: "Gagal memuat data", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const pendingPayments = payments.filter((payment) => getPaymentStatus(payment.status) === "pending");
  const allPayments = payments;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadge = (status: string) => {
    const normalized = getPaymentStatus(status);
    const label = getPaymentStateLabel(normalized);

    if (normalized === "pending") {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{label}</Badge>;
    }
    if (normalized === "verified") {
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{label}</Badge>;
    }
    if (normalized === "rejected") {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{label}</Badge>;
    }
    return <Badge variant="outline">{label}</Badge>;
  };

  const handleApprove = (payment: PaymentItem) => {
    setSelectedPayment(payment);
    setShowApproveDialog(true);
  };

  const handleReject = (payment: PaymentItem) => {
    setSelectedPayment(payment);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const handleViewProof = (payment: PaymentItem) => {
    setSelectedPayment(payment);
    setShowProofDialog(true);
  };

  const confirmApprove = async () => {
    if (!selectedPayment) return;
    setProcessing(true);
    try {
      const result = await apiRequest<{ success: boolean; pesantrenName?: string | null }>(
        `/api/admin/payments/${selectedPayment.id}/approve`,
        { method: "POST" },
      );
      toast({
        title: "Pembayaran disetujui",
        description: `${result.pesantrenName ?? selectedPayment.pesantren_claims.pesantren_name}: Aktivasi akan diproses oleh sistem.`,
      });
      setShowApproveDialog(false);
      fetchPayments();
    } catch (error) {
      toast({ title: "Gagal verifikasi", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedPayment || !rejectReason.trim()) return;
    setProcessing(true);
    try {
      await apiRequest(`/api/admin/payments/${selectedPayment.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason }),
      });
      toast({
        title: "Pembayaran ditolak",
        description: `${selectedPayment.pesantren_claims.pesantren_name} perlu mengunggah ulang bukti pembayaran.`,
      });
      setShowRejectDialog(false);
      fetchPayments();
    } catch (error) {
      toast({ title: "Gagal menolak", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{pendingPayments.length}</p>
              <p className="text-xs text-blue-600/70">Menunggu verifikasi</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-emerald-700">
                {payments.filter((payment) => getPaymentStatus(payment.status) === "verified").length}
              </p>
              <p className="text-xs text-emerald-600/70">Terverifikasi</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">
                {payments.filter((payment) => getPaymentStatus(payment.status) === "rejected").length}
              </p>
              <p className="text-xs text-red-600/70">Pembayaran ditolak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Verifikasi Pembayaran</span>
            <Button variant="ghost" size="sm" onClick={fetchPayments} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
              <p className="font-medium">Belum ada data</p>
              <p className="text-sm">Data akan tampil setelah tersedia</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pesantren</TableHead>
                    <TableHead>Pengelola</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Bukti</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.pesantren_claims.pesantren_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.pesantren_claims.nama_pengelola}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {payment.pesantren_claims.jenis_pengajuan === "pesantren_baru" ? "Baru" : "Klaim"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(payment.total_amount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(payment.created_at)}</TableCell>
                      <TableCell>
                        {payment.proof_file_url ? (
                          <Button variant="ghost" size="sm" onClick={() => handleViewProof(payment)} className="gap-1 text-blue-600">
                            <Eye className="h-3.5 w-3.5" />
                            Lihat
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" onClick={() => handleApprove(payment)} className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Setujui pembayaran
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(payment)} className="h-8 text-xs gap-1">
                            <XCircle className="h-3.5 w-3.5" />
                            Tolak pembayaran
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {allPayments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Riwayat Semua Pembayaran ({allPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pesantren</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium text-sm">{payment.pesantren_claims.pesantren_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {payment.pesantren_claims.jenis_pengajuan === "pesantren_baru" ? "Baru" : "Klaim"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(payment.total_amount)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(payment.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Verifikasi Pembayaran</DialogTitle>
            <DialogDescription>
              Setujui pembayaran ini? Akun akan diproses sesuai alur aktivasi sistem setelah pembayaran terverifikasi.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-3 py-2">
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="font-medium">{selectedPayment.pesantren_claims.pesantren_name}</p>
                <p className="text-sm text-muted-foreground">{selectedPayment.pesantren_claims.nama_pengelola}</p>
                <p className="text-sm font-mono">Total: {formatCurrency(selectedPayment.total_amount)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={processing}>
              Batal
            </Button>
            <Button onClick={confirmApprove} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Verifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pembayaran</DialogTitle>
            <DialogDescription>Pengguna akan diminta mengunggah ulang bukti pembayaran.</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-3 py-2">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium">{selectedPayment.pesantren_claims.pesantren_name}</p>
                <p className="text-sm text-muted-foreground">Total: {formatCurrency(selectedPayment.total_amount)}</p>
              </div>
              <Textarea placeholder="Alasan penolakan (wajib diisi)..." value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} rows={3} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={processing}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={processing || !rejectReason.trim()}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              Tolak Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Bukti Pembayaran
            </DialogTitle>
            <DialogDescription>{selectedPayment?.pesantren_claims.pesantren_name}</DialogDescription>
          </DialogHeader>
          {selectedPayment?.proof_file_url ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center p-2 bg-muted/30 rounded-lg min-h-[200px]">
                <img src={selectedPayment.proof_file_url} alt="Bukti Pembayaran" className="max-w-full max-h-[400px] object-contain rounded" />
              </div>
              <p className="text-center text-xs text-muted-foreground">Jika file tidak tampil, buka di tab baru.</p>
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              <p className="font-medium">Belum ada data</p>
              <p className="text-sm">Data akan tampil setelah tersedia</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProofDialog(false)}>
              Tutup
            </Button>
            {selectedPayment?.proof_file_url && (
              <Button variant="outline" onClick={() => window.open(selectedPayment.proof_file_url!, "_blank")}>
                Buka di Tab Baru
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceVerifikasi;
