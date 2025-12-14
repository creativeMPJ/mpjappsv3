import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Search, ArrowRight, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data pesantren terdaftar
const registeredPesantren = [
  { id: 1, name: "Darul Ulum Jombang", region: "Jombang" },
  { id: 2, name: "Darul Ulum Peterongan", region: "Jombang" },
  { id: 3, name: "Tebuireng Jombang", region: "Jombang" },
  { id: 4, name: "Lirboyo Kediri", region: "Kediri" },
  { id: 5, name: "Sidogiri Pasuruan", region: "Pasuruan" },
  { id: 6, name: "PeTIK Jombang", region: "Jombang" },
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

  const handleNext = () => {
    if (selectedPesantren) {
      // Pesantren ditemukan -> redirect ke Claim Account dengan data
      navigate("/claim-account", { 
        state: { 
          pesantrenId: selectedPesantren.id,
          pesantrenName: selectedPesantren.name,
          fromSearch: true 
        } 
      });
    } else if (searchQuery.trim()) {
      // Tidak ditemukan -> redirect ke form pengajuan baru
      navigate("/institution-submission", { 
        state: { searchedName: searchQuery } 
      });
    }
  };

  const handleNewSubmission = () => {
    navigate("/institution-submission");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm mb-2">Jadi bagian dari MPJ</p>
          <button
            onClick={handleNewSubmission}
            className="text-[#166534] font-semibold text-base flex items-center justify-center gap-1 mx-auto hover:underline"
          >
            <Plus className="w-4 h-4" />
            Ajukan Pesantren Baru
          </button>
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
            {showDropdown && filteredPesantren.length > 0 && (
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
                    {selectedPesantren?.id === pesantren.id && (
                      <span className="text-[#166534] text-sm font-medium">Terpilih</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {showDropdown && searchQuery.length > 0 && filteredPesantren.length === 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <p className="text-gray-500 text-center text-sm">
                  Pesantren tidak ditemukan
                </p>
                <button
                  onClick={handleNewSubmission}
                  className="w-full mt-2 text-[#166534] font-medium text-sm hover:underline"
                >
                  + Ajukan sebagai Pesantren Baru
                </button>
              </div>
            )}
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            disabled={!searchQuery.trim()}
            className="w-full h-12 bg-gradient-to-r from-[#166534] to-[#22c55e] hover:from-[#14532d] hover:to-[#16a34a] text-white font-semibold text-base rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selanjutnya
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
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
