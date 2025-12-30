import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CityCombobox } from "@/components/registration/CityCombobox";
import { LocationPicker } from "@/components/registration/LocationPicker";
import { useAuth } from "@/contexts/AuthContext";

const InstitutionSubmission = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const searchedName = location.state?.searchedName || "";

  // Guard state
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(true);

  // Wizard step
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Data Pokok
  const [formData, setFormData] = useState({
    namaPesantren: searchedName,
    namaPengasuh: "",
    alamatSingkat: "",
    cityId: "",
    cityName: "",
    noWhatsapp: "",
    password: "",
    konfirmasiPassword: "",
  });

  // Step 2: Location
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * GLOBAL GUARD: Check if user already has an approved pesantren claim
   * If yes, block access and redirect to dashboard
   */
  useEffect(() => {
    const checkPesantrenOwnership = async () => {
      if (authLoading) return;
      
      // If user is logged in, check their claim status
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
            // LOCK: User already has an approved pesantren
            toast({
              title: "Akses Ditolak",
              description: `Akun Anda sudah terdaftar sebagai pengelola "${claim.pesantren_name}". Satu akun hanya boleh mengelola satu pesantren.`,
              variant: "destructive",
            });
            navigate('/user', { replace: true });
            return;
          }

          // If user has pending claim, redirect to verification
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

  const handleCitySelect = (cityId: string, cityName: string) => {
    setFormData((prev) => ({ ...prev, cityId, cityName }));
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  // Validation for Step 1
  const isStep1Valid = () => {
    return (
      formData.namaPesantren.trim() &&
      formData.namaPengasuh.trim() &&
      formData.alamatSingkat.trim() &&
      formData.cityId &&
      formData.noWhatsapp.trim().length >= 10 &&
      formData.password.length >= 6 &&
      formData.password === formData.konfirmasiPassword
    );
  };

  // Handle Step 1 completion - Create user, profile, AND pesantren_claim
  const handleStep1Complete = async () => {
    if (!isStep1Valid()) return;

    setIsSubmitting(true);

    try {
      // Format phone number as email for auth
      const phoneEmail = `${formData.noWhatsapp}@mpj.local`;

      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: phoneEmail,
        password: formData.password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Gagal membuat akun");
      }

      // Get region_id from city
      const { data: cityData } = await supabase
        .from('cities')
        .select('region_id')
        .eq('id', formData.cityId)
        .single();

      // Update profile with pesantren data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          nama_pesantren: formData.namaPesantren,
          nama_pengasuh: formData.namaPengasuh,
          alamat_singkat: formData.alamatSingkat,
          city_id: formData.cityId,
          no_wa_pendaftar: formData.noWhatsapp,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        throw profileError;
      }

      // Create pesantren_claim entry (1 User = 1 Pesantren)
      const { error: claimError } = await supabase
        .from("pesantren_claims")
        .insert({
          user_id: authData.user.id,
          pesantren_name: formData.namaPesantren,
          status: 'pending',
          region_id: cityData?.region_id || null,
        });

      if (claimError) {
        console.error('Claim error:', claimError);
        // Don't throw - claim might already exist from trigger
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
    }
  };

  // Handle Step 2 completion - Update location
  const handleStep2Complete = async () => {
    setIsSubmitting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.user) {
        throw new Error("Sesi tidak ditemukan");
      }

      // Update profile with location data
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          latitude: latitude,
          longitude: longitude,
        })
        .eq("id", sessionData.session.user.id);

      if (updateError) {
        throw updateError;
      }

      // Sign out user (they need to wait for admin approval)
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

  // Skip Step 2 and complete registration
  const handleSkipStep2 = async () => {
    setIsSubmitting(true);

    try {
      // Sign out user (they need to wait for admin approval)
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

  // Show loading while checking ownership
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
              <p className="font-medium text-foreground">
                {formData.namaPesantren}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pengasuh:</p>
              <p className="font-medium text-foreground">
                {formData.namaPengasuh}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">WhatsApp:</p>
              <p className="font-medium text-foreground">
                {formData.noWhatsapp}
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/login")}
            className="w-full h-12 rounded-xl"
          >
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
          onClick={() =>
            currentStep === 1 ? navigate("/check-institution") : setCurrentStep(1)
          }
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`flex-1 h-1.5 rounded-full ${
              currentStep >= 1 ? "bg-primary" : "bg-muted"
            }`}
          />
          <div
            className={`flex-1 h-1.5 rounded-full ${
              currentStep >= 2 ? "bg-primary" : "bg-muted"
            }`}
          />
        </div>

        {/* Step 1: Data Pokok */}
        {currentStep === 1 && (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Daftar Pesantren Baru
              </h1>
              <p className="text-muted-foreground text-sm">
                Langkah 1: Data Pokok
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Section: Data Pesantren */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    A
                  </div>
                  <h2 className="font-semibold text-foreground">
                    Data Pesantren
                  </h2>
                </div>

                <div className="space-y-4 bg-muted/50 rounded-xl p-4">
                  {/* Nama Pesantren */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Building2 className="w-4 h-4" />
                      Nama Pesantren
                    </label>
                    <Input
                      type="text"
                      placeholder="Masukkan nama pesantren"
                      value={formData.namaPesantren}
                      onChange={(e) =>
                        handleChange("namaPesantren", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>

                  {/* Nama Pengasuh */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <User className="w-4 h-4" />
                      Nama Pengasuh
                    </label>
                    <Input
                      type="text"
                      placeholder="Masukkan nama pengasuh"
                      value={formData.namaPengasuh}
                      onChange={(e) =>
                        handleChange("namaPengasuh", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>

                  {/* Alamat Singkat */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin className="w-4 h-4" />
                      Alamat Singkat
                    </label>
                    <Textarea
                      placeholder="Contoh: Jl. Raya No. 123, Kecamatan..."
                      value={formData.alamatSingkat}
                      onChange={(e) =>
                        handleChange("alamatSingkat", e.target.value)
                      }
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  {/* Kota/Kabupaten - Searchable Combobox */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin className="w-4 h-4" />
                      Kota/Kabupaten
                    </label>
                    <CityCombobox
                      value={formData.cityId}
                      onSelect={handleCitySelect}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Data Akun */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    B
                  </div>
                  <h2 className="font-semibold text-foreground">
                    Data Akun Anda
                  </h2>
                </div>

                <div className="space-y-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4">
                  {/* No WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Phone className="w-4 h-4" />
                      No. WhatsApp
                    </label>
                    <Input
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.noWhatsapp}
                      onChange={(e) =>
                        handleChange(
                          "noWhatsapp",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Nomor ini akan digunakan untuk login
                    </p>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Lock className="w-4 h-4" />
                      Buat Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 6 karakter"
                        value={formData.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Password */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Lock className="w-4 h-4" />
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi password"
                        value={formData.konfirmasiPassword}
                        onChange={(e) =>
                          handleChange("konfirmasiPassword", e.target.value)
                        }
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {formData.konfirmasiPassword &&
                      formData.password !== formData.konfirmasiPassword && (
                        <p className="text-xs text-destructive">
                          Password tidak cocok
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleStep1Complete}
                disabled={!isStep1Valid() || isSubmitting}
                className="w-full h-12 rounded-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
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
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Lokasi Pesantren
              </h1>
              <p className="text-muted-foreground text-sm">
                Langkah 2: Tandai Lokasi (Opsional)
              </p>
            </div>

            {/* Location Picker */}
            <div className="space-y-4">
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleLocationChange}
              />

              {latitude && longitude && (
                <div className="bg-muted rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground">
                    Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
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