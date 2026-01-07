import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Search, 
  Check, 
  ChevronsUpDown,
  Calendar,
  Shield,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEntry } from "@/lib/audit-log";
import { cn } from "@/lib/utils";
import { MOCK_CREWS, MOCK_REGIONS } from "@/lib/debug-mock-data";

interface AsistenRegionalManagementProps {
  isDebugMode?: boolean;
}

// Crew option for selection
interface CrewOption {
  id: string;
  nama: string;
  niam: string | null;
  pesantren_name: string;
  email?: string;
  profile_id: string;
}

// Assistant data structure
interface RegionalAssistant {
  id: string;
  crew_id: string;
  nama: string;
  email: string;
  niam: string | null;
  pesantren_name: string;
  appointed_at: string;
  appointed_by: string;
}

// Clean NIAM format (remove dots)
const formatNIAMClean = (niam: string | null): string => {
  if (!niam) return '-';
  return niam.replace(/\./g, '');
};

// Mock debug data for assistants
const MOCK_ASSISTANTS: RegionalAssistant[] = [
  {
    id: 'asst-1',
    crew_id: 'c1',
    nama: 'Ahmad Rizky',
    email: 'ahmad.rizky@gmail.com',
    niam: 'AN260100101',
    pesantren_name: 'PP Al-Hikmah Singosari',
    appointed_at: '2026-01-05T08:00:00Z',
    appointed_by: 'Admin Regional Malang',
  },
  {
    id: 'asst-2',
    crew_id: 'c2',
    nama: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    niam: 'AN260100102',
    pesantren_name: 'PP Al-Hikmah Singosari',
    appointed_at: '2026-01-03T10:00:00Z',
    appointed_by: 'Admin Regional Malang',
  },
];

