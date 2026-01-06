import { useState, useEffect } from "react";
import { Settings, User, Lock, UserPlus, Search, Trash2, Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatNIAM } from "@/lib/id-utils";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AdminUser {
  id: string;
  user_id: string;
  nama: string;
  niam: string | null;
  jabatan: string | null;
  region_id: string | null;
  region_name: string | null;
  role: AppRole;
}

interface CrewOption {
  id: string;
  profile_id: string;
  nama: string;
  niam: string | null;
  jabatan: string | null;
  pesantren_name: string | null;
  region_id: string | null;
  region_name: string | null;
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
  
  // Admin management state
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add admin dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [crewSearchQuery, setCrewSearchQuery] = useState("");
  const [crewOptions, setCrewOptions] = useState<CrewOption[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<CrewOption | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>("admin_regional");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [isSearchingCrew, setIsSearchingCrew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all admins by joining user_roles with crews
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin_pusat", "admin_regional", "admin_finance"]);

      if (rolesData && rolesData.length > 0) {
        // Get crew info for each admin
        const adminPromises = rolesData.map(async (roleData) => {
          const { data: crewData } = await supabase
            .from("crews")
            .select(`
              id,
              nama,
              niam,
              jabatan,
              profile_id,
              profiles!crews_profile_id_fkey (region_id, regions!profiles_region_id_fkey (name))
            `)
            .eq("profile_id", roleData.user_id)
            .limit(1)
            .single();

          if (crewData) {
            return {
              id: crewData.id,
              user_id: roleData.user_id,
              nama: crewData.nama,
              niam: crewData.niam,
              jabatan: crewData.jabatan,
              region_id: (crewData.profiles as any)?.region_id || null,
              region_name: (crewData.profiles as any)?.regions?.name || null,
              role: roleData.role,
            };
          }
          return null;
        });

        const admins = (await Promise.all(adminPromises)).filter(Boolean) as AdminUser[];
        setAdminList(admins);
      }

      // Fetch all regions
      const { data: regionsData } = await supabase
        .from("regions")
        .select("id, name")
        .order("name", { ascending: true });

      if (regionsData) {
        setRegions(regionsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
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

  // Search crew from database
  const searchCrew = async (query: string) => {
    if (query.length < 2) {
      setCrewOptions([]);
      return;
    }

    setIsSearchingCrew(true);
    try {
      const { data } = await supabase
        .from("crews")
        .select(`
          id,
          profile_id,
          nama,
          niam,
          jabatan,
          profiles!crews_profile_id_fkey (nama_pesantren, region_id, regions!profiles_region_id_fkey (name))
        `)
        .ilike("nama", `%${query}%`)
        .limit(10);

      if (data) {
        // Filter out already assigned admins
        const existingAdminUserIds = adminList.map(a => a.user_id);
        const filtered = data.filter(c => !existingAdminUserIds.includes(c.profile_id));
        
        setCrewOptions(filtered.map((item: any) => ({
          id: item.id,
          profile_id: item.profile_id,
          nama: item.nama,
          niam: item.niam,
          jabatan: item.jabatan,
          pesantren_name: item.profiles?.nama_pesantren || null,
          region_id: item.profiles?.region_id || null,
          region_name: item.profiles?.regions?.name || null,
        })));
      }
    } catch (error) {
      console.error("Error searching crew:", error);
    } finally {
      setIsSearchingCrew(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedCrew) {
      toast({ title: "Error", description: "Pilih kru terlebih dahulu", variant: "destructive" });
      return;
    }

    if (selectedRole === "admin_regional" && !selectedRegion) {
      toast({ title: "Error", description: "Pilih wilayah untuk Admin Regional", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      // Upsert to user_roles table
      const { error } = await supabase
        .from("user_roles")
        .upsert({
          user_id: selectedCrew.profile_id,
          role: selectedRole,
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `${selectedCrew.nama} berhasil ditambahkan sebagai ${selectedRole === 'admin_pusat' ? 'Admin Pusat' : selectedRole === 'admin_regional' ? 'Admin Regional' : 'Admin Finance'}`,
      });

      setIsAddDialogOpen(false);
      setSelectedCrew(null);
      setCrewSearchQuery("");
      setCrewOptions([]);
      fetchData();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!deleteTarget) return;

    setIsSaving(true);
    try {
      // Demote to regular user
      const { error } = await supabase
        .from("user_roles")
        .update({ role: "user" })
        .eq("user_id", deleteTarget.user_id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `${deleteTarget.nama} tidak lagi menjadi admin.`,
      });

      setDeleteTarget(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter by role type
  const adminPusatList = adminList.filter(a => a.role === "admin_pusat");
  const adminRegionalList = adminList.filter(a => a.role === "admin_regional");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">Kelola akun dan personil admin</p>
      </div>

      {/* Profile Section */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-foreground font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profil Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <Input 
                value={user?.email || ""} 
                disabled 
                className="mt-1 bg-muted"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <Input 
                value="Admin Pusat" 
                disabled 
                className="mt-1 bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-foreground font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Ganti Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Password Lama</Label>
              <Input 
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password lama"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Password Baru</Label>
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Simpan Password
          </Button>
        </CardContent>
      </Card>

      {/* Admin Management Section */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Kelola Personil Admin
            </CardTitle>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Tambah Admin
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tambah atau hapus personil admin dari database kru yang sudah terdaftar.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Admin Pusat Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-purple-600" />
              <h3 className="font-semibold text-foreground">Tim Pusat ({adminPusatList.length})</h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-muted-foreground">NIAM</TableHead>
                        <TableHead className="text-muted-foreground">Nama</TableHead>
                        <TableHead className="text-muted-foreground">Jabatan</TableHead>
                        <TableHead className="text-muted-foreground">Role</TableHead>
                        <TableHead className="text-muted-foreground text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminPusatList.length > 0 ? (
                        adminPusatList.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell className="font-mono text-sm">
                              {admin.niam ? formatNIAM(admin.niam, true) : "-"}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{admin.nama}</TableCell>
                            <TableCell className="text-muted-foreground">{admin.jabatan || "-"}</TableCell>
                            <TableCell>{getRoleBadge(admin.role)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget(admin)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                            Belum ada Admin Pusat
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {adminPusatList.length > 0 ? (
                    adminPusatList.map((admin) => (
                      <div key={admin.id} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{admin.nama}</p>
                            {admin.niam && (
                              <p className="text-sm font-mono text-primary">{formatNIAM(admin.niam, true)}</p>
                            )}
                            <p className="text-sm text-muted-foreground">{admin.jabatan || "-"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(admin.role)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(admin)}
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Belum ada Admin Pusat</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="border-t border-border" />

          {/* Admin Regional Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-foreground">Admin Regional ({adminRegionalList.length})</h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-muted-foreground">NIAM</TableHead>
                        <TableHead className="text-muted-foreground">Nama</TableHead>
                        <TableHead className="text-muted-foreground">Jabatan</TableHead>
                        <TableHead className="text-muted-foreground">Wilayah</TableHead>
                        <TableHead className="text-muted-foreground text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminRegionalList.length > 0 ? (
                        adminRegionalList.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell className="font-mono text-sm">
                              {admin.niam ? formatNIAM(admin.niam, true) : "-"}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{admin.nama}</TableCell>
                            <TableCell className="text-muted-foreground">{admin.jabatan || "-"}</TableCell>
                            <TableCell className="text-muted-foreground">{admin.region_name || "-"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget(admin)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                            Belum ada Admin Regional
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {adminRegionalList.length > 0 ? (
                    adminRegionalList.map((admin) => (
                      <div key={admin.id} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{admin.nama}</p>
                            {admin.niam && (
                              <p className="text-sm font-mono text-primary">{formatNIAM(admin.niam, true)}</p>
                            )}
                            <p className="text-sm text-muted-foreground">{admin.jabatan || "-"}</p>
                            <Badge variant="outline" className="mt-1 text-xs">{admin.region_name || "-"}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(admin)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Belum ada Admin Regional</p>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Tambah Admin Baru
            </DialogTitle>
            <DialogDescription>
              Cari kru dari database dan tetapkan sebagai admin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Crew Search */}
            <div className="space-y-2">
              <Label>Cari Kru</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={crewSearchQuery}
                  onChange={(e) => {
                    setCrewSearchQuery(e.target.value);
                    searchCrew(e.target.value);
                  }}
                  placeholder="Ketik nama kru (min. 2 karakter)"
                  className="pl-10"
                />
              </div>
              
              {/* Search Results */}
              {crewOptions.length > 0 && (
                <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                  {crewOptions.map((crew) => (
                    <button
                      key={crew.id}
                      type="button"
                      onClick={() => {
                        setSelectedCrew(crew);
                        setCrewSearchQuery(crew.nama);
                        setCrewOptions([]);
                        // Auto-set region if available
                        if (crew.region_id) {
                          setSelectedRegion(crew.region_id);
                        }
                      }}
                      className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                        selectedCrew?.id === crew.id ? 'bg-primary/10' : ''
                      }`}
                    >
                      <p className="font-medium text-foreground">{crew.nama}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {crew.niam && <span className="font-mono">{formatNIAM(crew.niam, true)}</span>}
                        <span>•</span>
                        <span>{crew.pesantren_name || "-"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {isSearchingCrew && (
                <p className="text-sm text-muted-foreground">Mencari...</p>
              )}
            </div>

            {/* Selected Crew Info */}
            {selectedCrew && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="font-medium text-foreground">{selectedCrew.nama}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCrew.jabatan || "Tanpa Jabatan"} • {selectedCrew.pesantren_name || "-"}
                </p>
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Pilih Role</Label>
              <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as AppRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin_regional">Admin Regional</SelectItem>
                  <SelectItem value="admin_finance">Admin Finance</SelectItem>
                  <SelectItem value="admin_pusat">Admin Pusat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Region Selection - Only for admin_regional */}
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

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setSelectedCrew(null);
              setCrewSearchQuery("");
              setCrewOptions([]);
            }}>
              Batal
            </Button>
            <Button 
              onClick={handleAddAdmin} 
              disabled={!selectedCrew || isSaving}
              className="bg-primary"
            >
              {isSaving ? "Menyimpan..." : "Tambah Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Admin Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus dari Tim Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.nama}</strong> akan dikembalikan menjadi user biasa dan tidak lagi memiliki akses admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveAdmin} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? "Menghapus..." : "Hapus dari Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPusatPengaturan;
