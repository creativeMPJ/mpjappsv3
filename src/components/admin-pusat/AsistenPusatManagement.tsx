import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Crown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api-client";
import { logAuditEntry } from "@/lib/audit-log";
import { cn } from "@/lib/utils";
import { MOCK_CREWS } from "@/lib/debug-mock-data";
import { formatNIAM } from "@/lib/id-utils";

interface AsistenPusatManagementProps {
  isDebugMode?: boolean;
}

// Crew option for selection
interface CrewOption {
  id: string;
  nama: string;
  niam: string | null;
  pesantren_name: string;
  region_name?: string;
  email?: string;
  profile_id: string;
}

// Assistant data structure
interface PusatAssistant {
  id: string;
  crew_id: string;
  nama: string;
  email: string;
  niam: string | null;
  pesantren_name: string;
  region_name?: string;
  appointed_at: string;
  appointed_by: string;
}

// Mock debug data for Pusat assistants
const MOCK_PUSAT_ASSISTANTS: PusatAssistant[] = [
  {
    id: 'passt-1',
    crew_id: 'c6',
    nama: 'Eko Prasetyo',
    email: 'eko.prasetyo@email.com',
    niam: 'AN260300101',
    pesantren_name: 'PP Tebuireng',
    region_name: 'Jombang & Sekitarnya',
    appointed_at: '2026-01-05T08:00:00Z',
    appointed_by: 'Admin Pusat',
  },
  {
    id: 'passt-2',
    crew_id: 'c9',
    nama: 'Fatimah Zahra',
    email: 'fatimah.zahra@email.com',
    niam: 'AN261000101',
    pesantren_name: 'PP Nurul Jadid Paiton',
    region_name: 'Probolinggo',
    appointed_at: '2026-01-03T10:00:00Z',
    appointed_by: 'Admin Pusat',
  },
];

