import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Check, Copy, Loader2, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

const MAX_FILE_SIZE = 350 * 1024;

interface CurrentPaymentResponse {
  redirectTo?: string;
  accessDeniedReason?: string;
  claim?: {
    id: string;
    pesantren_name: string;
    jenis_pengajuan: string;
    status: string;
  };
  payment?: {
    id: string;
    baseAmount?: number;
    uniqueCode?: number;
    totalAmount?: number;
  };
  bankInfo?: {
    bank?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
  } | null;
}

interface BankInfo {
  bank: string;
  accountNumber: string;
  accountName: string;
}

const Payment = () => {
  const [senderName, setSenderName] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [baseAmount, setBaseAmount] = useState(0);
  const [uniqueCode, setUniqueCode] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [claimData, setClaimData] = useState<CurrentPaymentResponse["claim"] | null>(null);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const hasPaymentData = Boolean(paymentId && totalAmount > 0);
  const hasBankInfo = Boolean(bankInfo?.bank && bankInfo.accountNumber && bankInfo.accountName);

  useEffect(() => {
    const initializePayment = async () => {
      if (authLoading) return;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      setIsCheckingAccess(true);

      try {
        const data = await apiRequest<CurrentPaymentResponse>("/api/payments/current");

        if (data.redirectTo) {
          navigate(data.redirectTo, { replace: true });
          return;
        }

        if (data.accessDeniedReason) {
          setAccessDeniedReason(data.accessDeniedReason);
          return;
        }

        if (data.claim) setClaimData(data.claim);
        if (data.payment) {
          setPaymentId(data.payment.id);
          setBaseAmount(data.payment.baseAmount ?? 0);
          setUniqueCode(data.payment.uniqueCode ?? 0);
          setTotalAmount(data.payment.totalAmount ?? 0);
        }
        if (data.bankInfo?.bank && data.bankInfo.accountNumber && data.bankInfo.accountName) {
          setBankInfo({
            bank: data.bankInfo.bank,
            accountNumber: data.bankInfo.accountNumber,
            accountName: data.bankInfo.accountName,
          });
        }
      } catch (error) {
        console.error("Error initializing payment:", error);
        toast({
          title: "Gagal memuat data",
          description: "Gagal memuat data pembayaran",
          variant: "destructive",
        });
      } finally {
        setIsCheckingAccess(false);
      }
    };

    initializePayment();
  }, [user, authLoading, navigate, toast]);

  const handleCopyAccount = () => {
    if (!bankInfo?.accountNumber) return;
    navigator.clipboard.writeText(bankInfo.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
    toast({ title: "Disalin", description: "Nomor rekening telah disalin" });
  };

  const handleCopyAmount = () => {
    if (!hasPaymentData) return;
    navigator.clipboard.writeText(totalAmount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
    toast({ title: "Disalin", description: "Nominal tagihan telah disalin" });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File terlalu besar",
        description: "Ukuran file terlalu besar. Maksimal yang diizinkan adalah 350KB.",
        variant: "destructive",
      });
      return;
    }

    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProofPreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!senderName.trim()) {
      toast({
        title: "Nama pengirim diperlukan",
        description: "Masukkan nama sesuai rekening",
        variant: "destructive",
      });
      return;
    }

    if (!proofFile) {
      toast({
        title: "Bukti transfer diperlukan",
        description: "Upload bukti transfer",
        variant: "destructive",
      });
      return;
    }

    if (!paymentId || !user || !hasPaymentData || !hasBankInfo) {
      toast({
        title: "Belum ada data",
        description: "Data pembayaran akan tampil setelah tersedia",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const form = new FormData();
      form.append("paymentId", paymentId);
      form.append("senderName", senderName.trim());
      form.append("file", proofFile);

      await apiRequest("/api/payments/submit-proof", {
        method: "POST",
        body: form,
      });

      toast({
        title: "Bukti pembayaran terkirim",
        description: "Menunggu verifikasi",
      });
      navigate("/payment-pending");
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Gagal mengirim",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID").format(amount);

  if (authLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  if (accessDeniedReason) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Pembayaran belum tersedia</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">{accessDeniedReason}</p>
          <Button onClick={() => navigate("/user")} className="w-full">
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-primary/90 to-primary">
      <div className="flex-shrink-0 pt-6 pb-3 px-4">
        <Link to="/user" className="inline-flex items-center text-primary-foreground/80 text-sm mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-foreground">Pembayaran</h1>
          <p className="text-xs text-primary-foreground/70">
            {claimData?.jenis_pengajuan === "klaim" ? "Aktivasi Akun" : "Registrasi Pesantren Baru"}
          </p>
        </div>
      </div>

      <div className="flex-1 bg-card rounded-t-3xl px-5 pt-5 pb-8 overflow-y-auto">
        {claimData && (
          <div className="bg-muted/30 rounded-xl p-3 mb-4">
            <p className="text-xs text-muted-foreground">Pesantren:</p>
            <p className="font-semibold text-foreground">{claimData.pesantren_name}</p>
          </div>
        )}

        <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white mb-5">
          <CardContent className="p-4">
            <p className="text-xs opacity-90 mb-1 text-center">Total Tagihan</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-bold">{hasPaymentData ? `Rp ${formatCurrency(totalAmount)},-` : "Belum ada data"}</p>
              <Button variant="ghost" size="sm" onClick={handleCopyAmount} disabled={!hasPaymentData} className="h-8 w-8 p-0 hover:bg-white/20">
                {copiedAmount ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4 text-white/80" />}
              </Button>
            </div>
            {hasPaymentData ? (
              <div className="flex justify-center gap-4 mt-2 text-xs opacity-80">
                <span>Dasar: Rp {formatCurrency(baseAmount)}</span>
                <span>+</span>
                <span>Kode: {uniqueCode}</span>
              </div>
            ) : (
              <p className="mt-2 text-center text-xs opacity-80">Data akan tampil setelah tersedia</p>
            )}
          </CardContent>
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
          <p className="text-xs text-amber-800 text-center font-medium">
            Penting: transfer sesuai nominal yang ditampilkan agar proses verifikasi berjalan lancar.
          </p>
        </div>

        <Card className="bg-muted/20 border-border/50 mb-5">
          <CardContent className="p-4">
            {hasBankInfo && bankInfo ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{bankInfo.bank}</p>
                    <p className="text-xs text-muted-foreground">Transfer ke rekening berikut</p>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Nomor Rekening</p>
                      <p className="text-base font-mono font-bold text-foreground">{bankInfo.accountNumber}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCopyAccount} className="h-8 px-2">
                      {copiedAccount ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">a.n. {bankInfo.accountName}</p>
                </div>
              </>
            ) : (
              <div className="py-6 text-center">
                <Building2 className="mx-auto mb-3 h-9 w-9 text-muted-foreground/50" />
                <p className="font-medium text-foreground">Belum ada data</p>
                <p className="mt-1 text-sm text-muted-foreground">Data rekening akan tampil setelah tersedia</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="senderName" className="text-sm">Nama Pengirim</Label>
            <Input
              id="senderName"
              placeholder="Nama sesuai rekening"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
              className="h-11 rounded-xl border-border/50 bg-muted/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Upload Bukti Transfer (Maks. 350KB)</Label>
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${proofPreview ? "border-emerald-500 bg-emerald-500/10" : "border-border/50"}`}>
                {proofPreview ? (
                  <div className="space-y-2">
                    <img src={proofPreview} alt="Preview" className="max-h-28 mx-auto rounded-lg object-contain" />
                    <p className="text-xs text-emerald-500 font-medium truncate px-4">{proofFile?.name}</p>
                  </div>
                ) : (
                  <div className="py-3">
                    <Upload className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Klik untuk upload</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG (Maks. 350KB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !hasPaymentData || !hasBankInfo}
            className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                Kirim Bukti Pembayaran
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="mt-5 p-3 bg-muted/30 rounded-xl">
          <p className="text-xs text-center text-muted-foreground">
            Setelah bukti pembayaran dikirim, status akan menunggu verifikasi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
