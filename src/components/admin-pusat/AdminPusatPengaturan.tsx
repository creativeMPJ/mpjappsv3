import { useState, useEffect } from "react";
import { Settings, User, Lock, Send, FileText, Shield, UserPlus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserData {
  id: string;
  nama_pesantren: string | null;
  nama_pengasuh: string | null;
  region_id: string | null;
  region_name: string | null;
  role: AppRole;
  status_account: string;
}

interface Region {
  id: string;
  name: string;
}

const AdminPusatPengaturan = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Super Admin Zone state
  const [userList, setUserList] = useState<UserData[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Role management dialog state
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>("user");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users with their roles
        const { data: userData } = await supabase
          .from("profiles")
          .select(`
            id,
            nama_pesantren,
            nama_pengasuh,
            region_id,
            role,
            status_account,
            regions!profiles_region_id_fkey (name)
          `)
          .order("nama_pesantren", { ascending: true });

        // Fetch all regions
        const { data: regionsData } = await supabase
          .from("regions")
          .select("id, name")
          .order("name", { ascending: true });

        if (userData) {
          setUserList(
            userData.map((item: any) => ({
              id: item.id,
              nama_pesantren: item.nama_pesantren,
              nama_pengasuh: item.nama_pengasuh,
              region_id: item.region_id,
              region_name: item.regions?.name || "Belum diatur",
              role: item.role,
              status_account: item.status_account,
            }))
          );
        }

        if (regionsData) {
          setRegions(regionsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

    toast({
      title: "Coming Soon",
      description: "Fitur ganti password akan segera tersedia.",
      variant: "default",
    });
    setCurrentPassword("");
    setNewPassword("");
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case "admin_pusat":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin Pusat</Badge>;
      case "admin_regional":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Admin Regional</Badge>;
      case "admin_finance":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Admin Finance</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">User</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleOpenRoleDialog = (userData: UserData) => {
    setSelectedUser(userData);
    setSelectedRole(userData.role);
    setSelectedRegion(userData.region_id || "");
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    
    setIsSaving(true);
    try {
      // Update user_roles table (this will trigger sync to profiles via the trigger)
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({
          user_id: selectedUser.id,
          role: selectedRole,
        }, {
          onConflict: "user_id"
        });

      if (roleError) throw roleError;

      // Update region in profiles if admin_regional and region changed
      if (selectedRole === "admin_regional" && selectedRegion && selectedRegion !== selectedUser.region_id) {
        const { error: regionError } = await supabase.rpc("migrate_legacy_account", {
          p_user_id: selectedUser.id,
          p_city_id: null as any,
          p_region_id: selectedRegion,
          p_nama_pesantren: selectedUser.nama_pesantren || "",
          p_nama_pengasuh: selectedUser.nama_pengasuh || "",
          p_alamat_singkat: "",
          p_no_wa_pendaftar: "",
          p_status_account: selectedUser.status_account as any,
        });

        if (regionError) {
          console.error("Region update error:", regionError);
        }
      }

      // Update local state
      setUserList(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { 
              ...u, 
              role: selectedRole,
              region_id: selectedRegion || u.region_id,
              region_name: regions.find(r => r.id === selectedRegion)?.name || u.region_name
            }
          : u
      ));

      toast({
        title: "Berhasil",
        description: `Role ${selectedUser.nama_pesantren || selectedUser.nama_pengasuh || "user"} berhasil diperbarui.`,
      });

      setIsRoleDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat memperbarui role.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter users by role
  const adminRegionalList = userList.filter(u => u.role === "admin_regional");
  const adminPusatList = userList.filter(u => u.role === "admin_pusat" || u.role === "admin_finance");

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

      {/* SUPER ADMIN ZONE */}
      <Card className="bg-white border-2 border-red-200 shadow-sm">
        <CardHeader className="pb-3 bg-red-50 rounded-t-lg">
          <CardTitle className="text-lg text-red-800 font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SUPER ADMIN ZONE: MANAJEMEN AKSES
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600 font-medium">
              Fitur ini hanya untuk Super Admin. Perubahan role bersifat permanen.
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* Admin Regional Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Manajemen Admin Regional ({adminRegionalList.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#166534]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Nama</TableHead>
                      <TableHead className="text-slate-600">Wilayah</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                      <TableHead className="text-slate-600 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminRegionalList.length > 0 ? (
                      adminRegionalList.map((userData) => (
                        <TableRow key={userData.id}>
                          <TableCell className="font-medium text-slate-900">
                            {userData.nama_pesantren || userData.nama_pengasuh || "Belum diisi"}
                          </TableCell>
                          <TableCell className="text-slate-600">{userData.region_name}</TableCell>
                          <TableCell>{getStatusBadge(userData.status_account)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenRoleDialog(userData)}
                              className="gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <Shield className="h-4 w-4" />
                              Ubah Role
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                          Belum ada Admin Regional
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Admin Pusat / Tim Pusat Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-600" />
                Manajemen Tim Pusat ({adminPusatList.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#166534]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Nama</TableHead>
                      <TableHead className="text-slate-600">Role</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                      <TableHead className="text-slate-600 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminPusatList.length > 0 ? (
                      adminPusatList.map((userData) => (
                        <TableRow key={userData.id}>
                          <TableCell className="font-medium text-slate-900">
                            {userData.nama_pesantren || userData.nama_pengasuh || "Belum diisi"}
                          </TableCell>
                          <TableCell>{getRoleBadge(userData.role)}</TableCell>
                          <TableCell>{getStatusBadge(userData.status_account)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenRoleDialog(userData)}
                              className="gap-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                            >
                              <Shield className="h-4 w-4" />
                              Ubah Role
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                          Belum ada Tim Pusat
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Promote New User Section */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Promosikan User Baru</h3>
            <p className="text-sm text-slate-500 mb-4">
              Cari user yang sudah terdaftar dan promosikan ke role Admin.
            </p>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-600">Nama</TableHead>
                    <TableHead className="text-slate-600">Wilayah</TableHead>
                    <TableHead className="text-slate-600">Role Saat Ini</TableHead>
                    <TableHead className="text-slate-600">Status</TableHead>
                    <TableHead className="text-slate-600 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userList.filter(u => u.role === "user").slice(0, 10).map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell className="font-medium text-slate-900">
                        {userData.nama_pesantren || userData.nama_pengasuh || "Belum diisi"}
                      </TableCell>
                      <TableCell className="text-slate-600">{userData.region_name}</TableCell>
                      <TableCell>{getRoleBadge(userData.role)}</TableCell>
                      <TableCell>{getStatusBadge(userData.status_account)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleOpenRoleDialog(userData)}
                          className="gap-1 bg-[#166534] hover:bg-emerald-700 text-white"
                        >
                          <UserPlus className="h-4 w-4" />
                          Promosikan
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {userList.filter(u => u.role === "user").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 py-6">
                        Tidak ada user biasa yang tersedia
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
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

      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#166534]" />
              Atur Peran User
            </DialogTitle>
            <DialogDescription>
              Ubah role dan wilayah user. Perubahan akan langsung aktif.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              {/* User Info */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-900">
                  {selectedUser.nama_pesantren || selectedUser.nama_pengasuh || "User"}
                </p>
                <p className="text-sm text-slate-500">
                  Wilayah: {selectedUser.region_name}
                </p>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Pilih Role Baru</Label>
                <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as AppRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User (Biasa)</SelectItem>
                    <SelectItem value="admin_regional">Admin Regional</SelectItem>
                    <SelectItem value="admin_finance">Admin Finance</SelectItem>
                    <SelectItem value="admin_pusat">Admin Pusat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Region Selection - Only show if admin_regional */}
              {selectedRole === "admin_regional" && (
                <div className="space-y-2">
                  <Label>Pilih Wilayah</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih wilayah" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleSaveRole} 
              disabled={isSaving}
              className="bg-[#166534] hover:bg-emerald-700 text-white"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPusatPengaturan;
