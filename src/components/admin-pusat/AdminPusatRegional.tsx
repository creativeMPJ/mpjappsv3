import { useState, useEffect } from "react";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Building2, 
  CheckCircle2,
  UserPlus, 
  Shield, 
  Search, 
  AlertTriangle 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

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

interface Region {
  id: string;
  name: string;
  code: string;
}

interface City {
  id: string;
  name: string;
  region_id: string;
}

interface UserData {
  id: string;
  nama_pesantren: string | null;
  nama_pengasuh: string | null;
  region_id: string | null;
  region_name: string | null;
  role: AppRole;
  status_account: string;
}

interface RegionWithStats extends Region {
  city_count: number;
  admin_count: number;
}

const AdminPusatRegional = ({ isDebugMode, debugData }: Props = {}) => {
  const { toast } = useToast();
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [userList, setUserList] = useState<UserData[]>([]);
  const [regionsWithStats, setRegionsWithStats] = useState<RegionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected region for mapping
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  
  // Dialog states
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [newRegionName, setNewRegionName] = useState("");
  const [newRegionCode, setNewRegionCode] = useState("");
  const [newCityName, setNewCityName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Admin assignment
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedRegionForAssign, setSelectedRegionForAssign] = useState<string>("");

  const fetchData = async () => {
    try {
      // Fetch regions
      const { data: regionsData } = await supabase
        .from("regions")
        .select("id, name, code")
        .order("name", { ascending: true });

      // Fetch cities
      const { data: citiesData } = await supabase
        .from("cities")
        .select("id, name, region_id")
        .order("name", { ascending: true });

      // Fetch users with roles
      const { data: userData } = await supabase
        .from("profiles")
        .select(`
          id,
          nama_pesantren,
          nama_pengasuh,
          region_id,
          role,
          status_account,
          regions!profiles_region_id_fkey (name)
        `)
        .order("nama_pesantren", { ascending: true });

      if (regionsData) {
        setRegions(regionsData);
        
        // Calculate stats
        const cityCountMap: Record<string, number> = {};
        citiesData?.forEach(city => {
          cityCountMap[city.region_id] = (cityCountMap[city.region_id] || 0) + 1;
        });

        const adminCountMap: Record<string, number> = {};
        userData?.forEach((user: any) => {
          if (user.role === "admin_regional" && user.region_id) {
            adminCountMap[user.region_id] = (adminCountMap[user.region_id] || 0) + 1;
          }
        });

        setRegionsWithStats(
          regionsData.map(region => ({
            ...region,
            city_count: cityCountMap[region.id] || 0,
            admin_count: adminCountMap[region.id] || 0,
          }))
        );
      }

      if (citiesData) {
        setCities(citiesData);
      }

      if (userData) {
        setUserList(
          userData.map((item: any) => ({
            id: item.id,
            nama_pesantren: item.nama_pesantren,
            nama_pengasuh: item.nama_pengasuh,
            region_id: item.region_id,
            region_name: item.regions?.name || null,
            role: item.role,
            status_account: item.status_account,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ══════════════════════════════════════════════════════════════
  // STEP 1 & 2: Regional & City Management
  // ══════════════════════════════════════════════════════════════
  
  const handleAddRegion = async () => {
    if (!newRegionName.trim() || !newRegionCode.trim()) {
      toast({
        title: "Error",
        description: "Nama dan kode regional harus diisi",
        variant: "destructive",
      });
      return;
    }

    // Validate 2-digit code
    if (!/^\d{2}$/.test(newRegionCode.trim())) {
      toast({
        title: "Error",
        description: "Kode regional harus 2 digit angka (contoh: 01, 12)",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("regions")
        .insert({ name: newRegionName.trim(), code: newRegionCode.trim() })
        .select()
        .single();

      if (error) throw error;

      setRegions(prev => [...prev, data]);
      setRegionsWithStats(prev => [...prev, { ...data, city_count: 0, admin_count: 0 }]);
      setNewRegionName("");
      setNewRegionCode("");
      setIsAddRegionOpen(false);
      setSelectedRegion(data);
      
      toast({
        title: "✅ Step 1 Selesai",
        description: `Regional "${data.name}" (Kode: ${data.code}) berhasil dibuat.`,
      });
    } catch (error: any) {
      console.error("Error adding region:", error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat menambah regional.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRegion = async (region: Region) => {
    const regionCities = cities.filter(c => c.region_id === region.id);
    if (!confirm(`Hapus regional "${region.name}"? ${regionCities.length > 0 ? `${regionCities.length} kota juga akan terhapus.` : ""}`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("regions")
        .delete()
        .eq("id", region.id);

      if (error) throw error;

      setRegions(prev => prev.filter(r => r.id !== region.id));
      setRegionsWithStats(prev => prev.filter(r => r.id !== region.id));
      setCities(prev => prev.filter(c => c.region_id !== region.id));
      
      if (selectedRegion?.id === region.id) {
        setSelectedRegion(null);
      }

      toast({
        title: "Berhasil",
        description: `Regional "${region.name}" berhasil dihapus.`,
      });
    } catch (error: any) {
      console.error("Error deleting region:", error);
      toast({
        title: "Gagal",
        description: error.message || "Tidak dapat menghapus regional yang masih memiliki pesantren terdaftar.",
        variant: "destructive",
      });
    }
  };

  const handleAddCity = async () => {
    if (!newCityName.trim()) {
      toast({
        title: "Error",
        description: "Nama kota harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRegion) {
      toast({
        title: "Error",
        description: "Pilih regional terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("cities")
        .insert({ name: newCityName.trim(), region_id: selectedRegion.id })
        .select()
        .single();

      if (error) throw error;

      setCities(prev => [...prev, data]);
      setRegionsWithStats(prev => prev.map(r => 
        r.id === selectedRegion.id ? { ...r, city_count: r.city_count + 1 } : r
      ));
      setNewCityName("");
      setIsAddCityOpen(false);
      
      toast({
        title: "✅ Step 2 Selesai",
        description: `Kota "${data.name}" berhasil ditambahkan ke ${selectedRegion.name}.`,
      });
    } catch (error: any) {
      console.error("Error adding city:", error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat menambah kota.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCity = async (city: City) => {
    if (!confirm(`Hapus kota "${city.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("cities")
        .delete()
        .eq("id", city.id);

      if (error) throw error;

      setCities(prev => prev.filter(c => c.id !== city.id));
      setRegionsWithStats(prev => prev.map(r => 
        r.id === city.region_id ? { ...r, city_count: r.city_count - 1 } : r
      ));

      toast({
        title: "Berhasil",
        description: `Kota "${city.name}" berhasil dihapus.`,
      });
    } catch (error: any) {
      console.error("Error deleting city:", error);
      toast({
        title: "Gagal",
        description: error.message || "Tidak dapat menghapus kota yang masih memiliki pesantren terdaftar.",
        variant: "destructive",
      });
    }
  };

  // ══════════════════════════════════════════════════════════════
  // STEP 3: Admin Assignment
  // ══════════════════════════════════════════════════════════════

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case "admin_pusat":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin Pusat</Badge>;
      case "admin_regional":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Admin Regional</Badge>;
      case "admin_finance":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Admin Finance</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">User</Badge>;
    }
  };

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

  const handleOpenAssignDialog = (user: UserData) => {
    setSelectedUser(user);
    setSelectedRegionForAssign(user.region_id || "");
    setIsAssignDialogOpen(true);
  };

  const handleAssignAdmin = async () => {
    if (!selectedUser) return;
    
    if (!selectedRegionForAssign) {
      toast({
        title: "Error",
        description: "Pilih regional terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    const regionExists = regionsWithStats.find(r => r.id === selectedRegionForAssign);
    if (!regionExists) {
      toast({
        title: "Error",
        description: "Regional tidak ditemukan. Buat regional terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    if (regionExists.city_count === 0) {
      const proceed = confirm(
        `Regional "${regionExists.name}" belum memiliki kota cakupan. Lanjutkan assign admin?`
      );
      if (!proceed) return;
    }

    setIsSaving(true);
    try {
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({
          user_id: selectedUser.id,
          role: "admin_regional" as AppRole,
        }, {
          onConflict: "user_id"
        });

      if (roleError) throw roleError;

      const { error: profileError } = await supabase.rpc("migrate_legacy_account", {
        p_user_id: selectedUser.id,
        p_city_id: null as any,
        p_region_id: selectedRegionForAssign,
        p_nama_pesantren: selectedUser.nama_pesantren || "",
        p_nama_pengasuh: selectedUser.nama_pengasuh || "",
        p_alamat_singkat: "",
        p_no_wa_pendaftar: "",
        p_status_account: selectedUser.status_account as any,
      });

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      setUserList(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { 
              ...u, 
              role: "admin_regional" as AppRole,
              region_id: selectedRegionForAssign,
              region_name: regionExists.name
            }
          : u
      ));

      setRegionsWithStats(prev => prev.map(r => 
        r.id === selectedRegionForAssign 
          ? { ...r, admin_count: r.admin_count + 1 }
          : r
      ));

      toast({
        title: "✅ Step 3 Selesai",
        description: `${selectedUser.nama_pesantren || selectedUser.nama_pengasuh || "User"} berhasil diangkat sebagai Admin ${regionExists.name}.`,
      });

      setIsAssignDialogOpen(false);
    } catch (error: any) {
      console.error("Error assigning admin:", error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat mengangkat admin.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter cities by selected region
  const filteredCities = selectedRegion 
    ? cities.filter(c => c.region_id === selectedRegion.id)
    : [];

  // Filter users for assignment
  const filteredUsers = userList.filter(u => {
    const matchesSearch = 
      (u.nama_pesantren?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       u.nama_pengasuh?.toLowerCase().includes(searchQuery.toLowerCase()));
    const isPromotable = u.role === "user" || u.role === "admin_regional";
    return (searchQuery === "" || matchesSearch) && isPromotable;
  });

  const adminRegionalList = userList.filter(u => u.role === "admin_regional");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manajemen Regional</h1>
        <p className="text-muted-foreground mt-1">Kelola wilayah dan Admin Regional dalam satu tempat</p>
      </div>

      {/* Workflow Steps Indicator */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                1
              </div>
              <span className="font-medium text-foreground">Buat Regional</span>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                2
              </div>
              <span className="font-medium text-foreground">Mapping Kota</span>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="font-medium text-foreground">Assign Admin</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="struktur" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="struktur" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Struktur & Mapping
          </TabsTrigger>
          <TabsTrigger value="otoritas" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Otoritas Admin
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Struktur & Mapping */}
        <TabsContent value="struktur" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* STEP 1: Create Regional */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    Daftar Regional ({regions.length})
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setIsAddRegionOpen(true)}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Buat Regional
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {regions.length > 0 ? (
                    regions.map((region) => {
                      const stats = regionsWithStats.find(r => r.id === region.id);
                      return (
                        <div 
                          key={region.id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                            selectedRegion?.id === region.id 
                              ? "bg-primary/10 border-2 border-primary ring-2 ring-primary/20" 
                              : "bg-muted/50 hover:bg-muted border-2 border-transparent"
                          }`}
                          onClick={() => setSelectedRegion(region)}
                        >
                          <div className="flex items-center gap-3">
                            {selectedRegion?.id === region.id && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                            <div>
                              <p className="font-medium text-foreground">{region.name}</p>
                              <p className="text-sm text-muted-foreground">Kode RR: {region.code}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {stats?.city_count || 0} Kota
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRegion(region);
                              }}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Belum ada regional</p>
                      <p className="text-sm">Klik "Buat Regional" untuk memulai</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* STEP 2: Map Cities */}
            <Card className={`border-2 ${selectedRegion ? "border-primary/20" : "border-dashed border-muted"}`}>
              <CardHeader className={`pb-3 rounded-t-lg ${selectedRegion ? "bg-primary/5" : "bg-muted/30"}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${
                    selectedRegion ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedRegion ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      2
                    </div>
                    Kota Cakupan {selectedRegion && `(${filteredCities.length})`}
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setIsAddCityOpen(true)}
                    disabled={!selectedRegion}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Kota
                  </Button>
                </div>
                {selectedRegion && (
                  <div className="mt-2">
                    <Badge className="bg-primary text-primary-foreground">
                      Regional: {selectedRegion.name}
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                {!selectedRegion ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Pilih Regional Terlebih Dahulu</p>
                    <p className="text-sm">Klik regional di sebelah kiri untuk melihat dan mengelola kota</p>
                  </div>
                ) : filteredCities.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredCities.map((city) => (
                      <div 
                        key={city.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{city.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCity(city)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Belum ada kota di regional ini</p>
                    <p className="text-sm">Klik "Tambah Kota" untuk menambahkan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Otoritas Admin */}
        <TabsContent value="otoritas" className="space-y-6 mt-6">
          {/* Regions Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Regional Tersedia ({regionsWithStats.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {regionsWithStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Belum ada regional</p>
                  <p className="text-sm">Buat regional terlebih dahulu di Tab "Struktur & Mapping"</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {regionsWithStats.map(region => (
                    <div 
                      key={region.id} 
                      className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{region.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {region.city_count} Kota
                          </Badge>
                          <Badge 
                            variant={region.admin_count > 0 ? "default" : "outline"} 
                            className={`text-xs ${region.admin_count > 0 ? "bg-green-100 text-green-800" : ""}`}
                          >
                            {region.admin_count} Admin
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Admin Regional */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-3 bg-blue-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Admin Regional Aktif ({adminRegionalList.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {adminRegionalList.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Belum ada Admin Regional</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Wilayah</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminRegionalList.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.nama_pesantren || user.nama_pengasuh || "Belum diisi"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.region_name || "Belum diatur"}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status_account)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAssignDialog(user)}
                            className="gap-1"
                          >
                            <Shield className="h-4 w-4" />
                            Ubah Regional
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Assign New Admin */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Angkat Admin Regional Baru
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari user berdasarkan nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {regionsWithStats.length === 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Belum ada regional</p>
                    <p className="text-sm text-yellow-700">
                      Buat regional terlebih dahulu di Tab "Struktur & Mapping" sebelum dapat mengangkat admin.
                    </p>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Wilayah Saat Ini</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.nama_pesantren || user.nama_pengasuh || "Belum diisi"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.region_name || "-"}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status_account)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleOpenAssignDialog(user)}
                            disabled={regionsWithStats.length === 0}
                            className="gap-1"
                          >
                            <UserPlus className="h-4 w-4" />
                            Angkat Admin
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {searchQuery ? "Tidak ada user yang ditemukan" : "Tidak ada user yang tersedia untuk diangkat"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Region Dialog */}
      <Dialog open={isAddRegionOpen} onOpenChange={setIsAddRegionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Regional Baru</DialogTitle>
            <DialogDescription>
              Step 1: Buat entitas regional dengan kode 2 digit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama Regional</Label>
              <Input
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                placeholder="Contoh: MPJ Surabaya"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Kode RR (2 Digit)</Label>
              <Input
                value={newRegionCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setNewRegionCode(value);
                }}
                placeholder="Contoh: 01"
                className="mt-1"
                maxLength={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Kode 2 digit untuk identifikasi NIP (contoh: 01, 12, 17)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRegionOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddRegion} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Buat Regional"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add City Dialog */}
      <Dialog open={isAddCityOpen} onOpenChange={setIsAddCityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kota Cakupan</DialogTitle>
            <DialogDescription>
              Step 2: Tambahkan kota ke regional "{selectedRegion?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama Kota</Label>
              <Input
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="Contoh: Surabaya"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCityOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddCity} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Tambah Kota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Admin Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Angkat Admin Regional</DialogTitle>
            <DialogDescription>
              Step 3: Pilih wilayah untuk {selectedUser?.nama_pesantren || selectedUser?.nama_pengasuh || "user ini"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pilih Regional</Label>
              <Select value={selectedRegionForAssign} onValueChange={setSelectedRegionForAssign}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih regional..." />
                </SelectTrigger>
                <SelectContent>
                  {regionsWithStats.map(region => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name} ({region.city_count} kota, {region.admin_count} admin)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAssignAdmin} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Angkat Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPusatRegional;
