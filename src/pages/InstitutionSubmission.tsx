import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Building2, User, MapPin, Mail, CheckCircle, Phone, Lock, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Daftar Kota/Kabupaten Jawa Timur
const kotaKabupaten = [
  "Surabaya", "Malang", "Sidoarjo", "Gresik", "Mojokerto", "Pasuruan",
  "Probolinggo", "Lumajang", "Jember", "Banyuwangi", "Bondowoso",
  "Situbondo", "Kediri", "Blitar", "Tulungagung", "Trenggalek",
  "Nganjuk", "Madiun", "Magetan", "Ngawi", "Ponorogo", "Pacitan",
  "Bojonegoro", "Tuban", "Lamongan", "Jombang", "Bangkalan",
  "Sampang", "Pamekasan", "Sumenep"
];

const InstitutionSubmission = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const searchedName = location.state?.searchedName || "";

  // Section A: Data Pesantren
  const [pesantrenData, setPesantrenData] = useState({
    namaPesantren: searchedName,
    namaPengasuh: "",
    alamatLengkap: "",
    kotaKabupaten: "",
    emailResmi: "",
  });

  // Section B: Data Koordinator
  const [koordinatorData, setKoordinatorData] = useState({
    namaLengkap: "",
    noWhatsapp: "",
    password: "",
    konfirmasiPassword: "",
  });

  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePesantrenChange = (field: string, value: string) => {
    setPesantrenData((prev) => ({ ...prev, [field]: value }));
  };

  const handleKoordinatorChange = (field: string, value: string) => {
    setKoordinatorData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBuktiFile(e.target.files[0]);
    }
  };

  const isFormValid = () => {
    const pesantrenValid = 
      pesantrenData.namaPesantren.trim() &&
      pesantrenData.namaPengasuh.trim() &&
      pesantrenData.alamatLengkap.trim() &&
      pesantrenData.kotaKabupaten &&
      pesantrenData.emailResmi.trim() &&
      pesantrenData.emailResmi.includes("@");

    const koordinatorValid =
      koordinatorData.namaLengkap.trim() &&
      koordinatorData.noWhatsapp.trim() &&
      koordinatorData.noWhatsapp.length >= 10 &&
      koordinatorData.password.length >= 6 &&
      koordinatorData.password === koordinatorData.konfirmasiPassword;

    return pesantrenValid && koordinatorValid;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Store submission data (simulating database insert)
    const submissionData = {
      pesantren: {
        ...pesantrenData,
        status: "pending_approval",
        createdAt: new Date().toISOString(),
      },
      koordinator: {
        namaLengkap: koordinatorData.namaLengkap,
        noWhatsapp: koordinatorData.noWhatsapp,
        role: "coordinator",
        origin_source: "register",
        status: "pending_approval",
        createdAt: new Date().toISOString(),
      },
      buktiFile: buktiFile?.name || null,
    };
    
    localStorage.setItem("mpj_registration", JSON.stringify(submissionData));

    setIsSubmitting(false);
    setIsSuccess(true);

    toast({
      title: "Pendaftaran Berhasil!",
      description: "Admin akan memverifikasi data Anda.",
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-[#166534]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#166534]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Terima Kasih!
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Data Anda telah diterima. Admin kami akan memverifikasi data Pesantren Anda <span className="font-semibold">1x24 jam</span>. Silakan tunggu notifikasi WhatsApp untuk login.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            <div>
              <p className="text-xs text-gray-500">Pesantren:</p>
              <p className="font-medium text-gray-900">{pesantrenData.namaPesantren}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Koordinator:</p>
              <p className="font-medium text-gray-900">{koordinatorData.namaLengkap}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">WhatsApp:</p>
              <p className="font-medium text-gray-900">{koordinatorData.noWhatsapp}</p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full h-12 border-[#166534] text-[#166534] hover:bg-[#166534] hover:text-white rounded-xl"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-6 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/check-institution")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Buat Akun Koordinator Baru</h1>
          <p className="text-gray-500 text-sm">Lengkapi data pesantren dan akun Anda</p>
        </div>

        {/* SECTION A: Data Pesantren */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-[#166534] text-white rounded-full flex items-center justify-center text-xs font-bold">A</div>
            <h2 className="font-semibold text-gray-900">Data Pesantren</h2>
          </div>
          
          <div className="space-y-4 bg-gray-50 rounded-xl p-4">
            {/* Nama Pesantren */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building2 className="w-4 h-4" />
                Nama Pesantren
              </label>
              <Input
                type="text"
                placeholder="Masukkan nama pesantren"
                value={pesantrenData.namaPesantren}
                onChange={(e) => handlePesantrenChange("namaPesantren", e.target.value)}
                className="h-11 border-gray-200 bg-white focus:border-[#166534] focus:ring-[#166534]"
              />
            </div>

            {/* Nama Pengasuh */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                Nama Pengasuh
              </label>
              <Input
                type="text"
                placeholder="Masukkan nama pengasuh"
                value={pesantrenData.namaPengasuh}
                onChange={(e) => handlePesantrenChange("namaPengasuh", e.target.value)}
                className="h-11 border-gray-200 bg-white focus:border-[#166534] focus:ring-[#166534]"
              />
            </div>

            {/* Alamat Lengkap */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4" />
                Alamat Lengkap
              </label>
              <Textarea
                placeholder="Masukkan alamat lengkap pesantren"
                value={pesantrenData.alamatLengkap}
                onChange={(e) => handlePesantrenChange("alamatLengkap", e.target.value)}
                className="min-h-[80px] border-gray-200 bg-white focus:border-[#166534] focus:ring-[#166534] resize-none"
              />
            </div>

            {/* Kota/Kabupaten */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4" />
                Kota/Kabupaten
              </label>
              <Select
                value={pesantrenData.kotaKabupaten}
                onValueChange={(value) => handlePesantrenChange("kotaKabupaten", value)}
              >
                <SelectTrigger className="h-11 border-gray-200 bg-white focus:border-[#166534] focus:ring-[#166534]">
                  <SelectValue placeholder="Pilih kota/kabupaten" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50 max-h-60">
                  {kotaKabupaten.map((kota) => (
                    <SelectItem key={kota} value={kota}>
                      {kota}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email Resmi */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4" />
                Email Resmi Pesantren
              </label>
              <Input
                type="email"
                placeholder="contoh@pesantren.id"
                value={pesantrenData.emailResmi}
                onChange={(e) => handlePesantrenChange("emailResmi", e.target.value)}
                className="h-11 border-gray-200 bg-white focus:border-[#166534] focus:ring-[#166534]"
              />
            </div>

            {/* Upload Bukti */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Upload className="w-4 h-4" />
                Upload Bukti/Foto
                <span className="text-gray-400 text-xs">(Opsional)</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="bukti-upload"
                />
                <label
                  htmlFor="bukti-upload"
                  className="flex items-center justify-center h-11 w-full border border-dashed border-gray-300 rounded-lg bg-white cursor-pointer hover:border-[#166534] transition-colors"
                >
                  {buktiFile ? (
                    <span className="text-sm text-gray-700 truncate px-2">{buktiFile.name}</span>
                  ) : (
                    <span className="text-sm text-gray-500">Pilih file...</span>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: Data Koordinator */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-[#f59e0b] text-white rounded-full flex items-center justify-center text-xs font-bold">B</div>
            <h2 className="font-semibold text-gray-900">Data Koordinator (Akun Anda)</h2>
          </div>
          
          <div className="space-y-4 bg-amber-50 rounded-xl p-4">
            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                Nama Lengkap Anda
              </label>
              <Input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={koordinatorData.namaLengkap}
                onChange={(e) => handleKoordinatorChange("namaLengkap", e.target.value)}
                className="h-11 border-gray-200 bg-white focus:border-[#f59e0b] focus:ring-[#f59e0b]"
              />
            </div>

            {/* No WhatsApp */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4" />
                No. WhatsApp
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={koordinatorData.noWhatsapp}
                onChange={(e) => handleKoordinatorChange("noWhatsapp", e.target.value.replace(/\D/g, ''))}
                className="h-11 border-gray-200 bg-white focus:border-[#f59e0b] focus:ring-[#f59e0b]"
              />
              <p className="text-xs text-gray-500">Nomor ini akan digunakan untuk login</p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4" />
                Buat Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={koordinatorData.password}
                  onChange={(e) => handleKoordinatorChange("password", e.target.value)}
                  className="h-11 border-gray-200 bg-white focus:border-[#f59e0b] focus:ring-[#f59e0b] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4" />
                Konfirmasi Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={koordinatorData.konfirmasiPassword}
                  onChange={(e) => handleKoordinatorChange("konfirmasiPassword", e.target.value)}
                  className="h-11 border-gray-200 bg-white focus:border-[#f59e0b] focus:ring-[#f59e0b] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {koordinatorData.konfirmasiPassword && koordinatorData.password !== koordinatorData.konfirmasiPassword && (
                <p className="text-xs text-red-500">Password tidak cocok</p>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 text-center mb-4 px-2">
          Dengan mendaftar, akun Anda akan masuk antrian verifikasi Admin sebelum bisa digunakan.
        </p>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
          className="w-full h-12 bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-base rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Mendaftar...
            </span>
          ) : (
            "Daftar Sekarang"
          )}
        </Button>
      </div>
    </div>
  );
};

export default InstitutionSubmission;
