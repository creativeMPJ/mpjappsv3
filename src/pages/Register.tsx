import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, ArrowRight, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

// Regional data mapping
const regionalData: Record<string, { code: string; name: string }> = {
  "Kota Malang": { code: "01", name: "MALANG RAYA" },
  "Kabupaten Malang": { code: "01", name: "MALANG RAYA" },
  "Kota Batu": { code: "01", name: "MALANG RAYA" },
  "Kota Blitar": { code: "02", name: "BLITAR RAYA" },
  "Kabupaten Blitar": { code: "02", name: "BLITAR RAYA" },
  "Kabupaten Tulungagung": { code: "03", name: "TULUNGAGUNG-TRENGGALEK" },
  "Kabupaten Trenggalek": { code: "03", name: "TULUNGAGUNG-TRENGGALEK" },
  "Kota Madiun": { code: "04", name: "PLAT AE" },
  "Kabupaten Madiun": { code: "04", name: "PLAT AE" },
  "Kabupaten Magetan": { code: "04", name: "PLAT AE" },
  "Kabupaten Ngawi": { code: "04", name: "PLAT AE" },
  "Kabupaten Ponorogo": { code: "04", name: "PLAT AE" },
  "Kabupaten Pacitan": { code: "04", name: "PLAT AE" },
  "Kabupaten Banyuwangi": { code: "05", name: "BANYUWANGI" },
  "Kabupaten Bojonegoro": { code: "06", name: "OJOLAMBAN" },
  "Kabupaten Lamongan": { code: "06", name: "OJOLAMBAN" },
  "Kabupaten Tuban": { code: "06", name: "OJOLAMBAN" },
  "Kota Kediri": { code: "07", name: "KEDIRI RAYA" },
  "Kabupaten Kediri": { code: "07", name: "KEDIRI RAYA" },
  "Kabupaten Jombang": { code: "08", name: "JOMBANG" },
  "Kota Mojokerto": { code: "09", name: "MOJOKERTO" },
  "Kabupaten Mojokerto": { code: "09", name: "MOJOKERTO" },
  "Kabupaten Jember": { code: "10", name: "DAPIL IV" },
  "Kabupaten Lumajang": { code: "10", name: "DAPIL IV" },
  "Kabupaten Nganjuk": { code: "11", name: "NGANJUK" },
  "Kabupaten Bangkalan": { code: "12", name: "MADURA RAYA" },
  "Kabupaten Sampang": { code: "12", name: "MADURA RAYA" },
  "Kabupaten Pamekasan": { code: "12", name: "MADURA RAYA" },
  "Kabupaten Sumenep": { code: "12", name: "MADURA RAYA" },
  "Kota Probolinggo": { code: "13", name: "PROBOLINGGO RAYA" },
  "Kabupaten Probolinggo": { code: "13", name: "PROBOLINGGO RAYA" },
  "Kota Surabaya": { code: "14", name: "SURABAYA-GRESIK" },
  "Kabupaten Gresik": { code: "14", name: "SURABAYA-GRESIK" },
  "Kabupaten Sidoarjo": { code: "15", name: "SIDOPAS" },
  "Kota Pasuruan": { code: "15", name: "SIDOPAS" },
  "Kabupaten Pasuruan": { code: "15", name: "SIDOPAS" },
  "Kabupaten Situbondo": { code: "16", name: "SITUBONDO" },
  "Kabupaten Bondowoso": { code: "17", name: "BONDOWOSO" },
};

