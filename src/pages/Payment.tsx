import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Copy, Check, ArrowRight, ArrowLeft, Building2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MAX_FILE_SIZE = 350 * 1024; // 350KB - Global limit

const Payment = () => {
  const [senderName, setSenderName] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  
  // Dynamic data from database
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [uniqueCode, setUniqueCode] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [claimData, setClaimData] = useState<{
    id: string;
    pesantren_name: string;
    jenis_pengajuan: string;
    status: string;
  } | null>(null);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [bankInfo, setBankInfo] = useState({
    bank: "Bank Syariah Indonesia (BSI)",
    accountNumber: "7171234567890",
    accountName: "MEDIA PONDOK JAWA TIMUR",
  });

  // Check access and load payment data
  useEffect(() => {
    const initializePayment = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      setIsCheckingAccess(true);
      
      try {
        // 1. Check pesantren_claims status
        const { data: claim, error: claimError } = await supabase
          .from('pesantren_claims')
          .select('id, pesantren_name, jenis_pengajuan, status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (claimError) throw claimError;

        if (!claim) {
          setAccessDeniedReason("Anda belum mendaftarkan pesantren.");
          setIsCheckingAccess(false);
          return;
        }

        // Check claim status
        if (claim.status === 'pending') {
          setAccessDeniedReason("Menunggu verifikasi dari Admin Wilayah. Silakan tunggu proses validasi dokumen Anda.");
          setIsCheckingAccess(false);
          return;
        }

        if (claim.status === 'rejected') {
          setAccessDeniedReason("Pengajuan Anda ditolak oleh Admin Wilayah. Silakan hubungi admin untuk informasi lebih lanjut.");
          setIsCheckingAccess(false);
          return;
        }

        if (claim.status === 'approved' || claim.status === 'pusat_approved') {
          // Already activated, redirect to dashboard
          navigate('/user', { replace: true });
          return;
        }

        // Only regional_approved can access payment
        if (claim.status !== 'regional_approved') {
          setAccessDeniedReason("Status pengajuan tidak valid untuk pembayaran.");
          setIsCheckingAccess(false);
          return;
        }

        setClaimData(claim);

        // 2. Get base price from system_settings based on jenis_pengajuan
        const priceKey = claim.jenis_pengajuan === 'klaim' 
          ? 'claim_base_price' 
          : 'registration_base_price';

        const { data: priceSetting, error: priceError } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', priceKey)
          .single();

        if (priceError) throw priceError;

        const fetchedBaseAmount = parseInt(String(priceSetting.value).replace(/"/g, '')) || 50000;
        setBaseAmount(fetchedBaseAmount);

        // Fetch bank info from system_settings
        const { data: bankSettings } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['bank_name', 'bank_account_number', 'bank_account_name']);

        if (bankSettings && bankSettings.length > 0) {
          const bankData: Record<string, string> = {};
          bankSettings.forEach(setting => {
            bankData[setting.key] = String(setting.value).replace(/"/g, '');
          });
          
          setBankInfo({
            bank: bankData.bank_name || "Bank Syariah Indonesia (BSI)",
            accountNumber: bankData.bank_account_number || "7171234567890",
            accountName: bankData.bank_account_name || "MEDIA PONDOK JAWA TIMUR",
          });
        }

        // 3. Check if payment record already exists (for persisted unique code)
        const { data: existingPayment, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .eq('pesantren_claim_id', claim.id)
          .maybeSingle();

        if (paymentError && paymentError.code !== 'PGRST116') throw paymentError;

        if (existingPayment) {
          // Use existing payment data (persisted unique code)
          setPaymentId(existingPayment.id);
          setUniqueCode(existingPayment.unique_code);
          setTotalAmount(existingPayment.total_amount);
          
          // If already pending verification, redirect
          if (existingPayment.status === 'pending_verification') {
            navigate('/payment-pending', { replace: true });
            return;
          }
          
          // If verified, redirect to dashboard
          if (existingPayment.status === 'verified') {
            navigate('/user', { replace: true });
            return;
          }
        } else {
          // Generate new unique code and create payment record
          const newUniqueCode = Math.floor(Math.random() * 900) + 100;
          const newTotalAmount = fetchedBaseAmount + newUniqueCode;
          
          const { data: newPayment, error: insertError } = await supabase
            .from('payments')
            .insert({
              user_id: user.id,
              pesantren_claim_id: claim.id,
              base_amount: fetchedBaseAmount,
              unique_code: newUniqueCode,
              total_amount: newTotalAmount,
              status: 'pending_payment',
            })
            .select()
            .single();

          if (insertError) throw insertError;

          setPaymentId(newPayment.id);
          setUniqueCode(newUniqueCode);
          setTotalAmount(newTotalAmount);
        }

      } catch (error: any) {
        console.error('Error initializing payment:', error);
        toast({
          title: "Error",
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
    navigator.clipboard.writeText(bankInfo.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
    toast({
      title: "Disalin!",
      description: "Nomor rekening telah disalin",
    });
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(totalAmount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
    toast({
      title: "Disalin!",
      description: "Nominal tagihan telah disalin",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    if (!paymentId || !user) {
      toast({
        title: "Error",
        description: "Data pembayaran tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload proof file to storage
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile);

      if (uploadError) throw uploadError;

      // Update payment record
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          proof_file_url: fileName,
          status: 'pending_verification',
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      toast({
        title: "Pembayaran Terkirim!",
        description: "Menunggu konfirmasi Admin",
      });
      
      navigate("/payment-pending");
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Gagal mengirim",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  // Loading state
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

  // Access denied state
  if (accessDeniedReason) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Akses Pembayaran Ditolak
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {accessDeniedReason}
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-primary/90 to-primary">
      {/* Header */}
      <div className="flex-shrink-0 pt-6 pb-3 px-4">
        <Link to="/login" className="inline-flex items-center text-primary-foreground/80 text-sm mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-foreground">Pembayaran</h1>
          <p className="text-xs text-primary-foreground/70">
            {claimData?.jenis_pengajuan === 'klaim' ? "Aktivasi Akun Legacy" : "Registrasi Pesantren Baru"}
          </p>
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-card rounded-t-3xl px-5 pt-5 pb-8 overflow-y-auto">
        {/* Pesantren Info */}
        {claimData && (
          <div className="bg-muted/30 rounded-xl p-3 mb-4">
            <p className="text-xs text-muted-foreground">Pesantren:</p>
            <p className="font-semibold text-foreground">{claimData.pesantren_name}</p>
          </div>
        )}

        {/* Amount Card */}
        <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white mb-5">
          <CardContent className="p-4">
            <p className="text-xs opacity-90 mb-1 text-center">Total Tagihan</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-bold">Rp {formatCurrency(totalAmount)},-</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAmount}
                className="h-8 w-8 p-0 hover:bg-white/20"
              >
                {copiedAmount ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4 text-white/80" />}
              </Button>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs opacity-80">
              <span>Dasar: Rp {formatCurrency(baseAmount)}</span>
              <span>+</span>
              <span>Kode: {uniqueCode}</span>
            </div>
          </CardContent>
        </Card>

        {/* Warning Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
          <p className="text-xs text-amber-800 text-center font-medium">
            ⚠️ PENTING: Transfer <strong>TEPAT</strong> sesuai nominal hingga 3 digit terakhir. 
            Perbedaan nominal akan menghambat proses verifikasi ID Anda.
          </p>
        </div>

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
                  onClick={handleCopyAccount}
                  className="h-8 px-2"
                >
                  {copiedAccount ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
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
            <Label className="text-sm">Upload Bukti Transfer (Maks. 350KB)</Label>
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
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG (Maks. 350KB)</p>
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
