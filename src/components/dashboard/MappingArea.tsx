import { useState } from "react";
import { MapPin, Check, Save, Plus, Trash2, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

interface Regional {
  id: string;
  name: string;
  cities: string[];
  memberCount?: number; // For validation
}

interface City {
  id: string;
  name: string;
}

// All East Java cities/regencies
const allCities: City[] = [
  { id: "kota-malang", name: "Kota Malang" },
  { id: "kab-malang", name: "Kab. Malang" },
  { id: "kota-batu", name: "Kota Batu" },
  { id: "kota-surabaya", name: "Kota Surabaya" },
  { id: "kab-sidoarjo", name: "Kab. Sidoarjo" },
  { id: "kab-gresik", name: "Kab. Gresik" },
  { id: "kab-lamongan", name: "Kab. Lamongan" },
  { id: "kab-jombang", name: "Kab. Jombang" },
  { id: "kab-mojokerto", name: "Kab. Mojokerto" },
  { id: "kota-mojokerto", name: "Kota Mojokerto" },
  { id: "kab-kediri", name: "Kab. Kediri" },
  { id: "kota-kediri", name: "Kota Kediri" },
  { id: "kab-blitar", name: "Kab. Blitar" },
  { id: "kota-blitar", name: "Kota Blitar" },
  { id: "kab-tulungagung", name: "Kab. Tulungagung" },
  { id: "kab-trenggalek", name: "Kab. Trenggalek" },
  { id: "kab-nganjuk", name: "Kab. Nganjuk" },
  { id: "kab-madiun", name: "Kab. Madiun" },
  { id: "kota-madiun", name: "Kota Madiun" },
  { id: "kab-magetan", name: "Kab. Magetan" },
  { id: "kab-ngawi", name: "Kab. Ngawi" },
  { id: "kab-ponorogo", name: "Kab. Ponorogo" },
  { id: "kab-pacitan", name: "Kab. Pacitan" },
  { id: "kab-bojonegoro", name: "Kab. Bojonegoro" },
  { id: "kab-tuban", name: "Kab. Tuban" },
  { id: "kab-pasuruan", name: "Kab. Pasuruan" },
  { id: "kota-pasuruan", name: "Kota Pasuruan" },
  { id: "kab-probolinggo", name: "Kab. Probolinggo" },
  { id: "kota-probolinggo", name: "Kota Probolinggo" },
  { id: "kab-lumajang", name: "Kab. Lumajang" },
  { id: "kab-jember", name: "Kab. Jember" },
  { id: "kab-bondowoso", name: "Kab. Bondowoso" },
  { id: "kab-situbondo", name: "Kab. Situbondo" },
  { id: "kab-banyuwangi", name: "Kab. Banyuwangi" },
  { id: "kab-bangkalan", name: "Kab. Bangkalan" },
  { id: "kab-sampang", name: "Kab. Sampang" },
  { id: "kab-pamekasan", name: "Kab. Pamekasan" },
  { id: "kab-sumenep", name: "Kab. Sumenep" },
];

// Mock data for regional mapping with member counts
const initialRegionals: Regional[] = [
  {
    id: "malang-raya",
    name: "MPJ Malang Raya",
    cities: ["kota-malang", "kab-malang", "kota-batu"],
    memberCount: 45,
  },
  {
    id: "tapal-kuda",
    name: "MPJ Tapal Kuda",
    cities: ["kab-banyuwangi", "kab-situbondo", "kab-bondowoso", "kab-jember"],
    memberCount: 32,
  },
  {
    id: "surabaya-raya",
    name: "MPJ Surabaya Raya",
    cities: ["kota-surabaya", "kab-sidoarjo", "kab-gresik"],
    memberCount: 67,
  },
  {
    id: "kediri-raya",
    name: "MPJ Kediri Raya",
    cities: ["kab-kediri", "kota-kediri", "kab-nganjuk"],
    memberCount: 28,
  },
  {
    id: "madura-raya",
    name: "MPJ Madura Raya",
    cities: ["kab-bangkalan", "kab-sampang", "kab-pamekasan", "kab-sumenep"],
    memberCount: 0, // Can be deleted
  },
  {
    id: "jombang-raya",
    name: "MPJ Jombang Raya",
    cities: ["kab-jombang", "kab-mojokerto", "kota-mojokerto"],
    memberCount: 19,
  },
  {
    id: "madiun-raya",
    name: "MPJ Madiun Raya",
    cities: ["kab-madiun", "kota-madiun", "kab-magetan", "kab-ngawi", "kab-ponorogo"],
    memberCount: 41,
  },
  {
    id: "blitar-raya",
    name: "MPJ Blitar Raya",
    cities: ["kab-blitar", "kota-blitar", "kab-tulungagung", "kab-trenggalek"],
    memberCount: 0, // Can be deleted
  },
  {
    id: "pasuruan-raya",
    name: "MPJ Pasuruan-Probolinggo",
    cities: ["kab-pasuruan", "kota-pasuruan", "kab-probolinggo", "kota-probolinggo", "kab-lumajang"],
    memberCount: 38,
  },
];

const MappingArea = () => {
  const [regionals, setRegionals] = useState<Regional[]>(initialRegionals);
  const [selectedRegional, setSelectedRegional] = useState<Regional | null>(regionals[0] || null);
  const [selectedCities, setSelectedCities] = useState<string[]>(regionals[0]?.cities || []);
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCannotDeleteDialog, setShowCannotDeleteDialog] = useState(false);
  const [newRegionalName, setNewRegionalName] = useState("");
  const [regionalToDelete, setRegionalToDelete] = useState<Regional | null>(null);

  const handleRegionalSelect = (regional: Regional) => {
    setSelectedRegional(regional);
    setSelectedCities(regional.cities);
  };

  const handleCityToggle = (cityId: string) => {
    setSelectedCities((prev) =>
      prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId]
    );
  };

  const handleSave = () => {
    if (!selectedRegional) return;

    setRegionals((prev) =>
      prev.map((r) =>
        r.id === selectedRegional.id ? { ...r, cities: selectedCities } : r
      )
    );

    toast.success("Cakupan wilayah berhasil diperbarui!", {
      description: `${selectedRegional.name} sekarang mencakup ${selectedCities.length} kota/kabupaten.`,
    });
  };

  const handleAddRegional = () => {
    if (!newRegionalName.trim()) {
      toast.error("Nama regional tidak boleh kosong");
      return;
    }

    const newId = newRegionalName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    // Check for duplicate
    if (regionals.some(r => r.id === newId || r.name.toLowerCase() === newRegionalName.toLowerCase())) {
      toast.error("Regional dengan nama tersebut sudah ada");
      return;
    }

    const newRegional: Regional = {
      id: newId,
      name: newRegionalName.startsWith("MPJ ") ? newRegionalName : `MPJ ${newRegionalName}`,
      cities: [],
      memberCount: 0,
    };

    setRegionals((prev) => [...prev, newRegional]);
    setSelectedRegional(newRegional);
    setSelectedCities([]);
    setShowAddDialog(false);
    setNewRegionalName("");

    toast.success("Regional baru berhasil ditambahkan!", {
      description: `${newRegional.name} telah dibuat. Silakan tentukan cakupan wilayahnya.`,
    });
  };

  const handleDeleteClick = (regional: Regional, e: React.MouseEvent) => {
    e.stopPropagation();
    setRegionalToDelete(regional);
    
    if (regional.memberCount && regional.memberCount > 0) {
      setShowCannotDeleteDialog(true);
    } else {
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = () => {
    if (!regionalToDelete) return;

    setRegionals((prev) => prev.filter((r) => r.id !== regionalToDelete.id));
    
    if (selectedRegional?.id === regionalToDelete.id) {
      const remaining = regionals.filter((r) => r.id !== regionalToDelete.id);
      setSelectedRegional(remaining[0] || null);
      setSelectedCities(remaining[0]?.cities || []);
    }

    toast.success("Regional berhasil dihapus", {
      description: `${regionalToDelete.name} telah dihapus dari sistem.`,
    });

    setShowDeleteDialog(false);
    setRegionalToDelete(null);
  };

  // Check if city is assigned to another regional
  const isCityAssignedElsewhere = (cityId: string) => {
    if (!selectedRegional) return false;
    return regionals.some(
      (r) => r.id !== selectedRegional.id && r.cities.includes(cityId)
    );
  };

  const getAssignedRegional = (cityId: string) => {
    const regional = regionals.find(
      (r) => r.id !== selectedRegional?.id && r.cities.includes(cityId)
    );
    return regional?.name || null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mapping Area Regional</h1>
          <p className="text-slate-500">
            Tentukan kota/kabupaten yang menjadi cakupan setiap koordinator regional
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Regional
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Regional List */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Daftar Regional ({regionals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {regionals.map((regional) => (
                <div
                  key={regional.id}
                  className={cn(
                    "w-full text-left px-4 py-3 transition-colors flex items-center justify-between group cursor-pointer",
                    selectedRegional?.id === regional.id
                      ? "bg-emerald-50 border-l-4 border-emerald-600"
                      : "hover:bg-slate-50"
                  )}
                  onClick={() => handleRegionalSelect(regional)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800">{regional.name}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span>{regional.cities.length} kota/kabupaten</span>
                      {regional.memberCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {regional.memberCount} anggota
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                      regional.memberCount && regional.memberCount > 0
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-red-500 hover:text-red-700 hover:bg-red-50"
                    )}
                    onClick={(e) => handleDeleteClick(regional, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - City Checklist */}
        <Card className="bg-white border-0 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-slate-800">
                {selectedRegional
                  ? `Cakupan Wilayah: ${selectedRegional.name}`
                  : "Pilih Regional"}
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Centang kota/kabupaten yang termasuk dalam cakupan regional ini
              </p>
            </div>
            {selectedRegional && (
              <Button
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Save className="h-4 w-4" />
                Update Cakupan Wilayah
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {selectedRegional ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allCities.map((city) => {
                  const isChecked = selectedCities.includes(city.id);
                  const assignedElsewhere = isCityAssignedElsewhere(city.id);
                  const assignedTo = getAssignedRegional(city.id);

                  return (
                    <div
                      key={city.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        isChecked
                          ? "bg-emerald-50 border-emerald-200"
                          : assignedElsewhere
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : "bg-white border-slate-200 hover:border-emerald-300"
                      )}
                    >
                      <Checkbox
                        id={city.id}
                        checked={isChecked}
                        onCheckedChange={() => handleCityToggle(city.id)}
                        disabled={assignedElsewhere && !isChecked}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={city.id}
                          className={cn(
                            "text-sm font-medium cursor-pointer",
                            isChecked ? "text-emerald-700" : "text-slate-700"
                          )}
                        >
                          {city.name}
                        </label>
                        {assignedElsewhere && (
                          <p className="text-xs text-slate-500 truncate">
                            → {assignedTo}
                          </p>
                        )}
                      </div>
                      {isChecked && (
                        <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Pilih regional dari daftar di sebelah kiri untuk mengelola cakupan wilayahnya
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Informasi Penting</p>
              <p className="text-sm text-amber-700">
                Mapping area ini digunakan untuk menentukan regional mana yang bertanggung jawab 
                memvalidasi pendaftaran pesantren. Ketika user memilih kota/kabupaten saat pendaftaran, 
                sistem akan otomatis mengarahkan data ke regional yang sesuai.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Regional Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Tambah Regional Baru</DialogTitle>
            <DialogDescription>
              Buat entitas regional baru untuk mengelola cakupan wilayah pesantren.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="regional-name">Nama Regional</Label>
              <Input
                id="regional-name"
                placeholder="Contoh: Pacitan Raya"
                value={newRegionalName}
                onChange={(e) => setNewRegionalName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRegional()}
              />
              <p className="text-xs text-slate-500">
                Prefix "MPJ" akan ditambahkan secara otomatis jika belum ada
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleAddRegional}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Regional
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Regional?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus <strong>{regionalToDelete?.name}</strong>? 
              Tindakan ini tidak dapat dibatalkan. Semua data mapping wilayah akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Regional
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cannot Delete Dialog (Has Active Members) */}
      <AlertDialog open={showCannotDeleteDialog} onOpenChange={setShowCannotDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Tidak Dapat Menghapus Regional
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Regional <strong>{regionalToDelete?.name}</strong> tidak dapat dihapus karena 
                masih memiliki <strong>{regionalToDelete?.memberCount} anggota aktif</strong>.
              </p>
              <p>
                Untuk menghapus regional ini, pastikan semua anggota telah dipindahkan 
                ke regional lain atau dinonaktifkan terlebih dahulu.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-slate-600 hover:bg-slate-700 text-white">
              Mengerti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MappingArea;
