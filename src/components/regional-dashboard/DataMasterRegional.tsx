import { useState, useEffect, useMemo, memo } from "react";
import { Search, Building2, Users, UserCircle, Loader2, Eye, Award } from "lucide-react";
import { maskPhoneNumber, maskName } from "@/lib/privacy-utils";
import { formatNIP, formatNIAM } from "@/lib/id-utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileLevelBadge } from "@/components/shared/LevelBadge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PesantrenData {
  id: string;
  nama_pesantren: string | null;
  nama_pengasuh: string | null;
  alamat_singkat: string | null;
  status_account: string;
  status_payment: string;
  profile_level: string;
  no_wa_pendaftar: string | null;
  nip: string | null;
  sejarah: string | null;
  visi_misi: string | null;
  jumlah_santri: number | null;
  tipe_pesantren: string | null;
  logo_url: string | null;
}

interface CrewData {
  id: string;
  nama: string;
  jabatan: string | null;
  niam: string | null;
  xp_level: number | null;
  profile_id: string;
  pesantren_name?: string | null;
}

interface DataMasterRegionalProps {
  isDebugMode?: boolean;
}

// Mock data for debug mode
const MOCK_PESANTREN: PesantrenData[] = [
  {
    id: 'mock-1',
    nama_pesantren: 'PP Al-Hikmah Singosari',
    nama_pengasuh: 'KH. Ahmad Fauzi',
    alamat_singkat: 'Jl. Raya Singosari No. 123',
    status_account: 'active',
    status_payment: 'paid',
    profile_level: 'platinum',
    no_wa_pendaftar: '081234567890',
    nip: '2601001',
    sejarah: 'Didirikan pada tahun 1980...',
    visi_misi: 'Mencetak generasi Qurani...',
    jumlah_santri: 250,
    tipe_pesantren: 'Kombinasi',
    logo_url: '/placeholder.svg',
  },
  {
    id: 'mock-2',
    nama_pesantren: 'PP Darul Ulum',
    nama_pengasuh: 'KH. Budi Santoso',
    alamat_singkat: 'Jl. Veteran No. 45',
    status_account: 'active',
    status_payment: 'paid',
    profile_level: 'gold',
    no_wa_pendaftar: '081234567891',
    nip: '2601002',
    sejarah: 'Berdiri sejak 1995...',
    visi_misi: 'Mewujudkan santri berakhlak...',
    jumlah_santri: 180,
    tipe_pesantren: 'Salaf',
    logo_url: '/placeholder.svg',
  },
  {
    id: 'mock-3',
    nama_pesantren: 'PP Nurul Jadid',
    nama_pengasuh: 'KH. M. Yusuf',
    alamat_singkat: 'Jl. Masjid No. 12',
    status_account: 'active',
    status_payment: 'paid',
    profile_level: 'silver',
    no_wa_pendaftar: '081234567892',
    nip: '2601003',
    sejarah: null,
    visi_misi: null,
    jumlah_santri: 75,
    tipe_pesantren: 'Modern',
    logo_url: null,
  },
  {
    id: 'mock-4',
    nama_pesantren: 'PP Al-Falah',
    nama_pengasuh: 'KH. Dedi Kurniawan',
    alamat_singkat: 'Jl. Sukarno Hatta No. 78',
    status_account: 'pending',
    status_payment: 'unpaid',
    profile_level: 'basic',
    no_wa_pendaftar: '081234567893',
    nip: null,
    sejarah: null,
    visi_misi: null,
    jumlah_santri: null,
    tipe_pesantren: null,
    logo_url: null,
  },
  {
    id: 'mock-5',
    nama_pesantren: 'PP Miftahul Huda',
    nama_pengasuh: 'Nyai Hj. Eva Fitriani',
    alamat_singkat: 'Jl. Sukun Raya No. 56',
    status_account: 'active',
    status_payment: 'paid',
    profile_level: 'gold',
    no_wa_pendaftar: '081234567894',
    nip: '2601005',
    sejarah: 'Berdiri tahun 2000...',
    visi_misi: 'Mendidik santri berprestasi...',
    jumlah_santri: 120,
    tipe_pesantren: 'Kombinasi',
    logo_url: '/placeholder.svg',
  },
];

const MOCK_CREWS: CrewData[] = [
  { id: 'c1', nama: 'Ahmad Rizky', jabatan: 'Videografer', niam: 'AN260100101', xp_level: 1500, profile_id: 'mock-1', pesantren_name: 'PP Al-Hikmah Singosari' },
  { id: 'c2', nama: 'Budi Santoso', jabatan: 'Editor', niam: 'AN260100102', xp_level: 2500, profile_id: 'mock-1', pesantren_name: 'PP Al-Hikmah Singosari' },
  { id: 'c3', nama: 'Cahya Dewi', jabatan: 'Desainer', niam: 'AN260100103', xp_level: 800, profile_id: 'mock-2', pesantren_name: 'PP Darul Ulum' },
  { id: 'c4', nama: 'Dedi Kurniawan', jabatan: 'Admin Media', niam: 'AN260100201', xp_level: 3200, profile_id: 'mock-2', pesantren_name: 'PP Darul Ulum' },
  { id: 'c5', nama: 'Eva Fitriani', jabatan: 'Reporter', niam: 'AN260100301', xp_level: 450, profile_id: 'mock-3', pesantren_name: 'PP Nurul Jadid' },
];

