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
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
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
        description: "Mohon lengkapi semua kolom",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeTerms) {
      toast({
        title: "Syarat & Ketentuan",
        description: "Anda harus menyetujui syarat & ketentuan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const registrationData = {
      ...formData,
      id: Date.now(),
      origin_source: "register",
      status: "pending_otp",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("mpj_pending_registration", JSON.stringify(registrationData));

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Tersimpan!",
        description: "Silakan verifikasi OTP",
      });
      navigate("/verify-otp", { state: { type: "register", email: formData.email } });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
      {/* Header */}
      <div className="flex-shrink-0 pt-6 pb-3 px-4">
        <Link to="/login" className="inline-flex items-center text-emerald-200/80 text-sm mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Link>
        <div className="flex items-center gap-3">
          <img src={logoMpj} alt="MPJ" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-white">Daftar Baru</h1>
            <p className="text-xs text-emerald-200/70">Bergabung dengan MPJ</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-card rounded-t-3xl px-5 pt-5 pb-8 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="namaPesantren" className="text-sm">Nama Pesantren *</Label>
            <Input
              id="namaPesantren"
              placeholder="Masukkan nama pesantren"
              value={formData.namaPesantren}
              onChange={(e) => setFormData({ ...formData, namaPesantren: e.target.value })}
              className="h-11 rounded-xl border-border/50 bg-muted/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="namaPengasuh" className="text-sm">Nama Pengasuh *</Label>
            <Input
              id="namaPengasuh"
              placeholder="Masukkan nama pengasuh"
              value={formData.namaPengasuh}
              onChange={(e) => setFormData({ ...formData, namaPengasuh: e.target.value })}
              className="h-11 rounded-xl border-border/50 bg-muted/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="namaMedia" className="text-sm">Nama Media *</Label>
            <Input
              id="namaMedia"
              placeholder="Nama media pesantren"
              value={formData.namaMedia}
              onChange={(e) => setFormData({ ...formData, namaMedia: e.target.value })}
              className="h-11 rounded-xl border-border/50 bg-muted/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11 rounded-xl border-border/50 bg-muted/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">No. HP *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08xxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11 rounded-xl border-border/50 bg-muted/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Kabupaten / Kota *</Label>
            <Select value={formData.city} onValueChange={handleCityChange}>
              <SelectTrigger className="h-11 rounded-xl border-border/50 bg-muted/30">
                <SelectValue placeholder="Pilih lokasi" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-60 z-50">
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.regional && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {formData.regionalCode}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Regional (Auto)</p>
                <p className="text-sm font-medium text-foreground">{formData.regional}</p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Buat password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 rounded-xl border-border/50 pr-12 bg-muted/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-1">
            <Checkbox 
              id="terms" 
              className="mt-0.5" 
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
            />
            <label htmlFor="terms" className="text-sm text-foreground leading-tight">
              Saya setuju dengan{" "}
              <Link to="/terms" className="text-amber-500">syarat & ketentuan</Link>
            </label>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
          >
            {isLoading ? "Memproses..." : "Daftar & Verifikasi OTP"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <div className="mt-5 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-emerald-500 font-semibold">
              Masuk
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Khodim lama?{" "}
            <Link to="/claim-account" className="text-amber-500 font-semibold">
              Klaim Akun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;