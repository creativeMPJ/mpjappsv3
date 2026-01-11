import { useState, useEffect, useMemo } from "react";
import { 
  DollarSign, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Loader2,
  Save,
  RefreshCw,
  ClipboardList,
  Award,
  FileText,
  Clock,
  Building2,
  User,
  History,
  ShieldCheck,
  MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatNIP } from "@/lib/id-utils";
import JabatanCodesManagement from "./JabatanCodesManagement";
interface DebugData {
  pesantren?: unknown[];
  crews?: unknown[];
  regions?: unknown[];
  payments?: unknown[];
  claims?: unknown[];
}

interface Props {
  isDebugMode?: boolean;
  debugData?: DebugData;
}

interface ClaimRecord {
  id: string;
  user_id: string;
  pesantren_name: string;
  nama_pengelola: string | null;
  jenis_pengajuan: string;
  status: string;
  created_at: string;
  region_id: string | null;
  region_name?: string;
  mpj_id_number: string | null;
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
    region_id: string;
    mpj_id_number: string | null;
  };
  profiles?: {
    no_wa_pendaftar: string | null;
  };
}

interface LevelingProfile {
  id: string;
  nama_pesantren: string | null;
  nip: string | null;
  profile_level: string;
  sejarah: string | null;
  visi_misi: string | null;
  logo_url: string | null;
  foto_pengasuh_url: string | null;
  region_name?: string;
}

