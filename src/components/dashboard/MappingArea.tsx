import { useState } from "react";
import { MapPin, Check, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Regional {
  id: string;
  name: string;
  cities: string[];
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

// Mock data for regional mapping
const initialRegionals: Regional[] = [
  {
    id: "malang-raya",
    name: "MPJ Malang Raya",
    cities: ["kota-malang", "kab-malang", "kota-batu"],
  },
  {
    id: "tapal-kuda",
    name: "MPJ Tapal Kuda",
    cities: ["kab-banyuwangi", "kab-situbondo", "kab-bondowoso", "kab-jember"],
  },
  {
    id: "surabaya-raya",
    name: "MPJ Surabaya Raya",
    cities: ["kota-surabaya", "kab-sidoarjo", "kab-gresik"],
  },
  {
    id: "kediri-raya",
    name: "MPJ Kediri Raya",
    cities: ["kab-kediri", "kota-kediri", "kab-nganjuk"],
  },
  {
    id: "madura-raya",
    name: "MPJ Madura Raya",
    cities: ["kab-bangkalan", "kab-sampang", "kab-pamekasan", "kab-sumenep"],
  },
  {
    id: "jombang-raya",
    name: "MPJ Jombang Raya",
    cities: ["kab-jombang", "kab-mojokerto", "kota-mojokerto"],
  },
  {
    id: "madiun-raya",
    name: "MPJ Madiun Raya",
    cities: ["kab-madiun", "kota-madiun", "kab-magetan", "kab-ngawi", "kab-ponorogo"],
  },
  {
    id: "blitar-raya",
    name: "MPJ Blitar Raya",
    cities: ["kab-blitar", "kota-blitar", "kab-tulungagung", "kab-trenggalek"],
  },
  {
    id: "pasuruan-raya",
    name: "MPJ Pasuruan-Probolinggo",
    cities: ["kab-pasuruan", "kota-pasuruan", "kab-probolinggo", "kota-probolinggo", "kab-lumajang"],
  },
];

const MappingArea = () => {
  const [regionals, setRegionals] = useState<Regional[]>(initialRegionals);
  const [selectedRegional, setSelectedRegional] = useState<Regional | null>(regionals[0] || null);
  const [selectedCities, setSelectedCities] = useState<string[]>(regionals[0]?.cities || []);

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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mapping Area Regional</h1>
        <p className="text-slate-500">
          Tentukan kota/kabupaten yang menjadi cakupan setiap koordinator regional
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Regional List */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Daftar Regional
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {regionals.map((regional) => (
                <button
                  key={regional.id}
                  onClick={() => handleRegionalSelect(regional)}
                  className={cn(
                    "w-full text-left px-4 py-3 transition-colors",
                    selectedRegional?.id === regional.id
                      ? "bg-emerald-50 border-l-4 border-emerald-600"
                      : "hover:bg-slate-50"
                  )}
                >
                  <p className="font-medium text-slate-800">{regional.name}</p>
                  <p className="text-sm text-slate-500">
                    {regional.cities.length} kota/kabupaten
                  </p>
                </button>
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
    </div>
  );
};

export default MappingArea;
