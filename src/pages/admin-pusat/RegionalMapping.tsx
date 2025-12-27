import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const RegionalMapping = () => {
  const { toast } = useToast();
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected region for Step 2
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  
  // Dialog states
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [newRegionName, setNewRegionName] = useState("");
  const [newRegionCode, setNewRegionCode] = useState("");
  const [newCityName, setNewCityName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const { data: regionsData } = await supabase
        .from("regions")
        .select("id, name, code")
        .order("name", { ascending: true });

      const { data: citiesData } = await supabase
        .from("cities")
        .select("id, name, region_id")
        .order("name", { ascending: true });

      if (regionsData) {
        setRegions(regionsData);
      }

      if (citiesData) {
        setCities(citiesData);
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

  // STEP 1: Add new region
  const handleAddRegion = async () => {
    if (!newRegionName.trim() || !newRegionCode.trim()) {
      toast({
        title: "Error",
        description: "Nama dan kode regional harus diisi",
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
      
      // Auto-select the newly created region
      setSelectedRegion(data);
      
      toast({
        title: "✅ Step 1 Selesai",
        description: `Regional "${data.name}" berhasil dibuat. Sekarang tambahkan kota cakupan.`,
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

  // STEP 2: Add city to selected region
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
        description: "Pilih regional terlebih dahulu sebelum menambah kota",
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
        description: error.message || "Tidak dapat menghapus kota yang masih memiliki pesantren terdaftar.",
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mapping Regional</h1>
        <p className="text-muted-foreground mt-1">Buat regional baru dan tentukan wilayah cakupannya</p>
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                selectedRegion ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                2
              </div>
              <span className={`font-medium ${selectedRegion ? "text-foreground" : "text-muted-foreground"}`}>
                Mapping Kota
              </span>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="text-muted-foreground">Assign Admin</span>
              <Badge variant="outline" className="text-xs">Di halaman lain</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  const cityCount = cities.filter(c => c.region_id === region.id).length;
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
                          <p className="text-sm text-muted-foreground">Kode: {region.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {cityCount} Kota
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

      {/* Add Region Dialog */}
      <Dialog open={isAddRegionOpen} onOpenChange={setIsAddRegionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Regional Baru</DialogTitle>
            <DialogDescription>
              Step 1: Buat entitas regional terlebih dahulu
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
              <Label>Kode Regional</Label>
              <Input
                value={newRegionCode}
                onChange={(e) => setNewRegionCode(e.target.value)}
                placeholder="Contoh: SBY"
                className="mt-1"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground mt-1">Kode unik untuk identifikasi (maks 10 karakter)</p>
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
                placeholder="Contoh: Kota Surabaya"
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
    </div>
  );
};

export default RegionalMapping;