const AsistenRegionalManagement = ({ isDebugMode = false }: AsistenRegionalManagementProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assistants, setAssistants] = useState<RegionalAssistant[]>([]);
  const [availableCrews, setAvailableCrews] = useState<CrewOption[]>([]);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<RegionalAssistant | null>(null);
  
  // Crew selection state
  const [crewSearchOpen, setCrewSearchOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<CrewOption | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Admin info for debug
  const adminRegionId = isDebugMode ? 'reg-01' : profile?.region_id;
  const adminRegionName = isDebugMode 
    ? MOCK_REGIONS.find(r => r.id === 'reg-01')?.name || 'Malang Raya'
    : '';
  const adminName = isDebugMode ? 'Admin Regional Malang' : profile?.nama_pesantren || 'Admin';

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (isDebugMode) {
        // Use mock data for debug mode
        setAssistants(MOCK_ASSISTANTS);
        
        // Filter crews by region and exclude already appointed assistants
        const regionCrews = MOCK_CREWS.filter(c => c.region_id === 'reg-01');
        const appointedIds = MOCK_ASSISTANTS.map(a => a.crew_id);
        const available = regionCrews
          .filter(c => !appointedIds.includes(c.id))
          .map(c => ({
            id: c.id,
            nama: c.nama,
            niam: c.niam,
            pesantren_name: c.pesantren_name,
            email: `${c.nama.toLowerCase().replace(/\s/g, '.')}@email.com`,
            profile_id: c.profile_id,
          }));
        setAvailableCrews(available);
        setLoading(false);
        return;
      }

      if (!user?.id || !profile?.region_id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch crews in the same region
        const { data: crewsData, error: crewsError } = await supabase
          .from('crews')
          .select(`
            id,
            nama,
            niam,
            profile_id,
            profiles!inner(
              region_id,
              nama_pesantren
            )
          `)
          .eq('profiles.region_id', profile.region_id);

        if (crewsError) {
          console.error('Error fetching crews:', crewsError);
        } else if (crewsData) {
          // Transform to crew options
          const crewOptions: CrewOption[] = crewsData.map((c: any) => ({
            id: c.id,
            nama: c.nama,
            niam: c.niam,
            pesantren_name: c.profiles?.nama_pesantren || '-',
            profile_id: c.profile_id,
          }));
          setAvailableCrews(crewOptions);
        }

        // TODO: Fetch actual assistants from database when table exists
        // For now, use empty array for production
        setAssistants([]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isDebugMode, user?.id, profile?.region_id]);

  // Handle add assistant
  const handleAddAssistant = () => {
    if (!selectedCrew) {
      toast({
        title: "Pilih Kru",
        description: "Silakan pilih kru yang akan ditunjuk sebagai asisten.",
        variant: "destructive",
      });
      return;
    }

    const newAssistant: RegionalAssistant = {
      id: `asst-${Date.now()}`,
      crew_id: selectedCrew.id,
      nama: selectedCrew.nama,
      email: selectedCrew.email || '',
      niam: selectedCrew.niam,
      pesantren_name: selectedCrew.pesantren_name,
      appointed_at: new Date().toISOString(),
      appointed_by: adminName,
    };

    setAssistants(prev => [...prev, newAssistant]);
    setAvailableCrews(prev => prev.filter(c => c.id !== selectedCrew.id));

    // Log audit entry
    logAuditEntry({
      actor_id: isDebugMode ? 'debug-admin' : user?.id || '',
      actor_name: adminName,
      actor_role: 'admin_regional',
      action: 'admin_added',
      target_type: 'admin',
      target_id: newAssistant.id,
      target_name: selectedCrew.nama,
      details: `${adminName} menunjuk ${selectedCrew.nama} sebagai Asisten Regional`,
      region_id: adminRegionId || undefined,
      region_name: adminRegionName,
    });

    toast({
      title: "Asisten Berhasil Ditunjuk",
      description: `Kru ${selectedCrew.nama} dengan email ${selectedCrew.email} berhasil ditunjuk sebagai Asisten Regional. Akses login sekarang aktif.`,
    });

    setAddDialogOpen(false);
    setSelectedCrew(null);
    setSearchQuery("");
  };

  // Handle remove assistant
  const handleRemoveAssistant = () => {
    if (!selectedAssistant) return;

    // Return crew to available list
    const returnedCrew: CrewOption = {
      id: selectedAssistant.crew_id,
      nama: selectedAssistant.nama,
      niam: selectedAssistant.niam,
      pesantren_name: selectedAssistant.pesantren_name,
      email: selectedAssistant.email,
      profile_id: '', // Will be fetched from original data
    };

    setAvailableCrews(prev => [...prev, returnedCrew]);
    setAssistants(prev => prev.filter(a => a.id !== selectedAssistant.id));

    // Log audit entry
    logAuditEntry({
      actor_id: isDebugMode ? 'debug-admin' : user?.id || '',
      actor_name: adminName,
      actor_role: 'admin_regional',
      action: 'admin_removed',
      target_type: 'admin',
      target_id: selectedAssistant.id,
      target_name: selectedAssistant.nama,
      details: `${adminName} mencabut akses ${selectedAssistant.nama} sebagai Asisten Regional`,
      region_id: adminRegionId || undefined,
      region_name: adminRegionName,
    });

    toast({
      title: "Asisten Dihapus",
      description: `Akses ${selectedAssistant.nama} sebagai Asisten Regional telah dicabut.`,
    });

    setRemoveDialogOpen(false);
    setSelectedAssistant(null);
  };

  // Filter crews by search
  const filteredCrews = availableCrews.filter(crew => 
    crew.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crew.pesantren_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (crew.niam && crew.niam.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Asisten Regional
              </CardTitle>
              <CardDescription>
                Kelola asisten yang membantu tugas Admin Regional {adminRegionName}
              </CardDescription>
            </div>
            <Button 
              onClick={() => setAddDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 min-h-[44px]"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Asisten Wilayah
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Total Asisten</p>
              <p className="text-2xl font-bold text-emerald-600">{assistants.length}</p>
            </div>
            <div className="bg-background p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Kru Tersedia</p>
              <p className="text-2xl font-bold text-blue-600">{availableCrews.length}</p>
            </div>
          </div>

          {/* Assistants Table */}
          {assistants.length > 0 ? (
            <div className="rounded-lg border bg-background overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nama</TableHead>
                    <TableHead className="hidden sm:table-cell">NIAM</TableHead>
                    <TableHead className="hidden md:table-cell">Pesantren</TableHead>
                    <TableHead className="hidden lg:table-cell">Tanggal Ditunjuk</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assistants.map((assistant) => (
                    <TableRow key={assistant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                              {assistant.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{assistant.nama}</p>
                            <p className="text-xs text-muted-foreground">{assistant.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="font-mono text-xs">
                          {formatNIAMClean(assistant.niam)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {assistant.pesantren_name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(assistant.appointed_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedAssistant(assistant);
                            setRemoveDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-background rounded-lg border">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Belum Ada Asisten</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tambahkan asisten dari kru di wilayah Anda untuk membantu tugas monitoring.
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Hak Akses Asisten Regional</p>
                <ul className="mt-2 text-blue-700 space-y-1">
                  <li>• Melihat data pendaftaran dan klaim di wilayah</li>
                  <li>• Membantu verifikasi awal dokumen</li>
                  <li>• Melihat statistik regional</li>
                  <li>• <strong>Tidak dapat</strong> menghapus Admin Utama atau asisten lain</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Assistant Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Tambah Asisten Wilayah
            </DialogTitle>
            <DialogDescription>
              Pilih kru dari wilayah {adminRegionName} untuk ditunjuk sebagai asisten.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Crew Selector */}
            <div className="space-y-2">
              <Label>Pilih Kru</Label>
              <Popover open={crewSearchOpen} onOpenChange={setCrewSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between min-h-[44px]",
                      !selectedCrew && "text-muted-foreground"
                    )}
                  >
                    {selectedCrew ? (
                      <span className="truncate">{selectedCrew.nama}</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Cari kru...
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Cari nama, NIAM, atau pesantren..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>Tidak ada kru ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {filteredCrews.map((crew) => (
                          <CommandItem
                            key={crew.id}
                            value={crew.id}
                            onSelect={() => {
                              setSelectedCrew(crew);
                              setCrewSearchOpen(false);
                            }}
                            className="flex items-center gap-3 py-3"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                {crew.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{crew.nama}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="font-mono text-[10px]">
                                  {formatNIAMClean(crew.niam)}
                                </Badge>
                                <span className="truncate">{crew.pesantren_name}</span>
                              </div>
                            </div>
                            {selectedCrew?.id === crew.id && (
                              <Check className="h-4 w-4 text-emerald-600" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Auto-filled fields (read-only) */}
            {selectedCrew && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="selectedNama">Nama Lengkap</Label>
                  <Input
                    id="selectedNama"
                    value={selectedCrew.nama}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selectedEmail">Email</Label>
                  <Input
                    id="selectedEmail"
                    type="email"
                    value={selectedCrew.email || '-'}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selectedNIAM">NIAM</Label>
                  <Input
                    id="selectedNIAM"
                    value={formatNIAMClean(selectedCrew.niam)}
                    disabled
                    className="bg-muted font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Data diambil otomatis dari database dan tidak dapat diedit.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setAddDialogOpen(false);
                setSelectedCrew(null);
                setSearchQuery("");
              }}
            >
              Batal
            </Button>
            <Button 
              onClick={handleAddAssistant}
              disabled={!selectedCrew}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Tunjuk Sebagai Asisten
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Hapus Asisten?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan mencabut akses <strong>{selectedAssistant?.nama}</strong> sebagai Asisten Regional. 
              Mereka tidak akan bisa mengakses Dashboard Regional lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAssistant}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Hapus Akses
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AsistenRegionalManagement;