const cities = Object.keys(regionalData).sort();

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    namaPesantren: "",
    namaPengasuh: "",
    namaMedia: "",
    email: "",
    phone: "",
    city: "",
    regional: "",
    regionalCode: "",
    password: "",
    agreeTerms: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCityChange = (value: string) => {
    const regional = regionalData[value];
    setFormData({
      ...formData,
      city: value,
      regional: regional ? regional.name : "",
      regionalCode: regional ? regional.code : "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.namaPesantren || !formData.namaPengasuh || !formData.namaMedia ||
        !formData.email || !formData.phone || !formData.city || !formData.password) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi semua kolom yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeTerms) {
      toast({
        title: "Syarat & Ketentuan",
        description: "Anda harus menyetujui syarat & ketentuan untuk mendaftar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Save registration data with origin_source
    const registrationData = {
      ...formData,
      id: Date.now(),
      origin_source: "register",
      tagihan: 50000,
      status: "pending_otp",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("mpj_pending_registration", JSON.stringify(registrationData));

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Tersimpan! ✅",
        description: "Silakan verifikasi OTP untuk melanjutkan",
      });
      navigate("/verify-otp", { state: { type: "register", email: formData.email } });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-4 py-8">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/20">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={logoMpj} alt="Media Pondok Jawa Timur" className="h-14 object-contain" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Daftar Pesantren Baru 🕌
            </h1>
            <p className="text-muted-foreground text-sm">
              Bergabung dengan komunitas Media Pondok Jawa Timur
            </p>
          </div>

          {/* Pricing Info */}
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Tarif Registrasi: Rp 50.000</p>
              <p className="text-xs text-muted-foreground">Dapat 3 Slot User (1 Koordinator + 2 Kru)</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namaPesantren" className="text-foreground">Nama Pesantren *</Label>
              <Input
                id="namaPesantren"
                type="text"
                placeholder="Masukkan nama pesantren"
                value={formData.namaPesantren}
                onChange={(e) => setFormData({ ...formData, namaPesantren: e.target.value })}
                className="h-11 rounded-xl border-border/50 focus:border-primary bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="namaPengasuh" className="text-foreground">Nama Pengasuh *</Label>
              <Input
                id="namaPengasuh"
                type="text"
                placeholder="Masukkan nama pengasuh"
                value={formData.namaPengasuh}
                onChange={(e) => setFormData({ ...formData, namaPengasuh: e.target.value })}
                className="h-11 rounded-xl border-border/50 focus:border-primary bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="namaMedia" className="text-foreground">Nama Media *</Label>
              <Input
                id="namaMedia"
                type="text"
                placeholder="Nama media pesantren Anda"
                value={formData.namaMedia}
                onChange={(e) => setFormData({ ...formData, namaMedia: e.target.value })}
                className="h-11 rounded-xl border-border/50 focus:border-primary bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 rounded-xl border-border/50 focus:border-primary bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">No. HP *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 rounded-xl border-border/50 focus:border-primary bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-foreground">Kabupaten / Kota *</Label>
              <Select value={formData.city} onValueChange={handleCityChange}>
                <SelectTrigger className="h-11 rounded-xl border-border/50 focus:border-primary bg-background">
                  <SelectValue placeholder="Pilih Kabupaten/Kota" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60 z-50">
                  {cities.map((city) => (
                    <SelectItem key={city} value={city} className="cursor-pointer">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Regional (Auto)</Label>
              <div className="flex items-center gap-2">
                {formData.regionalCode && (
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-600 text-white font-bold">
                    {formData.regionalCode}
                  </div>
                )}
                <Input
                  value={formData.regional || "Otomatis berdasarkan kota"}
                  readOnly
                  disabled
                  className="h-11 rounded-xl border-border/50 bg-muted/50 flex-1 text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat password yang kuat"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 rounded-xl border-border/50 focus:border-primary pr-12 bg-background"
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

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox 
                id="terms" 
                className="mt-1" 
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
              />
              <label htmlFor="terms" className="text-sm text-foreground cursor-pointer leading-relaxed">
                Saya setuju dengan{" "}
                <Link to="/terms" className="text-amber-500 hover:text-amber-400">
                  syarat & ketentuan
                </Link>
              </label>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg"
            >
              {isLoading ? "Memproses..." : "Daftar & Verifikasi OTP"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
                Masuk di sini
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Khodim lama?{" "}
              <Link to="/claim-account" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
                Klaim Akun (Diskon Rp 20.000)
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
