import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Clock3, CreditCard, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

interface AdministrasiProps {
  paymentStatus: "paid" | "unpaid";
  onPaymentStatusChange: (status: "paid" | "unpaid") => void;
  debugProfile?: {
    nip?: string;
    nama_pesantren?: string;
  };
  debugPayments?: any[];
}

type PaymentSnapshot = {
  id: string;
  baseAmount: number;
  uniqueCode: number;
  totalAmount: number;
  status: "pending_payment" | "pending_verification" | "verified" | "rejected";
  rejectionReason?: string | null;
};

const Administrasi = ({ paymentStatus, onPaymentStatusChange }: AdministrasiProps) => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>(paymentStatus);
  const [payment, setPayment] = useState<PaymentSnapshot | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<{ payment?: PaymentSnapshot | null; redirectTo?: string }>("/api/payments/current");

        if (data.redirectTo === "/user") {
          setStatus("verified");
          onPaymentStatusChange("paid");
          return;
        }

        setPayment(data.payment || null);
        const currentStatus = data.payment?.status || "pending_payment";
        const nextStatus = currentStatus === "verified" ? "paid" : "unpaid";
        setStatus(currentStatus);
        onPaymentStatusChange(nextStatus);
      } catch {
        setStatus("pending_payment");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [onPaymentStatusChange]);

  const statusMeta = useMemo(() => {
    if (status === "verified") {
      return {
        label: "Lunas & Terverifikasi",
        tone: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      };
    }

    if (status === "pending_verification") {
      return {
        label: "Menunggu Verifikasi Admin",
        tone: "bg-amber-100 text-amber-700 border-amber-200",
        icon: <Clock3 className="h-4 w-4 text-amber-600" />,
      };
    }

    if (status === "rejected") {
      return {
        label: "Bukti Ditolak",
        tone: "bg-red-100 text-red-700 border-red-200",
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      };
    }

    return {
      label: "Belum Bayar",
      tone: "bg-slate-100 text-slate-700 border-slate-200",
      icon: <CreditCard className="h-4 w-4 text-slate-600" />,
    };
  }, [status]);

  const formatRupiah = (amount: number) => new Intl.NumberFormat("id-ID").format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Administrasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat status pembayaran...
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {statusMeta.icon}
              <Badge variant="outline" className={statusMeta.tone}>
                {statusMeta.label}
              </Badge>
            </div>

            {payment && (
              <div className="rounded-md border bg-muted/20 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tagihan Dasar</span>
                  <span>Rp {formatRupiah(payment.baseAmount)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground">Kode Unik</span>
                  <span>{payment.uniqueCode}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total Transfer</span>
                  <span>Rp {formatRupiah(payment.totalAmount)}</span>
                </div>
              </div>
            )}

            {status === "rejected" && payment?.rejectionReason && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Alasan penolakan: {payment.rejectionReason}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Upload ulang bukti transfer jika ditolak, atau pantau status verifikasi di halaman pembayaran.
            </p>
            <Button onClick={() => (window.location.href = "/payment")}>
              Buka Halaman Pembayaran
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Administrasi;
