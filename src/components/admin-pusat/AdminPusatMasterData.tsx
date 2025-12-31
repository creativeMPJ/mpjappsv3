import { useState, useEffect } from "react";
import { Building2, Users, MapPin, Plus, Trash2, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JabatanCodesManagement from "./JabatanCodesManagement";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Pesantren {
  id: string;
  nama_pesantren: string | null;
  region_name: string | null;
  status_account: string;
  profile_level: string;
}

interface Crew {
  id: string;
  nama: string;
  jabatan: string | null;
  pesantren_name: string | null;
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

const AdminPusatMasterData = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("lembaga");
  const [pesantrenList, setPesantrenList] = useState<Pesantren[]>([]);
  const [crewList, setCrewList] = useState<Crew[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Region/City management state
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [newRegionName, setNewRegionName] = useState("");
  const [newRegionCode, setNewRegionCode] = useState("");
  const [newCityName, setNewCityName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch all pesantren
      const { data: pesantrenData } = await supabase
        .from("profiles")
        .select(`
          id,
          nama_pesantren,
          status_account,
          profile_level,
          regions!profiles_region_id_fkey (name)
        `)
        .order("nama_pesantren", { ascending: true });

      // Fetch all crews
      const { data: crewData } = await supabase
        .from("crews")
        .select(`
          id,
          nama,
          jabatan,
          profiles!crews_profile_id_fkey (nama_pesantren)
        `)
        .order("nama", { ascending: true });

      // Fetch all regions
      const { data: regionsData } = await supabase
        .from("regions")
        .select("id, name, code")
        .order("name", { ascending: true });

      // Fetch all cities
      const { data: citiesData } = await supabase
        .from("cities")
        .select("id, name, region_id")
        .order("name", { ascending: true });

      if (pesantrenData) {
        setPesantrenList(
          pesantrenData.map((item: any) => ({
            id: item.id,
            nama_pesantren: item.nama_pesantren,
            region_name: item.regions?.name || "Unknown",
            status_account: item.status_account,
            profile_level: item.profile_level,
          }))
        );
      }

      if (crewData) {
        setCrewList(
          crewData.map((item: any) => ({
            id: item.id,
            nama: item.nama,
            jabatan: item.jabatan,
            pesantren_name: item.profiles?.nama_pesantren || "Unknown",
          }))
        );
      }

      if (regionsData) {
        setRegions(regionsData);
        if (regionsData.length > 0 && !selectedRegion) {
          setSelectedRegion(regionsData[0]);
        }
      }

      if (citiesData) {
        setCities(citiesData);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      platinum: "bg-purple-100 text-purple-800",
    };
    return <Badge className={colors[level] || colors.basic}>{level.toUpperCase()}</Badge>;
  };

  // Add new region
  const handleAddRegion = async () => {
    if (!newRegionName.trim() || !newRegionCode.trim()) {
      toast({
        title: "Error",
        description: "Nama dan kode regional harus diisi",
        variant: "destructive",
      });
      return;
    }

    // Validate RR code is exactly 2 digits
    if (!/^[0-9]{2}$/.test(newRegionCode)) {
      toast({
        title: "Error",
        description: "Kode RR harus tepat 2 digit angka (contoh: 01, 07, 15)",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate code
    if (regions.some(r => r.code === newRegionCode)) {
      toast({
        title: "Error",
        description: `Kode RR "${newRegionCode}" sudah digunakan oleh regional lain`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("regions")
        .insert({ name: newRegionName.trim(), code: newRegionCode.trim().toUpperCase() })
        .select()
        .single();

      if (error) throw error;

      setRegions(prev => [...prev, data]);
      setNewRegionName("");
      setNewRegionCode("");
      setIsAddRegionOpen(false);
      
      toast({
        title: "Berhasil",
        description: `Regional "${data.name}" berhasil ditambahkan.`,
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

  // Delete region
  const handleDeleteRegion = async (region: Region) => {
    if (!confirm(`Hapus regional "${region.name}"? Semua kota di dalamnya juga akan terhapus.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("regions")
        .delete()
        .eq("id", region.id);

      if (error) throw error;

      setRegions(prev => prev.filter(r => r.id !== region.id));
      setCities(prev => prev.filter(c => c.region_id !== region.id));
      
      if (selectedRegion?.id === region.id) {
        setSelectedRegion(regions.find(r => r.id !== region.id) || null);
      }

      toast({
        title: "Berhasil",
        description: `Regional "${region.name}" berhasil dihapus.`,
      });
    } catch (error: any) {
      console.error("Error deleting region:", error);
      toast({
        title: "Gagal",
        description: error.message || "Tidak dapat menghapus regional yang masih memiliki pesantren.",
        variant: "destructive",
      });
    }
  };

  // Add new city
  const handleAddCity = async () => {
    if (!newCityName.trim() || !selectedRegion) {
      toast({
        title: "Error",
        description: "Pilih regional dan masukkan nama kota",
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
      setNewCityName("");
      setIsAddCityOpen(false);
      
      toast({
        title: "Berhasil",
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

  // Delete city
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

      toast({
        title: "Berhasil",
        description: `Kota "${city.name}" berhasil dihapus.`,
      });
    } catch (error: any) {
      console.error("Error deleting city:", error);
      toast({
        title: "Gagal",
        description: error.message || "Tidak dapat menghapus kota yang masih memiliki pesantren.",
        variant: "destructive",
      });
    }
  };

  // Filter cities by selected region
  const filteredCities = selectedRegion 
    ? cities.filter(c => c.region_id === selectedRegion.id)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#166534]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Master Data</h1>
        <p className="text-slate-500 mt-1">Database lengkap pesantren, kru, dan wilayah MPJ</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="lembaga" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Data Lembaga
          </TabsTrigger>
          <TabsTrigger value="kru" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Data Kru
          </TabsTrigger>
          <TabsTrigger value="wilayah" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Data Wilayah
          </TabsTrigger>
          <TabsTrigger value="jabatan" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Kode Jabatan
          </TabsTrigger>
        </TabsList>

        {/* Data Lembaga Tab */}
        <TabsContent value="lembaga">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 font-semibold">
                Daftar Pesantren ({pesantrenList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Nama Pesantren</TableHead>
                      <TableHead className="text-slate-600">Wilayah</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                      <TableHead className="text-slate-600">Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pesantrenList.length > 0 ? (
                      pesantrenList.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-slate-900">
                            {item.nama_pesantren || "Belum diisi"}
                          </TableCell>
                          <TableCell className="text-slate-600">{item.region_name}</TableCell>
                          <TableCell>{getStatusBadge(item.status_account)}</TableCell>
                          <TableCell>{getLevelBadge(item.profile_level)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                          Belum ada data pesantren
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Kru Tab */}
        <TabsContent value="kru">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 font-semibold">
                Daftar Kru ({crewList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Nama Kru</TableHead>
                      <TableHead className="text-slate-600">Jabatan</TableHead>
                      <TableHead className="text-slate-600">Pesantren</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crewList.length > 0 ? (
                      crewList.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-slate-900">{item.nama}</TableCell>
                          <TableCell className="text-slate-600">{item.jabatan || "-"}</TableCell>
                          <TableCell className="text-slate-600">{item.pesantren_name}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                          Belum ada data kru
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Wilayah Tab */}
        <TabsContent value="wilayah">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Regions */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-900 font-semibold">
                    Daftar Regional ({regions.length})
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setIsAddRegionOpen(true)}
                    className="bg-[#166534] hover:bg-emerald-700 text-white gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Regional
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {regions.length > 0 ? (
                    regions.map((region) => {
                      const isValidCode = /^[0-9]{2}$/.test(region.code);
                      return (
                        <div 
                          key={region.id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedRegion?.id === region.id 
                              ? "bg-emerald-50 border-2 border-[#166534]" 
                              : "bg-slate-50 hover:bg-slate-100 border-2 border-transparent"
                          }`}
                          onClick={() => setSelectedRegion(region)}
                        >
                          <div>
                            <p className="font-medium text-slate-900">{region.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-slate-500">Kode RR:</span>
                              <Badge className={isValidCode ? "bg-emerald-100 text-emerald-800 font-mono" : "bg-red-100 text-red-800 font-mono"}>
                                {region.code}
                              </Badge>
                              {!isValidCode && (
                                <span className="text-xs text-red-500">⚠️ Harus 2 digit angka!</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              {cities.filter(c => c.region_id === region.id).length} Kota
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRegion(region);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-slate-500 py-8">
                      Belum ada data regional
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Cities */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-900 font-semibold">
                    {selectedRegion ? `Kota di ${selectedRegion.name}` : "Pilih Regional"}
                    {selectedRegion && ` (${filteredCities.length})`}
                  </CardTitle>
                  {selectedRegion && (
                    <Button 
                      size="sm" 
                      onClick={() => setIsAddCityOpen(true)}
                      className="bg-[#166534] hover:bg-emerald-700 text-white gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Kota
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedRegion ? (
                  <div className="space-y-2">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <div 
                          key={city.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <p className="font-medium text-slate-900">{city.name}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCity(city)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-8">
                        Belum ada kota di regional ini
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    Pilih regional di sebelah kiri untuk melihat daftar kota
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Kode Jabatan Tab */}
        <TabsContent value="jabatan">
          <JabatanCodesManagement />
        </TabsContent>
      </Tabs>

      {/* Add Region Dialog */}
      <Dialog open={isAddRegionOpen} onOpenChange={setIsAddRegionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Regional Baru</DialogTitle>
            <DialogDescription>
              Buat regional baru untuk mengelompokkan kota-kota cakupan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Regional</Label>
              <Input
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                placeholder="Contoh: Regional Tapal Kuda"
              />
              <p className="text-xs text-slate-500">Nama regional sesuai kesepakatan pengurus</p>
            </div>
            <div className="space-y-2">
              <Label>Kode RR (2 Digit Angka) <span className="text-red-500">*</span></Label>
              <Input
                value={newRegionCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setNewRegionCode(val);
                }}
                placeholder="Contoh: 07"
                maxLength={2}
                className="font-mono text-lg tracking-widest"
              />
              <p className="text-xs text-amber-600 font-medium">
                ⚠️ WAJIB 2 digit angka unik (01-99). Kode ini akan digunakan untuk generate NIP Lembaga.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRegionOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleAddRegion} 
              disabled={isSaving || newRegionCode.length !== 2}
              className="bg-[#166534] hover:bg-emerald-700 text-white"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add City Dialog */}
      <Dialog open={isAddCityOpen} onOpenChange={setIsAddCityOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Kota Cakupan</DialogTitle>
            <DialogDescription>
              Tambahkan kota ke regional {selectedRegion?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Kota</Label>
              <Input
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="Contoh: Banyuwangi"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCityOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleAddCity} 
              disabled={isSaving}
              className="bg-[#166534] hover:bg-emerald-700 text-white"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPusatMasterData;
