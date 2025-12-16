import { useState } from "react";
import { Users, Mail, Phone, Shield, Edit2, Plus, Eye, EyeOff, Search, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock users data for searchable combobox
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const mockUsers: User[] = [
  { id: "USR-001", name: "Ahmad Fauzi", email: "ahmad.fauzi@gmail.com", phone: "081234567890" },
  { id: "USR-002", name: "Siti Aminah", email: "siti.aminah@gmail.com", phone: "082345678901" },
  { id: "USR-003", name: "Muhammad Hasan", email: "m.hasan@gmail.com", phone: "083456789012" },
  { id: "USR-004", name: "Fatimah Zahra", email: "fatimah.z@gmail.com", phone: "084567890123" },
  { id: "USR-005", name: "Abdullah Rahman", email: "abdullah.r@gmail.com", phone: "085678901234" },
  { id: "USR-006", name: "Khadijah Nur", email: "khadijah.nur@gmail.com", phone: "086789012345" },
  { id: "USR-007", name: "Umar Faruk", email: "umar.faruk@gmail.com", phone: "087890123456" },
  { id: "USR-008", name: "Aisyah Putri", email: "aisyah.p@gmail.com", phone: "088901234567" },
  { id: "USR-009", name: "Ibrahim Malik", email: "ibrahim.m@gmail.com", phone: "089012345678" },
  { id: "USR-010", name: "Zainab Husna", email: "zainab.h@gmail.com", phone: "081123456789" },
];

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  regional: string;
  status: "active" | "inactive";
  createdAt: string;
}

const initialAccounts: AdminAccount[] = [
  {
    id: "ADM-001",
    name: "Ahmad Fauzi",
    email: "admin.malang@mpj.id",
    phone: "081234567890",
    regional: "MPJ Malang Raya",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "ADM-002",
    name: "Siti Aminah",
    email: "admin.surabaya@mpj.id",
    phone: "082345678901",
    regional: "MPJ Surabaya Raya",
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "ADM-003",
    name: "Muhammad Hasan",
    email: "admin.tapalkuda@mpj.id",
    phone: "083456789012",
    regional: "MPJ Tapal Kuda",
    status: "active",
    createdAt: "2024-02-01",
  },
  {
    id: "ADM-004",
    name: "Fatimah Zahra",
    email: "admin.kediri@mpj.id",
    phone: "084567890123",
    regional: "MPJ Kediri Raya",
    status: "active",
    createdAt: "2024-02-10",
  },
  {
    id: "ADM-005",
    name: "Abdullah Rahman",
    email: "admin.madura@mpj.id",
    phone: "085678901234",
    regional: "MPJ Madura Raya",
    status: "inactive",
    createdAt: "2024-03-01",
  },
];

const regionals = [
  "MPJ Malang Raya",
  "MPJ Surabaya Raya",
  "MPJ Tapal Kuda",
  "MPJ Kediri Raya",
  "MPJ Madura Raya",
  "MPJ Jombang Raya",
  "MPJ Madiun Raya",
  "MPJ Blitar Raya",
  "MPJ Pasuruan-Probolinggo",
];

const RegionalAkun = () => {
  const [accounts, setAccounts] = useState<AdminAccount[]>(initialAccounts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    regional: "",
    password: "",
  });

  // Filter out users who are already assigned as regional admins
  const assignedEmails = accounts.map((acc) => acc.email.toLowerCase());
  const availableUsers = mockUsers.filter(
    (user) => !assignedEmails.includes(user.email.toLowerCase())
  );

  const handleCreate = () => {
    setEditingAccount(null);
    setSelectedUser(null);
    setFormData({ name: "", email: "", phone: "", regional: "", password: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (account: AdminAccount) => {
    setEditingAccount(account);
    setSelectedUser(null);
    setFormData({
      name: account.name,
      email: account.email,
      phone: account.phone,
      regional: account.regional,
      password: "",
    });
    setIsDialogOpen(true);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
    setUserSearchOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.regional) {
      toast.error("Lengkapi data yang wajib diisi!");
      return;
    }

    if (editingAccount) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === editingAccount.id
            ? {
                ...acc,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                regional: formData.regional,
              }
            : acc
        )
      );
      toast.success("Akun berhasil diperbarui!");
    } else {
      const newAccount: AdminAccount = {
        id: `ADM-${String(accounts.length + 1).padStart(3, "0")}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        regional: formData.regional,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setAccounts((prev) => [...prev, newAccount]);
      toast.success("Akun admin regional berhasil dibuat!");
    }

    setIsDialogOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? { ...acc, status: acc.status === "active" ? "inactive" : "active" }
          : acc
      )
    );
    toast.success("Status akun berhasil diubah!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Akun Regional</h1>
          <p className="text-slate-500">Kelola akun admin untuk setiap koordinator regional</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Admin
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Admin</p>
                <p className="text-2xl font-bold text-slate-800">{accounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {accounts.filter((a) => a.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Non-Aktif</p>
                <p className="text-2xl font-bold text-slate-500">
                  {accounts.filter((a) => a.status === "inactive").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Daftar Admin Regional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-600">Nama</TableHead>
                  <TableHead className="text-slate-600">Email</TableHead>
                  <TableHead className="text-slate-600">No. HP</TableHead>
                  <TableHead className="text-slate-600">Regional</TableHead>
                  <TableHead className="text-slate-600">Status</TableHead>
                  <TableHead className="text-slate-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id} className="border-slate-100">
                    <TableCell>
                      <p className="font-medium text-slate-800">{account.name}</p>
                      <p className="text-xs text-slate-500">{account.id}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {account.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {account.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                        {account.regional}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center text-xs font-medium px-2 py-1 rounded-full",
                          account.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {account.status === "active" ? "Aktif" : "Non-Aktif"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(account)}
                          className="text-slate-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(account.id)}
                          className={cn(
                            account.status === "active"
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          )}
                        >
                          {account.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              {editingAccount ? "Edit Admin" : "Tambah Admin Regional"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!editingAccount && (
              <div className="space-y-2">
                <Label>Cari User *</Label>
                <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userSearchOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedUser ? (
                        <span>{selectedUser.name} - {selectedUser.email}</span>
                      ) : (
                        <span className="text-muted-foreground">Cari user... ({availableUsers.length} tersedia)</span>
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 bg-white" align="start">
                    <Command>
                      <CommandInput placeholder="Ketik nama atau email..." />
                      <CommandList>
                        <CommandEmpty>User tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {availableUsers.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              Semua user sudah terdaftar sebagai admin.
                            </div>
                          ) : (
                            availableUsers.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={`${user.name} ${user.email}`}
                                onSelect={() => handleSelectUser(user)}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{user.name}</span>
                                  <span className="text-xs text-muted-foreground">{user.email} • {user.phone}</span>
                                </div>
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
                readOnly={!editingAccount && !!selectedUser}
                className={!editingAccount && selectedUser ? "bg-slate-50" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@mpj.id"
                readOnly={!editingAccount && !!selectedUser}
                className={!editingAccount && selectedUser ? "bg-slate-50" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">No. WhatsApp</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                readOnly={!editingAccount && !!selectedUser}
                className={!editingAccount && selectedUser ? "bg-slate-50" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regional">Regional *</Label>
              <Select
                value={formData.regional}
                onValueChange={(value) => setFormData({ ...formData, regional: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih regional" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {regionals.map((regional) => (
                    <SelectItem key={regional} value={regional}>
                      {regional}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!editingAccount && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Masukkan password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {editingAccount ? "Simpan Perubahan" : "Buat Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegionalAkun;
