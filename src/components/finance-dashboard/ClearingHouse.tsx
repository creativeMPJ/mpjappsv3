import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Check, 
  X, 
  Clock,
  CheckCircle,
  RefreshCw,
  Inbox
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface PendingProfile {
  id: string;
  nama_pesantren: string | null;
  nama_pengasuh: string | null;
  city_id: string | null;
  created_at: string | null;
  city?: {
    name: string;
  } | null;
}

// Generate NIP: MPJ-YYYY-XXXX
const generateNIP = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MPJ-${year}-${random}`;
};

const ClearingHouse = () => {
  const [selectedProfile, setSelectedProfile] = useState<PendingProfile | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending profiles
  const { data: pendingProfiles, isLoading, refetch } = useQuery({
    queryKey: ['pending-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          nama_pesantren,
          nama_pengasuh,
          city_id,
          created_at,
          city:cities(name)
        `)
        .eq('status_account', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending profiles:', error);
        throw error;
      }

      return (data || []) as PendingProfile[];
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const nip = generateNIP();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          status_account: 'active',
          status_payment: 'paid',
          nip: nip,
        })
        .eq('id', profileId);

      if (error) throw error;
      return { nip };
    },
    onSuccess: (data) => {
      toast({
        title: "Akun Diaktifkan",
        description: `NIP: ${data.nip} berhasil dibuat. Status akun: Active & Paid.`,
      });
      queryClient.invalidateQueries({ queryKey: ['pending-profiles'] });
      setShowApproveDialog(false);
      setSelectedProfile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Mengaktifkan Akun",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          status_account: 'rejected',
        })
        .eq('id', profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Akun Ditolak",
        description: "Status akun telah diubah menjadi Rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-profiles'] });
      setShowRejectDialog(false);
      setSelectedProfile(null);
      setRejectReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Menolak Akun",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApproveClick = (profile: PendingProfile) => {
    setSelectedProfile(profile);
    setShowApproveDialog(true);
  };

  const handleRejectClick = (profile: PendingProfile) => {
    setSelectedProfile(profile);
    setShowRejectDialog(true);
  };

  const handleConfirmApprove = () => {
    if (selectedProfile) {
      approveMutation.mutate(selectedProfile.id);
    }
  };

  const handleConfirmReject = () => {
    if (selectedProfile && rejectReason.trim()) {
      rejectMutation.mutate(selectedProfile.id);
    }
  };

  const pendingCount = pendingProfiles?.length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verifikasi Pendaftaran</h1>
          <p className="text-muted-foreground">Antrian verifikasi akun baru</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Menunggu Verifikasi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Antrian Pendaftaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
              <p className="text-lg font-medium text-foreground">Semua Beres!</p>
              <p className="text-muted-foreground">Tidak ada antrian verifikasi saat ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pesantren</TableHead>
                    <TableHead>Nama Pendaftar</TableHead>
                    <TableHead>Kota</TableHead>
                    <TableHead>Waktu Daftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingProfiles?.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-sidebar text-white text-xs">
                              {profile.nama_pesantren?.charAt(0) || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {profile.nama_pesantren || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {profile.nama_pengasuh || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {profile.city?.name || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {profile.created_at 
                          ? format(new Date(profile.created_at), "dd MMM yyyy, HH:mm", { locale: localeId })
                          : "-"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 gap-1"
                            onClick={() => handleApproveClick(profile)}
                          >
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => handleRejectClick(profile)}
                          >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline">Reject</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terima & Aktifkan Akun?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun <strong>{selectedProfile?.nama_pesantren}</strong> akan diaktifkan dengan status:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Status Akun: <strong>Active</strong></li>
                <li>Status Pembayaran: <strong>Paid</strong></li>
                <li>NIP akan digenerate otomatis</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApprove}
              disabled={approveMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {approveMutation.isPending ? "Memproses..." : "Ya, Aktifkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog with Reason */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pendaftaran</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk <strong>{selectedProfile?.nama_pesantren}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Masukkan alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Memproses..." : "Tolak Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClearingHouse;
