import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Edit, Users, RefreshCw } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type AccountStatus = Database["public"]["Enums"]["account_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];

interface UserProfile {
  id: string;
  nama_pesantren: string | null;
  nama_pengasuh: string | null;
  role: AppRole;
  status_account: AccountStatus;
  status_payment: PaymentStatus;
  region_id: string | null;
  region_name?: string;
  email?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Edit form state
  const [editRole, setEditRole] = useState<AppRole>("user");
  const [editStatus, setEditStatus] = useState<AccountStatus>("pending");
  const [editPayment, setEditPayment] = useState<PaymentStatus>("unpaid");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          nama_pesantren,
          nama_pengasuh,
          role,
          status_account,
          status_payment,
          region_id,
          regions (name)
        `)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const usersWithRegion = (profilesData || []).map((p: any) => ({
        id: p.id,
        nama_pesantren: p.nama_pesantren,
        nama_pengasuh: p.nama_pengasuh,
        role: p.role,
        status_account: p.status_account,
        status_payment: p.status_payment,
        region_id: p.region_id,
        region_name: p.regions?.name || "-",
      }));

      setUsers(usersWithRegion);
      setFilteredUsers(usersWithRegion);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegions = async () => {
    const { data } = await supabase.from("regions").select("id, name");
    setRegions(data || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchRegions();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.nama_pesantren?.toLowerCase().includes(query) ||
        u.nama_pengasuh?.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query) ||
        u.region_name?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const openEditDialog = (user: UserProfile) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus(user.status_account);
    setEditPayment(user.status_payment);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setIsSaving(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: editRole,
          status_account: editStatus,
          status_payment: editPayment,
        })
        .eq("id", editingUser.id);

      if (profileError) throw profileError;

      // Also update user_roles table for role sync
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: editRole })
        .eq("user_id", editingUser.id);

      if (roleError) {
        console.warn("Could not update user_roles:", roleError);
      }

      toast({
        title: "Berhasil",
        description: "Data pengguna berhasil diperbarui.",
      });

      // Refresh the list
      await fetchUsers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data pengguna.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role: AppRole) => {
    switch (role) {
      case "admin_pusat":
        return "bg-purple-500 hover:bg-purple-600";
      case "admin_regional":
        return "bg-blue-500 hover:bg-blue-600";
      case "admin_finance":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-slate-500 hover:bg-slate-600";
    }
  };

  const getStatusBadgeVariant = (status: AccountStatus) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
              <Badge variant="outline" className="ml-2">
                {users.length} users
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, role, region..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchUsers}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pesantren</TableHead>
                    <TableHead>Pengasuh</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada data pengguna.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.nama_pesantren || "-"}
                        </TableCell>
                        <TableCell>{user.nama_pengasuh || "-"}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(user.status_account)}>
                            {user.status_account}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.status_payment === "paid" ? "default" : "outline"}
                            className={
                              user.status_payment === "paid"
                                ? "bg-emerald-500 hover:bg-emerald-600"
                                : ""
                            }
                          >
                            {user.status_payment}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.region_name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User - GOD MODE</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="text-sm text-muted-foreground">
                <strong>Pesantren:</strong> {editingUser.nama_pesantren || "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Pengasuh:</strong> {editingUser.nama_pengasuh || "N/A"}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">user</SelectItem>
                    <SelectItem value="admin_regional">admin_regional</SelectItem>
                    <SelectItem value="admin_pusat">admin_pusat</SelectItem>
                    <SelectItem value="admin_finance">admin_finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status Account</label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as AccountStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">pending</SelectItem>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="rejected">rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status Payment</label>
                <Select value={editPayment} onValueChange={(v) => setEditPayment(v as PaymentStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">unpaid</SelectItem>
                    <SelectItem value="paid">paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
