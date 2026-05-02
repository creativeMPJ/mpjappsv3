import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock3, CreditCard, Loader2, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { getPaymentStatus } from "@/features/v4/utils";

type PaymentStatus = "pending_payment" | "pending_verification" | "pending" | "verified" | "rejected";

const AktivasiNIPNIAM = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PaymentStatus>("pending_payment");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<{ payment?: { status?: PaymentStatus } | null; redirectTo?: string }>("/api/payments/current");
        if (data.redirectTo === "/user") {
          setStatus("verified");
          return;
        }
        setStatus(data.payment?.status || "pending_payment");
      } catch {
        setStatus("pending_payment");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const statusMeta = useMemo(() => {
    const normalizedStatus = getPaymentStatus(status);

    if (normalizedStatus === "verified") {
      return {
        label: "Akun aktif",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        tone: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    }
    if (normalizedStatus === "pending") {
      return {
        label: "Menunggu verifikasi pembayaran",
        icon: <Clock3 className="h-4 w-4 text-amber-600" />,
        tone: "bg-amber-100 text-amber-700 border-amber-200",
      };
    }
    if (normalizedStatus === "rejected") {
      return {
        label: "Pembayaran ditolak",
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        tone: "bg-red-100 text-red-700 border-red-200",
      };
    }
    return {
      label: "Belum aktif",
      icon: <CreditCard className="h-4 w-4 text-slate-600" />,
      tone: "bg-slate-100 text-slate-700 border-slate-200",
    };
  }, [status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Aktivasi Akun
        </CardTitle>
        <CardDescription>
          Identitas resmi akan tampil setelah pembayaran terverifikasi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat status aktivasi...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {statusMeta.icon}
            <Badge variant="outline" className={statusMeta.tone}>
              {statusMeta.label}
            </Badge>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Aktivasi diproses oleh sistem setelah pembayaran disetujui.
        </p>
        <Button
          className="gap-2"
          onClick={() => {
            navigate("/payment");
          }}
        >
          <CreditCard className="h-4 w-4" />
          Buka Halaman Pembayaran
        </Button>
      </CardContent>
    </Card>
  );
};

export default AktivasiNIPNIAM;
