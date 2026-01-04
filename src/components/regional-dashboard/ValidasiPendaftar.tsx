import { useState, useEffect } from "react";
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
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { maskPhoneNumber, maskEmail, maskName } from "@/lib/privacy-utils";

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
  // Manually joined profile data
  nama_pengasuh?: string | null;
  alamat_singkat?: string | null;
  no_wa_pendaftar?: string | null;
}

const ValidasiPendaftar = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PesantrenClaim[]>([]);
  const [filteredData, setFilteredData] = useState<PesantrenClaim[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
    if (!profile?.region_id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch claims first
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

      // Fetch related profiles
      const userIds = claims.map(c => c.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nama_pengasuh, alamat_singkat, no_wa_pendaftar')
        .in('id', userIds);

      // Merge profile data into claims
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
  }, [profile?.region_id]);

  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.pesantren_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nama_pengelola?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchQuery, data]);

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

  // Open document in new tab
  const handleViewDocument = async () => {
    if (!selectedClaim?.dokumen_bukti_url) {
      toast({
        title: "Dokumen tidak tersedia",
        description: "Pendaftar tidak mengunggah dokumen bukti",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: urlData } = await supabase.storage
        .from('registration-documents')
        .createSignedUrl(selectedClaim.dokumen_bukti_url, 3600); // 1 hour expiry

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

  // Approve claim
  const handleApprove = async () => {
    if (!selectedClaim) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('pesantren_claims')
        .update({ 
          status: 'regional_approved',
          approved_at: new Date().toISOString(),
          approved_by: profile?.id
        })
        .eq('id', selectedClaim.id);

      if (error) throw error;

      toast({
        title: "Berhasil Disetujui!",
        description: `Klaim ${selectedClaim.pesantren_name} telah disetujui wilayah dan menunggu verifikasi pusat.`,
      });

      // Refresh data
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

  // Reject claim
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
        description: `Pendaftaran ${selectedClaim.pesantren_name} telah ditolak dengan alasan yang tercatat.`,
        variant: "destructive",
      });

      // Refresh data
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const pendingCount = data.filter((d) => d.status === "pending").length;

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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-primary" />
            Verifikasi Pesantren
          </h1>
          <p className="text-muted-foreground mt-1">
            {pendingCount} pengajuan menunggu validasi wilayah
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama pesantren atau pengelola..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-3 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Regional Approved</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Ditolak</span>
        </div>
      </div>

      {/* Table Card */}
      <Card className="bg-card shadow-sm border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Tanggal</TableHead>
                  <TableHead className="font-semibold text-foreground">Nama Pesantren</TableHead>
                  <TableHead className="font-semibold text-foreground hidden sm:table-cell">Pengelola</TableHead>
                  <TableHead className="font-semibold text-foreground hidden md:table-cell">Kecamatan</TableHead>
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
                    <TableCell className="text-foreground hidden sm:table-cell">
                      {maskName(item.nama_pengelola) || '-'}
                    </TableCell>
                    <TableCell className="text-foreground hidden md:table-cell">
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
                        <span className="hidden sm:inline">Periksa</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
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
              {/* Mobile: Simple Prev/Next */}
              <div className="flex sm:hidden items-center justify-between">
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

              {/* Desktop: Full Controls */}
              <div className="hidden sm:flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{endIndex} of {totalItems} entries
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
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
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
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
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status Saat Ini</span>
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
                Setujui Wilayah
              </Button>
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
          <AlertDialogFooter>
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