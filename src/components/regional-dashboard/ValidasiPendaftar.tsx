import { useState, useEffect, useMemo, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Clock,
  AlertTriangle,
  Loader2,
  Building2,
  History,
  MessageCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { maskPhoneNumber, maskEmail, maskName } from "@/lib/privacy-utils";
import LatePaymentFollowUp from "./LatePaymentFollowUp";

interface PesantrenClaim {
  id: string;
  user_id: string;
  pesantren_name: string;
  status: 'pending' | 'regional_approved' | 'pusat_approved' | 'approved' | 'rejected';
  region_id: string | null;
  kecamatan: string | null;
  nama_pengelola: string | null;
  email_pengelola: string | null;
  dokumen_bukti_url: string | null;
  notes: string | null;
  claimed_at: string;
  created_at: string;
  jenis_pengajuan: 'klaim' | 'pesantren_baru';
  nama_pengasuh?: string | null;
  alamat_singkat?: string | null;
  no_wa_pendaftar?: string | null;
  regional_approved_at?: string | null;
}

interface ValidasiPendaftarProps {
  isDebugMode?: boolean;
}

// Mobile Card Component
const ClaimCard = memo(({ 
  claim, 
  onView, 
  formatDate, 
  getStatusBadge, 
  getJenisBadge 
}: { 
  claim: PesantrenClaim;
  onView: (claim: PesantrenClaim) => void;
  formatDate: (date: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
  getJenisBadge: (jenis: string) => JSX.Element;
}) => (
  <Card className="bg-card border border-border hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base truncate">{claim.pesantren_name}</h3>
          <p className="text-sm text-muted-foreground">{claim.kecamatan || 'Kecamatan tidak diisi'}</p>
        </div>
        {getJenisBadge(claim.jenis_pengajuan)}
      </div>
      
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{formatDate(claim.created_at)}</span>
        </div>
        {getStatusBadge(claim.status)}
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        <span className="font-medium">Pengelola:</span> {maskName(claim.nama_pengelola) || '-'}
      </div>
      
      <Button
        onClick={() => onView(claim)}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px]"
      >
        <Eye className="w-4 h-4 mr-2" />
        Periksa Detail
      </Button>
    </CardContent>
  </Card>
));

ClaimCard.displayName = 'ClaimCard';

// Mock data for debug mode
const MOCK_CLAIMS: PesantrenClaim[] = [
  {
    id: 'mock-1',
    user_id: 'user-1',
    pesantren_name: 'PP Al-Hikmah Singosari',
    status: 'pending',
    region_id: 'malang-region',
    kecamatan: 'Singosari',
    nama_pengelola: 'Ahmad Fauzi',
    email_pengelola: 'fauzi@email.com',
    dokumen_bukti_url: '/placeholder.svg',
    notes: null,
    claimed_at: '2025-01-05T10:00:00Z',
    created_at: '2025-01-05T10:00:00Z',
    jenis_pengajuan: 'pesantren_baru',
    nama_pengasuh: 'KH. Ahmad Fauzi',
    alamat_singkat: 'Jl. Raya Singosari No. 123',
    no_wa_pendaftar: '081234567890',
  },
  {
    id: 'mock-2',
    user_id: 'user-2',
    pesantren_name: 'PP Darul Ulum Jombang',
    status: 'pending',
    region_id: 'malang-region',
    kecamatan: 'Lowokwaru',
    nama_pengelola: 'Budi Santoso',
    email_pengelola: 'budi@email.com',
    dokumen_bukti_url: '/placeholder.svg',
    notes: null,
    claimed_at: '2025-01-04T09:00:00Z',
    created_at: '2025-01-04T09:00:00Z',
    jenis_pengajuan: 'klaim',
    nama_pengasuh: 'KH. Budi Santoso',
    alamat_singkat: 'Jl. Veteran No. 45',
    no_wa_pendaftar: '081234567891',
  },
  {
    id: 'mock-3',
    user_id: 'user-3',
    pesantren_name: 'PP Nurul Jadid',
    status: 'rejected',
    region_id: 'malang-region',
    kecamatan: 'Kedungkandang',
    nama_pengelola: 'Cahya Dewi',
    email_pengelola: 'cahya@email.com',
    dokumen_bukti_url: null,
    notes: 'Dokumen SK tidak valid',
    claimed_at: '2025-01-03T08:00:00Z',
    created_at: '2025-01-03T08:00:00Z',
    jenis_pengajuan: 'klaim',
    nama_pengasuh: 'KH. M. Yusuf',
    alamat_singkat: 'Jl. Masjid No. 12',
    no_wa_pendaftar: '081234567892',
  },
  {
    id: 'mock-4',
    user_id: 'user-4',
    pesantren_name: 'PP Al-Falah Blitar',
    status: 'pending',
    region_id: 'malang-region',
    kecamatan: 'Blimbing',
    nama_pengelola: 'Dedi Kurniawan',
    email_pengelola: 'dedi@email.com',
    dokumen_bukti_url: '/placeholder.svg',
    notes: null,
    claimed_at: '2025-01-02T14:00:00Z',
    created_at: '2025-01-02T14:00:00Z',
    jenis_pengajuan: 'pesantren_baru',
    nama_pengasuh: 'KH. Dedi Kurniawan',
    alamat_singkat: 'Jl. Sukarno Hatta No. 78',
    no_wa_pendaftar: '081234567893',
  },
  {
    id: 'mock-5',
    user_id: 'user-5',
    pesantren_name: 'PP Miftahul Huda',
    status: 'pending',
    region_id: 'malang-region',
    kecamatan: 'Sukun',
    nama_pengelola: 'Eva Fitriani',
    email_pengelola: 'eva@email.com',
    dokumen_bukti_url: '/placeholder.svg',
    notes: null,
    claimed_at: '2025-01-01T11:00:00Z',
    created_at: '2025-01-01T11:00:00Z',
    jenis_pengajuan: 'klaim',
    nama_pengasuh: 'Nyai Hj. Eva Fitriani',
    alamat_singkat: 'Jl. Sukun Raya No. 56',
    no_wa_pendaftar: '081234567894',
  },
];

const ValidasiPendaftar = ({ isDebugMode = false }: ValidasiPendaftarProps) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PesantrenClaim[]>([]);
  const [filteredData, setFilteredData] = useState<PesantrenClaim[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState<'all' | 'klaim' | 'pesantren_baru'>('all');
  const [selectedClaim, setSelectedClaim] = useState<PesantrenClaim | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch claims from database
  const fetchClaims = async () => {
    if (isDebugMode) {
      setData(MOCK_CLAIMS);
      setFilteredData(MOCK_CLAIMS);
      setLoading(false);
      return;
    }

    if (!profile?.region_id) {
      setLoading(false);
      return;
    }

    try {
      const { data: claims, error } = await supabase
        .from('pesantren_claims')
        .select('*')
        .eq('region_id', profile.region_id)
        .in('status', ['pending', 'rejected'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching claims:', error);
        toast({
          title: "Gagal memuat data",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!claims || claims.length === 0) {
        setData([]);
        setFilteredData([]);
        setLoading(false);
        return;
      }

      const userIds = claims.map(c => c.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nama_pengasuh, alamat_singkat, no_wa_pendaftar')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const enrichedClaims: PesantrenClaim[] = claims.map(claim => ({
        ...claim,
        nama_pengasuh: profileMap.get(claim.user_id)?.nama_pengasuh || null,
        alamat_singkat: profileMap.get(claim.user_id)?.alamat_singkat || null,
        no_wa_pendaftar: profileMap.get(claim.user_id)?.no_wa_pendaftar || null,
      }));

      setData(enrichedClaims);
      setFilteredData(enrichedClaims);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [profile?.region_id, isDebugMode]);

  // Memoized filtered data
  const processedData = useMemo(() => {
    let result = data;
    
    // Filter by jenis
    if (filterJenis !== 'all') {
      result = result.filter(item => item.jenis_pengajuan === filterJenis);
    }
    
    // Filter by search
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.pesantren_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.nama_pengelola?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }
    
    return result;
  }, [data, filterJenis, searchQuery]);

  useEffect(() => {
    setFilteredData(processedData);
    setCurrentPage(1);
  }, [processedData]);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 3;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3);
      } else if (currentPage >= totalPages - 1) {
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1);
      }
    }
    return pages;
  };

  const handleViewClick = (claim: PesantrenClaim) => {
    setSelectedClaim(claim);
    setDialogOpen(true);
  };

  const handleViewDocument = async () => {
    if (!selectedClaim?.dokumen_bukti_url) {
      toast({
        title: "Dokumen tidak tersedia",
        description: "Pendaftar tidak mengunggah dokumen bukti",
        variant: "destructive",
      });
      return;
    }

    if (isDebugMode) {
      toast({
        title: "Mode Debug",
        description: "Dokumen tidak tersedia di mode simulasi",
      });
      return;
    }

    try {
      const { data: urlData } = await supabase.storage
        .from('registration-documents')
        .createSignedUrl(selectedClaim.dokumen_bukti_url, 3600);

      if (urlData?.signedUrl) {
        window.open(urlData.signedUrl, '_blank');
      } else {
        toast({
          title: "Gagal membuka dokumen",
          description: "Tidak dapat mengakses file dokumen",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error getting document URL:', error);
      toast({
        title: "Error",
        description: "Gagal mengakses dokumen",
        variant: "destructive",
      });
    }
  };

  // Generate WhatsApp message for approval notification - different for klaim vs pesantren_baru
  const generateApprovalWhatsAppUrl = (claim: PesantrenClaim) => {
    const phone = claim.no_wa_pendaftar?.replace(/^0/, '62') || '';
    const isKlaim = claim.jenis_pengajuan === 'klaim';
    
    const message = isKlaim
      ? encodeURIComponent(
          `Assalamu'alaikum,\n\nBerkas *KLAIM AKUN* MPJ Apps untuk *${claim.pesantren_name}* telah kami verifikasi dan disetujui.\n\nAkun Anda sudah aktif dengan data lama. Silakan login untuk mulai mengelola profil.\n\nTerima kasih.`
        )
      : encodeURIComponent(
          `Assalamu'alaikum,\n\nBerkas *PENDAFTARAN BARU* MPJ Apps untuk *${claim.pesantren_name}* telah kami verifikasi dan disetujui.\n\nSilakan login dan lanjutkan ke proses pembayaran untuk mendapatkan NIP/NIAM resmi.\n\nTerima kasih.`
        );
    
    return `https://wa.me/${phone}?text=${message}`;
  };

  const handleApprove = async () => {
    if (!selectedClaim) return;

    if (isDebugMode) {
      toast({
        title: "Mode Debug",
        description: `Klaim ${selectedClaim.pesantren_name} akan disetujui (simulasi)`,
      });
      setApproveDialogOpen(false);
      setDialogOpen(false);
      return;
    }

    setIsProcessing(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('pesantren_claims')
        .update({ 
          status: 'regional_approved',
          approved_at: now,
          approved_by: profile?.id,
          regional_approved_at: now
        })
        .eq('id', selectedClaim.id);

      if (error) throw error;

      toast({
        title: "Berhasil Disetujui!",
        description: `Klaim ${selectedClaim.pesantren_name} telah disetujui wilayah.`,
      });

      await fetchClaims();
      setApproveDialogOpen(false);
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Approve error:', error);
      toast({
        title: "Gagal menyetujui",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve and contact via WhatsApp
  const handleApproveAndContact = async () => {
    if (!selectedClaim) return;

    if (isDebugMode) {
      toast({
        title: "Mode Debug",
        description: `Klaim ${selectedClaim.pesantren_name} akan disetujui & dihubungi (simulasi)`,
      });
      setApproveDialogOpen(false);
      setDialogOpen(false);
      return;
    }

    setIsProcessing(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('pesantren_claims')
        .update({ 
          status: 'regional_approved',
          approved_at: now,
          approved_by: profile?.id,
          regional_approved_at: now
        })
        .eq('id', selectedClaim.id);

      if (error) throw error;

      toast({
        title: "Berhasil Disetujui!",
        description: `Klaim ${selectedClaim.pesantren_name} telah disetujui. Membuka WhatsApp...`,
      });

      // Open WhatsApp with pre-filled message
      if (selectedClaim.no_wa_pendaftar) {
        window.open(generateApprovalWhatsAppUrl(selectedClaim), '_blank');
      }

      await fetchClaims();
      setApproveDialogOpen(false);
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Approve error:', error);
      toast({
        title: "Gagal menyetujui",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;

    if (!rejectReason.trim()) {
      toast({
        title: "Alasan diperlukan",
        description: "Mohon isi alasan penolakan",
        variant: "destructive",
      });
      return;
    }

    if (isDebugMode) {
      toast({
        title: "Mode Debug",
        description: `Klaim ${selectedClaim.pesantren_name} akan ditolak (simulasi)`,
        variant: "destructive",
      });
      setRejectDialogOpen(false);
      setRejectReason("");
      setDialogOpen(false);
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('pesantren_claims')
        .update({ 
          status: 'rejected',
          notes: rejectReason.trim()
        })
        .eq('id', selectedClaim.id);

      if (error) throw error;

      toast({
        title: "Klaim Ditolak",
        description: `Pendaftaran ${selectedClaim.pesantren_name} telah ditolak.`,
        variant: "destructive",
      });

      await fetchClaims();
      setRejectDialogOpen(false);
      setRejectReason("");
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Reject error:', error);
      toast({
        title: "Gagal menolak",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "regional_approved":
        return <Badge className="bg-blue-500 text-white">Regional Approved</Badge>;
      case "pusat_approved":
      case "approved":
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 text-white">Ditolak</Badge>;
      default:
        return <Badge className="bg-amber-500 text-white">Pending</Badge>;
    }
  };

  // Jenis Pengajuan Badge (Blue for Baru, Gold for Klaim/Legacy)
  const getJenisBadge = (jenis: string) => {
    if (jenis === 'pesantren_baru') {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
          <Building2 className="w-3 h-3" />
          Baru
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
        <History className="w-3 h-3" />
        Legacy
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const pendingCount = data.filter((d) => d.status === "pending").length;
  const baruCount = data.filter((d) => d.jenis_pengajuan === "pesantren_baru").length;
  const legacyCount = data.filter((d) => d.jenis_pengajuan === "klaim").length;

  if (loading) {
    return (
      <Card className="bg-card shadow-sm border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Late Payment Follow-Up Section */}
      <LatePaymentFollowUp isDebugMode={isDebugMode} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            Verifikasi Pesantren
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pendingCount} pengajuan menunggu validasi wilayah
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama pesantren atau pengelola..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Filter Tabs - Akun Baru vs Akun Lama */}
      <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
        <Button
          variant={filterJenis === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterJenis('all')}
          className="min-h-[40px]"
        >
          Semua ({data.length})
        </Button>
        <Button
          variant={filterJenis === 'pesantren_baru' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterJenis('pesantren_baru')}
          className={`min-h-[40px] gap-2 ${filterJenis === 'pesantren_baru' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
        >
          <Building2 className="w-4 h-4" />
          Akun Baru ({baruCount})
        </Button>
        <Button
          variant={filterJenis === 'klaim' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterJenis('klaim')}
          className={`min-h-[40px] gap-2 ${filterJenis === 'klaim' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
        >
          <History className="w-4 h-4" />
          Akun Lama ({legacyCount})
        </Button>
      </div>

      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-4">
        {paginatedData.map((claim) => (
          <ClaimCard
            key={claim.id}
            claim={claim}
            onView={handleViewClick}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
            getJenisBadge={getJenisBadge}
          />
        ))}
        {paginatedData.length === 0 && (
          <Card className="bg-card">
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
              <p className="font-medium text-foreground">Tidak ada pengajuan pending</p>
              <p className="text-sm text-muted-foreground">Semua pengajuan sudah diverifikasi</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop: Table Layout */}
      <Card className="bg-card shadow-sm border-0 hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Tanggal</TableHead>
                  <TableHead className="font-semibold text-foreground">Nama Pesantren</TableHead>
                  <TableHead className="font-semibold text-foreground">Jenis</TableHead>
                  <TableHead className="font-semibold text-foreground">Pengelola</TableHead>
                  <TableHead className="font-semibold text-foreground">Kecamatan</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow 
                    key={item.id} 
                    className={`${index % 2 === 0 ? "bg-card" : "bg-muted/30"} hover:bg-muted/50 transition-colors cursor-pointer`}
                    onClick={() => handleViewClick(item)}
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {item.pesantren_name}
                    </TableCell>
                    <TableCell>{getJenisBadge(item.jenis_pengajuan)}</TableCell>
                    <TableCell className="text-foreground">
                      {maskName(item.nama_pengelola) || '-'}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {item.kecamatan || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClick(item);
                        }}
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground min-h-[44px]"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Periksa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <CheckCircle className="w-12 h-12 text-green-500/50" />
                        <p className="font-medium">Tidak ada pengajuan pending</p>
                        <p className="text-sm">Semua pengajuan sudah diverifikasi</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {startIndex + 1}-{endIndex} dari {totalItems}
                </span>
                <div className="flex items-center gap-2">
                  <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
                    <SelectTrigger className="w-[70px] h-9 bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-50">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {getVisiblePages().map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`h-9 w-9 p-0 ${currentPage === page ? "bg-primary text-primary-foreground" : ""}`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Pagination */}
      {totalItems > 0 && (
        <div className="md:hidden flex items-center justify-between px-2">
          <span className="text-sm text-muted-foreground">
            {startIndex + 1}-{endIndex} dari {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="min-h-[44px] min-w-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">{currentPage}/{totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="min-h-[44px] min-w-[44px]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Detail Pengajuan
            </DialogTitle>
            <DialogDescription>
              Verifikasi kelengkapan dan keaslian dokumen pendaftaran
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4 py-4">
              {/* Jenis & Status Badge */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                {getJenisBadge(selectedClaim.jenis_pengajuan)}
                {getStatusBadge(selectedClaim.status)}
              </div>

              {/* Rejected Notes */}
              {selectedClaim.status === 'rejected' && selectedClaim.notes && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">Alasan Penolakan</p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{selectedClaim.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Pesantren */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">Data Pesantren</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nama Pesantren</p>
                    <p className="font-medium text-foreground">{selectedClaim.pesantren_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nama Pengasuh</p>
                    <p className="font-medium text-foreground">{selectedClaim.nama_pengasuh || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Kecamatan</p>
                    <p className="font-medium text-foreground">{selectedClaim.kecamatan || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tanggal Daftar</p>
                    <p className="font-medium text-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(selectedClaim.created_at)}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Alamat Lengkap</p>
                  <p className="font-medium text-foreground">{selectedClaim.alamat_singkat || '-'}</p>
                </div>
              </div>

              {/* Data Pengelola */}
              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">Data Pengelola</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nama Pengelola</p>
                    <p className="font-medium text-foreground">{selectedClaim.nama_pengelola || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground break-all">{selectedClaim.email_pengelola || '-'}</p>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">No. WhatsApp</p>
                    {selectedClaim.no_wa_pendaftar ? (
                      <a 
                        href={`https://wa.me/${selectedClaim.no_wa_pendaftar.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {selectedClaim.no_wa_pendaftar}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : '-'}
                  </div>
                </div>
              </div>

              {/* Dokumen Bukti */}
              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Dokumen Bukti
                </h4>
                
                {selectedClaim.dokumen_bukti_url ? (
                  <Button
                    variant="outline"
                    onClick={handleViewDocument}
                    className="w-full justify-center gap-2 h-12"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Lihat Dokumen Bukti (SK/Surat Tugas)
                  </Button>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                      Dokumen tidak tersedia
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Pendaftar tidak mengunggah dokumen bukti
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {selectedClaim?.status === 'pending' && (
            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(true)}
                className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 min-h-[44px] w-full sm:w-auto"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Tolak
              </Button>
              <Button
                onClick={() => setApproveDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px] w-full sm:w-auto"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Setujui
              </Button>
              {selectedClaim?.no_wa_pendaftar && (
                <Button
                  onClick={() => setApproveDialogOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-h-[44px] w-full sm:w-auto gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Verifikasi & Hubungi
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Persetujuan</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan menyetujui pengajuan <strong>{selectedClaim?.pesantren_name}</strong>. 
              Status akan berubah menjadi <Badge className="bg-blue-500 text-white mx-1">Regional Approved</Badge> 
              dan menunggu verifikasi dari Admin Pusat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary/90"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </span>
              ) : (
                "Ya, Setujui"
              )}
            </AlertDialogAction>
            {selectedClaim?.no_wa_pendaftar && (
              <AlertDialogAction
                onClick={handleApproveAndContact}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    Setujui & Hubungi WA
                  </>
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog with Reason */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Tolak Pengajuan
            </DialogTitle>
            <DialogDescription>
              Masukkan alasan penolakan agar pendaftar dapat memperbaiki data mereka.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Alasan Penolakan <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Contoh: Dokumen SK tidak valid / Data tidak lengkap / Pesantren sudah terdaftar..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason("");
              }}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </span>
              ) : (
                "Konfirmasi Tolak"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidasiPendaftar;