import { useState, useEffect, useMemo } from "react";
import { Building2, Users, Tv, Search, Pencil, Trash2, Eye, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatNIP, formatNIAM } from "@/lib/id-utils";

interface Pesantren {
  id: string;
  nama_pesantren: string | null;
  nip: string | null;
  region_id: string | null;
  region_name: string | null;
  city_name: string | null;
  status_account: string;
  profile_level: string;
  alamat_singkat: string | null;
  nama_pengasuh: string | null;
}

interface MediaAdmin {
  id: string;
  nama_pesantren: string | null;
  nama_media: string | null;
  nip: string | null;
  region_id: string | null;
  region_name: string | null;
  status_account: string;
  profile_level: string;
  no_wa_pendaftar: string | null;
}

interface Crew {
  id: string;
  nama: string;
  niam: string | null;
  jabatan: string | null;
  xp_level: number | null;
  profile_id: string;
  pesantren_name: string | null;
  region_id: string | null;
  region_name: string | null;
}

interface Region {
  id: string;
  name: string;
  code: string;
}

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

const AdminPusatMasterData = ({ isDebugMode, debugData }: Props = {}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pesantren");
  const [pesantrenList, setPesantrenList] = useState<Pesantren[]>([]);
  const [mediaList, setMediaList] = useState<MediaAdmin[]>([]);
  const [crewList, setCrewList] = useState<Crew[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search state
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal state
  const [isEditPesantrenOpen, setIsEditPesantrenOpen] = useState(false);
  const [isEditMediaOpen, setIsEditMediaOpen] = useState(false);
  const [isEditCrewOpen, setIsEditCrewOpen] = useState(false);
  const [editingPesantren, setEditingPesantren] = useState<Pesantren | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaAdmin | null>(null);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'pesantren' | 'media' | 'crew'; id: string; name: string } | null>(null);

  // Detail view state
  const [detailPesantren, setDetailPesantren] = useState<Pesantren | null>(null);

  // Form state for editing
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch all pesantren with region info
      const { data: pesantrenData } = await supabase
        .from("profiles")
        .select(`
          id,
          nama_pesantren,
          nip,
          region_id,
          status_account,
          profile_level,
          alamat_singkat,
          nama_pengasuh,
          regions!profiles_region_id_fkey (name),
          cities!profiles_city_id_fkey (name)
        `)
        .order("nama_pesantren", { ascending: true });

      // Fetch all crews with pesantren info
      const { data: crewData } = await supabase
        .from("crews")
        .select(`
          id,
          nama,
          niam,
          jabatan,
          xp_level,
          profile_id,
          profiles!crews_profile_id_fkey (nama_pesantren, region_id, regions!profiles_region_id_fkey (name))
        `)
        .order("nama", { ascending: true });

      // Fetch all regions
      const { data: regionsData } = await supabase
        .from("regions")
        .select("id, name, code")
        .order("code", { ascending: true });

      if (pesantrenData) {
        const mapped = pesantrenData.map((item: any) => ({
          id: item.id,
          nama_pesantren: item.nama_pesantren,
          nip: item.nip,
          region_id: item.region_id,
          region_name: item.regions?.name || null,
          city_name: item.cities?.name || null,
          status_account: item.status_account,
          profile_level: item.profile_level,
          alamat_singkat: item.alamat_singkat,
          nama_pengasuh: item.nama_pengasuh,
        }));
        setPesantrenList(mapped);
        // Media is same as pesantren with nama_media
        setMediaList(pesantrenData.filter((p: any) => p.nama_media || p.nama_pesantren).map((item: any) => ({
          id: item.id,
          nama_pesantren: item.nama_pesantren,
          nama_media: item.nama_media,
          nip: item.nip,
          region_id: item.region_id,
          region_name: item.regions?.name || null,
          status_account: item.status_account,
          profile_level: item.profile_level,
          no_wa_pendaftar: item.no_wa_pendaftar,
        })));
      }

      if (crewData) {
        setCrewList(
          crewData.map((item: any) => ({
            id: item.id,
            nama: item.nama,
            niam: item.niam,
            jabatan: item.jabatan,
            xp_level: item.xp_level,
            profile_id: item.profile_id,
            pesantren_name: item.profiles?.nama_pesantren || null,
            region_id: item.profiles?.region_id || null,
            region_name: item.profiles?.regions?.name || null,
          }))
        );
      }

      if (regionsData) {
        setRegions(regionsData);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // DEBUG MODE: Use mock data instead of fetching from database
    if (isDebugMode && debugData) {
      // Map pesantren from debug data
      const pesantrenData = (debugData.pesantren || []) as Array<Record<string, unknown>>;
      const mappedPesantren: Pesantren[] = pesantrenData.map((item) => ({
        id: String(item.id),
        nama_pesantren: (item.nama_pesantren as string) || null,
        nip: (item.nip as string) || null,
        region_id: (item.region_id as string) || null,
        region_name: (item.region_name as string) || null,
        city_name: (item.city_name as string) || null,
        status_account: String(item.status_account || 'pending'),
        profile_level: String(item.profile_level || 'basic'),
        alamat_singkat: (item.alamat_singkat as string) || null,
        nama_pengasuh: (item.nama_pengasuh as string) || null,
      }));
      setPesantrenList(mappedPesantren);

      // Map media from debug data (same as pesantren with nama_media)
      const mappedMedia: MediaAdmin[] = pesantrenData.map((item) => ({
        id: String(item.id),
        nama_pesantren: (item.nama_pesantren as string) || null,
        nama_media: (item.nama_media as string) || null,
        nip: (item.nip as string) || null,
        region_id: (item.region_id as string) || null,
        region_name: (item.region_name as string) || null,
        status_account: String(item.status_account || 'pending'),
        profile_level: String(item.profile_level || 'basic'),
        no_wa_pendaftar: (item.no_wa_pendaftar as string) || null,
      }));
      setMediaList(mappedMedia);

      // Map crews from debug data
      const crewData = (debugData.crews || []) as Array<Record<string, unknown>>;
      const mappedCrew: Crew[] = crewData.map((item) => ({
        id: String(item.id),
        nama: (item.nama as string) || '',
        niam: (item.niam as string) || null,
        jabatan: (item.jabatan as string) || null,
        xp_level: Number(item.xp_level) || null,
        profile_id: (item.profile_id as string) || '',
        pesantren_name: (item.pesantren_name as string) || null,
        region_id: (item.region_id as string) || null,
        region_name: (item.region_name as string) || null,
      }));
      setCrewList(mappedCrew);

      // Map regions from debug data
      const regionsData = (debugData.regions || []) as Array<Record<string, unknown>>;
      const mappedRegions: Region[] = regionsData.map((item) => ({
        id: String(item.id),
        name: (item.name as string) || '',
        code: (item.code as string) || '',
      }));
      setRegions(mappedRegions);

      setLoading(false);
      return;
    }

    fetchData();
  }, [isDebugMode, debugData]);

  // Filtered data based on region and search
  const filteredPesantren = useMemo(() => {
    return pesantrenList.filter((item) => {
      const matchesRegion = selectedRegionFilter === "all" || item.region_id === selectedRegionFilter;
      const matchesSearch = searchQuery === "" || 
        item.nama_pesantren?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nip?.includes(searchQuery) ||
        item.nama_pengasuh?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [pesantrenList, selectedRegionFilter, searchQuery]);

  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      const matchesRegion = selectedRegionFilter === "all" || item.region_id === selectedRegionFilter;
      const matchesSearch = searchQuery === "" || 
        item.nama_pesantren?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nama_media?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nip?.includes(searchQuery);
      return matchesRegion && matchesSearch;
    });
  }, [mediaList, selectedRegionFilter, searchQuery]);

  const filteredCrew = useMemo(() => {
    return crewList.filter((item) => {
      const matchesRegion = selectedRegionFilter === "all" || item.region_id === selectedRegionFilter;
      const matchesSearch = searchQuery === "" || 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.niam?.includes(searchQuery) ||
        item.pesantren_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [crewList, selectedRegionFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      basic: "bg-slate-100 text-slate-800",
      silver: "bg-gray-200 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-cyan-100 text-cyan-800",
    };
    return <Badge className={`${colors[level] || colors.basic} hover:${colors[level]}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</Badge>;
  };

  // Edit handlers
  const openEditPesantren = (item: Pesantren) => {
    setEditingPesantren(item);
    setEditFormData({
      nama_pesantren: item.nama_pesantren || "",
      nama_pengasuh: item.nama_pengasuh || "",
      alamat_singkat: item.alamat_singkat || "",
      nip: item.nip || "",
    });
    setIsEditPesantrenOpen(true);
  };

  const openEditMedia = (item: MediaAdmin) => {
    setEditingMedia(item);
    setEditFormData({
      nama_pesantren: item.nama_pesantren || "",
      nama_media: item.nama_media || "",
      no_wa_pendaftar: item.no_wa_pendaftar || "",
      nip: item.nip || "",
    });
    setIsEditMediaOpen(true);
  };

  const openEditCrew = (item: Crew) => {
    setEditingCrew(item);
    setEditFormData({
      nama: item.nama || "",
      jabatan: item.jabatan || "",
      niam: item.niam || "",
    });
    setIsEditCrewOpen(true);
  };

  const handleSavePesantren = async () => {
    if (!editingPesantren) return;
    setIsSaving(true);
    try {
      // NIP is immutable - do not include in update
      const { error } = await supabase
        .from("profiles")
        .update({
          nama_pesantren: editFormData.nama_pesantren,
          nama_pengasuh: editFormData.nama_pengasuh,
          alamat_singkat: editFormData.alamat_singkat,
        })
        .eq("id", editingPesantren.id);

      if (error) throw error;

      toast({ title: "Berhasil", description: "Data pesantren berhasil diperbarui" });
      setIsEditPesantrenOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMedia = async () => {
    if (!editingMedia) return;
    setIsSaving(true);
    try {
      // NIP is immutable - do not include in update
      const { error } = await supabase
        .from("profiles")
        .update({
          nama_pesantren: editFormData.nama_pesantren,
          nama_media: editFormData.nama_media,
          no_wa_pendaftar: editFormData.no_wa_pendaftar,
        })
        .eq("id", editingMedia.id);

      if (error) throw error;

      toast({ title: "Berhasil", description: "Data media berhasil diperbarui" });
      setIsEditMediaOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCrew = async () => {
    if (!editingCrew) return;
    setIsSaving(true);
    try {
      // NIAM is immutable - do not include in update
      const { error } = await supabase
        .from("crews")
        .update({
          nama: editFormData.nama,
          jabatan: editFormData.jabatan,
        })
        .eq("id", editingCrew.id);

      if (error) throw error;

      toast({ title: "Berhasil", description: "Data kru berhasil diperbarui" });
      setIsEditCrewOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      if (deleteTarget.type === "crew") {
        const { error } = await supabase.from("crews").delete().eq("id", deleteTarget.id);
        if (error) throw error;
      } else {
        // For pesantren/media, we cannot delete profiles due to RLS
        toast({ 
          title: "Tidak Diizinkan", 
          description: "Profil pesantren tidak dapat dihapus dari Master Data. Gunakan menu administrasi.", 
          variant: "destructive" 
        });
        setDeleteTarget(null);
        setIsSaving(false);
        return;
      }
      toast({ title: "Berhasil", description: `${deleteTarget.name} berhasil dihapus` });
      setDeleteTarget(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Master Data</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Database lengkap pesantren, media, dan kru MPJ Jawa Timur</p>
      </div>

      {/* Global Filter & Search */}
      <Card className="bg-card border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Regional Filter */}
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-muted-foreground mb-1 block">Filter Regional</Label>
              <Select value={selectedRegionFilter} onValueChange={setSelectedRegionFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua Regional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Regional</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      [{region.code}] {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex-1 md:flex-[2]">
              <Label className="text-xs text-muted-foreground mb-1 block">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, NIP, atau NIAM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted w-full md:w-auto flex">
          <TabsTrigger value="pesantren" className="flex-1 md:flex-none items-center gap-2 text-xs md:text-sm">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span> Pesantren
          </TabsTrigger>
          <TabsTrigger value="media" className="flex-1 md:flex-none items-center gap-2 text-xs md:text-sm">
            <Tv className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span> Media
          </TabsTrigger>
          <TabsTrigger value="kru" className="flex-1 md:flex-none items-center gap-2 text-xs md:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span> Kru
          </TabsTrigger>
        </TabsList>

        {/* Data Pesantren Tab */}
        <TabsContent value="pesantren">
          <Card className="bg-card border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-foreground font-semibold flex items-center justify-between">
                <span>Daftar Pesantren ({filteredPesantren.length})</span>
                {selectedRegionFilter !== "all" && (
                  <Badge variant="outline" className="font-normal">
                    {regions.find(r => r.id === selectedRegionFilter)?.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-foreground">NIP</TableHead>
                      <TableHead className="text-muted-foreground">Nama Pesantren</TableHead>
                      <TableHead className="text-muted-foreground">Regional</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Level</TableHead>
                      <TableHead className="text-muted-foreground text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPesantren.length > 0 ? (
                      filteredPesantren.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm font-medium">
                            {item.nip ? formatNIP(item.nip, true) : "-"}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {item.nama_pesantren || "Belum diisi"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.region_name || "-"}</TableCell>
                          <TableCell>{getStatusBadge(item.status_account)}</TableCell>
                          <TableCell>{getLevelBadge(item.profile_level)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setDetailPesantren(item)} title="Lihat Detail">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openEditPesantren(item)} title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data pesantren"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredPesantren.length > 0 ? (
                  filteredPesantren.map((item) => (
                    <div key={item.id} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-base">
                            {item.nama_pesantren || "Belum diisi"}
                          </p>
                          {item.nip && (
                            <p className="font-mono text-sm text-primary font-bold mt-1">
                              NIP: {formatNIP(item.nip, true)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDetailPesantren(item)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditPesantren(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getStatusBadge(item.status_account)}
                        {getLevelBadge(item.profile_level)}
                        {item.region_name && (
                          <Badge variant="outline" className="text-xs">{item.region_name}</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data pesantren"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Media Tab */}
        <TabsContent value="media">
          <Card className="bg-card border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-foreground font-semibold flex items-center justify-between">
                <span>Daftar Admin Media ({filteredMedia.length})</span>
                {selectedRegionFilter !== "all" && (
                  <Badge variant="outline" className="font-normal">
                    {regions.find(r => r.id === selectedRegionFilter)?.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-foreground">NIP</TableHead>
                      <TableHead className="text-muted-foreground">Pesantren</TableHead>
                      <TableHead className="text-muted-foreground">Nama Media</TableHead>
                      <TableHead className="text-muted-foreground">Regional</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedia.length > 0 ? (
                      filteredMedia.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm font-medium">
                            {item.nip ? formatNIP(item.nip, true) : "-"}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {item.nama_pesantren || "Belum diisi"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.nama_media || "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{item.region_name || "-"}</TableCell>
                          <TableCell>{getStatusBadge(item.status_account)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditMedia(item)} title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data media"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredMedia.length > 0 ? (
                  filteredMedia.map((item) => (
                    <div key={item.id} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-base">
                            {item.nama_pesantren || "Belum diisi"}
                          </p>
                          {item.nama_media && (
                            <p className="text-sm text-muted-foreground">{item.nama_media}</p>
                          )}
                          {item.nip && (
                            <p className="font-mono text-sm text-primary font-bold mt-1">
                              NIP: {formatNIP(item.nip, true)}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditMedia(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getStatusBadge(item.status_account)}
                        {getLevelBadge(item.profile_level)}
                        {item.region_name && (
                          <Badge variant="outline" className="text-xs">{item.region_name}</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data media"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Kru Tab */}
        <TabsContent value="kru">
          <Card className="bg-card border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-foreground font-semibold flex items-center justify-between">
                <span>Daftar Kru ({filteredCrew.length})</span>
                {selectedRegionFilter !== "all" && (
                  <Badge variant="outline" className="font-normal">
                    {regions.find(r => r.id === selectedRegionFilter)?.name}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-foreground">NIAM</TableHead>
                      <TableHead className="text-muted-foreground">Nama Kru</TableHead>
                      <TableHead className="text-muted-foreground">Jabatan</TableHead>
                      <TableHead className="text-muted-foreground">Pesantren</TableHead>
                      <TableHead className="text-muted-foreground">Regional</TableHead>
                      <TableHead className="text-muted-foreground text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCrew.length > 0 ? (
                      filteredCrew.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm font-medium">
                            {item.niam ? formatNIAM(item.niam, true) : "-"}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{item.nama}</TableCell>
                          <TableCell className="text-muted-foreground">{item.jabatan || "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{item.pesantren_name || "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{item.region_name || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditCrew(item)} title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ type: 'crew', id: item.id, name: item.nama })} title="Hapus" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data kru"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredCrew.length > 0 ? (
                  filteredCrew.map((item) => (
                    <div key={item.id} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-base">{item.nama}</p>
                          {item.niam && (
                            <p className="font-mono text-sm text-primary font-bold mt-1">
                              NIAM: {formatNIAM(item.niam, true)}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.jabatan || "Tanpa Jabatan"} • {item.pesantren_name || "-"}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditCrew(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleteTarget({ type: 'crew', id: item.id, name: item.nama })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {item.region_name && (
                        <Badge variant="outline" className="text-xs mt-2">{item.region_name}</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data kru"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Pesantren Dialog */}
      <Dialog open={isEditPesantrenOpen} onOpenChange={setIsEditPesantrenOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Data Pesantren</DialogTitle>
            <DialogDescription>Perbarui informasi pesantren. Perubahan akan langsung tersimpan ke database.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                NIP (Nomor Induk Pesantren)
                <Badge variant="outline" className="text-xs text-muted-foreground">Permanen</Badge>
              </Label>
              <Input
                value={editFormData.nip ? formatNIP(editFormData.nip, true) : "-"}
                disabled
                className="font-mono bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">NIP tidak dapat diubah setelah diterbitkan</p>
            </div>
            <div className="space-y-2">
              <Label>Nama Pesantren</Label>
              <Input
                value={editFormData.nama_pesantren || ""}
                onChange={(e) => setEditFormData({ ...editFormData, nama_pesantren: e.target.value })}
                placeholder="Masukkan nama pesantren"
              />
            </div>
            <div className="space-y-2">
              <Label>Nama Pengasuh</Label>
              <Input
                value={editFormData.nama_pengasuh || ""}
                onChange={(e) => setEditFormData({ ...editFormData, nama_pengasuh: e.target.value })}
                placeholder="Masukkan nama pengasuh"
              />
            </div>
            <div className="space-y-2">
              <Label>Alamat Singkat</Label>
              <Input
                value={editFormData.alamat_singkat || ""}
                onChange={(e) => setEditFormData({ ...editFormData, alamat_singkat: e.target.value })}
                placeholder="Masukkan alamat singkat"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPesantrenOpen(false)}>Batal</Button>
            <Button onClick={handleSavePesantren} disabled={isSaving} className="bg-primary">
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Media Dialog */}
      <Dialog open={isEditMediaOpen} onOpenChange={setIsEditMediaOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Data Media</DialogTitle>
            <DialogDescription>Perbarui informasi admin media pesantren.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                NIP
                <Badge variant="outline" className="text-xs text-muted-foreground">Permanen</Badge>
              </Label>
              <Input
                value={editFormData.nip ? formatNIP(editFormData.nip, true) : "-"}
                disabled
                className="font-mono bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">NIP tidak dapat diubah setelah diterbitkan</p>
            </div>
            <div className="space-y-2">
              <Label>Nama Pesantren</Label>
              <Input
                value={editFormData.nama_pesantren || ""}
                onChange={(e) => setEditFormData({ ...editFormData, nama_pesantren: e.target.value })}
                placeholder="Masukkan nama pesantren"
              />
            </div>
            <div className="space-y-2">
              <Label>Nama Media</Label>
              <Input
                value={editFormData.nama_media || ""}
                onChange={(e) => setEditFormData({ ...editFormData, nama_media: e.target.value })}
                placeholder="Masukkan nama media"
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor WhatsApp</Label>
              <Input
                value={editFormData.no_wa_pendaftar || ""}
                onChange={(e) => setEditFormData({ ...editFormData, no_wa_pendaftar: e.target.value })}
                placeholder="Contoh: 081234567890"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMediaOpen(false)}>Batal</Button>
            <Button onClick={handleSaveMedia} disabled={isSaving} className="bg-primary">
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Crew Dialog */}
      <Dialog open={isEditCrewOpen} onOpenChange={setIsEditCrewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Data Kru</DialogTitle>
            <DialogDescription>Perbarui informasi kru media pesantren.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                NIAM (Nomor Induk Anggota Media)
                <Badge variant="outline" className="text-xs text-muted-foreground">Permanen</Badge>
              </Label>
              <Input
                value={editFormData.niam ? formatNIAM(editFormData.niam, true) : "-"}
                disabled
                className="font-mono bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">NIAM tidak dapat diubah setelah diterbitkan</p>
            </div>
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                value={editFormData.nama || ""}
                onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input
                value={editFormData.jabatan || ""}
                onChange={(e) => setEditFormData({ ...editFormData, jabatan: e.target.value })}
                placeholder="Contoh: Videografer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCrewOpen(false)}>Batal</Button>
            <Button onClick={handleSaveCrew} disabled={isSaving} className="bg-primary">
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Pesantren Dialog */}
      <Dialog open={!!detailPesantren} onOpenChange={() => setDetailPesantren(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pesantren</DialogTitle>
          </DialogHeader>
          {detailPesantren && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">NIP</Label>
                  <p className="font-mono font-bold text-lg">
                    {detailPesantren.nip ? formatNIP(detailPesantren.nip, true) : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <div className="mt-1">{getStatusBadge(detailPesantren.status_account)}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Nama Pesantren</Label>
                <p className="font-semibold text-lg">{detailPesantren.nama_pesantren || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Nama Pengasuh</Label>
                <p>{detailPesantren.nama_pengasuh || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Alamat</Label>
                <p>{detailPesantren.alamat_singkat || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Regional</Label>
                  <p>{detailPesantren.region_name || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Kota</Label>
                  <p>{detailPesantren.city_name || "-"}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Level Profil</Label>
                <div className="mt-1">{getLevelBadge(detailPesantren.profile_level)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailPesantren(null)}>Tutup</Button>
            <Button onClick={() => { setDetailPesantren(null); openEditPesantren(detailPesantren!); }} className="bg-primary">
              Edit Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSaving ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPusatMasterData;
