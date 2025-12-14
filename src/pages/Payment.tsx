import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Copy, Check, ArrowRight, Clock, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

const Payment = () => {
  const [senderName, setSenderName] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { type } = (location.state as { type: string }) || { type: "register" };

  const tagihan = type === "claim" ? 20000 : 50000;
  const tagihanFormatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(tagihan);

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
        description: "Masukkan nama pengirim sesuai rekening",
        variant: "destructive",
      });
      return;
    }

    if (!proofFile) {
      toast({
        title: "Bukti transfer diperlukan",
        description: "Upload bukti transfer Anda",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Save payment data
    const paymentData = {
      id: Date.now(),
      type,
      senderName,
      amount: tagihan,
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
        title: "Pembayaran Terkirim! ✅",
        description: "Menunggu konfirmasi dari Admin Pusat",
      });
      navigate("/payment-pending");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-4 py-8">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/20">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={logoMpj} alt="Media Pondok Jawa Timur" className="h-14 object-contain" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Pembayaran Administrasi 💳
            </h1>
            <p className="text-muted-foreground text-sm">
              {type === "claim" ? "Aktivasi Akun Legacy" : "Pendaftaran Pesantren Baru"}
            </p>
          </div>

          {/* Amount Card */}
          <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white mb-6">
            <CardContent className="p-4 text-center">
              <p className="text-sm opacity-90">Total Tagihan</p>
              <p className="text-3xl font-bold">{tagihanFormatted}</p>
              <p className="text-xs opacity-75 mt-1">
                {type === "claim" ? "Diskon Aktivasi Legacy" : "Tarif Normal (3 Slot)"}
              </p>
            </CardContent>
          </Card>

          {/* Bank Info */}
          <Card className="bg-muted/30 border-border/50 mb-6">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
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
                    <p className="text-lg font-mono font-bold text-foreground">{bankInfo.accountNumber}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-9 px-3"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">a.n. {bankInfo.accountName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senderName" className="text-foreground">Nama Pengirim</Label>
              <Input
                id="senderName"
                type="text"
                placeholder="Nama sesuai rekening pengirim"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="h-11 rounded-xl border-border/50 focus:border-primary bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Upload Bukti Transfer</Label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                  proofPreview ? "border-emerald-500 bg-emerald-500/10" : "border-border/50 hover:border-primary"
                }`}>
                  {proofPreview ? (
                    <div className="space-y-2">
                      <img 
                        src={proofPreview} 
                        alt="Preview" 
                        className="max-h-32 mx-auto rounded-lg object-contain"
                      />
                      <p className="text-sm text-emerald-500 font-medium">
                        {proofFile?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">Klik untuk ganti</p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Klik atau drag file di sini
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              {isLoading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          {/* Info */}
          <div className="mt-6 p-3 bg-muted/30 rounded-xl flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">Proses Verifikasi</p>
              <p className="text-xs text-muted-foreground">
                Admin akan mengkonfirmasi pembayaran Anda dalam 1x24 jam kerja
              </p>
            </div>
          </div>

          {/* Back Link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors">
              ← Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;