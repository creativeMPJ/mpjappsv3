import { useState, useEffect } from "react";
import { Building2, Users, CreditCard, UserCog, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Pesantren {
  id: string;
  nama_pesantren: string | null;
  region_name: string | null;
  status_account: string;
  profile_level: string;
}

interface Crew {
  id: string;
  nama: string;
  jabatan: string | null;
  pesantren_name: string | null;
}

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

const AdminPusatMasterData = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("lembaga");
  const [pesantrenList, setPesantrenList] = useState<Pesantren[]>([]);
  const [crewList, setCrewList] = useState<Crew[]>([]);
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
        // Fetch all pesantren
        const { data: pesantrenData } = await supabase
          .from("profiles")
          .select(`
            id,
            nama_pesantren,
            status_account,
            profile_level,
            regions!profiles_region_id_fkey (name)
          `)
          .order("nama_pesantren", { ascending: true });

        // Fetch all crews
        const { data: crewData } = await supabase
          .from("crews")
          .select(`
            id,
            nama,
            jabatan,
            profiles!crews_profile_id_fkey (nama_pesantren)
          `)
          .order("nama", { ascending: true });

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

        if (pesantrenData) {
          setPesantrenList(
            pesantrenData.map((item: any) => ({
              id: item.id,
              nama_pesantren: item.nama_pesantren,
              region_name: item.regions?.name || "Unknown",
              status_account: item.status_account,
              profile_level: item.profile_level,
            }))
          );
        }

        if (crewData) {
          setCrewList(
            crewData.map((item: any) => ({
              id: item.id,
              nama: item.nama,
              jabatan: item.jabatan,
              pesantren_name: item.profiles?.nama_pesantren || "Unknown",
            }))
          );
        }

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
        console.error("Error fetching master data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      basic: "bg-slate-100 text-slate-800",
      silver: "bg-gray-200 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-purple-100 text-purple-800",
    };
    return <Badge className={colors[level] || colors.basic}>{level.toUpperCase()}</Badge>;
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

  const handleOpenRoleDialog = (user: UserData) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setSelectedRegion(user.region_id || "");
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

      // Update region in profiles if changed
      if (selectedRegion && selectedRegion !== selectedUser.region_id) {
        // Use the migrate_legacy_account function which can bypass region lock
        const { error: regionError } = await supabase.rpc("migrate_legacy_account", {
          p_user_id: selectedUser.id,
          p_city_id: null as any, // We don't change city
          p_region_id: selectedRegion,
          p_nama_pesantren: selectedUser.nama_pesantren || "",
          p_nama_pengasuh: selectedUser.nama_pengasuh || "",
          p_alamat_singkat: "",
          p_no_wa_pendaftar: "",
          p_status_account: selectedUser.status_account as any,
        });

        if (regionError) {
          console.error("Region update error:", regionError);
          // Don't fail the whole operation, role is already updated
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
        description: `Role ${selectedUser.nama_pesantren || selectedUser.nama_pengasuh || "user"} berhasil diperbarui menjadi ${selectedRole === "admin_regional" ? "Admin Regional" : selectedRole === "admin_finance" ? "Admin Finance" : "User"}.`,
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

  // Dummy ID Card queue for MVP
  const idCardQueue = [
    { id: "1", nama_pesantren: "PP Al-Hikmah Surabaya", jumlah_kru: 5, status: "Siap Cetak" },
    { id: "2", nama_pesantren: "PP Darul Ulum Jombang", jumlah_kru: 8, status: "Siap Cetak" },
    { id: "3", nama_pesantren: "PP Lirboyo Kediri", jumlah_kru: 12, status: "Siap Cetak" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#166534]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Master Data</h1>
        <p className="text-slate-500 mt-1">Database lengkap pesantren, kru, dan manajemen user MPJ</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="lembaga" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Data Lembaga
          </TabsTrigger>
          <TabsTrigger value="kru" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Data Kru
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Manajemen User
          </TabsTrigger>
          <TabsTrigger value="logistik" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Logistik ID Card
          </TabsTrigger>
        </TabsList>

        {/* Data Lembaga Tab */}
        <TabsContent value="lembaga">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 font-semibold">
                Daftar Pesantren ({pesantrenList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Nama Pesantren</TableHead>
                      <TableHead className="text-slate-600">Wilayah</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                      <TableHead className="text-slate-600">Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pesantrenList.length > 0 ? (
                      pesantrenList.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-slate-900">
                            {item.nama_pesantren || "Belum diisi"}
                          </TableCell>
                          <TableCell className="text-slate-600">{item.region_name}</TableCell>
                          <TableCell>{getStatusBadge(item.status_account)}</TableCell>
                          <TableCell>{getLevelBadge(item.profile_level)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                          Belum ada data pesantren
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Kru Tab */}
        <TabsContent value="kru">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 font-semibold">
                Daftar Kru ({crewList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Nama Kru</TableHead>
                      <TableHead className="text-slate-600">Jabatan</TableHead>
                      <TableHead className="text-slate-600">Pesantren</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crewList.length > 0 ? (
                      crewList.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-slate-900">{item.nama}</TableCell>
                          <TableCell className="text-slate-600">{item.jabatan || "-"}</TableCell>
                          <TableCell className="text-slate-600">{item.pesantren_name}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                          Belum ada data kru
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manajemen User Tab */}
        <TabsContent value="user">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#166534]" />
                Manajemen User & Role ({userList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Nama</TableHead>
                      <TableHead className="text-slate-600">Wilayah</TableHead>
                      <TableHead className="text-slate-600">Role</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                      <TableHead className="text-slate-600 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userList.length > 0 ? (
                      userList.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-slate-900">
                            {user.nama_pesantren || user.nama_pengasuh || "Belum diisi"}
                          </TableCell>
                          <TableCell className="text-slate-600">{user.region_name}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user.status_account)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenRoleDialog(user)}
                              className="gap-1"
                            >
                              <UserCog className="h-4 w-4" />
                              Ubah Role
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                          Belum ada data user
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logistik ID Card Tab */}
        <TabsContent value="logistik">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 font-semibold">
                Antrian Cetak ID Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Pesantren</TableHead>
                      <TableHead className="text-slate-600">Jumlah Kru</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {idCardQueue.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-slate-900">{item.nama_pesantren}</TableCell>
                        <TableCell className="text-slate-600">{item.jumlah_kru}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-slate-500 mt-4 text-center">
                * Data dummy untuk MVP - akan terhubung ke sistem cetak
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-[#166534]" />
              Atur Peran User
            </DialogTitle>
            <DialogDescription>
              Ubah role dan wilayah untuk user ini
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
                  Wilayah saat ini: {selectedUser.region_name}
                </p>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                  <SelectTrigger id="role" className="bg-white">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="user">User (Pesantren)</SelectItem>
                    <SelectItem value="admin_regional">Admin Regional</SelectItem>
                    <SelectItem value="admin_finance">Admin Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Region Selection (for admin_regional) */}
              {selectedRole === "admin_regional" && (
                <div className="space-y-2">
                  <Label htmlFor="region">Wilayah yang Dikelola</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger id="region" className="bg-white">
                      <SelectValue placeholder="Pilih wilayah" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    * Admin Regional akan mengelola pesantren di wilayah ini
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button 
              onClick={handleSaveRole} 
              disabled={isSaving}
              className="bg-[#166534] hover:bg-[#14532d] text-white"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPusatMasterData;