// Mobile Card Components
const PesantrenCard = memo(({ item, onView, getStatusBadge }: { 
  item: PesantrenData; 
  onView: (item: PesantrenData) => void;
  getStatusBadge: (status: string) => JSX.Element;
}) => (
  <Card className="bg-card border border-border hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base truncate">{item.nama_pesantren || '-'}</h3>
          <p className="text-sm text-muted-foreground truncate">{item.alamat_singkat || 'Alamat tidak tersedia'}</p>
        </div>
        <ProfileLevelBadge level={item.profile_level as any} size="sm" />
      </div>
      
      <div className="flex items-center justify-between gap-2 mb-3">
        {item.nip && (
          <Badge variant="outline" className="font-mono text-xs">
            NIP: {formatNIP(item.nip, true)}
          </Badge>
        )}
        {getStatusBadge(item.status_account)}
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        <span className="font-medium">Pengasuh:</span> {maskName(item.nama_pengasuh) || '-'}
      </div>
      
      <Button
        onClick={() => onView(item)}
        variant="outline"
        className="w-full min-h-[44px]"
      >
        <Eye className="w-4 h-4 mr-2" />
        Lihat Detail
      </Button>
    </CardContent>
  </Card>
));

PesantrenCard.displayName = 'PesantrenCard';

const CrewCard = memo(({ item }: { item: CrewData }) => (
  <Card className="bg-card border border-border">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base">{maskName(item.nama)}</h3>
          <p className="text-sm text-muted-foreground">{item.pesantren_name || '-'}</p>
        </div>
        {item.xp_level !== null && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            <Award className="w-3 h-3 mr-1" />
            {item.xp_level} XP
          </Badge>
        )}
      </div>
      
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {item.jabatan || '-'}
        </Badge>
        {item.niam && (
          <span className="font-mono text-xs text-muted-foreground">
            {formatNIAM(item.niam, true)}
          </span>
        )}
      </div>
    </CardContent>
  </Card>
));

CrewCard.displayName = 'CrewCard';

