import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ChevronDown, MapPin } from "lucide-react";
import logoMpj from "@/assets/logo-mpj.png";

// Data Kabupaten/Kota Jawa Timur dengan Regional
const regionalData = {
  "01": { name: "MALANG RAYA", cities: ["Kota Malang", "Kabupaten Malang", "Kota Batu"] },
  "02": { name: "BLITAR RAYA", cities: ["Kota Blitar", "Kabupaten Blitar"] },
  "03": { name: "TULUNGGALEK", cities: ["Kabupaten Tulungagung", "Kabupaten Trenggalek"] },
  "04": { name: "PLAT AE", cities: ["Kota Madiun", "Kabupaten Madiun", "Kabupaten Magetan", "Kabupaten Ngawi", "Kabupaten Ponorogo", "Kabupaten Pacitan"] },
  "05": { name: "BANYUWANGI", cities: ["Kabupaten Banyuwangi"] },
  "06": { name: "OJOLAMBAN", cities: ["Kabupaten Bojonegoro", "Kabupaten Lamongan", "Kabupaten Tuban"] },
  "07": { name: "KEDIRI RAYA", cities: ["Kota Kediri", "Kabupaten Kediri"] },
  "08": { name: "JOMBANG", cities: ["Kabupaten Jombang"] },
  "09": { name: "MOJOKERTO", cities: ["Kota Mojokerto", "Kabupaten Mojokerto"] },
  "10": { name: "DAPIL IV", cities: ["Kabupaten Jember", "Kabupaten Lumajang"] },
  "11": { name: "NGANJUK", cities: ["Kabupaten Nganjuk"] },
  "12": { name: "MADURA RAYA", cities: ["Kabupaten Bangkalan", "Kabupaten Sampang", "Kabupaten Pamekasan", "Kabupaten Sumenep"] },
  "13": { name: "PROBOLINGGO RAYA", cities: ["Kota Probolinggo", "Kabupaten Probolinggo", "Kabupaten Situbondo", "Kabupaten Bondowoso"] },
  "14": { name: "SURABAYA-GRESIK", cities: ["Kota Surabaya", "Kabupaten Gresik"] },
  "15": { name: "SIDOPAS", cities: ["Kabupaten Sidoarjo", "Kota Pasuruan", "Kabupaten Pasuruan"] },
};

// Flatten cities with their regional info
const allCities = Object.entries(regionalData).flatMap(([code, data]) =>
  data.cities.map(city => ({ city, regionalCode: code, regionalName: data.name }))
).sort((a, b) => a.city.localeCompare(b.city));

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<typeof allCities[0] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCities = useMemo(() => {
    if (!citySearch) return allCities;
    return allCities.filter(item => 
      item.city.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [citySearch]);

  const handleCitySelect = (cityData: typeof allCities[0]) => {
    setSelectedCity(cityData);
    setCitySearch(cityData.city);
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/20 via-background to-accent/5 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card rounded-3xl shadow-soft p-8 border border-border/50">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logoMpj} alt="Media Pondok Jawa Timur" className="h-14 object-contain" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Daftar Anggota Baru 🚀
            </h1>
            <p className="text-muted-foreground text-sm">
              Bergabung dengan komunitas Media Pondok Jawa Timur
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4">
            {/* Nama Pesantren */}
            <div className="space-y-2">
              <Label htmlFor="pesantren" className="text-foreground">Nama Pesantren</Label>
              <Input
                id="pesantren"
                type="text"
                placeholder="Masukkan nama pesantren"
                className="h-12 rounded-xl border-border/50 focus:border-primary"
              />
            </div>

            {/* Nama Pengasuh */}
            <div className="space-y-2">
              <Label htmlFor="pengasuh" className="text-foreground">Nama Pengasuh</Label>
              <Input
                id="pengasuh"
                type="text"
                placeholder="Masukkan nama pengasuh"
                className="h-12 rounded-xl border-border/50 focus:border-primary"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                className="h-12 rounded-xl border-border/50 focus:border-primary"
              />
            </div>

            {/* No HP / WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">No. HP / WhatsApp Aktif</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-4 h-12 rounded-xl border border-border/50 bg-muted/30">
                  <span className="text-sm font-medium text-foreground">+62</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="8123456789"
                  className="h-12 rounded-xl border-border/50 focus:border-primary flex-1"
                />
              </div>
            </div>

            {/* Kabupaten/Kota Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-foreground">Kabupaten / Kota</Label>
              <div className="relative">
                <div className="relative">
                  <Input
                    id="city"
                    type="text"
                    placeholder="Ketik atau pilih kabupaten/kota"
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setShowDropdown(true);
                      if (!e.target.value) setSelectedCity(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="h-12 rounded-xl border-border/50 focus:border-primary pr-10"
                  />
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-card border border-border/50 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleCitySelect(item)}
                          className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center justify-between border-b border-border/20 last:border-b-0"
                        >
                          <span className="text-foreground">{item.city}</span>
                          <span className="text-xs text-muted-foreground">{item.regionalName}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-muted-foreground text-sm">
                        Tidak ditemukan
                      </div>
                    )}
                  </div>
                )}

                {/* Regional Notification */}
                {selectedCity && (
                  <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        Regional {selectedCity.regionalCode}
                      </span>
                      <span className="text-sm text-primary font-semibold">
                        {selectedCity.regionalName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat password yang kuat"
                  className="h-12 rounded-xl border-border/50 focus:border-primary pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox id="terms" className="mt-1" />
              <label htmlFor="terms" className="text-sm text-foreground cursor-pointer leading-relaxed">
                Saya setuju dengan{" "}
                <Link to="/privacy-policy" className="text-accent hover:text-accent/80">
                  kebijakan privasi
                </Link>
                {" "}dan{" "}
                <Link to="/terms" className="text-accent hover:text-accent/80">
                  syarat & ketentuan
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-glow">
              Daftar Sekarang
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default Register;
