import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Save, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const PengaturanAdmin = () => {
  const [profile, setProfile] = useState({
    name: "Super Admin",
    email: "admin@mpj.id",
    avatar: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSaveProfile = () => {
    if (!profile.name) {
      toast.error("Nama tidak boleh kosong!");
      return;
    }
    toast.success("Profil berhasil diperbarui!");
  };

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("Lengkapi semua field password!");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Password baru tidak cocok!");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password minimal 8 karakter!");
      return;
    }
    toast.success("Password berhasil diubah!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-slate-500">Kelola profil dan keamanan akun Super Admin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Section */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Profil Saya
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-800">{profile.name}</p>
                <p className="text-sm text-slate-500">Super Administrator</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Ubah Foto
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="pl-10 bg-slate-50"
                  />
                </div>
                <p className="text-xs text-slate-500">Email tidak dapat diubah</p>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-emerald-700">Super Administrator</span>
                </div>
              </div>

              <Button 
                onClick={handleSaveProfile}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan Profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-600" />
              Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                Pastikan password Anda kuat dan unik. Gunakan kombinasi huruf besar, 
                huruf kecil, angka, dan simbol.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Password Saat Ini</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder="Masukkan password saat ini"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    placeholder="Masukkan password baru"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Ulangi password baru"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={!passwords.current || !passwords.new || !passwords.confirm}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PengaturanAdmin;
