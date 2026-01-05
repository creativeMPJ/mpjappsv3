import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  CreditCard, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock,
  AlertTriangle,
  Receipt,
  Eye,
  Loader2,
  Building2,
  CalendarDays,
  Banknote,
  ShieldCheck
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatNIP } from "@/lib/id-utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Payment {
  id: string;
  base_amount: number;
  unique_code: number;
  total_amount: number;
  status: "pending_payment" | "pending_verification" | "verified" | "rejected";
  created_at: string;
  verified_at: string | null;
  proof_file_url: string | null;
  rejection_reason: string | null;
}

interface AdministrasiProps {
  paymentStatus: "paid" | "unpaid";
  onPaymentStatusChange: (status: "paid" | "unpaid") => void;
  debugProfile?: {
    nip?: string;
    nama_pesantren?: string;
  };
  debugPayments?: Payment[];
}

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date helper
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd MMM yyyy", { locale: localeId });
  } catch {
    return "-";
  }
};

// Get status display
const getStatusDisplay = (status: Payment["status"]) => {
  switch (status) {
    case "verified":
      return {
        label: "Lunas",
        variant: "bg-green-100 text-green-700",
        icon: CheckCircle2,
      };
    case "pending_verification":
      return {
        label: "Menunggu Verifikasi",
        variant: "bg-amber-100 text-amber-700",
        icon: Clock,
      };
    case "pending_payment":
      return {
        label: "Belum Bayar",
        variant: "bg-red-100 text-red-700",
        icon: AlertTriangle,
      };
    case "rejected":
      return {
        label: "Ditolak",
        variant: "bg-red-100 text-red-700",
        icon: AlertTriangle,
      };
    default:
      return {
        label: "Unknown",
        variant: "bg-gray-100 text-gray-700",
        icon: Clock,
      };
  }
};

// Skeleton for table rows
const TableRowSkeleton = memo(() => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
  </TableRow>
));
TableRowSkeleton.displayName = 'TableRowSkeleton';

