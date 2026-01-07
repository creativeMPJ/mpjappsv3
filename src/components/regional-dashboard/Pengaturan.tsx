import { useState, useEffect, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Building, Shield, Camera, Eye, EyeOff, MapPin, Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AsistenRegionalManagement from "./AsistenRegionalManagement";

interface PengaturanProps {
  isDebugMode?: boolean;
}

// Mock data for debug mode
const MOCK_ADMIN = {
  nama: 'Ahmad Admin Regional',
  email: 'admin.malang@mpj.or.id',
  whatsapp: '081234567890',
  jabatan: 'Admin Regional Utama',
};

const MOCK_REGION = {
  code: '01',
  name: 'Malang Raya',
};

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

const Pengaturan = ({ isDebugMode = false }: PengaturanProps) => {
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState("profil");
  const [loading, setLoading] = useState(true);

  // Profile state (Read-only from database)
  const [profileData, setProfileData] = useState({
    avatar: "",
    namaLengkap: "",
    email: "",
    whatsapp: "",
    jabatan: "Admin Regional",
  });

  // Regional data (Read-only from database)
  const [regionalData, setRegionalData] = useState({
    regionCode: "",
    regionName: "",
  });

  // Avatar crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Fetch admin data from crews table
  useEffect(() => {
    const fetchData = async () => {
      if (isDebugMode) {
        setProfileData({
          avatar: "",
          namaLengkap: MOCK_ADMIN.nama,
          email: MOCK_ADMIN.email,
          whatsapp: MOCK_ADMIN.whatsapp,
          jabatan: MOCK_ADMIN.jabatan,
        });
        setRegionalData({
          regionCode: MOCK_REGION.code,
          regionName: MOCK_REGION.name,
        });
        setLoading(false);
        return;
      }

      if (!user?.id || !profile?.region_id) {
        setLoading(false);
        return;
      }

      try {
        // Set email from auth user
        setProfileData(prev => ({
          ...prev,
          email: user.email || '',
        }));

        // Fetch region data
        const { data: regionData } = await supabase
          .from('regions')
          .select('code, name')
          .eq('id', profile.region_id)
          .single();

        if (regionData) {
          setRegionalData({
            regionCode: regionData.code,
            regionName: regionData.name,
          });
        }

        // Try to fetch crew data for this admin (if they have a crew record)
        const { data: crewData } = await supabase
          .from('crews')
          .select('nama, jabatan')
          .eq('profile_id', user.id)
          .single();

        if (crewData) {
          setProfileData(prev => ({
            ...prev,
            namaLengkap: crewData.nama || profile.nama_pesantren || '',
            jabatan: crewData.jabatan || 'Admin Regional',
          }));
        } else {
          // Fallback to profile data
          setProfileData(prev => ({
            ...prev,
            namaLengkap: profile.nama_pesantren || 'Admin Regional',
          }));
        }

        // Get WhatsApp from full profile query
        const { data: fullProfile } = await supabase
          .from('profiles')
          .select('no_wa_pendaftar')
          .eq('id', user.id)
          .single();

        if (fullProfile?.no_wa_pendaftar) {
          setProfileData(prev => ({
            ...prev,
            whatsapp: fullProfile.no_wa_pendaftar || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, profile?.region_id, isDebugMode]);

  // Handle avatar file selection
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const generateCroppedImage = useCallback(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setProfileData({ ...profileData, avatar: url });
        setCropModalOpen(false);
        toast({
          title: "Foto profil diperbarui",
          description: "Avatar baru telah disimpan.",
        });
      }
    }, "image/jpeg");
  }, [completedCrop, profileData, toast]);

  // Update password
  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword) {
      toast({
        title: "Password saat ini diperlukan",
        description: "Mohon isi password saat ini.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Password terlalu pendek",
        description: "Password baru minimal 6 karakter.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Konfirmasi password tidak sesuai dengan password baru.",
        variant: "destructive",
      });
      return;
    }

    if (isDebugMode) {
      toast({
        title: "Mode Debug",
        description: "Password akan diperbarui (simulasi)",
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password berhasil diperbarui",
        description: "Silakan gunakan password baru untuk login berikutnya.",
      });

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({
        title: "Gagal memperbarui password",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const isPasswordFormValid =
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">Kelola profil dan keamanan akun</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto -mx-6 px-6 mb-6">
              <TabsList className="inline-flex w-auto min-w-full sm:w-full justify-start sm:justify-center">
                <TabsTrigger value="profil" className="flex-shrink-0 gap-2 min-h-[44px]">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profil Saya</span>
                  <span className="sm:hidden">Profil</span>
                </TabsTrigger>
                <TabsTrigger value="regional" className="flex-shrink-0 gap-2 min-h-[44px]">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Regional</span>
                  <span className="sm:hidden">Regional</span>
                </TabsTrigger>
                <TabsTrigger value="tim" className="flex-shrink-0 gap-2 min-h-[44px]">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Tim Regional</span>
                  <span className="sm:hidden">Tim</span>
                </TabsTrigger>
                <TabsTrigger value="keamanan" className="flex-shrink-0 gap-2 min-h-[44px]">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Keamanan</span>
                  <span className="sm:hidden">Password</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: PROFIL SAYA (Read-Only) */}
            <TabsContent value="profil" className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Data Pribadi Admin
                  </CardTitle>
                  <CardDescription>
                    Data diambil dari database (Read-Only)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                        <AvatarImage src={profileData.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          {profileData.namaLengkap.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                        <Camera className="h-4 w-4 text-primary-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarSelect}
                        />
                      </label>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-lg">{profileData.namaLengkap}</h3>
                      <p className="text-sm text-muted-foreground">{profileData.jabatan}</p>
                    </div>
                  </div>

                  {/* Form Fields (Read-Only) */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap</Label>
                      <Input
                        id="nama"
                        value={profileData.namaLengkap}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">No. WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        value={profileData.whatsapp}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jabatan">Jabatan/Role</Label>
                      <Input
                        id="jabatan"
                        value={profileData.jabatan}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Data profil diambil otomatis dari database. Hubungi Admin Pusat untuk perubahan.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: REGIONAL INFO (Read-Only) */}
            <TabsContent value="regional" className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Informasi Regional
                  </CardTitle>
                  <CardDescription>
                    Data wilayah tugas Anda (Read-Only)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="regionCode">Kode Regional (RR)</Label>
                      <Input
                        id="regionCode"
                        value={regionalData.regionCode}
                        disabled
                        className="bg-muted font-mono text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regionName">Nama Regional</Label>
                      <Input
                        id="regionName"
                        value={regionalData.regionName}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-foreground">
                      <strong>Regional [{regionalData.regionCode}]</strong> - {regionalData.regionName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Wilayah tugas ini ditetapkan oleh Admin Pusat dan tidak dapat diubah.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: TIM REGIONAL (Asisten Management) */}
            <TabsContent value="tim" className="space-y-6">
              <AsistenRegionalManagement isDebugMode={isDebugMode} />
            </TabsContent>

            {/* TAB 4: KEAMANAN */}
            <TabsContent value="keamanan" className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Ubah Password
                  </CardTitle>
                  <CardDescription>
                    Perbarui password akun Anda secara berkala
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Minimal 6 karakter</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-destructive">Password tidak cocok</p>
                    )}
                  </div>

                  <Button
                    onClick={handleUpdatePassword}
                    disabled={!isPasswordFormValid || isUpdatingPassword}
                    className="bg-primary hover:bg-primary/90 min-h-[44px]"
                  >
                    {isUpdatingPassword ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memperbarui...
                      </span>
                    ) : (
                      "Perbarui Password"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Crop Modal */}
      <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Foto Profil</DialogTitle>
            <DialogDescription>
              Sesuaikan area foto yang akan ditampilkan
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{ maxHeight: "400px", width: "100%" }}
                />
              </ReactCrop>
            )}
            <canvas ref={previewCanvasRef} style={{ display: "none" }} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCropModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={generateCroppedImage} className="bg-primary hover:bg-primary/90">
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pengaturan;