import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  User,
  MapPin,
  CheckCircle,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  FileText,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CityCombobox } from "@/components/registration/CityCombobox";
import { LocationPicker } from "@/components/registration/LocationPicker";
import { useAuth } from "@/contexts/AuthContext";

const MAX_FILE_SIZE = 100 * 1024; // 100KB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const InstitutionSubmission = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const searchedName = location.state?.searchedName || "";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guard state
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(true);

  // Wizard step
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Data Pokok - ALL REQUIRED FIELDS
  const [formData, setFormData] = useState({
    // Data Pesantren
    namaPesantren: searchedName,
    namaPengasuh: "",
    alamatLengkap: "",
    provinsi: "Jawa Timur", // Fixed for MVP
    cityId: "",
    cityName: "",
    kecamatan: "",
    // Data Pengelola
    namaPengelola: "",
    emailPengelola: "",
    noWhatsapp: "",
    password: "",
    konfirmasiPassword: "",
  });

  // Document upload state
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Step 2: Location
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Region auto-lock (derived from city)
  const [regionId, setRegionId] = useState<string | null>(null);
  const [regionName, setRegionName] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * GLOBAL GUARD: Check if user already has an approved pesantren claim
   */
  useEffect(() => {
    const checkPesantrenOwnership = async () => {
      if (authLoading) return;
      
      if (user) {
        try {
          const { data: claim, error } = await supabase
            .from('pesantren_claims')
            .select('status, pesantren_name')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error checking ownership:', error);
            setIsCheckingOwnership(false);
            return;
          }

          if (claim && (claim.status === 'approved' || claim.status === 'pusat_approved')) {
            toast({
              title: "Akses Ditolak",
              description: `Akun Anda sudah terdaftar sebagai pengelola "${claim.pesantren_name}". Satu akun hanya boleh mengelola satu pesantren.`,
              variant: "destructive",
            });
            navigate('/user', { replace: true });
            return;
          }

          if (claim && (claim.status === 'pending' || claim.status === 'regional_approved')) {
            navigate('/verification-pending', { replace: true });
            return;
          }
        } catch (error) {
          console.error('Error in ownership check:', error);
        }
      }
      
      setIsCheckingOwnership(false);
    };

    checkPesantrenOwnership();
  }, [user, authLoading, navigate, toast]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle city selection and auto-lock region
  const handleCitySelect = async (cityId: string, cityName: string) => {
    setFormData((prev) => ({ ...prev, cityId, cityName }));
    
    // Auto-fetch region for this city
    if (cityId) {
      const { data: cityData, error } = await supabase
        .from('cities')
        .select('region_id, regions(id, name, code)')
        .eq('id', cityId)
        .single();
      
      if (!error && cityData?.regions) {
        const region = cityData.regions as { id: string; name: string; code: string };
        setRegionId(region.id);
        setRegionName(`${region.code} - ${region.name}`);
      }
    } else {
      setRegionId(null);
      setRegionName("");
    }
  };

  // Handle document file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setDocumentError(null);
    
    if (!file) {
      setDocumentFile(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setDocumentError("Format file tidak didukung. Gunakan PDF, JPG, PNG, atau WebP.");
      setDocumentFile(null);
      return;
    }

    // Validate file size (max 100KB)
    if (file.size > MAX_FILE_SIZE) {
      setDocumentError(`Ukuran file terlalu besar (${(file.size / 1024).toFixed(1)}KB). Maksimal 100KB.`);
      setDocumentFile(null);
      return;
    }

    setDocumentFile(file);
  };

  const removeDocument = () => {
    setDocumentFile(null);
    setDocumentError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  // Strict validation for Step 1 - ALL fields required
  const isStep1Valid = () => {
    return (
      formData.namaPesantren.trim().length > 0 &&
      formData.namaPengasuh.trim().length > 0 &&
      formData.alamatLengkap.trim().length > 0 &&
      formData.cityId.length > 0 &&
      formData.kecamatan.trim().length > 0 &&
      formData.namaPengelola.trim().length > 0 &&
      formData.emailPengelola.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailPengelola) &&
      formData.noWhatsapp.trim().length >= 10 &&
      formData.password.length >= 6 &&
      formData.password === formData.konfirmasiPassword &&
      documentFile !== null // Document is REQUIRED
    );
  };

  // Get validation status for each field
  const getFieldStatus = (field: string): 'empty' | 'valid' | 'invalid' => {
    const value = formData[field as keyof typeof formData];
    if (!value || (typeof value === 'string' && value.trim().length === 0)) return 'empty';
    
    if (field === 'emailPengelola') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'valid' : 'invalid';
    }
    if (field === 'noWhatsapp') {
      return value.length >= 10 ? 'valid' : 'invalid';
    }
    if (field === 'password') {
      return value.length >= 6 ? 'valid' : 'invalid';
    }
    if (field === 'konfirmasiPassword') {
      return value === formData.password ? 'valid' : 'invalid';
    }
    
    return 'valid';
  };

  // Handle Step 1 completion
  const handleStep1Complete = async () => {
    if (!isStep1Valid()) {
      toast({
        title: "Form Belum Lengkap",
        description: "Mohon lengkapi semua field yang wajib diisi termasuk unggah dokumen bukti.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format phone number as email for auth
      const phoneEmail = `${formData.noWhatsapp}@mpj.local`;

      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: phoneEmail,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Gagal membuat akun");

      // Upload document to storage
      setIsUploadingDoc(true);
      let documentUrl: string | null = null;

      if (documentFile) {
        const fileExt = documentFile.name.split('.').pop();
        const fileName = `${authData.user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('registration-documents')
          .upload(fileName, documentFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          // Don't throw - continue with registration
        } else {
          documentUrl = uploadData?.path || null;
        }
      }
      setIsUploadingDoc(false);

      // Update profile with pesantren data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          nama_pesantren: formData.namaPesantren,
          nama_pengasuh: formData.namaPengasuh,
          alamat_singkat: formData.alamatLengkap,
          city_id: formData.cityId,
          no_wa_pendaftar: formData.noWhatsapp,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      // Create pesantren_claim entry with all new fields
      const { error: claimError } = await supabase
        .from("pesantren_claims")
        .insert({
          user_id: authData.user.id,
          pesantren_name: formData.namaPesantren,
          status: 'pending',
          region_id: regionId,
          kecamatan: formData.kecamatan,
          nama_pengelola: formData.namaPengelola,
          email_pengelola: formData.emailPengelola,
          dokumen_bukti_url: documentUrl,
          jenis_pengajuan: 'pesantren_baru',
        });

      if (claimError) {
        console.error('Claim error:', claimError);
      }

      // Move to Step 2
      setCurrentStep(2);

      toast({
        title: "Data tersimpan",
        description: "Lanjutkan ke langkah berikutnya",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Gagal mendaftar",
        description: error.message || "Terjadi kesalahan saat mendaftar",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploadingDoc(false);
    }
  };

  // Handle Step 2 completion
  const handleStep2Complete = async () => {
    setIsSubmitting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.user) {
        throw new Error("Sesi tidak ditemukan");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          latitude: latitude,
          longitude: longitude,
        })
        .eq("id", sessionData.session.user.id);

      if (updateError) throw updateError;

      await supabase.auth.signOut();
      setIsSuccess(true);

      toast({
        title: "Pendaftaran Berhasil!",
        description: "Menunggu verifikasi admin wilayah.",
      });
    } catch (error: any) {
      console.error("Location update error:", error);
      toast({
        title: "Gagal menyimpan lokasi",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipStep2 = async () => {
    setIsSubmitting(true);
    try {
      await supabase.auth.signOut();
      setIsSuccess(true);
      toast({
        title: "Pendaftaran Berhasil!",
        description: "Menunggu verifikasi admin wilayah.",
      });
    } catch (error: any) {
      console.error("Skip error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (authLoading || isCheckingOwnership) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Memeriksa status kepemilikan...</p>
        </div>
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Pendaftaran Berhasil
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Menunggu Verifikasi Admin Wilayah. Anda akan menerima notifikasi
            WhatsApp dalam <span className="font-semibold">1x24 jam</span>.
          </p>
          <div className="bg-muted rounded-xl p-4 mb-6 space-y-2 text-left">
            <div>
              <p className="text-xs text-muted-foreground">Pesantren:</p>
              <p className="font-medium text-foreground">{formData.namaPesantren}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pengasuh:</p>
              <p className="font-medium text-foreground">{formData.namaPengasuh}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pengelola:</p>
              <p className="font-medium text-foreground">{formData.namaPengelola}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">WhatsApp:</p>
              <p className="font-medium text-foreground">{formData.noWhatsapp}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/login")} className="w-full h-12 rounded-xl">
            Ke Halaman Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => currentStep === 1 ? navigate("/check-institution") : setCurrentStep(1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex-1 h-1.5 rounded-full ${currentStep >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex-1 h-1.5 rounded-full ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`} />
        </div>

        {/* Step 1: Data Pokok */}
        {currentStep === 1 && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">Daftar Pesantren Baru</h1>
              <p className="text-muted-foreground text-sm">Langkah 1: Data Pokok (Semua Wajib Diisi)</p>
            </div>

            <div className="space-y-6">
              {/* Section A: Data Pesantren */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">A</div>
                  <h2 className="font-semibold text-foreground">Data Pesantren</h2>
                </div>

                <div className="space-y-4 bg-muted/50 rounded-xl p-4">
                  {/* Nama Pesantren */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Building2 className="w-4 h-4" />
                      Nama Pesantren <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Masukkan nama pesantren"
                      value={formData.namaPesantren}
                      onChange={(e) => handleChange("namaPesantren", e.target.value)}
                      className={`h-11 ${getFieldStatus('namaPesantren') === 'empty' ? 'border-amber-300' : ''}`}
                    />
                  </div>

                  {/* Nama Pengasuh */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <User className="w-4 h-4" />
                      Nama Pengasuh <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Masukkan nama pengasuh"
                      value={formData.namaPengasuh}
                      onChange={(e) => handleChange("namaPengasuh", e.target.value)}
                      className={`h-11 ${getFieldStatus('namaPengasuh') === 'empty' ? 'border-amber-300' : ''}`}
                    />
                  </div>

                  {/* Alamat Lengkap */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin className="w-4 h-4" />
                      Alamat Lengkap <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      placeholder="Jl. Raya No. 123, Desa/Kelurahan..."
                      value={formData.alamatLengkap}
                      onChange={(e) => handleChange("alamatLengkap", e.target.value)}
                      className={`min-h-[80px] resize-none ${getFieldStatus('alamatLengkap') === 'empty' ? 'border-amber-300' : ''}`}
                    />
                  </div>

                  {/* Provinsi (Fixed) */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin className="w-4 h-4" />
                      Provinsi
                    </label>
                    <Input
                      type="text"
                      value={formData.provinsi}
                      disabled
                      className="h-11 bg-muted cursor-not-allowed"
                    />
                  </div>

                  {/* Kota/Kabupaten */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin className="w-4 h-4" />
                      Kabupaten/Kota <span className="text-destructive">*</span>
                    </label>
                    <CityCombobox value={formData.cityId} onSelect={handleCitySelect} />
                  </div>

                  {/* Kecamatan */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin className="w-4 h-4" />
                      Kecamatan <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Masukkan nama kecamatan"
                      value={formData.kecamatan}
                      onChange={(e) => handleChange("kecamatan", e.target.value)}
                      className={`h-11 ${getFieldStatus('kecamatan') === 'empty' ? 'border-amber-300' : ''}`}
                    />
                  </div>

                  {/* Regional Auto-Lock (Read Only) */}
                  {regionName && (
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <MapPin className="w-4 h-4" />
                        Nama Regional (Auto)
                      </label>
                      <Input
                        type="text"
                        value={regionName}
                        disabled
                        className="h-11 bg-primary/10 text-primary font-medium cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">
                        Regional ditentukan otomatis berdasarkan Kabupaten/Kota
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section B: Data Pengelola */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">B</div>
                  <h2 className="font-semibold text-foreground">Data Pengelola</h2>
                </div>

                <div className="space-y-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4">
                  {/* Nama Pengelola */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <User className="w-4 h-4" />
                      Nama Pengelola <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Nama lengkap pengelola"
                      value={formData.namaPengelola}
                      onChange={(e) => handleChange("namaPengelola", e.target.value)}
                      className={`h-11 ${getFieldStatus('namaPengelola') === 'empty' ? 'border-amber-300' : ''}`}
                    />
                  </div>

                  {/* Email Pengelola */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mail className="w-4 h-4" />
                      Email Pengelola <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.emailPengelola}
                      onChange={(e) => handleChange("emailPengelola", e.target.value)}
                      className={`h-11 ${getFieldStatus('emailPengelola') === 'invalid' ? 'border-destructive' : getFieldStatus('emailPengelola') === 'empty' ? 'border-amber-300' : ''}`}
                    />
                    {getFieldStatus('emailPengelola') === 'invalid' && (
                      <p className="text-xs text-destructive">Format email tidak valid</p>
                    )}
                  </div>

                  {/* No WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Phone className="w-4 h-4" />
                      No. WhatsApp <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.noWhatsapp}
                      onChange={(e) => handleChange("noWhatsapp", e.target.value.replace(/\D/g, ""))}
                      className={`h-11 ${getFieldStatus('noWhatsapp') === 'invalid' ? 'border-destructive' : getFieldStatus('noWhatsapp') === 'empty' ? 'border-amber-300' : ''}`}
                    />
                    <p className="text-xs text-muted-foreground">Nomor ini akan digunakan untuk login</p>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Lock className="w-4 h-4" />
                      Buat Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 6 karakter"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        className={`h-11 pr-10 ${getFieldStatus('password') === 'invalid' ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Password */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Lock className="w-4 h-4" />
                      Konfirmasi Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi password"
                        value={formData.konfirmasiPassword}
                        onChange={(e) => handleChange("konfirmasiPassword", e.target.value)}
                        className={`h-11 pr-10 ${getFieldStatus('konfirmasiPassword') === 'invalid' ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {getFieldStatus('konfirmasiPassword') === 'invalid' && formData.konfirmasiPassword && (
                      <p className="text-xs text-destructive">Password tidak cocok</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section C: Dokumen Bukti */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">C</div>
                  <h2 className="font-semibold text-foreground">Dokumen Bukti</h2>
                </div>

                <div className="space-y-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <FileText className="w-4 h-4" />
                      SK Pesantren / Surat Tugas <span className="text-destructive">*</span>
                    </label>
                    
                    {!documentFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                          ${documentError 
                            ? 'border-destructive bg-destructive/5' 
                            : 'border-border hover:border-primary hover:bg-primary/5'
                          }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Upload className={`w-8 h-8 mx-auto mb-2 ${documentError ? 'text-destructive' : 'text-muted-foreground'}`} />
                        <p className="text-sm font-medium text-foreground">
                          Klik untuk unggah dokumen
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, JPG, PNG, WebP • Maks. 100KB
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {documentFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(documentFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeDocument}
                          className="p-1.5 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {documentError && (
                      <div className="flex items-start gap-2 text-destructive text-xs mt-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{documentError}</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      Unggah SK Pendirian Pesantren atau Surat Tugas Pengelola sebagai bukti legalitas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Validation Summary */}
              {!isStep1Valid() && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Form belum lengkap
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Pastikan semua field bertanda (*) sudah terisi dengan benar dan dokumen bukti sudah diunggah.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleStep1Complete}
                disabled={!isStep1Valid() || isSubmitting}
                className="w-full h-12 rounded-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isUploadingDoc ? "Mengunggah dokumen..." : "Menyimpan..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Lanjutkan
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Lokasi */}
        {currentStep === 2 && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">Lokasi Pesantren</h1>
              <p className="text-muted-foreground text-sm">Langkah 2: Tandai Lokasi (Opsional)</p>
            </div>

            <div className="space-y-4">
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleLocationChange}
              />

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleStep2Complete}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Simpan & Selesai
                      <CheckCircle className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleSkipStep2}
                  disabled={isSubmitting}
                  className="w-full h-12 text-muted-foreground"
                >
                  Lewati, isi nanti
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstitutionSubmission;