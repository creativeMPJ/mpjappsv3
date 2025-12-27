import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Lock, 
  Mail,
  Phone,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Pengaturan = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: true,
    event: true,
    payment: true,
  });

  const [profile, setProfile] = useState({
    name: "Ahmad Fauzi",
    email: "ahmad.fauzi@example.com",
    phone: "081234567890",
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profil Disimpan",
      description: "Perubahan profil berhasil disimpan.",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Password Diubah",
      description: "Password baru berhasil disimpan.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-slate-500">Kelola akun dan preferensi Anda</p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#166534]" />
            Profil Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-[#166534] text-2xl font-bold">
              AF
            </div>
            <div>
              <Button variant="outline" size="sm">
                Ganti Foto
              </Button>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG max 2MB</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">No. WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="phone"
                  className="pl-10"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <Button className="bg-[#166534] hover:bg-[#14532d]" onClick={handleSaveProfile}>
            <Save className="h-4 w-4 mr-2" />
            Simpan Perubahan
          </Button>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#166534]" />
            Keamanan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <Button className="bg-[#166534] hover:bg-[#14532d]" onClick={handleChangePassword}>
            <Lock className="h-4 w-4 mr-2" />
            Ubah Password
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#166534]" />
            Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Notifikasi Email</p>
                <p className="text-sm text-slate-500">Terima update via email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Notifikasi WhatsApp</p>
                <p className="text-sm text-slate-500">Terima update via WhatsApp</p>
              </div>
              <Switch
                checked={notifications.whatsapp}
                onCheckedChange={(checked) => setNotifications({ ...notifications, whatsapp: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Reminder Event</p>
                <p className="text-sm text-slate-500">Pengingat event mendatang</p>
              </div>
              <Switch
                checked={notifications.event}
                onCheckedChange={(checked) => setNotifications({ ...notifications, event: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Reminder Pembayaran</p>
                <p className="text-sm text-slate-500">Pengingat tagihan jatuh tempo</p>
              </div>
              <Switch
                checked={notifications.payment}
                onCheckedChange={(checked) => setNotifications({ ...notifications, payment: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pengaturan;