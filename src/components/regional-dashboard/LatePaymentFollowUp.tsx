import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Clock, 
  MessageCircle, 
  AlertTriangle,
  RefreshCw,
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LatePaymentClaim {
  id: string;
  user_id: string;
  pesantren_name: string;
  nama_pengelola: string | null;
  regional_approved_at: string;
  jenis_pengajuan: 'klaim' | 'pesantren_baru';
  no_wa_pendaftar: string | null;
  days_overdue: number;
}

interface LatePaymentFollowUpProps {
  isDebugMode?: boolean;
}

const calculateDaysOverdue = (approvedAt: string): number => {
  const approvedDate = new Date(approvedAt);
  const deadline = new Date(approvedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = now.getTime() - deadline.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
};

// Mock data for debug mode
const MOCK_LATE_CLAIMS: LatePaymentClaim[] = [
  {
    id: 'late-1',
    user_id: 'user-1',
    pesantren_name: 'PP Al-Hikmah Singosari',
    nama_pengelola: 'Ahmad Fauzi',
    regional_approved_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    jenis_pengajuan: 'pesantren_baru',
    no_wa_pendaftar: '081234567890',
    days_overdue: 3,
  },
  {
    id: 'late-2',
    user_id: 'user-2',
    pesantren_name: 'PP Darul Ulum',
    nama_pengelola: 'Budi Santoso',
    regional_approved_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    jenis_pengajuan: 'pesantren_baru',
    no_wa_pendaftar: '081234567891',
    days_overdue: 8,
  },
];

const LatePaymentFollowUp = ({ isDebugMode = false }: LatePaymentFollowUpProps) => {
  const [loading, setLoading] = useState(true);
  const [lateClaims, setLateClaims] = useState<LatePaymentClaim[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchLateClaims = async () => {
    if (isDebugMode) {
      setLateClaims(MOCK_LATE_CLAIMS);
      setLoading(false);
      return;
    }

    if (!profile?.region_id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch regional_approved claims that are > 7 days old and still unpaid
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: claims, error } = await supabase
        .from('pesantren_claims')
        .select('id, user_id, pesantren_name, nama_pengelola, regional_approved_at, jenis_pengajuan')
        .eq('region_id', profile.region_id)
        .eq('status', 'regional_approved')
        .not('regional_approved_at', 'is', null)
        .lt('regional_approved_at', sevenDaysAgo)
        .order('regional_approved_at', { ascending: true });

      if (error) throw error;

      if (!claims || claims.length === 0) {
        setLateClaims([]);
        setLoading(false);
        return;
      }

      // Check which ones are still unpaid
      const userIds = claims.map(c => c.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, status_payment, no_wa_pendaftar')
        .in('id', userIds);

      const unpaidUserMap = new Map(
        profiles?.filter(p => p.status_payment === 'unpaid')
          .map(p => [p.id, p]) || []
      );

      const lateClaimsData: LatePaymentClaim[] = claims
        .filter(claim => unpaidUserMap.has(claim.user_id))
        .map(claim => ({
          ...claim,
          no_wa_pendaftar: unpaidUserMap.get(claim.user_id)?.no_wa_pendaftar || null,
          days_overdue: calculateDaysOverdue(claim.regional_approved_at!),
        }));

      setLateClaims(lateClaimsData);
    } catch (error) {
      console.error('Error fetching late claims:', error);
      toast({
        title: "Gagal memuat data",
        description: "Tidak dapat memuat daftar terlambat bayar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLateClaims();
  }, [profile?.region_id, isDebugMode]);

  const generateFollowUpWhatsAppUrl = (claim: LatePaymentClaim) => {
    const phone = claim.no_wa_pendaftar?.replace(/\D/g, '').replace(/^0/, '62') || '';
    const message = encodeURIComponent(
      `Assalamu'alaikum, kami dari Admin Regional MPJ ingin menanyakan kendala proses aktivasi NIP/NIAM untuk ${claim.pesantren_name} yang sudah disetujui ${claim.days_overdue + 7} hari lalu. Ada yang bisa kami bantu? Terima kasih.`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  const handleFollowUp = (claim: LatePaymentClaim) => {
    if (!claim.no_wa_pendaftar) {
      toast({
        title: "Nomor WA tidak tersedia",
        description: "Pendaftar tidak memiliki nomor WhatsApp",
        variant: "destructive",
      });
      return;
    }
    window.open(generateFollowUpWhatsAppUrl(claim), '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Terlambat Bayar ({lateClaims.length})
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchLateClaims}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {lateClaims.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Tidak ada pesantren yang terlambat bayar</p>
            <p className="text-sm">Semua pesantren regional_approved sudah melakukan pembayaran</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
              {lateClaims.map((claim) => (
                <Card key={claim.id} className="bg-white">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold">{claim.pesantren_name}</h4>
                        <p className="text-sm text-muted-foreground">{claim.nama_pengelola || '-'}</p>
                      </div>
                      <Badge variant="destructive" className="shrink-0">
                        +{claim.days_overdue} hari
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => handleFollowUp(claim)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!claim.no_wa_pendaftar}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Follow Up WA
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pesantren</TableHead>
                    <TableHead>Pengelola</TableHead>
                    <TableHead>Disetujui</TableHead>
                    <TableHead>Keterlambatan</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lateClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {claim.pesantren_name}
                        </div>
                      </TableCell>
                      <TableCell>{claim.nama_pengelola || '-'}</TableCell>
                      <TableCell>
                        {new Date(claim.regional_approved_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          +{claim.days_overdue} hari dari batas
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          size="sm"
                          onClick={() => handleFollowUp(claim)}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={!claim.no_wa_pendaftar}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Follow Up WA
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LatePaymentFollowUp;