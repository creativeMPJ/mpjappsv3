import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Building2, User, MapPin, Mail, CheckCircle } from "lucide-react";
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

  const [formData, setFormData] = useState({
    namaPesantren: searchedName,
    namaPengasuh: "",
    alamatLengkap: "",
    kotaKabupaten: "",
    emailResmi: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.namaPesantren.trim() &&
      formData.namaPengasuh.trim() &&
      formData.alamatLengkap.trim() &&
      formData.kotaKabupaten &&
      formData.emailResmi.trim() &&
      formData.emailResmi.includes("@")
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Store submission data
    const submissionData = {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: "pending",
      origin_source: "register" // New registration
    };
    
    localStorage.setItem("institution_submission", JSON.stringify(submissionData));

    setIsSubmitting(false);
    setIsSuccess(true);

    toast({
      title: "Pengajuan Terkirim!",
      description: "Silakan cek email Anda secara berkala.",
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#166534]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Pengajuan Terkirim!
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Silakan cek <span className="font-semibold">Email Resmi Pesantren</span> Anda secara berkala untuk Token Aktivasi.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Email tujuan:</p>
            <p className="font-medium text-gray-900">{formData.emailResmi}</p>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full h-12 border-[#166534] text-[#166534] hover:bg-[#166534] hover:text-white"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Akunmu!</h1>
          <p className="text-gray-500">Jadi bagian dari MPJ</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Nama Pesantren */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Building2 className="w-4 h-4" />
              Nama Pesantren
            </label>
            <Input
              type="text"
              placeholder="Masukkan nama pesantren"
              value={formData.namaPesantren}
              onChange={(e) => handleInputChange("namaPesantren", e.target.value)}
              className="h-12 border-gray-200 focus:border-[#166534] focus:ring-[#166534]"
            />
          </div>

          {/* Nama Pengasuh */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              Nama Pengasuh
            </label>
            <Input
              type="text"
              placeholder="Masukkan nama pengasuh"
              value={formData.namaPengasuh}
              onChange={(e) => handleInputChange("namaPengasuh", e.target.value)}
              className="h-12 border-gray-200 focus:border-[#166534] focus:ring-[#166534]"
            />
          </div>

          {/* Alamat Lengkap */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              Alamat Lengkap
            </label>
            <Textarea
              placeholder="Masukkan alamat lengkap pesantren"
              value={formData.alamatLengkap}
              onChange={(e) => handleInputChange("alamatLengkap", e.target.value)}
              className="min-h-[100px] border-gray-200 focus:border-[#166534] focus:ring-[#166534] resize-none"
            />
          </div>

          {/* Kota/Kabupaten */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              Kota/Kabupaten
            </label>
            <Select
              value={formData.kotaKabupaten}
              onValueChange={(value) => handleInputChange("kotaKabupaten", value)}
            >
              <SelectTrigger className="h-12 border-gray-200 focus:border-[#166534] focus:ring-[#166534]">
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
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4" />
              Email Resmi Pesantren
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="contoh@pesantren.id"
              value={formData.emailResmi}
              onChange={(e) => handleInputChange("emailResmi", e.target.value)}
              className="h-12 border-gray-200 focus:border-[#166534] focus:ring-[#166534]"
            />
            <p className="text-xs text-gray-500">
              Email ini akan digunakan untuk menerima Token Registrasi.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="w-full h-12 bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-base rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengirim...
              </span>
            ) : (
              "Ajukan Verifikasi"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstitutionSubmission;
