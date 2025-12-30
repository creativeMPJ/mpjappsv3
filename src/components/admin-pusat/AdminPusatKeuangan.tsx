import { useState, useEffect } from "react";
import { 
  DollarSign, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Loader2,
  Save,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PriceSetting {
  key: string;
  value: string;
  description: string;
}

interface PaymentRecord {
  id: string;
  user_id: string;
  pesantren_claim_id: string;
  base_amount: number;
  unique_code: number;
  total_amount: number;
  proof_file_url: string | null;
  status: string;
  created_at: string;
  pesantren_claims?: {
    pesantren_name: string;
    nama_pengelola: string;
    jenis_pengajuan: string;
  };
}

const AdminPusatKeuangan = () => {
  const { toast } = useToast();
  
  // Price settings state
  const [registrationPrice, setRegistrationPrice] = useState<string>("50000");
  const [claimPrice, setClaimPrice] = useState<string>("20000");
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  
  // Payments state
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  
  // Modal states
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch price settings
  useEffect(() => {
    fetchPriceSettings();
    fetchPayments();
  }, []);

  const fetchPriceSettings = async () => {
    setIsLoadingPrices(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value, description')
        .in('key', ['registration_base_price', 'claim_base_price']);

      if (error) throw error;

      data?.forEach((setting: PriceSetting) => {
        if (setting.key === 'registration_base_price') {
          setRegistrationPrice(setting.value.toString());
        } else if (setting.key === 'claim_base_price') {
          setClaimPrice(setting.value.toString());
        }
      });
    } catch (error) {
      console.error('Error fetching prices:', error);
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan harga",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPrices(false);
    }
  };

  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          pesantren_claims (
            pesantren_name,
            nama_pengelola,
            jenis_pengajuan
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pembayaran",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handleSavePrices = async () => {
    setIsSavingPrices(true);
    try {
      // Update registration price
      const { error: regError } = await supabase
        .from('system_settings')
        .update({ value: registrationPrice })
        .eq('key', 'registration_base_price');

      if (regError) throw regError;

      // Update claim price
      const { error: claimError } = await supabase
        .from('system_settings')
        .update({ value: claimPrice })
        .eq('key', 'claim_base_price');

      if (claimError) throw claimError;

      toast({
        title: "Berhasil",
        description: "Pengaturan harga telah disimpan",
      });
    } catch (error) {
      console.error('Error saving prices:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan harga",
        variant: "destructive",
      });
    } finally {
      setIsSavingPrices(false);
    }
  };

  const handleViewProof = async (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setProofModalOpen(true);
  };

  const getProofUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from('payment-proofs').getPublicUrl(path);
    return data?.publicUrl;
  };

  const handleApprovePayment = async () => {
    if (!selectedPayment) return;
    
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update payment status
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'verified',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', selectedPayment.id);

      if (paymentError) throw paymentError;

      // Update pesantren_claims status to approved
      const { error: claimError } = await supabase
        .from('pesantren_claims')
        .update({ status: 'approved' })
        .eq('id', selectedPayment.pesantren_claim_id);

      if (claimError) throw claimError;

      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          status_account: 'active',
          status_payment: 'paid',
        })
        .eq('id', selectedPayment.user_id);

      if (profileError) throw profileError;

      toast({
        title: "Pembayaran Diverifikasi",
        description: "Status akun telah diaktifkan",
      });

      setConfirmDialogOpen(false);
      setProofModalOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: "Error",
        description: "Gagal memverifikasi pembayaran",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Masukkan alasan penolakan",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedPayment.id);

      if (error) throw error;

      toast({
        title: "Pembayaran Ditolak",
        description: "User akan diberitahu untuk mengirim ulang bukti",
      });

      setRejectDialogOpen(false);
      setProofModalOpen(false);
      setRejectionReason("");
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Error",
        description: "Gagal menolak pembayaran",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <Badge variant="outline" className="bg-slate-100 text-slate-700">Belum Bayar</Badge>;
      case 'pending_verification':
        return <Badge className="bg-amber-500 text-white">Menunggu Verifikasi</Badge>;
      case 'verified':
        return <Badge className="bg-emerald-500 text-white">Terverifikasi</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getJenisBadge = (jenis: string) => {
    if (jenis === 'klaim') {
      return <Badge variant="outline" className="bg-blue-100 text-blue-700">Klaim Akun</Badge>;
    }
    return <Badge variant="outline" className="bg-emerald-100 text-emerald-700">Pesantren Baru</Badge>;
  };

  const pendingCount = payments.filter(p => p.status === 'pending_verification').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administrasi Keuangan</h1>
          <p className="text-muted-foreground">Kelola harga dan verifikasi pembayaran</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-500 text-white text-lg px-4 py-2">
            {pendingCount} Menunggu Verifikasi
          </Badge>
        )}
      </div>

      <Tabs defaultValue="verifikasi" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="verifikasi" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Verifikasi Pembayaran
          </TabsTrigger>
          <TabsTrigger value="pengaturan" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Pengaturan Harga
          </TabsTrigger>
        </TabsList>

        {/* Tab: Verifikasi Pembayaran */}
        <TabsContent value="verifikasi">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Daftar Pembayaran
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchPayments}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingPayments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada data pembayaran</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pesantren</TableHead>
                        <TableHead>Pengelola</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(payment.created_at)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {payment.pesantren_claims?.pesantren_name || '-'}
                          </TableCell>
                          <TableCell>
                            {payment.pesantren_claims?.nama_pengelola || '-'}
                          </TableCell>
                          <TableCell>
                            {payment.pesantren_claims?.jenis_pengajuan && 
                              getJenisBadge(payment.pesantren_claims.jenis_pengajuan)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            Rp {formatCurrency(payment.total_amount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell>
                            {payment.status === 'pending_verification' && payment.proof_file_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewProof(payment)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Lihat Bukti
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pengaturan Harga */}
        <TabsContent value="pengaturan">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Pengaturan Harga Pendaftaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPrices ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6 max-w-lg">
                  {/* Registration Price */}
                  <div className="space-y-2">
                    <Label htmlFor="regPrice" className="text-base font-medium">
                      Harga Jalur Registrasi Baru (Pesantren Baru)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Biaya pendaftaran untuk pesantren yang belum pernah terdaftar sebelumnya
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Rp</span>
                      <Input
                        id="regPrice"
                        type="number"
                        value={registrationPrice}
                        onChange={(e) => setRegistrationPrice(e.target.value)}
                        className="max-w-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Claim Price */}
                  <div className="space-y-2">
                    <Label htmlFor="claimPrice" className="text-base font-medium">
                      Harga Jalur Klaim Akun (Legacy)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Biaya aktivasi untuk pesantren yang sudah ada di database lama
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Rp</span>
                      <Input
                        id="claimPrice"
                        type="number"
                        value={claimPrice}
                        onChange={(e) => setClaimPrice(e.target.value)}
                        className="max-w-xs font-mono"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSavePrices} 
                    disabled={isSavingPrices}
                    className="mt-4"
                  >
                    {isSavingPrices ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Simpan Pengaturan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Proof Modal */}
      <Dialog open={proofModalOpen} onOpenChange={setProofModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bukti Transfer</DialogTitle>
            <DialogDescription>
              {selectedPayment?.pesantren_claims?.pesantren_name} - 
              Rp {selectedPayment && formatCurrency(selectedPayment.total_amount)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment?.proof_file_url && (
            <div className="my-4">
              <img
                src={getProofUrl(selectedPayment.proof_file_url) || ''}
                alt="Bukti Transfer"
                className="w-full rounded-lg border"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
            <div>
              <p className="text-muted-foreground">Nominal Dasar</p>
              <p className="font-medium">Rp {selectedPayment && formatCurrency(selectedPayment.base_amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Kode Unik</p>
              <p className="font-medium">{selectedPayment?.unique_code}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Transfer</p>
              <p className="font-bold text-lg">Rp {selectedPayment && formatCurrency(selectedPayment.total_amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Jenis Pengajuan</p>
              <p className="font-medium capitalize">{selectedPayment?.pesantren_claims?.jenis_pengajuan}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => setRejectDialogOpen(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Tolak
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setConfirmDialogOpen(true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verifikasi & Aktifkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Verifikasi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin memverifikasi pembayaran ini? 
              Akun pesantren akan langsung diaktifkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprovePayment}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ya, Verifikasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Pembayaran</AlertDialogTitle>
            <AlertDialogDescription>
              Masukkan alasan penolakan. User akan diberitahu untuk mengirim ulang bukti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Alasan penolakan (wajib diisi)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectPayment}
              disabled={isProcessing || !rejectionReason.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Tolak Pembayaran
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPusatKeuangan;
