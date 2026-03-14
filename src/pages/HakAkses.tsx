import { useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  LayoutDashboard,
  Map,
  CalendarDays,
  Layers,
  Settings,
  Globe,
  FileText,
  IdCard,
  Users,
  Image as ImageIcon,
  ClipboardList,
  BarChart3,
  UserCheck,
  AlertCircle,
  Download,
  Banknote,
  CreditCard,
  MonitorDot,
  UserCog,
  Swords,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ─── Menu Groups — per fitur/modul, ID & label sesuai ALL_MENUS di CmsLayout ──
const menuGroups = [
  {
    id: "identitas-administrasi",
    label: "Identitas & Administrasi",
    icon: IdCard,
    items: [
      { id: "user-identitas",          label: "IDENTITAS PESANTREN", icon: IdCard },
      { id: "user-administrasi",       label: "ADMINISTRASI",        icon: ClipboardList },
      { id: "admin-pusat-administrasi",label: "ADMINISTRASI",        icon: ClipboardList },
    ],
  },
  {
    id: "kru",
    label: "Manajemen Kru",
    icon: Users,
    items: [
      { id: "user-tim", label: "MANAJEMEN KRU", icon: Users },
      { id: "user-eid", label: "EID ASET",      icon: ImageIcon },
    ],
  },
  {
    id: "event",
    label: "Event",
    icon: CalendarDays,
    items: [
      { id: "user-event",                    label: "EVENT",           icon: CalendarDays },
      { id: "admin-pusat-manajemen-event",   label: "MANAJEMEN EVENT", icon: CalendarDays },
      { id: "admin-regional-manajemen-event",label: "MANAJEMEN EVENT", icon: CalendarDays },
    ],
  },
  {
    id: "verifikasi",
    label: "Verifikasi",
    icon: UserCheck,
    items: [
      { id: "admin-regional-validasi-pendaftar", label: "VALIDASI PENDAFTAR", icon: UserCheck },
      { id: "admin-finance-verifikasi",          label: "VERIFIKASI",         icon: UserCheck },
    ],
  },
  {
    id: "laporan-dokumen",
    label: "Laporan & Dokumen",
    icon: FileText,
    items: [
      { id: "admin-regional-laporan-dokumentasi", label: "LAPORAN & DOKUMENTASI", icon: FileText },
      { id: "admin-regional-late-payment",        label: "LATE PAYMENT",          icon: AlertCircle },
      { id: "admin-regional-download-center",     label: "DOWNLOAD CENTER",       icon: Download },
      { id: "admin-finance-laporan",              label: "LAPORAN",               icon: FileText },
    ],
  },
  {
    id: "master",
    label: "Master Data",
    icon: BarChart3,
    items: [
      { id: "admin-pusat-master-data",     label: "MASTER DATA",     icon: BarChart3 },
      { id: "admin-pusat-master-regional", label: "MASTER REGIONAL", icon: Map },
      { id: "admin-regional-data-master",  label: "DATA MASTER",     icon: BarChart3 },
    ],
  },
  {
    id: "keuangan",
    label: "Keuangan",
    icon: Banknote,
    items: [
      { id: "admin-finance-harga",              label: "HARGA",              icon: Banknote },
      { id: "admin-finance-clearing",           label: "CLEARING",           icon: CreditCard },
      { id: "admin-finance-regional-monitoring",label: "REGIONAL MONITORING",icon: MonitorDot },
      { id: "super-admin-finance",              label: "FINANCE",            icon: DollarSign },
    ],
  },
  {
    id: "hub-militansi",
    label: "Hub & Militansi",
    icon: Globe,
    items: [
      { id: "user-hub",                        label: "MPJ HUB",              icon: Globe },
      { id: "admin-pusat-mpj-hub",             label: "MPJ HUB",              icon: Globe },
      { id: "admin-pusat-manajemen-militansi", label: "MANAJEMEN MILITANSI",  icon: Swords },
    ],
  },
  {
    id: "user-akses",
    label: "User & Akses",
    icon: UserCog,
    items: [
      { id: "super-admin-user-management", label: "USER MANAGEMENT", icon: UserCog },
      { id: "super-admin-hierarchy",       label: "HIERARKI DATA",   icon: Layers },
      { id: "super-admin-hak-akses",       label: "HAK AKSES",       icon: Shield },
    ],
  },
  {
    id: "pengaturan",
    label: "Pengaturan",
    icon: Settings,
    items: [
      { id: "user-pengaturan",          label: "PENGATURAN", icon: Settings },
      { id: "admin-pusat-pengaturan",   label: "PENGATURAN", icon: Settings },
      { id: "admin-regional-pengaturan",label: "PENGATURAN", icon: Settings },
      { id: "admin-finance-pengaturan", label: "PENGATURAN", icon: Settings },
      { id: "super-admin-settings",     label: "SETTINGS",   icon: Settings },
    ],
  },
];

// Flat list of all items
const allMenuItems = menuGroups.flatMap((g) => g.items);

// ─── Types ────────────────────────────────────────────────────────────────────
interface HakAksesItem {
  id: string;
  nama: string;
  role: string;
  permissions: string;
  created_at: string;
}

// ─── Dummy data ───────────────────────────────────────────────────────────────
const dummyHakAkses: HakAksesItem[] = [
  {
    id: "1",
    nama: "Admin Pusat",
    role: "admin_pusat",
    permissions: "admin-pusat-dashboard:read, user-identitas:read, admin-pusat-administrasi:read, admin-pusat-administrasi:create, admin-pusat-administrasi:update, admin-pusat-master-data:read, admin-pusat-master-regional:read, admin-pusat-manajemen-event:read, admin-pusat-manajemen-event:create, admin-pusat-pengaturan:read",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    nama: "Admin Regional",
    role: "admin_regional",
    permissions: "admin-regional-dashboard:read, admin-regional-validasi-pendaftar:read, admin-regional-validasi-pendaftar:update, admin-regional-data-master:read, admin-pusat-master-regional:read, admin-regional-manajemen-event:read, admin-regional-laporan-dokumentasi:read, admin-regional-download-center:read",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    nama: "Admin Finance",
    role: "admin_finance",
    permissions: "admin-finance-dashboard:read, admin-finance-verifikasi:read, admin-finance-verifikasi:update, admin-finance-laporan:read, admin-finance-harga:read, admin-finance-harga:update, admin-finance-clearing:read, admin-finance-regional-monitoring:read",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    nama: "User (Media Pesantren)",
    role: "user",
    permissions: "user-beranda:read, user-identitas:read, user-identitas:update, user-administrasi:read, user-tim:read, user-tim:create, user-tim:update, user-eid:read, user-event:read, user-hub:read, admin-pusat-pengaturan:read",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    nama: "Super Admin",
    role: "super_admin",
    permissions: ":read, super-admin-user-management:read, super-admin-user-management:create, super-admin-user-management:update, super-admin-user-management:delete, super-admin-hierarchy:read, super-admin-hak-akses:read, super-admin-hak-akses:create, super-admin-hak-akses:update, super-admin-hak-akses:delete, super-admin-settings:read, super-admin-settings:update",
    created_at: new Date().toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugifyRoleCode(nama: string): string {
  return nama.toLowerCase().trim().replace(/\s+/g, "_");
}

function parsePermissions(str: string): string[] {
  return str.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
}

function getPermissionColor(permission: string): string {
  if (permission.includes(":create"))
    return "bg-blue-100 text-blue-800 border-blue-200";
  if (permission.includes(":update"))
    return "bg-amber-100 text-amber-800 border-amber-200";
  if (permission.includes(":delete"))
    return "bg-red-100 text-red-800 border-red-200";
  if (permission.includes(":read"))
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
}

const CRUD_ACTIONS = ["create", "read", "update", "delete"] as const;

// ─── Permission Checkboxes ────────────────────────────────────────────────────
function PermissionCheckboxes({
  path,
  permissions,
  onChange,
}: {
  path: string;
  permissions: Record<string, boolean>;
  onChange: (key: string, value: boolean) => void;
}) {
  const allChecked = CRUD_ACTIONS.every((a) => permissions[`${path}_${a}`]);

  const handleAll = (checked: boolean) => {
    CRUD_ACTIONS.forEach((a) => onChange(`${path}_${a}`, checked));
    onChange(`${path}_all`, checked);
  };

  return (
    <div className="px-4 py-3 bg-white">
      <div className="grid grid-cols-3 gap-2 mb-2">
        <label
          htmlFor={`${path}_all`}
          className="flex items-center gap-1.5 bg-gray-100 rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <Checkbox
            id={`${path}_all`}
            checked={allChecked}
            onCheckedChange={(c) => handleAll(!!c)}
            className="h-3.5 w-3.5"
          />
          <span className="text-xs font-medium text-gray-700">All</span>
        </label>
        <label
          htmlFor={`${path}_create`}
          className="flex items-center gap-1.5 bg-blue-50 rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <Checkbox
            id={`${path}_create`}
            checked={!!permissions[`${path}_create`]}
            onCheckedChange={(c) => onChange(`${path}_create`, !!c)}
            className="h-3.5 w-3.5"
          />
          <span className="text-xs font-medium text-blue-700">Create</span>
        </label>
        <label
          htmlFor={`${path}_read`}
          className="flex items-center gap-1.5 bg-emerald-50 rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-emerald-100 transition-colors"
        >
          <Checkbox
            id={`${path}_read`}
            checked={!!permissions[`${path}_read`]}
            onCheckedChange={(c) => onChange(`${path}_read`, !!c)}
            className="h-3.5 w-3.5"
          />
          <span className="text-xs font-medium text-emerald-700">Read</span>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label
          htmlFor={`${path}_update`}
          className="flex items-center gap-1.5 bg-amber-50 rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-amber-100 transition-colors"
        >
          <Checkbox
            id={`${path}_update`}
            checked={!!permissions[`${path}_update`]}
            onCheckedChange={(c) => onChange(`${path}_update`, !!c)}
            className="h-3.5 w-3.5"
          />
          <span className="text-xs font-medium text-amber-700">Update</span>
        </label>
        <label
          htmlFor={`${path}_delete`}
          className="flex items-center gap-1.5 bg-red-50 rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-red-100 transition-colors"
        >
          <Checkbox
            id={`${path}_delete`}
            checked={!!permissions[`${path}_delete`]}
            onCheckedChange={(c) => onChange(`${path}_delete`, !!c)}
            className="h-3.5 w-3.5"
          />
          <span className="text-xs font-medium text-red-700">Delete</span>
        </label>
      </div>
    </div>
  );
}

// ─── Menu Group Permission Card ───────────────────────────────────────────────
function MenuGroupPermissionCard({
  group,
  permissions,
  onChange,
}: {
  group: (typeof menuGroups)[0];
  permissions: Record<string, boolean>;
  onChange: (key: string, value: boolean) => void;
}) {
  const [isGroupOpen, setIsGroupOpen] = useState(true);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const GroupIcon = group.icon;

  const toggleItem = (path: string) => {
    setOpenItems((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors border-b"
        onClick={() => setIsGroupOpen(!isGroupOpen)}
      >
        <div className="flex items-center gap-2">
          <GroupIcon className="h-4 w-4 text-emerald-700" />
          <span className="font-semibold text-sm text-gray-800">{group.label}</span>
        </div>
        {isGroupOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isGroupOpen && (
        <div className="divide-y">
          {group.items.map((item) => {
            const ItemIcon = item.icon;
            const isItemOpen = !!openItems[item.id];

            return (
              <div key={item.id}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-center gap-2">
                    <ItemIcon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  {isItemOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </button>

                {isItemOpen && (
                  <PermissionCheckboxes
                    path={item.id}
                    permissions={permissions}
                    onChange={onChange}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const HakAkses = () => {
  const { toast } = useToast();

  const [hakAksesList, setHakAksesList] = useState<HakAksesItem[]>(dummyHakAkses);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: "",
    role: "",
    permissions: {} as Record<string, boolean>,
  });

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"role" | "created_at">("role");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ── Filtering & Sorting ──
  const filtered = hakAksesList
    .filter(
      (item) =>
        search === "" ||
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "role") return a.role.localeCompare(b.role);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginationStart = (currentPage - 1) * itemsPerPage + 1;
  const paginationEnd = Math.min(currentPage * itemsPerPage, filtered.length);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Form helpers ──
  const resetForm = () => {
    setFormData({ nama: "", role: "", permissions: {} });
    setFormMode("create");
    setEditingId(null);
  };

  const toggleForm = () => {
    if (showForm) resetForm();
    setShowForm(!showForm);
  };

  const handlePermissionChange = (key: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: value },
    }));
  };

  const checkAll = () => {
    const next: Record<string, boolean> = {};
    allMenuItems.forEach((item) => {
      const k = item.id;
      CRUD_ACTIONS.forEach((a) => (next[`${k}_${a}`] = true));
      next[`${k}_all`] = true;
    });
    setFormData((prev) => ({ ...prev, permissions: next }));
  };

  const uncheckAll = () => {
    setFormData((prev) => ({ ...prev, permissions: {} }));
  };

  const collectPermissions = (): string => {
    const perms: string[] = [];
    allMenuItems.forEach((item) => {
      CRUD_ACTIONS.forEach((action) => {
        if (formData.permissions[`${item.id}_${action}`]) {
          perms.push(`${item.id}:${action}`);
        }
      });
    });
    return perms.join(", ");
  };

  const parsePermissionsToFormState = (permStr: string) => {
    const perms = parsePermissions(permStr);
    const next: Record<string, boolean> = {};
    perms.forEach((perm) => {
      const colonIdx = perm.lastIndexOf(":");
      const path = perm.substring(0, colonIdx);
      const action = perm.substring(colonIdx + 1);
      if (allMenuItems.find((m) => m.id === path) && action) {
        next[`${path}_${action}`] = true;
      }
    });
    allMenuItems.forEach((item) => {
      if (CRUD_ACTIONS.every((a) => next[`${item.id}_${a}`])) {
        next[`${item.id}_all`] = true;
      }
    });
    return next;
  };

  // ── Submit ──
  const submitForm = () => {
    if (!formData.nama.trim()) {
      toast({ title: "Nama role wajib diisi", variant: "destructive" });
      return;
    }
    if (!formData.role.trim()) {
      toast({ title: "Role code wajib diisi", variant: "destructive" });
      return;
    }
    const permissions = collectPermissions();
    if (!permissions) {
      toast({ title: "Pilih minimal satu menu untuk hak akses", variant: "destructive" });
      return;
    }

    if (formMode === "create") {
      setHakAksesList((prev) => [
        {
          id: Date.now().toString(),
          nama: formData.nama,
          role: formData.role,
          permissions,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      toast({ title: "Hak akses berhasil dibuat!" });
    } else {
      setHakAksesList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, nama: formData.nama, role: formData.role, permissions }
            : item
        )
      );
      toast({ title: "Hak akses berhasil diperbarui!" });
    }

    resetForm();
    setShowForm(false);
  };

  // ── Actions ──
  const handleEdit = (item: HakAksesItem) => {
    setFormData({
      nama: item.nama,
      role: item.role,
      permissions: parsePermissionsToFormState(item.permissions),
    });
    setFormMode("edit");
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (item: HakAksesItem) => {
    if (!window.confirm(`Hapus hak akses "${item.nama}"?`)) return;
    setHakAksesList((prev) => prev.filter((h) => h.id !== item.id));
    toast({ title: "Hak akses berhasil dihapus!" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Hak Akses</h1>
          <p className="text-muted-foreground">Kelola hak akses dan permissions untuk setiap role</p>
        </div>
        <Button onClick={toggleForm}>
          {showForm ? <ChevronUp className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Tutup Form" : "Tambah Hak Akses"}
        </Button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {formMode === "create" ? "Tambah Hak Akses Baru" : "Edit Hak Akses"}
            </CardTitle>
            <CardDescription>
              {formMode === "create"
                ? "Isi form di bawah untuk menambahkan hak akses baru"
                : "Perbarui informasi hak akses"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nama & Role Code */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Role *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  placeholder="Contoh: Super Admin, Admin Pusat"
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, nama: val, role: slugifyRoleCode(val) }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role Code *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  placeholder="Contoh: super_admin, admin_pusat"
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Otomatis digenerate dari nama role</p>
              </div>
            </div>

            {/* Hak Akses Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Hak Akses</Label>
                  <p className="text-xs text-muted-foreground">Pilih menu dan permissions yang ingin diberikan</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={checkAll}>
                    Check All
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={uncheckAll}>
                    Uncheck All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {menuGroups.map((group) => (
                  <MenuGroupPermissionCard
                    key={group.id}
                    group={group}
                    permissions={formData.permissions}
                    onChange={handlePermissionChange}
                  />
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={toggleForm}>
                Batal
              </Button>
              <Button type="button" onClick={submitForm}>
                {formMode === "create" ? "Simpan" : "Perbarui"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {!showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cari Hak Akses</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    placeholder="Cari role atau nama..."
                    className="pl-10"
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Urutkan</Label>
                <Select
                  value={sortBy}
                  onValueChange={(v) => { setSortBy(v as typeof sortBy); setCurrentPage(1); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih urutan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="created_at">Tanggal Dibuat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {!showForm && filtered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Hak Akses</CardTitle>
            <CardDescription>Daftar semua hak akses ({filtered.length} data)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((item) => {
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-muted-foreground">{item.nama}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 py-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {paginationStart}–{paginationEnd} dari {filtered.length} data
              </p>
              <div className="flex items-center gap-2">
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 py-1 text-sm">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!showForm && filtered.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada data hak akses</h3>
              <p className="text-muted-foreground mb-4">
                Belum ada data hak akses yang tersedia.
              </p>
              <Button onClick={toggleForm}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Hak Akses
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HakAkses;
