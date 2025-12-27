import { useState } from "react";
import { Settings, User, Lock, Send, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AdminPusatPengaturan = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLockedFeature = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `Fitur "${feature}" akan tersedia di update selanjutnya.`,
      variant: "default",
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      toast({
        title: "Error",
        description: "Harap isi semua field",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement password change via Supabase
    toast({
      title: "Coming Soon",
      description: "Fitur ganti password akan segera tersedia.",
      variant: "default",
    });
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-slate-500 mt-1">Kelola akun dan preferensi</p>
      </div>

      {/* Profile Section - ACTIVE */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-[#166534]" />
            Profil Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-600">Email</Label>
              <Input 
                value={user?.email || ""} 
                disabled 
                className="mt-1 bg-slate-50"
              />
            </div>
            <div>
              <Label className="text-slate-600">Role</Label>
              <Input 
                value="Admin Pusat" 
                disabled 
                className="mt-1 bg-slate-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password - ACTIVE */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#166534]" />
            Ganti Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-600">Password Lama</Label>
              <Input 
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password lama"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-600">Password Baru</Label>
              <Input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="mt-1"
              />
            </div>
          </div>
          <Button 
            onClick={handleChangePassword}
            className="bg-[#166534] hover:bg-emerald-700 text-white"
          >
            Simpan Password
          </Button>
        </CardContent>
      </Card>

      {/* Locked Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Broadcast Center - LOCKED */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
                <Send className="h-6 w-6 text-slate-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-500">Broadcast Center</h3>
                <p className="text-sm text-slate-400">Kirim pesan ke semua regional</p>
              </div>
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <Button 
              onClick={() => handleLockedFeature("Broadcast Center")}
              className="w-full mt-4 bg-slate-300 text-slate-600 cursor-not-allowed"
              disabled
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Audit Log - LOCKED */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-500">Audit Log</h3>
                <p className="text-sm text-slate-400">Riwayat aktivitas sistem</p>
              </div>
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <Button 
              onClick={() => handleLockedFeature("Audit Log")}
              className="w-full mt-4 bg-slate-300 text-slate-600 cursor-not-allowed"
              disabled
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPusatPengaturan;