// Invoice Preview Dialog
const InvoicePreview = memo(({ 
  payment, 
  institutionName, 
  nip 
}: { 
  payment: Payment; 
  institutionName: string; 
  nip: string;
}) => {
  const statusInfo = getStatusDisplay(payment.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg border">
      {/* Invoice Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-primary">MPJ MEDIA</h3>
          <p className="text-sm text-muted-foreground">Invoice Digital</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Tanggal</p>
          <p className="font-semibold">{formatDate(payment.created_at)}</p>
        </div>
      </div>

      <Separator />

      {/* Institution Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Ditagihkan Kepada</p>
          <p className="font-semibold text-foreground">{institutionName}</p>
          <p className="text-sm font-mono text-primary">NIP: {nip}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-1">Status Pembayaran</p>
          <Badge className={`${statusInfo.variant} flex items-center gap-1 w-fit ml-auto`}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Payment Details */}
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2">
          <span className="text-muted-foreground">Iuran Keanggotaan MPJ</span>
          <span className="font-semibold">{formatCurrency(payment.base_amount)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-muted-foreground">Kode Unik</span>
          <span className="font-mono text-sm">{payment.unique_code}</span>
        </div>
        <div className="flex justify-between items-center py-2 bg-primary/5 rounded-lg px-3">
          <span className="font-semibold text-foreground">Total Pembayaran</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(payment.total_amount)}</span>
        </div>
      </div>

      {payment.verified_at && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm">Diverifikasi pada: {formatDate(payment.verified_at)}</span>
        </div>
      )}

      {payment.rejection_reason && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>Alasan Penolakan:</strong> {payment.rejection_reason}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});
InvoicePreview.displayName = 'InvoicePreview';

// Payment Row Component
const PaymentRow = memo(({ 
  payment, 
  institutionName, 
  nip 
}: { 
  payment: Payment; 
  institutionName: string; 
  nip: string;
}) => {
  const statusInfo = getStatusDisplay(payment.status);
  const StatusIcon = statusInfo.icon;

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">
        {formatDate(payment.created_at)}
      </TableCell>
      <TableCell>Iuran Keanggotaan</TableCell>
      <TableCell className="font-semibold">
        {formatCurrency(payment.total_amount)}
      </TableCell>
      <TableCell>
        <Badge className={`${statusInfo.variant} flex items-center gap-1 w-fit`}>
          <StatusIcon className="h-3 w-3" />
          {statusInfo.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Lihat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Invoice Digital
              </DialogTitle>
            </DialogHeader>
            <InvoicePreview 
              payment={payment} 
              institutionName={institutionName} 
              nip={nip}
            />
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
});
PaymentRow.displayName = 'PaymentRow';

const Administrasi = ({ 
  paymentStatus, 
  onPaymentStatusChange, 
  debugProfile,
  debugPayments 
}: AdministrasiProps) => {
  const { user, profile: authProfile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const profile = debugProfile || authProfile;
  const nip = profile?.nip ? formatNIP(profile.nip, true) : "Belum Terdaftar";
  const institutionName = profile?.nama_pesantren || "Pesantren";

  // Fetch payments from database
  const fetchPayments = useCallback(async () => {
    if (debugPayments) {
      setPayments(debugPayments);
      setIsLoading(false);
      return;
    }

    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast to ensure correct status type
      const typedPayments = (data || []).map(p => ({
        ...p,
        status: p.status as Payment["status"]
      }));
      
      setPayments(typedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pembayaran",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, debugPayments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Memoized calculations
  const paymentSummary = useMemo(() => {
    const pendingPayments = payments.filter(p => p.status === "pending_payment" || p.status === "pending_verification");
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.total_amount, 0);
    const verifiedCount = payments.filter(p => p.status === "verified").length;
    
    return {
      totalPending,
      pendingCount: pendingPayments.length,
      verifiedCount,
      totalPayments: payments.length,
    };
  }, [payments]);

  // Get account status display
  const accountStatus = useMemo(() => {
    if (paymentStatus === "paid") {
      return { label: "AKTIF", variant: "bg-green-500 text-white" };
    }
    if (payments.some(p => p.status === "pending_verification")) {
      return { label: "MENUNGGU VERIFIKASI", variant: "bg-amber-500 text-white" };
    }
    return { label: "BELUM BAYAR", variant: "bg-red-500 text-white" };
  }, [paymentStatus, payments]);

  const handlePayNow = () => {
    toast({
      title: "Redirect ke Payment Gateway",
      description: "Anda akan diarahkan ke halaman pembayaran...",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administrasi</h1>
        <p className="text-muted-foreground">Kelola tagihan dan invoice lembaga Anda</p>
      </div>

      {/* Payment Status Alert */}
      {paymentStatus === "unpaid" && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span className="text-red-800">
              <strong>Tagihan Belum Lunas!</strong> Total: {formatCurrency(paymentSummary.totalPending)}
            </span>
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white ml-4"
              onClick={handlePayNow}
            >
              Bayar Sekarang
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === "paid" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Status: AKTIF</strong> — Semua tagihan telah lunas. Terima kasih!
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Total Tagihan</h3>
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className={`text-3xl font-bold ${paymentSummary.totalPending > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(paymentSummary.totalPending)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Belum dibayar</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Status Akun</h3>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <Badge className={`text-lg px-3 py-1 ${accountStatus.variant}`}>
              {accountStatus.label}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">
              {paymentStatus === "paid" 
                ? "Akses penuh tersedia" 
                : "Beberapa fitur terkunci"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Riwayat Transaksi</h3>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground">{paymentSummary.totalPayments}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {paymentSummary.verifiedCount} Lunas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Table */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Riwayat Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori Pembayaran</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Status Verifikasi</TableHead>
                <TableHead className="text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <PaymentRow 
                    key={payment.id} 
                    payment={payment} 
                    institutionName={institutionName}
                    nip={nip}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Receipt className="h-8 w-8" />
                      <p>Belum ada riwayat transaksi</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">Metode Pembayaran</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Transfer Bank</p>
              </div>
              <p className="text-sm text-foreground">BCA: 1234567890</p>
              <p className="text-sm text-muted-foreground">a.n. Media Pondok Jatim</p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">E-Wallet</p>
              </div>
              <p className="text-sm text-foreground">GoPay / OVO / DANA</p>
              <p className="text-sm text-muted-foreground">081234567890</p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">QRIS</p>
              </div>
              <p className="text-sm text-foreground">Scan QR di aplikasi</p>
              <p className="text-sm text-muted-foreground">Tersedia di halaman bayar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Administrasi;