// Mobile Card Components
const ClaimCard = ({ claim, getStatusBadge, getJenisBadge }: { 
  claim: ClaimRecord; 
  getStatusBadge: (status: string) => JSX.Element;
  getJenisBadge: (jenis: string) => JSX.Element;
}) => (
  <Card className="bg-white border shadow-sm">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{claim.pesantren_name}</h4>
          <p className="text-sm text-muted-foreground">{claim.nama_pengelola || '-'}</p>
        </div>
        {getJenisBadge(claim.jenis_pengajuan)}
      </div>
      <div className="flex flex-wrap gap-2">
        {getStatusBadge(claim.status)}
        <Badge variant="outline" className="text-xs">{claim.region_name || '-'}</Badge>
      </div>
      {claim.mpj_id_number && (
        <p className="text-sm font-mono text-emerald-600">
          NIP: {formatNIP(claim.mpj_id_number, true)}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {new Date(claim.created_at).toLocaleDateString("id-ID")}
      </p>
    </CardContent>
  </Card>
);

const PaymentCard = ({ 
  payment, 
  getStatusBadge, 
  getJenisBadge, 
  formatCurrency,
  onViewProof,
  showActions = true 
}: { 
  payment: PaymentRecord; 
  getStatusBadge: (status: string) => JSX.Element;
  getJenisBadge: (jenis: string) => JSX.Element;
  formatCurrency: (amount: number) => string;
  onViewProof: (payment: PaymentRecord) => void;
  showActions?: boolean;
}) => (
  <Card className="bg-white border shadow-sm">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">
            {payment.pesantren_claims?.pesantren_name || '-'}
          </h4>
          <p className="text-sm text-muted-foreground">
            {payment.pesantren_claims?.nama_pengelola || '-'}
          </p>
        </div>
        {payment.pesantren_claims?.jenis_pengajuan && 
          getJenisBadge(payment.pesantren_claims.jenis_pengajuan)}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold font-mono">
            Rp {formatCurrency(payment.total_amount)}
          </span>
          <p className="text-xs text-muted-foreground">
            Kode: {payment.unique_code}
          </p>
        </div>
        {getStatusBadge(payment.status)}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {new Date(payment.created_at).toLocaleDateString("id-ID", {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        {showActions && payment.status === 'pending_verification' && payment.proof_file_url && (
          <Button size="sm" variant="outline" onClick={() => onViewProof(payment)}>
            <Eye className="h-4 w-4 mr-1" />
            Lihat Bukti
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

const LevelingCard = ({ 
  profile, 
  getLevelBadge, 
  onValidate 
}: { 
  profile: LevelingProfile;
  getLevelBadge: (level: string) => JSX.Element;
  onValidate: (profile: LevelingProfile) => void;
}) => (
  <Card className="bg-white border shadow-sm">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{profile.nama_pesantren}</h4>
          <p className="text-sm text-muted-foreground font-mono">
            NIP: {profile.nip ? formatNIP(profile.nip, true) : '-'}
          </p>
        </div>
        {getLevelBadge(profile.profile_level)}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span>Sejarah: {profile.sejarah ? '✓' : '✗'}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span>Visi Misi: {profile.visi_misi ? '✓' : '✗'}</span>
        </div>
      </div>
      {profile.profile_level === 'gold' && profile.sejarah && profile.visi_misi && (
        <Button size="sm" variant="outline" className="w-full" onClick={() => onValidate(profile)}>
          <Award className="h-4 w-4 mr-1" />
          Validasi ke Platinum
        </Button>
      )}
    </CardContent>
  </Card>
);

const AdminPusatAdministrasi = ({ isDebugMode, debugData }: Props = {}) => {
  const { toast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("monitoring");
  
  // Regional monitoring state
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(true);
  
  // Payment verification state
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifikasiSubTab, setVerifikasiSubTab] = useState<"pending" | "history">("pending");
  
  // Leveling validation state
  const [levelingProfiles, setLevelingProfiles] = useState<LevelingProfile[]>([]);
  const [isLoadingLeveling, setIsLoadingLeveling] = useState(true);
  
  // Price settings state
  const [registrationPrice, setRegistrationPrice] = useState<string>("50000");
  const [claimPrice, setClaimPrice] = useState<string>("20000");
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  // Fetch all data on mount or use debug data
  useEffect(() => {
    // DEBUG MODE: Use mock data instead of fetching from database
    if (isDebugMode && debugData) {
      // Map payments from debug data
      const paymentsData = (debugData.payments || []) as Array<Record<string, unknown>>;
      const mappedPayments: PaymentRecord[] = paymentsData.map((p) => ({
        id: String(p.id),
        user_id: String(p.user_id || ''),
        pesantren_claim_id: String(p.pesantren_claim_id || ''),
        base_amount: Number(p.base_amount) || 0,
        unique_code: Number(p.unique_code) || 0,
        total_amount: Number(p.total_amount) || 0,
        proof_file_url: (p.proof_file_url as string) || null,
        status: String(p.status || 'pending_payment'),
        created_at: (p.created_at as string) || new Date().toISOString(),
        pesantren_claims: {
          pesantren_name: (p.pesantren_name as string) || '-',
          nama_pengelola: (p.nama_pengelola as string) || '-',
          jenis_pengajuan: (p.jenis_pengajuan as string) || 'klaim',
          region_id: String(p.region_id || ''),
          mpj_id_number: (p.nip_issued as string) || null,
        },
      }));
      setPayments(mappedPayments);
      setIsLoadingPayments(false);

      // Map claims from debug data
      const claimsData = (debugData.claims || []) as Array<Record<string, unknown>>;
      const mappedClaims: ClaimRecord[] = claimsData.map((c) => ({
        id: String(c.id),
        user_id: String(c.user_id || ''),
        pesantren_name: (c.pesantren_name as string) || '-',
        nama_pengelola: (c.nama_pengelola as string) || null,
        jenis_pengajuan: String(c.jenis_pengajuan || 'klaim'),
        status: String(c.status || 'pending'),
        created_at: (c.created_at as string) || new Date().toISOString(),
        region_id: null,
        region_name: (c.region_name as string) || '-',
        mpj_id_number: null,
      }));
      setClaims(mappedClaims);
      setIsLoadingClaims(false);

      // Map leveling profiles from pesantren debug data
      const pesantrenData = (debugData.pesantren || []) as Array<Record<string, unknown>>;
      const mappedLeveling: LevelingProfile[] = pesantrenData
        .filter((p) => p.status_account === 'active' && ['silver', 'gold'].includes(String(p.profile_level)))
        .map((p) => ({
          id: String(p.id),
          nama_pesantren: (p.nama_pesantren as string) || null,
          nip: (p.nip as string) || null,
          profile_level: String(p.profile_level || 'basic'),
          sejarah: (p.sejarah as string) || null,
          visi_misi: (p.visi_misi as string) || null,
          logo_url: (p.logo_url as string) || null,
          foto_pengasuh_url: (p.foto_pengasuh_url as string) || null,
          region_name: (p.region_name as string) || '-',
        }));
      setLevelingProfiles(mappedLeveling);
      setIsLoadingLeveling(false);

      // Set default prices for debug
      setRegistrationPrice("50000");
      setClaimPrice("20000");
      setIsLoadingPrices(false);

      return;
    }

    fetchClaims();
    fetchPayments();
    fetchLevelingProfiles();
    fetchPriceSettings();
  }, [isDebugMode, debugData]);

  const fetchClaims = async () => {
    setIsLoadingClaims(true);
    try {
      const { data, error } = await supabase
        .from('pesantren_claims')
        .select(`
          *,
          regions!pesantren_claims_region_id_fkey (name)
        `)
        .in('status', ['regional_approved', 'pusat_approved'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setClaims((data || []).map((item: any) => ({
        ...item,
        region_name: item.regions?.name || '-'
      })));
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setIsLoadingClaims(false);
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
            jenis_pengajuan,
            region_id,
            mpj_id_number
          ),
          profiles:user_id (
            no_wa_pendaftar
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments((data || []).map((p: any) => ({
        ...p,
        profiles: p.profiles || { no_wa_pendaftar: null }
      })));
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const fetchLevelingProfiles = async () => {
    setIsLoadingLeveling(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          nama_pesantren,
          nip,
          profile_level,
          sejarah,
          visi_misi,
          logo_url,
          foto_pengasuh_url,
          regions!profiles_region_id_fkey (name)
        `)
        .eq('status_account', 'active')
        .in('profile_level', ['silver', 'gold'])
        .order('nama_pesantren', { ascending: true });

      if (error) throw error;
      
      setLevelingProfiles((data || []).map((item: any) => ({
        ...item,
        region_name: item.regions?.name || '-'
      })));
    } catch (error) {
      console.error('Error fetching leveling profiles:', error);
    } finally {
      setIsLoadingLeveling(false);
    }
  };

  const fetchPriceSettings = async () => {
    setIsLoadingPrices(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['registration_base_price', 'claim_base_price']);

      if (error) throw error;

      data?.forEach((setting: any) => {
        if (setting.key === 'registration_base_price') {
          setRegistrationPrice(setting.value?.toString() || "50000");
        } else if (setting.key === 'claim_base_price') {
          setClaimPrice(setting.value?.toString() || "20000");
        }
      });
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Payment handlers
  const handleViewProof = (payment: PaymentRecord) => {
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
      const regionId = selectedPayment.pesantren_claims?.region_id;

      if (!regionId) {
        throw new Error('Region ID tidak ditemukan');
      }

      // Check region code
      const { data: regionData, error: regionError } = await supabase
        .from('regions')
        .select('code, name')
        .eq('id', regionId)
        .single();

      if (regionError || !regionData) {
        throw new Error('Region tidak ditemukan');
      }

      if (!/^[0-9]{2}$/.test(regionData.code)) {
        toast({
          title: "Kode RR Belum Valid",
          description: `Regional "${regionData.name}" belum memiliki kode RR 2 digit.`,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Generate NIP
      const { data: nipData, error: nipError } = await supabase
        .rpc('generate_nip', {
          p_claim_id: selectedPayment.pesantren_claim_id,
          p_region_id: regionId
        });

      if (nipError) throw nipError;

      const generatedNIP = nipData;
      
      // Update payment
      await supabase
        .from('payments')
        .update({
          status: 'verified',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', selectedPayment.id);

      // Update claim
      await supabase
        .from('pesantren_claims')
        .update({ 
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', selectedPayment.pesantren_claim_id);

      // Update profile
      await supabase
        .from('profiles')
        .update({
          status_account: 'active',
          status_payment: 'paid',
          nip: generatedNIP,
        })
        .eq('id', selectedPayment.user_id);

      toast({
        title: "NIP Diterbitkan",
        description: `NIP: ${formatNIP(generatedNIP, true)} - Akun telah diaktifkan`,
      });

      // Open WhatsApp with notification
      const phoneNumber = selectedPayment.profiles?.no_wa_pendaftar;
      const pesantrenName = selectedPayment.pesantren_claims?.pesantren_name || 'Pesantren';
      if (phoneNumber) {
        const waMessage = encodeURIComponent(
          `Assalamu'alaikum, pembayaran aktivasi Anda telah kami verifikasi. NIP & NIAM untuk ${pesantrenName} telah AKTIF. Silakan cek dashboard Anda untuk mendownload E-ID dan Piagam. Terima kasih.`
        );
        const cleanPhone = phoneNumber.replace(/\D/g, '').replace(/^0/, '62');
        window.open(`https://wa.me/${cleanPhone}?text=${waMessage}`, '_blank');
      }

      setConfirmDialogOpen(false);
      setProofModalOpen(false);
      fetchPayments();
      fetchClaims();
    } catch (error: any) {
      console.error('Error approving payment:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memverifikasi pembayaran",
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
      // Update status to pending_payment so user can re-upload
      await supabase
        .from('payments')
        .update({
          status: 'pending_payment',
          rejection_reason: rejectionReason,
          proof_file_url: null, // Clear old proof
        })
        .eq('id', selectedPayment.id);

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

  // Leveling handlers
  const handleValidatePlatinum = async (profile: LevelingProfile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_level: 'platinum' })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `${profile.nama_pesantren} telah dipromosikan ke Platinum`,
      });

      fetchLevelingProfiles();
    } catch (error) {
      console.error('Error updating level:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui level",
        variant: "destructive",
      });
    }
  };

  // Price handlers
  const handleSavePrices = async () => {
    setIsSavingPrices(true);
    try {
      await supabase
        .from('system_settings')
        .upsert([
          { key: 'registration_base_price', value: parseInt(registrationPrice) },
          { key: 'claim_base_price', value: parseInt(claimPrice) }
        ], { onConflict: 'key' });

      toast({
        title: "Berhasil",
        description: "Pengaturan harga telah disimpan",
      });
    } catch (error) {
      console.error('Error saving prices:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      });
    } finally {
      setIsSavingPrices(false);
    }
  };

  // Helper functions
  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID").format(amount);

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case 'regional_approved':
        return <Badge className="bg-blue-500 text-white">Disetujui Regional</Badge>;
      case 'pusat_approved':
        return <Badge className="bg-emerald-500 text-white">Disetujui Pusat</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 text-white">Aktif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <Badge variant="outline" className="bg-slate-100">Belum Bayar</Badge>;
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
      return <Badge variant="outline" className="bg-amber-100 text-amber-700">Akun Lama</Badge>;
    }
    return <Badge variant="outline" className="bg-blue-100 text-blue-700">Akun Baru</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      basic: "bg-slate-100 text-slate-800",
      silver: "bg-gray-200 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-purple-100 text-purple-800",
    };
    return <Badge className={colors[level] || colors.basic}>{level.toUpperCase()}</Badge>;
  };

  // Counts
  const pendingPaymentsCount = useMemo(() => 
    payments.filter(p => p.status === 'pending_verification').length, [payments]);
  const pendingLevelingCount = useMemo(() => 
    levelingProfiles.filter(p => p.profile_level === 'gold' && p.sejarah && p.visi_misi).length, [levelingProfiles]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administrasi</h1>
          <p className="text-muted-foreground">Pusat verifikasi dan validasi MPJ</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {pendingPaymentsCount > 0 && (
            <Badge className="bg-amber-500 text-white px-3 py-1">
              {pendingPaymentsCount} Pembayaran Pending
            </Badge>
          )}
          {pendingLevelingCount > 0 && (
            <Badge className="bg-purple-500 text-white px-3 py-1">
              {pendingLevelingCount} Siap Platinum
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="monitoring" className="flex-1 min-w-[120px] flex items-center gap-1 text-xs md:text-sm">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Monitoring</span>
            <span className="sm:hidden">Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="verifikasi" className="flex-1 min-w-[120px] flex items-center gap-1 text-xs md:text-sm">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Verifikasi</span>
            <span className="sm:hidden">Verif</span>
          </TabsTrigger>
          <TabsTrigger value="leveling" className="flex-1 min-w-[120px] flex items-center gap-1 text-xs md:text-sm">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Validasi Level</span>
            <span className="sm:hidden">Level</span>
          </TabsTrigger>
          <TabsTrigger value="jabatan" className="flex-1 min-w-[120px] flex items-center gap-1 text-xs md:text-sm">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Kode Jabatan</span>
            <span className="sm:hidden">Jabatan</span>
          </TabsTrigger>
          <TabsTrigger value="harga" className="flex-1 min-w-[120px] flex items-center gap-1 text-xs md:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Setting Harga</span>
            <span className="sm:hidden">Harga</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Monitoring Pendaftaran */}
        <TabsContent value="monitoring">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Monitoring Pendaftaran Regional
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchClaims}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingClaims ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : claims.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada pendaftaran yang disetujui Regional</p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {claims.map((claim) => (
                      <ClaimCard 
                        key={claim.id} 
                        claim={claim} 
                        getStatusBadge={getClaimStatusBadge}
                        getJenisBadge={getJenisBadge}
                      />
                    ))}
                  </div>
                  
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Pesantren</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Pengelola</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Jenis</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Regional</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">NIP</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claims.map((claim) => (
                          <tr key={claim.id} className="border-b">
                            <td className="py-3 px-2 font-medium">{claim.pesantren_name}</td>
                            <td className="py-3 px-2">{claim.nama_pengelola || '-'}</td>
                            <td className="py-3 px-2">{getJenisBadge(claim.jenis_pengajuan)}</td>
                            <td className="py-3 px-2">{claim.region_name}</td>
                            <td className="py-3 px-2 font-mono">
                              {claim.mpj_id_number ? formatNIP(claim.mpj_id_number, true) : '-'}
                            </td>
                            <td className="py-3 px-2">{getClaimStatusBadge(claim.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              <p className="text-xs text-muted-foreground mt-4 text-center">
                * Data Read-Only. Penerbitan NIP dilakukan melalui tab Verifikasi Pembayaran.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Verifikasi Pembayaran */}
        <TabsContent value="verifikasi">
          <Card>
            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Verifikasi Pembayaran Aktivasi
                </CardTitle>
                <Button variant="outline" size="sm" onClick={fetchPayments}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              {/* Sub-tabs for Verifikasi */}
              <div className="flex gap-2">
                <Button 
                  variant={verifikasiSubTab === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVerifikasiSubTab("pending")}
                  className={verifikasiSubTab === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}
                >
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  Verifikasi Aktivasi
                  {pendingPaymentsCount > 0 && (
                    <Badge className="ml-2 bg-white text-amber-600">{pendingPaymentsCount}</Badge>
                  )}
                </Button>
                <Button 
                  variant={verifikasiSubTab === "history" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVerifikasiSubTab("history")}
                  className={verifikasiSubTab === "history" ? "bg-slate-600 hover:bg-slate-700" : ""}
                >
                  <History className="h-4 w-4 mr-1" />
                  Log Transaksi
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPayments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : verifikasiSubTab === "pending" ? (
                // Pending Verification Tab
                (() => {
                  const pendingPayments = payments.filter(p => p.status === 'pending_verification');
                  return pendingPayments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Tidak ada pembayaran yang menunggu verifikasi</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Cards */}
                      <div className="grid grid-cols-1 gap-4 md:hidden">
                        {pendingPayments.map((payment) => (
                          <PaymentCard 
                            key={payment.id} 
                            payment={payment} 
                            getStatusBadge={getPaymentStatusBadge}
                            getJenisBadge={getJenisBadge}
                            formatCurrency={formatCurrency}
                            onViewProof={handleViewProof}
                          />
                        ))}
                      </div>
                      
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-amber-50">
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tanggal Upload</th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nama Pesantren</th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nama Pengirim</th>
                              <th className="text-right py-3 px-2 font-medium text-muted-foreground">Nominal (+ Kode Unik)</th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Jenis</th>
                              <th className="text-center py-3 px-2 font-medium text-muted-foreground">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingPayments.map((payment) => (
                              <tr key={payment.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-2 whitespace-nowrap">
                                  {new Date(payment.created_at).toLocaleDateString("id-ID", {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </td>
                                <td className="py-3 px-2 font-medium">
                                  {payment.pesantren_claims?.pesantren_name || '-'}
                                </td>
                                <td className="py-3 px-2">
                                  {payment.pesantren_claims?.nama_pengelola || '-'}
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <div className="font-mono font-bold">
                                    Rp {formatCurrency(payment.total_amount)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    (Rp {formatCurrency(payment.base_amount)} + {payment.unique_code})
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  {payment.pesantren_claims?.jenis_pengajuan && 
                                    getJenisBadge(payment.pesantren_claims.jenis_pengajuan)}
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleViewProof(payment)}
                                    className="bg-amber-500 hover:bg-amber-600"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Lihat Bukti
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()
              ) : (
                // History Tab (All Transactions)
                (() => {
                  const historyPayments = payments.filter(p => p.status !== 'pending_verification');
                  return historyPayments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Belum ada riwayat transaksi</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Cards */}
                      <div className="grid grid-cols-1 gap-4 md:hidden">
                        {historyPayments.map((payment) => (
                          <PaymentCard 
                            key={payment.id} 
                            payment={payment} 
                            getStatusBadge={getPaymentStatusBadge}
                            getJenisBadge={getJenisBadge}
                            formatCurrency={formatCurrency}
                            onViewProof={handleViewProof}
                            showActions={false}
                          />
                        ))}
                      </div>
                      
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tanggal</th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Pesantren</th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Pengirim</th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Jenis</th>
                              <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historyPayments.map((payment) => (
                              <tr key={payment.id} className="border-b">
                                <td className="py-3 px-2 whitespace-nowrap">
                                  {new Date(payment.created_at).toLocaleDateString("id-ID")}
                                </td>
                                <td className="py-3 px-2 font-medium">
                                  {payment.pesantren_claims?.pesantren_name || '-'}
                                </td>
                                <td className="py-3 px-2">
                                  {payment.pesantren_claims?.nama_pengelola || '-'}
                                </td>
                                <td className="py-3 px-2">
                                  {payment.pesantren_claims?.jenis_pengajuan && 
                                    getJenisBadge(payment.pesantren_claims.jenis_pengajuan)}
                                </td>
                                <td className="py-3 px-2 text-right font-mono">
                                  Rp {formatCurrency(payment.total_amount)}
                                </td>
                                <td className="py-3 px-2">{getPaymentStatusBadge(payment.status)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Validasi Leveling */}
        <TabsContent value="leveling">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Validasi Level Platinum
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchLevelingProfiles}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingLeveling ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : levelingProfiles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Semua pesantren aktif sudah Platinum</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {levelingProfiles.map((profile) => (
                    <LevelingCard 
                      key={profile.id} 
                      profile={profile} 
                      getLevelBadge={getLevelBadge}
                      onValidate={handleValidatePlatinum}
                    />
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4 text-center">
                * Pesantren Gold dengan Sejarah dan Visi Misi lengkap dapat dipromosikan ke Platinum
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Kode Jabatan */}
        <TabsContent value="jabatan">
          <JabatanCodesManagement />
        </TabsContent>

        {/* Tab: Setting Harga */}
        <TabsContent value="harga">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Pengaturan Harga Pendaftaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingPrices ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Harga Pendaftaran Baru</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={registrationPrice}
                          onChange={(e) => setRegistrationPrice(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Untuk pesantren yang baru pertama kali mendaftar
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Harga Klaim Akun Lama</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={claimPrice}
                          onChange={(e) => setClaimPrice(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Untuk pesantren yang mengklaim data Legacy
                      </p>
                    </div>
                  </div>

                  <Card className="bg-muted/50 border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Masa Aktif Keanggotaan</span>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Fitur periode keanggotaan tahunan akan tersedia di update selanjutnya.
                      </p>
                    </CardContent>
                  </Card>

                  <Button 
                    onClick={handleSavePrices} 
                    disabled={isSavingPrices}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isSavingPrices ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Simpan Pengaturan
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Proof Modal */}
      <Dialog open={proofModalOpen} onOpenChange={setProofModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Verifikasi Bukti Pembayaran
            </DialogTitle>
            <DialogDescription>
              Periksa keaslian bukti transfer sebelum menerbitkan NIP
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Payment Details */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {selectedPayment?.pesantren_claims?.pesantren_name || '-'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  {selectedPayment?.pesantren_claims?.nama_pengelola || '-'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                <span className="text-muted-foreground">Nominal Dasar:</span>
                <span className="font-mono">
                  Rp {formatCurrency(selectedPayment?.base_amount || 0)}
                </span>
                <span className="text-muted-foreground">Kode Unik:</span>
                <span className="font-mono text-amber-600 font-bold">
                  +{selectedPayment?.unique_code}
                </span>
                <span className="text-muted-foreground font-semibold">Total Transfer:</span>
                <span className="font-mono font-bold text-emerald-600">
                  Rp {formatCurrency(selectedPayment?.total_amount || 0)}
                </span>
              </div>
            </div>
            
            {/* Proof Image */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Bukti Transfer:</p>
              {selectedPayment?.proof_file_url ? (
                <img
                  src={getProofUrl(selectedPayment.proof_file_url) || ''}
                  alt="Bukti Transfer"
                  className="w-full rounded-lg border shadow-sm"
                />
              ) : (
                <div className="text-center py-8 bg-muted rounded-lg text-muted-foreground">
                  Tidak ada bukti yang diunggah
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={() => setRejectDialogOpen(true)}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Tolak
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setConfirmDialogOpen(true)}
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Konfirmasi & Terbitkan NIP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Konfirmasi Penerbitan NIP
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Dengan mengkonfirmasi, sistem akan:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Memperbarui status pembayaran menjadi <strong>Verified</strong></li>
                <li>Mengaktifkan akun pesantren menjadi <strong>Active</strong></li>
                <li>Menerbitkan <strong>NIP</strong> secara otomatis</li>
                <li>Membuka WhatsApp untuk notifikasi ke pengaju</li>
              </ul>
              <p className="text-amber-600 font-medium pt-2">Tindakan ini tidak dapat dibatalkan.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprovePayment}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                </>
              )}
              Konfirmasi & Kirim WA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Tolak Pembayaran
            </AlertDialogTitle>
            <AlertDialogDescription>
              Masukkan alasan penolakan. User akan bisa mengirim ulang bukti pembayaran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Contoh: Nominal tidak sesuai, bukti tidak jelas, nama pengirim berbeda..."
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectPayment}
              disabled={isProcessing || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Tolak & Minta Upload Ulang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPusatAdministrasi;
