import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Copy, Check, ArrowRight, ArrowLeft, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

// Generate random 3 digits for unique payment amount
const generateUniqueCode = () => Math.floor(Math.random() * 900) + 100;

const Payment = () => {
  const [senderName, setSenderName] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uniqueCode, setUniqueCode] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { type } = (location.state as { type: string }) || { type: "register" };

  // Generate unique code on mount
  useEffect(() => {
    setUniqueCode(generateUniqueCode());
  }, []);

  const baseTagihan = type === "claim" ? 20000 : 50000;
  const totalTagihan = baseTagihan + uniqueCode;

  const bankInfo = {
    bank: "Bank Syariah Indonesia (BSI)",
    accountNumber: "7171234567890",
    accountName: "MEDIA PONDOK JAWA TIMUR",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Disalin!",
      description: "Nomor rekening telah disalin",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File terlalu besar",
          description: "Maksimal ukuran file 5MB",
          variant: "destructive",
        });
        return;
      }

      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
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

    setIsLoading(true);

    const paymentData = {
      id: Date.now(),
      type,
      senderName,
      amount: totalTagihan,
      uniqueCode,
      proofFileName: proofFile.name,
      status: "pending_confirmation",
      submittedAt: new Date().toISOString(),
    };
    
    const payments = JSON.parse(localStorage.getItem("mpj_payments") || "[]");
    payments.push(paymentData);
    localStorage.setItem("mpj_payments", JSON.stringify(payments));

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Pembayaran Terkirim!",
        description: "Menunggu konfirmasi Admin",
      });
      navigate("/payment-pending");
    }, 1200);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
      {/* Header */}
      <div className="flex-shrink-0 pt-6 pb-3 px-4">
        <Link to="/login" className="inline-flex items-center text-emerald-200/80 text-sm mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Link>
        <div className="flex items-center gap-3">
          <img src={logoMpj} alt="MPJ" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-white">Pembayaran</h1>
            <p className="text-xs text-emerald-200/70">
              {type === "claim" ? "Aktivasi Akun" : "Registrasi Baru"}
            </p>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-card rounded-t-3xl px-5 pt-5 pb-8 overflow-y-auto">
        {/* Amount Card */}
        <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white mb-5">
          <CardContent className="p-4 text-center">
            <p className="text-xs opacity-90 mb-1">Total Tagihan</p>
            <p className="text-2xl font-bold">Rp {formatCurrency(totalTagihan)},-</p>
            <p className="text-[10px] opacity-75 mt-1">
              *Nominal unik untuk verifikasi otomatis
            </p>
          </CardContent>
        </Card>

        {/* Bank Info */}
        <Card className="bg-muted/20 border-border/50 mb-5">
          <CardContent className="p-4">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 px-2"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">a.n. {bankInfo.accountName}</p>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="senderName" className="text-sm">Nama Pengirim</Label>
            <Input
              id="senderName"
              placeholder="Nama sesuai rekening"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="h-11 rounded-xl border-border/50 bg-muted/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Upload Bukti Transfer</Label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                proofPreview ? "border-emerald-500 bg-emerald-500/10" : "border-border/50"
              }`}>
                {proofPreview ? (
                  <div className="space-y-2">
                    <img 
                      src={proofPreview} 
                      alt="Preview" 
                      className="max-h-28 mx-auto rounded-lg object-contain"
                    />
                    <p className="text-xs text-emerald-500 font-medium truncate px-4">
                      {proofFile?.name}
                    </p>
                  </div>
                ) : (
                  <div className="py-3">
                    <Upload className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Klik untuk upload</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
          >
            {isLoading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-5 p-3 bg-muted/30 rounded-xl">
          <p className="text-xs text-center text-muted-foreground">
            Admin akan mengkonfirmasi pembayaran Anda dalam 1x24 jam kerja
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;