import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Search, Info, Plus, MapPin, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Mock data pesantren terdaftar
const registeredPesantren = [
  { id: 1, name: "Darul Ulum Jombang", region: "Jombang", alamat: "Jl. Raya Peterongan, Jombang" },
  { id: 2, name: "Darul Ulum Peterongan", region: "Jombang", alamat: "Jl. Peterongan No. 10, Jombang" },
  { id: 3, name: "Tebuireng Jombang", region: "Jombang", alamat: "Jl. Irian Jaya No. 10, Jombang" },
  { id: 4, name: "Lirboyo Kediri", region: "Kediri", alamat: "Jl. KH. Abdul Karim, Kediri" },
  { id: 5, name: "Sidogiri Pasuruan", region: "Pasuruan", alamat: "Jl. Sidogiri, Pasuruan" },
  { id: 6, name: "PeTIK Jombang", region: "Jombang", alamat: "Jl. Raya Diwek, Jombang" },
];

const CheckInstitution = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPesantren, setSelectedPesantren] = useState<typeof registeredPesantren[0] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredPesantren = registeredPesantren.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPesantren = (pesantren: typeof registeredPesantren[0]) => {
    setSelectedPesantren(pesantren);
    setSearchQuery(pesantren.name);
    setShowDropdown(false);
  };

  const handleClaimAccount = () => {
    if (selectedPesantren) {
      navigate("/claim-account", { 
        state: { 
          pesantrenId: selectedPesantren.id,
          pesantrenName: selectedPesantren.name,
          fromSearch: true 
        } 
      });
    }
  };

  const handleNewSubmission = () => {
    navigate("/institution-submission", { 
      state: { searchedName: searchQuery.trim() } 
    });
  };

  const showNotFoundState = searchQuery.length > 0 && filteredPesantren.length === 0;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Cari Pesantren</h1>
          <p className="text-gray-500 text-sm">Jadi bagian dari MPJ</p>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Label */}
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <Building2 className="w-5 h-5" />
            <span>Pilih Pesantren</span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari nama pesantren..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedPesantren(null);
                  setShowDropdown(e.target.value.length > 0);
                }}
                onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
                className="pl-10 h-12 text-base border-gray-200 focus:border-[#166534] focus:ring-[#166534]"
              />
            </div>

            {/* Dropdown Results */}
            {showDropdown && filteredPesantren.length > 0 && !selectedPesantren && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredPesantren.map((pesantren) => (
                  <button
                    key={pesantren.id}
                    onClick={() => handleSelectPesantren(pesantren)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{pesantren.name}</p>
                      <p className="text-sm text-gray-500">{pesantren.region}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Pesantren Card - FOUND STATE */}
          {selectedPesantren && (
            <Card className="border-[#166534]/30 bg-[#166534]/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#166534]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-[#166534]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedPesantren.name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedPesantren.alamat}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleClaimAccount}
                  className="w-full h-11 bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold rounded-xl"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Klaim Akun Ini
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Not Found State */}
          {showNotFoundState && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">Pesantren tidak ditemukan</p>
              <p className="text-gray-500 text-sm mb-4">"{searchQuery}" belum terdaftar di sistem</p>
              <Button
                onClick={handleNewSubmission}
                className="w-full h-12 bg-[#166534] hover:bg-[#14532d] text-white font-semibold rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajukan Pesantren & Buat Akun
              </Button>
            </div>
          )}

          {/* Quick Add Link */}
          {!selectedPesantren && !showNotFoundState && (
            <button
              onClick={handleNewSubmission}
              className="w-full text-[#166534] font-semibold text-sm flex items-center justify-center gap-1 py-2 hover:underline"
            >
              <Plus className="w-4 h-4" />
              Ajukan Pesantren Baru
            </button>
          )}
        </div>

        {/* Warning Box */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
          <div className="flex-shrink-0">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
          </div>
          <div>
            <p className="text-amber-800 text-sm leading-relaxed">
              <span className="font-semibold">Catatan:</span> Sebelum mengajukan pesantren baru, pastikan untuk memeriksa daftar terlebih dahulu. Ajukan hanya jika pesantren Anda benar-benar belum terdaftar.
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Sudah punya akun?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#166534] font-semibold hover:underline"
            >
              Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckInstitution;
