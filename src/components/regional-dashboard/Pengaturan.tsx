import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Building, Shield, Upload, Camera, Eye, EyeOff, CreditCard, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const bankOptions = [
  "Bank BCA",
  "Bank Mandiri",
  "Bank BRI",
  "Bank BNI",
  "Bank Jatim",
  "Bank Syariah Indonesia (BSI)",
  "Bank CIMB Niaga",
  "Bank Permata",
];

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const Pengaturan = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profil");

  // Profile state
  const [profileForm, setProfileForm] = useState({
    avatar: "",
    namaLengkap: "Ahmad Admin",
    email: "admin.malang@mpj.or.id",
    whatsapp: "081234567890",
    jabatan: "Admin Regional",
  });

  // Avatar crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Regional Office state
  const [regionalForm, setRegionalForm] = useState({
    namaWilayah: "MPJ Koordinator Malang Raya",
    alamatSekretariat: "Jl. Soekarno Hatta No. 123, Lowokwaru, Malang",
    hotlineWa: "081234567890",
    googleMapsLink: "https://maps.google.com/?q=...",
    namaBank: "Bank Jatim",
    nomorRekening: "0123456789",
    atasNama: "MPJ Media Regional Malang",
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Handle image load for crop
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  // Generate cropped image
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
        setProfileForm({ ...profileForm, avatar: url });
        setCropModalOpen(false);
        toast({
          title: "Foto profil diperbarui",
          description: "Avatar baru telah disimpan.",
        });
      }
    }, "image/jpeg");
  }, [completedCrop, profileForm, toast]);

  // Save profile
  const handleSaveProfile = () => {
    if (!profileForm.namaLengkap) {
      toast({
        title: "Nama diperlukan",
        description: "Mohon isi nama lengkap.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profil berhasil diperbarui",
      description: "Data profil Anda telah tersimpan.",
    });
  };

  // Save regional data
  const handleSaveRegional = () => {
    if (!regionalForm.nomorRekening || !regionalForm.atasNama) {
      toast({
        title: "Data rekening tidak lengkap",
        description: "Mohon lengkapi data rekening operasional.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Data wilayah berhasil diperbarui",
      description: "Informasi wilayah dan rekening telah tersimpan.",
    });
  };

  // Update password
  const handleUpdatePassword = () => {
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

    toast({
      title: "Password berhasil diperbarui",
      description: "Silakan gunakan password baru untuk login berikutnya.",
    });

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const isPasswordFormValid =
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil, informasi wilayah, dan keamanan akun</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto -mx-6 px-6 mb-6">
              <TabsList className="inline-flex w-auto min-w-full sm:w-full justify-start sm:justify-center">
                <TabsTrigger value="profil" className="flex-shrink-0 gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profil Saya</span>
                  <span className="sm:hidden">Profil</span>
                </TabsTrigger>
                <TabsTrigger value="wilayah" className="flex-shrink-0 gap-2">
                  <Building className="h-4 w-4" />
                  <span className="hidden sm:inline">Profil Wilayah</span>
                  <span className="sm:hidden">Wilayah</span>
                </TabsTrigger>
                <TabsTrigger value="keamanan" className="flex-shrink-0 gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Keamanan</span>
                  <span className="sm:hidden">Password</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: PROFIL SAYA */}
            <TabsContent value="profil" className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Data Pribadi
                  </CardTitle>
                  <CardDescription>
                    Kelola informasi identitas akun Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                        <AvatarImage src={profileForm.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-emerald-600 text-white text-2xl">
                          {profileForm.namaLengkap.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 p-2 bg-emerald-600 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg">
                        <Camera className="h-4 w-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarSelect}
                        />
                      </label>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-lg">{profileForm.namaLengkap}</h3>
                      <p className="text-sm text-muted-foreground">{profileForm.jabatan}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Ubah Foto
                      </Button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap</Label>
                      <Input
                        id="nama"
                        value={profileForm.namaLengkap}
                        onChange={(e) => setProfileForm({ ...profileForm, namaLengkap: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">No. WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="081234567890"
                        value={profileForm.whatsapp}
                        onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Untuk notifikasi sistem</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jabatan">Jabatan/Role</Label>
                      <Input
                        id="jabatan"
                        value={profileForm.jabatan}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} className="bg-emerald-600 hover:bg-emerald-700">
                    Simpan Profil
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: PROFIL WILAYAH & KEUANGAN */}
            <TabsContent value="wilayah" className="space-y-6">
              {/* Office Info */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Informasi Wilayah
                  </CardTitle>
                  <CardDescription>
                    Data ini ditampilkan ke member di aplikasi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="namaWilayah">Nama Wilayah</Label>
                    <Input
                      id="namaWilayah"
                      value={regionalForm.namaWilayah}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alamat">Alamat Sekretariat</Label>
                    <Textarea
                      id="alamat"
                      placeholder="Masukkan alamat lengkap sekretariat..."
                      value={regionalForm.alamatSekretariat}
                      onChange={(e) => setRegionalForm({ ...regionalForm, alamatSekretariat: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hotline">Hotline / WA Admin</Label>
                      <Input
                        id="hotline"
                        type="tel"
                        placeholder="081234567890"
                        value={regionalForm.hotlineWa}
                        onChange={(e) => setRegionalForm({ ...regionalForm, hotlineWa: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Untuk dukungan member</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maps">Link Google Maps (Opsional)</Label>
                      <Input
                        id="maps"
                        type="url"
                        placeholder="https://maps.google.com/..."
                        value={regionalForm.googleMapsLink}
                        onChange={(e) => setRegionalForm({ ...regionalForm, googleMapsLink: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Account - Critical for Event Module */}
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                    Rekening Operasional
                  </CardTitle>
                  <CardDescription>
                    Rekening pembayaran untuk event berbayar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      💡 Data rekening ini akan muncul otomatis saat Member mendaftar Event berbayar.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="bank">Nama Bank</Label>
                      <Select
                        value={regionalForm.namaBank}
                        onValueChange={(value) => setRegionalForm({ ...regionalForm, namaBank: value })}
                      >
                        <SelectTrigger id="bank">
                          <SelectValue placeholder="Pilih Bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankOptions.map((bank) => (
                            <SelectItem key={bank} value={bank}>
                              {bank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="norek">Nomor Rekening</Label>
                      <Input
                        id="norek"
                        type="text"
                        placeholder="0123456789"
                        value={regionalForm.nomorRekening}
                        onChange={(e) => setRegionalForm({ ...regionalForm, nomorRekening: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="atasNama">Atas Nama</Label>
                      <Input
                        id="atasNama"
                        placeholder="Nama pemilik rekening"
                        value={regionalForm.atasNama}
                        onChange={(e) => setRegionalForm({ ...regionalForm, atasNama: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveRegional} className="bg-emerald-600 hover:bg-emerald-700">
                Simpan Data Wilayah
              </Button>
            </TabsContent>

            {/* TAB 3: KEAMANAN */}
            <TabsContent value="keamanan" className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Ubah Password
                  </CardTitle>
                  <CardDescription>
                    Perbarui password akun Anda untuk keamanan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Masukkan password saat ini"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
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
                        placeholder="Minimal 6 karakter"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi password baru"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
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
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={!isPasswordFormValid}
                  >
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Avatar Crop Modal */}
      <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Foto Profil</DialogTitle>
            <DialogDescription>
              Sesuaikan area foto yang akan digunakan (1:1 rasio)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[400px] mx-auto"
                />
              </ReactCrop>
            )}
            <canvas ref={previewCanvasRef} className="hidden" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCropModalOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={generateCroppedImage}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!completedCrop}
              >
                Simpan Foto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pengaturan;