const AsistenPusatManagement = ({ isDebugMode = false }: AsistenPusatManagementProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assistants, setAssistants] = useState<PusatAssistant[]>([]);
  const [availableCrews, setAvailableCrews] = useState<CrewOption[]>([]);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<PusatAssistant | null>(null);
  
  // Crew selection state
  const [crewSearchOpen, setCrewSearchOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<CrewOption | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const adminName = isDebugMode ? 'Admin Pusat' : profile?.nama_pesantren || 'Admin';

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (isDebugMode) {
        // Use mock data for debug mode
        setAssistants(MOCK_PUSAT_ASSISTANTS);
        
        // All crews are available for Pusat (no region filter)
        const appointedIds = MOCK_PUSAT_ASSISTANTS.map(a => a.crew_id);
        const available = MOCK_CREWS
          .filter(c => !appointedIds.includes(c.id))
          .map(c => ({
            id: c.id,
            nama: c.nama,
            niam: c.niam,
            pesantren_name: c.pesantren_name,
            region_name: c.region_name,
            email: c.email || `${c.nama.toLowerCase().replace(/\s/g, '.')}@email.com`,
            profile_id: c.profile_id,
          }));
        setAvailableCrews(available);
        setLoading(false);
        return;
      }

      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest<{ assistants: PusatAssistant[]; available_crews: CrewOption[] }>(
          "/api/admin/pusat-assistants"
        );
        setAssistants(data.assistants || []);
        setAvailableCrews(data.available_crews || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isDebugMode, user?.id]);

  // Handle add assistant
  const handleAddAssistant = async () => {
    if (!selectedCrew) {
      toast({
        title: "Pilih Kru",
        description: "Silakan pilih kru yang akan ditunjuk sebagai asisten pusat.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (!isDebugMode) {
        await apiRequest("/api/admin/pusat-assistants", {
          method: "POST",
          body: JSON.stringify({
            crewId: selectedCrew.id,
          }),
        });
      }

      const newAssistant: PusatAssistant = {
        id: `passt-${Date.now()}`,
        crew_id: selectedCrew.id,
        nama: selectedCrew.nama,
        email: selectedCrew.email || '',
        niam: selectedCrew.niam,
        pesantren_name: selectedCrew.pesantren_name,
        region_name: selectedCrew.region_name,
        appointed_at: new Date().toISOString(),
        appointed_by: adminName,
      };

      setAssistants(prev => [...prev, newAssistant]);
      setAvailableCrews(prev => prev.filter(c => c.id !== selectedCrew.id));

      // Log audit entry
      logAuditEntry({
        actor_id: isDebugMode ? 'debug-admin' : user?.id || '',
        actor_name: adminName,
        actor_role: 'admin_pusat',
        action: 'admin_added',
        target_type: 'admin',
        target_id: newAssistant.id,
        target_name: selectedCrew.nama,
        details: `${adminName} menunjuk ${selectedCrew.nama} sebagai Asisten Pusat`,
      });

      toast({
        title: "Asisten Pusat Berhasil Ditunjuk",
        description: `Kru ${selectedCrew.nama}${selectedCrew.niam ? ` (${formatNIAM(selectedCrew.niam, true)})` : ''} berhasil ditunjuk sebagai Asisten Pusat. Akses login sekarang aktif.`,
      });

      setAddDialogOpen(false);
      setSelectedCrew(null);
      setSearchQuery("");
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle remove assistant
  const handleRemoveAssistant = async () => {
    if (!selectedAssistant) return;

    setIsSaving(true);

    try {
      if (!isDebugMode) {
        await apiRequest(`/api/admin/pusat-assistants/${selectedAssistant.crew_id}`, {
          method: "DELETE",
        });
      }

      // Return crew to available list
      const returnedCrew: CrewOption = {
        id: selectedAssistant.crew_id,
        nama: selectedAssistant.nama,
        niam: selectedAssistant.niam,
        pesantren_name: selectedAssistant.pesantren_name,
        region_name: selectedAssistant.region_name,
        email: selectedAssistant.email,
        profile_id: '',
      };

      setAvailableCrews(prev => [...prev, returnedCrew]);
      setAssistants(prev => prev.filter(a => a.id !== selectedAssistant.id));

      // Log audit entry
      logAuditEntry({
        actor_id: isDebugMode ? 'debug-admin' : user?.id || '',
        actor_name: adminName,
        actor_role: 'admin_pusat',
        action: 'admin_removed',
        target_type: 'admin',
        target_id: selectedAssistant.id,
        target_name: selectedAssistant.nama,
        details: `${adminName} mencabut akses ${selectedAssistant.nama} sebagai Asisten Pusat`,
      });

      toast({
        title: "Asisten Dihapus",
        description: `Akses ${selectedAssistant.nama} sebagai Asisten Pusat telah dicabut.`,
      });

      setRemoveDialogOpen(false);
      setSelectedAssistant(null);
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter crews by search
  const filteredCrews = availableCrews.filter(crew => 
    crew.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crew.pesantren_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (crew.niam && crew.niam.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (crew.region_name && crew.region_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <Card className="bg-card border-0 shadow-sm">
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
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                Tim Asisten Pusat
              </CardTitle>
              <CardDescription>
                Kelola asisten yang membantu tugas Admin Pusat secara nasional
              </CardDescription>
            </div>
            <Button 
              onClick={() => setAddDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 min-h-[44px]"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Asisten Pusat
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/30 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Total Asisten Pusat</p>
              <p className="text-2xl font-bold text-purple-600">{assistants.length}</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Kru Tersedia</p>
              <p className="text-2xl font-bold text-blue-600">{availableCrews.length}</p>
            </div>
          </div>

          {/* Assistants Table */}
          {assistants.length > 0 ? (
            <div className="rounded-lg border bg-background overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-muted-foreground">Nama</TableHead>
                      <TableHead className="text-muted-foreground">NIAM</TableHead>
                      <TableHead className="text-muted-foreground">Pesantren</TableHead>
                      <TableHead className="text-muted-foreground">Wilayah</TableHead>
                      <TableHead className="text-muted-foreground">Tanggal Ditunjuk</TableHead>
                      <TableHead className="text-muted-foreground text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assistants.map((assistant) => (
                      <TableRow key={assistant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                                {assistant.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{assistant.nama}</p>
                              <p className="text-xs text-muted-foreground">{assistant.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {assistant.niam ? formatNIAM(assistant.niam, true) : '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {assistant.pesantren_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {assistant.region_name || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

              {/* Mobile Cards */}
              <div className="md:hidden divide-y">
                {assistants.map((assistant) => (
                  <div key={assistant.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-100 text-purple-700">
                            {assistant.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{assistant.nama}</p>
                          <p className="text-xs text-muted-foreground">{assistant.email}</p>
                          {assistant.niam && (
                            <Badge variant="outline" className="font-mono text-xs mt-1">
                              {formatNIAM(assistant.niam, true)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-8 w-8 p-0"
                        onClick={() => {
                          setSelectedAssistant(assistant);
                          setRemoveDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{assistant.pesantren_name}</span>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">{assistant.region_name}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg border">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Belum Ada Asisten Pusat</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tambahkan asisten dari kru yang terdaftar untuk membantu tugas Admin Pusat.
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-100 dark:border-purple-900">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-purple-800 dark:text-purple-200">Hak Akses Asisten Pusat</p>
                <ul className="mt-2 text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• Melihat semua data pendaftaran dan klaim dari semua wilayah</li>
                  <li>• Membantu verifikasi dokumen dan pembayaran</li>
                  <li>• Melihat statistik nasional</li>
                  <li>• <strong>Tidak dapat</strong> mengelola personil admin lain</li>
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
              <UserPlus className="h-5 w-5 text-purple-600" />
              Tambah Asisten Pusat
            </DialogTitle>
            <DialogDescription>
              Pilih kru dari seluruh Indonesia untuk ditunjuk sebagai Asisten Pusat.
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
                      placeholder="Cari nama, NIAM, pesantren, atau wilayah..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>Tidak ada kru ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {filteredCrews.slice(0, 10).map((crew) => (
                          <CommandItem
                            key={crew.id}
                            value={crew.nama}
                            onSelect={() => {
                              setSelectedCrew(crew);
                              setCrewSearchOpen(false);
                            }}
                            className="flex items-start gap-3 p-3"
                          >
                            <Avatar className="h-8 w-8 mt-0.5">
                              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                                {crew.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{crew.nama}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {crew.niam ? formatNIAM(crew.niam, true) : 'Tanpa NIAM'} • {crew.pesantren_name}
                              </p>
                              {crew.region_name && (
                                <Badge variant="secondary" className="text-[10px] mt-1">
                                  {crew.region_name}
                                </Badge>
                              )}
                            </div>
                            {selectedCrew?.id === crew.id && (
                              <Check className="h-4 w-4 text-purple-600" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Selected Crew Info - Read Only */}
            {selectedCrew && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Data Kru Terpilih</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedCrew(null);
                      setSearchQuery("");
                    }}
                    className="text-muted-foreground h-6 px-2"
                  >
                    Ganti
                  </Button>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nama Lengkap</Label>
                  <Input 
                    value={selectedCrew.nama} 
                    disabled 
                    className="bg-background font-medium"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">NIAM</Label>
                  <Input 
                    value={selectedCrew.niam ? formatNIAM(selectedCrew.niam, true) : "Belum ada NIAM"} 
                    disabled 
                    className="bg-background font-mono"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Pesantren</Label>
                    <Input 
                      value={selectedCrew.pesantren_name} 
                      disabled 
                      className="bg-background text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Wilayah</Label>
                    <Input 
                      value={selectedCrew.region_name || '-'} 
                      disabled 
                      className="bg-background text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status Akun</Label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-md border text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Akun terhubung & siap diaktifkan sebagai Asisten Pusat</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddDialogOpen(false);
              setSelectedCrew(null);
              setSearchQuery("");
            }}>
              Batal
            </Button>
            <Button 
              onClick={handleAddAssistant} 
              disabled={!selectedCrew || isSaving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSaving ? "Menyimpan..." : "Tunjuk sebagai Asisten Pusat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Assistant Confirmation */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Asisten Pusat?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedAssistant?.nama}</strong> akan dikembalikan menjadi user biasa dan tidak lagi memiliki akses Asisten Pusat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveAssistant} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSaving}
            >
              {isSaving ? "Menghapus..." : "Hapus dari Asisten"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AsistenPusatManagement;
