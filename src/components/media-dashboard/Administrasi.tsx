import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Clock3, CreditCard, Loader2, PartyPopper } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { useNavigate } from "react-router-dom";
import { getPaymentStatus } from "@/features/v4/utils";

interface AdministrasiProps {
  paymentStatus?: string;
  onPaymentStatusChange?: () => void;
  debugProfile?: {
    nip?: string;
    nama_pesantren?: string;
  };
  debugPayments?: unknown[];
}

type PaymentSnapshot = {
  id: string;
  baseAmount: number;
  uniqueCode: number;
  totalAmount: number;
  status: "pending_payment" | "pending_verification" | "verified" | "rejected";
  rejectionReason?: string | null;
};

const Administrasi = (_props: AdministrasiProps = {}) => {
  const [loading, setLoading] = useState(true);
  const [, setStatus] = useState<string>('pending_payment');
  const [payment, setPayment] = useState<PaymentSnapshot | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<{ paymentStatus: string; payment?: PaymentSnapshot | null }>("/api/payments/summary");

        setPayment(data.payment || null);
        setStatus(data.paymentStatus || "pending_payment");
      } catch {
        setStatus("pending_payment");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatRupiah = (amount: number) => new Intl.NumberFormat("id-ID").format(amount);
  const normalizedStatus = payment ? getPaymentStatus(payment) : "inactive";

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat status pembayaran...
        </CardContent>
      </Card>
    );
  }

  if (normalizedStatus === "verified") {
    return (
      <div className="space-y-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="flex flex-col items-center py-8 text-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-700">Pembayaran terverifikasi</h3>
              <p className="text-sm text-muted-foreground mt-1">Akun aktif.</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Terverifikasi
            </Badge>
          </CardContent>
        </Card>

        {payment && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rincian Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tagihan Dasar</span>
                <span>Rp {formatRupiah(payment.baseAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kode Unik</span>
                <span>{payment.uniqueCode}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Transfer</span>
                <span className="text-emerald-600">Rp {formatRupiah(payment.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (normalizedStatus === "pending") {
    return (
      <div className="space-y-4">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="flex flex-col items-center py-8 text-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Clock3 className="h-8 w-8 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-700">Menunggu verifikasi pembayaran</h3>
              <p className="text-sm text-muted-foreground mt-1">Bukti pembayaran Anda sedang diproses.</p>
            </div>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
              <Clock3 className="h-3.5 w-3.5 mr-1" />
              Menunggu verifikasi pembayaran
            </Badge>
          </CardContent>
        </Card>

        {payment && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rincian Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tagihan Dasar</span>
                <span>Rp {formatRupiah(payment.baseAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kode Unik</span>
                <span>{payment.uniqueCode}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Transfer</span>
                <span>Rp {formatRupiah(payment.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Button variant="outline" className="w-full" onClick={() => navigate("/payment-pending")}>
          <Clock3 className="h-4 w-4 mr-2" />
          Pantau Status Pembayaran
        </Button>
      </div>
    );
  }

  if (normalizedStatus === "rejected") {
    return (
      <div className="space-y-4">
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="flex flex-col items-center py-8 text-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700">Bukti Pembayaran Ditolak</h3>
              <p className="text-sm text-muted-foreground mt-1">Silakan upload ulang bukti transfer yang sesuai.</p>
            </div>
            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Ditolak
            </Badge>
          </CardContent>
        </Card>

        {payment?.rejectionReason && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span className="font-medium">Alasan: </span>{payment.rejectionReason}
          </div>
        )}

        <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => navigate("/payment")}>
          Upload Ulang Bukti Transfer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardContent className="flex flex-col items-center py-8 text-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <CreditCard className="h-8 w-8 text-slate-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700">Belum aktif</h3>
            <p className="text-sm text-muted-foreground mt-1">Selesaikan pembayaran untuk mengaktifkan akun Anda.</p>
          </div>
          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
            <CreditCard className="h-3.5 w-3.5 mr-1" />
            Belum aktif
          </Badge>
        </CardContent>
      </Card>

      {payment && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rincian Tagihan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tagihan Dasar</span>
              <span>Rp {formatRupiah(payment.baseAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kode Unik</span>
              <span>{payment.uniqueCode}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total Transfer</span>
              <span>Rp {formatRupiah(payment.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Button className="w-full" onClick={() => navigate("/payment")}>
        <CreditCard className="h-4 w-4 mr-2" />
        Bayar Sekarang
      </Button>
    </div>
  );
};

export default Administrasi;
