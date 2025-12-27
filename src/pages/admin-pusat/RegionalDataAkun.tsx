import { useState, useEffect } from "react";
import { UserPlus, Shield, MapPin, Search, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  code: string;
  city_count: number;
  admin_count: number;
}

const RegionalDataAkun = () => {
  const { toast } = useToast();
  const [userList, setUserList] = useState<UserData[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog state
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch all users with their current roles
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

      // Fetch all regions with city counts
      const { data: regionsData } = await supabase
        .from("regions")
        .select("id, name, code")
        .order("name", { ascending: true });

      // Fetch cities count per region
      const { data: citiesData } = await supabase
        .from("cities")
        .select("region_id");

      if (userData) {
        setUserList(
          userData.map((item: any) => ({
            id: item.id,
            nama_pesantren: item.nama_pesantren,
            nama_pengasuh: item.nama_pengasuh,
            region_id: item.region_id,
            region_name: item.regions?.name || null,
            role: item.role,
            status_account: item.status_account,
          }))
        );
      }

      if (regionsData) {
        const cityCountMap: Record<string, number> = {};
        citiesData?.forEach(city => {
          cityCountMap[city.region_id] = (cityCountMap[city.region_id] || 0) + 1;
        });

        const adminCountMap: Record<string, number> = {};
        userData?.forEach((user: any) => {
          if (user.role === "admin_regional" && user.region_id) {
            adminCountMap[user.region_id] = (adminCountMap[user.region_id] || 0) + 1;
          }
        });

        setRegions(
          regionsData.map(region => ({
            ...region,
            city_count: cityCountMap[region.id] || 0,
            admin_count: adminCountMap[region.id] || 0,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleOpenAssignDialog = (user: UserData) => {
    setSelectedUser(user);
    setSelectedRegion(user.region_id || "");
    setIsAssignDialogOpen(true);
  };

  // STEP 3: Assign user to region as admin
  const handleAssignAdmin = async () => {
    if (!selectedUser) return;
    
    if (!selectedRegion) {
      toast({
        title: "Error",
        description: "Pilih regional terlebih dahulu. Pastikan regional sudah dibuat di halaman Mapping.",
        variant: "destructive",
      });
      return;
    }

    // Validate region exists
    const regionExists = regions.find(r => r.id === selectedRegion);
    if (!regionExists) {
      toast({
        title: "Error",
        description: "Regional tidak ditemukan. Buat regional terlebih dahulu di halaman Mapping.",
        variant: "destructive",
      });
      return;
    }

    // Check if region has cities mapped
    if (regionExists.city_count === 0) {
      const proceed = confirm(
        `Regional "${regionExists.name}" belum memiliki kota cakupan. Lanjutkan assign admin?`
      );
      if (!proceed) return;
    }

    setIsSaving(true);
    try {
      // Update user_roles table
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({
          user_id: selectedUser.id,
          role: "admin_regional" as AppRole,
        }, {
          onConflict: "user_id"
        });

      if (roleError) throw roleError;

      // Update profile with region_id via RPC
      const { error: profileError } = await supabase.rpc("migrate_legacy_account", {
        p_user_id: selectedUser.id,
        p_city_id: null as any,
        p_region_id: selectedRegion,
        p_nama_pesantren: selectedUser.nama_pesantren || "",
        p_nama_pengasuh: selectedUser.nama_pengasuh || "",
        p_alamat_singkat: "",
        p_no_wa_pendaftar: "",
        p_status_account: selectedUser.status_account as any,
      });

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      // Update local state
      setUserList(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { 
              ...u, 
              role: "admin_regional" as AppRole,
              region_id: selectedRegion,
              region_name: regionExists.name
            }
          : u
      ));

      // Update region admin count
      setRegions(prev => prev.map(r => 
        r.id === selectedRegion 
          ? { ...r, admin_count: r.admin_count + 1 }
          : r
      ));

      toast({
        title: "✅ Step 3 Selesai",
        description: `${selectedUser.nama_pesantren || selectedUser.nama_pengasuh || "User"} berhasil diangkat sebagai Admin ${regionExists.name}.`,
      });

      setIsAssignDialogOpen(false);
    } catch (error: any) {
      console.error("Error assigning admin:", error);
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat mengangkat admin.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter users - show only regular users or those without region
  const filteredUsers = userList.filter(u => {
    const matchesSearch = 
      (u.nama_pesantren?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       u.nama_pengasuh?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Only show users who are not already admin_pusat or admin_finance
    const isPromotable = u.role === "user" || u.role === "admin_regional";
    
    return (searchQuery === "" || matchesSearch) && isPromotable;
  });

  // Current admin_regional list
  const adminRegionalList = userList.filter(u => u.role === "admin_regional");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Akun Regional</h1>
        <p className="text-muted-foreground mt-1">Kelola dan angkat Admin Regional untuk setiap wilayah</p>
      </div>

      {/* Workflow Steps Indicator */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">
                1
              </div>
              <span className="text-muted-foreground">Buat Regional</span>
              <Badge variant="outline" className="text-xs">Selesai di Mapping</Badge>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">
                2
              </div>
              <span className="text-muted-foreground">Mapping Kota</span>
              <Badge variant="outline" className="text-xs">Selesai di Mapping</Badge>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="font-medium text-foreground">Assign Admin</span>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regions Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Regional Tersedia ({regions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {regions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Belum ada regional</p>
              <p className="text-sm">Buat regional terlebih dahulu di halaman Mapping</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {regions.map(region => (
                <div 
                  key={region.id} 
                  className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">{region.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {region.city_count} Kota
                      </Badge>
                      <Badge 
                        variant={region.admin_count > 0 ? "default" : "outline"} 
                        className={`text-xs ${region.admin_count > 0 ? "bg-green-100 text-green-800" : ""}`}
                      >
                        {region.admin_count} Admin
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Admin Regional */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="pb-3 bg-blue-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Regional Aktif ({adminRegionalList.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {adminRegionalList.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Belum ada Admin Regional</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Wilayah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminRegionalList.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.nama_pesantren || user.nama_pengasuh || "Belum diisi"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.region_name || "Belum diatur"}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status_account)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAssignDialog(user)}
                        className="gap-1"
                      >
                        <Shield className="h-4 w-4" />
                        Ubah Regional
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign New Admin */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Angkat Admin Regional Baru
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari user berdasarkan nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {regions.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Belum ada regional</p>
                <p className="text-sm text-yellow-700">
                  Anda harus membuat regional terlebih dahulu sebelum dapat mengangkat admin. 
                  Kunjungi halaman Mapping Regional.
                </p>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Wilayah Saat Ini</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.nama_pesantren || user.nama_pengasuh || "Belum diisi"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.region_name || "-"}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status_account)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleOpenAssignDialog(user)}
                        disabled={regions.length === 0}
                        className="gap-1"
                      >
                        <UserPlus className="h-4 w-4" />
                        {user.role === "admin_regional" ? "Ubah" : "Angkat"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    {searchQuery ? "Tidak ada user yang cocok" : "Tidak ada user yang dapat diangkat"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Angkat Admin Regional</DialogTitle>
            <DialogDescription>
              Step 3: Assign user ke regional yang sudah dibuat
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">User</Label>
              <p className="font-medium text-foreground">
                {selectedUser?.nama_pesantren || selectedUser?.nama_pengasuh || "User"}
              </p>
            </div>
            <div>
              <Label>Pilih Regional</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih regional..." />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region.id} value={region.id}>
                      <div className="flex items-center gap-2">
                        <span>{region.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({region.city_count} kota, {region.admin_count} admin)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {regions.length === 0 && (
                <p className="text-sm text-destructive mt-1">
                  Tidak ada regional. Buat regional di halaman Mapping terlebih dahulu.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleAssignAdmin} 
              disabled={isSaving || regions.length === 0}
            >
              {isSaving ? "Menyimpan..." : "Angkat Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegionalDataAkun;