const DataMasterRegional = ({ isDebugMode = false }: DataMasterRegionalProps) => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pesantren");
  const [loading, setLoading] = useState(true);
  const [selectedPesantren, setSelectedPesantren] = useState<PesantrenData | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  const [pesantrenList, setPesantrenList] = useState<PesantrenData[]>([]);
  const [crewList, setCrewList] = useState<CrewData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (isDebugMode) {
        setPesantrenList(MOCK_PESANTREN);
        setCrewList(MOCK_CREWS);
        setLoading(false);
        return;
      }

      if (!profile?.region_id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nama_pesantren, nama_pengasuh, alamat_singkat, status_account, status_payment, profile_level, no_wa_pendaftar, nip, sejarah, visi_misi, jumlah_santri, tipe_pesantren, logo_url')
        .eq('region_id', profile.region_id)
        .eq('role', 'user');
      
      if (!profilesError && profiles) {
        setPesantrenList(profiles);
      }
      
      const { data: crews, error: crewsError } = await supabase
        .from('crews')
        .select('id, nama, jabatan, niam, xp_level, profile_id');
      
      if (!crewsError && crews && profiles) {
        const profileIds = profiles.map(p => p.id);
        const profileMap = new Map(profiles.map(p => [p.id, p.nama_pesantren]));
        const filteredCrews = crews
          .filter(crew => profileIds.includes(crew.profile_id))
          .map(crew => ({
            ...crew,
            pesantren_name: profileMap.get(crew.profile_id) || null,
          }));
        setCrewList(filteredCrews);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [profile?.region_id, isDebugMode]);

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Aktif</Badge>;
    }
    if (status === "pending") {
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Ditolak</Badge>;
  };

  // Memoized filtered data
  const filteredPesantren = useMemo(() => 
    pesantrenList.filter(item =>
      item.nama_pesantren?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_pengasuh?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nip?.includes(searchQuery)
    ), [pesantrenList, searchQuery]
  );

  const filteredCrews = useMemo(() => 
    crewList.filter(item =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jabatan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.niam?.includes(searchQuery)
    ), [crewList, searchQuery]
  );

  const handleViewDetail = (item: PesantrenData) => {
    setSelectedPesantren(item);
    setDetailDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Data Regional</h1>
          <p className="text-sm text-muted-foreground mt-1">Data pesantren dan kru di wilayah Anda (Read-Only)</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIP, atau NIAM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-muted p-1 w-auto min-w-full md:min-w-0">
            <TabsTrigger 
              value="pesantren" 
              className="flex items-center gap-2 px-4 py-2.5 min-h-[40px] whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Building2 className="w-4 h-4" />
              <span>Pesantren ({filteredPesantren.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="kru" 
              className="flex items-center gap-2 px-4 py-2.5 min-h-[40px] whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <UserCircle className="w-4 h-4" />
              <span>Kru ({filteredCrews.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content: Pesantren */}
        <TabsContent value="pesantren" className="mt-6">
          {/* Mobile: Card Layout */}
          <div className="md:hidden space-y-4">
            {filteredPesantren.length === 0 ? (
              <Card className="bg-card">
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="font-medium text-foreground">Belum ada data pesantren</p>
                  <p className="text-sm text-muted-foreground">Di wilayah ini belum ada pesantren terdaftar</p>
                </CardContent>
              </Card>
            ) : (
              filteredPesantren.map((item) => (
                <PesantrenCard 
                  key={item.id} 
                  item={item} 
                  onView={handleViewDetail}
                  getStatusBadge={getStatusBadge}
                />
              ))
            )}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden md:block bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 font-semibold">No</TableHead>
                    <TableHead className="font-semibold min-w-[200px]">Nama Pesantren</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">NIP</TableHead>
                    <TableHead className="font-semibold min-w-[100px]">Level</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">Pengasuh</TableHead>
                    <TableHead className="font-semibold w-24">Status</TableHead>
                    <TableHead className="font-semibold w-24 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPesantren.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Belum ada data pesantren di wilayah ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPesantren.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium text-foreground">{item.nama_pesantren || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{item.nip ? formatNIP(item.nip, true) : '-'}</TableCell>
                        <TableCell><ProfileLevelBadge level={item.profile_level as any} size="sm" /></TableCell>
                        <TableCell>{maskName(item.nama_pengasuh)}</TableCell>
                        <TableCell>{getStatusBadge(item.status_account)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(item)}
                            className="min-h-[36px]"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content: Kru */}
        <TabsContent value="kru" className="mt-6">
          {/* Mobile: Card Layout */}
          <div className="md:hidden space-y-4">
            {filteredCrews.length === 0 ? (
              <Card className="bg-card">
                <CardContent className="py-12 text-center">
                  <UserCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="font-medium text-foreground">Belum ada data kru</p>
                  <p className="text-sm text-muted-foreground">Di wilayah ini belum ada kru terdaftar</p>
                </CardContent>
              </Card>
            ) : (
              filteredCrews.map((item) => (
                <CrewCard key={item.id} item={item} />
              ))
            )}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden md:block bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12 font-semibold">No</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">Nama</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Jabatan</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">NIAM</TableHead>
                    <TableHead className="font-semibold min-w-[100px]">XP</TableHead>
                    <TableHead className="font-semibold min-w-[200px]">Pesantren</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCrews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Belum ada data kru di wilayah ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCrews.map((item, index) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium text-foreground">{maskName(item.nama)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
                            {item.jabatan || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.niam ? formatNIAM(item.niam, true) : '-'}</TableCell>
                        <TableCell>
                          {item.xp_level !== null ? (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                              {item.xp_level} XP
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.pesantren_name || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog (Read-Only) */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Detail Pesantren
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap pesantren (Read-Only)
            </DialogDescription>
          </DialogHeader>

          {selectedPesantren && (
            <div className="space-y-4 py-4">
              {/* Header with Level */}
              <div className="flex items-center justify-between">
                <ProfileLevelBadge level={selectedPesantren.profile_level as any} size="lg" />
                {getStatusBadge(selectedPesantren.status_account)}
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">Identitas</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nama Pesantren</p>
                    <p className="font-medium text-foreground">{selectedPesantren.nama_pesantren || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">NIP</p>
                    <p className="font-mono font-medium text-foreground">{selectedPesantren.nip ? formatNIP(selectedPesantren.nip, true) : '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nama Pengasuh</p>
                    <p className="font-medium text-foreground">{selectedPesantren.nama_pengasuh || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tipe Pesantren</p>
                    <p className="font-medium text-foreground">{selectedPesantren.tipe_pesantren || '-'}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Alamat</p>
                  <p className="font-medium text-foreground">{selectedPesantren.alamat_singkat || '-'}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">Statistik</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Jumlah Santri</p>
                    <p className="font-medium text-foreground">{selectedPesantren.jumlah_santri || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status Pembayaran</p>
                    <Badge className={selectedPesantren.status_payment === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                      {selectedPesantren.status_payment === 'paid' ? 'Lunas' : 'Belum Lunas'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Visi Misi */}
              {selectedPesantren.visi_misi && (
                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">Visi Misi</h4>
                  <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">{selectedPesantren.visi_misi}</p>
                </div>
              )}

              {/* Sejarah */}
              {selectedPesantren.sejarah && (
                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">Sejarah</h4>
                  <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">{selectedPesantren.sejarah}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataMasterRegional;