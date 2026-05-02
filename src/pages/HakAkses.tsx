import { useState, useEffect, useCallback } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/api-client";

// ─── Menu Groups — menggunakan aksesKey global (tanpa prefix role) ──────────
const menuGroups = [
  {
    id: "identitas-administrasi",
    label: "Identitas & Administrasi",
    icon: IdCard,
    items: [
      { id: "identitas",    label: "IDENTITAS PESANTREN", icon: IdCard },
      { id: "pembayaran",   label: "PEMBAYARAN",          icon: CreditCard },
      { id: "administrasi", label: "ADMINISTRASI",        icon: ClipboardList },
    ],
  },
  {
    id: "kru",
    label: "Manajemen Kru",
    icon: Users,
    items: [
      { id: "tim", label: "MANAJEMEN KRU", icon: Users },
      { id: "eid", label: "EID ASET",      icon: ImageIcon },
    ],
  },
  {
    id: "event",
    label: "Event",
    icon: CalendarDays,
    items: [
      { id: "user-event",                    label: "EVENT (User)",             icon: CalendarDays },
      { id: "admin-pusat-manajemen-event",   label: "EVENT (Admin Pusat)",      icon: CalendarDays },
      { id: "admin-regional-manajemen-event",label: "EVENT (Admin Regional)",   icon: CalendarDays },
    ],
  },
  {
    id: "verifikasi",
    label: "Verifikasi",
    icon: UserCheck,
    items: [
      { id: "validasi-pendaftar", label: "VALIDASI PENDAFTAR", icon: UserCheck },
      { id: "verifikasi",         label: "VERIFIKASI",         icon: UserCheck },
    ],
  },
  {
    id: "laporan-dokumen",
    label: "Laporan & Dokumen",
    icon: FileText,
    items: [
      { id: "laporan",          label: "LAPORAN & DOKUMENTASI", icon: FileText },
      { id: "laporan-keuangan", label: "LAPORAN KEUANGAN",      icon: FileText },
      { id: "late-payment",     label: "LATE PAYMENT",          icon: AlertCircle },
      { id: "download-center",  label: "DOWNLOAD CENTER",       icon: Download },
    ],
  },
  {
    id: "master",
    label: "Master Data",
    icon: BarChart3,
    items: [
      { id: "master-data",     label: "MASTER DATA",     icon: BarChart3 },
      { id: "data-master",     label: "DATA MASTER",     icon: BarChart3 },
      { id: "master-regional", label: "PENGATURAN REGIONAL", icon: Map },
    ],
  },
  {
    id: "keuangan",
    label: "Keuangan",
    icon: Banknote,
    items: [
      { id: "harga",              label: "HARGA",              icon: Banknote },
      { id: "clearing",           label: "CLEARING",           icon: CreditCard },
      { id: "regional-monitoring",label: "REGIONAL MONITORING",icon: MonitorDot },
      { id: "finance",            label: "FINANCE",            icon: DollarSign },
    ],
  },
  {
    id: "hub-militansi",
    label: "Hub & Militansi",
    icon: Globe,
    items: [
      { id: "hub",       label: "MPJ HUB",            icon: Globe },
      { id: "mpj-hub",   label: "MPJ HUB (COMING SOON)", icon: Globe },
      { id: "militansi", label: "MANAJEMEN MILITANSI", icon: Swords },
    ],
  },
  {
    id: "user-akses",
    label: "User & Akses",
    icon: UserCog,
    items: [
      { id: "user-management", label: "USER MANAGEMENT", icon: UserCog },
      { id: "hierarchy",       label: "HIERARKI DATA",   icon: Layers },
      { id: "hak-akses",       label: "HAK AKSES",       icon: Shield },
    ],
  },
  {
    id: "pengaturan",
    label: "Pengaturan",
    icon: Settings,
    items: [
      { id: "pengaturan", label: "PENGATURAN", icon: Settings },
    ],
  },
];

// Flat list of all items
const allMenuItems = menuGroups.flatMap((g) => g.items);

// ─── Types ────────────────────────────────────────────────────────────────────
interface PermissionAccess {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

interface HakAksesItem {
  id: string;
  nama: string;
  is_super_admin: boolean;
  akses: Record<string, PermissionAccess>;
  created_at: string;
  updated_at?: string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────
// Data akan diambil dari API

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CRUD_ACTIONS = ["view", "create", "update", "delete"] as const;
type CRUDAction = typeof CRUD_ACTIONS[number];

function createEmptyPermissions(): Record<string, PermissionAccess> {
  const empty: Record<string, PermissionAccess> = {};
  allMenuItems.forEach((item) => {
    empty[item.id] = { view: false, create: false, update: false, delete: false };
  });
  return empty;
}

// ─── Permission Checkboxes ────────────────────────────────────────────────────
function PermissionCheckboxes({
  path,
  akses,
  onChange,
}: {
  path: string;
  akses: Record<string, PermissionAccess>;
  onChange: (path: string, action: CRUDAction, value: boolean) => void;
}) {
  const itemAccess = akses[path] || { view: false, create: false, update: false, delete: false };
  const allChecked = CRUD_ACTIONS.every((a) => itemAccess[a]);

  const handleAll = (checked: boolean) => {
    CRUD_ACTIONS.forEach((a) => onChange(path, a, checked));
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
            checked={itemAccess.create}
            onCheckedChange={(c) => onChange(path, "create", !!c)}
            className="h-3.5 w-3.5"
          />
          <span className="text-xs font-medium text-blue-700">Create</span>
        </label>
        <label
          htmlFor={`${path}_view`}
          className="flex items-center gap-1.5 bg-emerald-50 rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-emerald-100 transition-colors"
        >
          <Checkbox
            id={`${path}_view`}
            checked={itemAccess.view}
            onCheckedChange={(c) => onChange(path, "view", !!c)}
            className="h-3.5 w-3.5"
          />
          <span className="text-xs font-medium text-emerald-700">View</span>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label
          htmlFor={`${path}_update`}
          className="flex items-center gap-1.5 bg-amber-50 rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-amber-100 transition-colors"
        >
          <Checkbox
            id={`${path}_update`}
            checked={itemAccess.update}
            onCheckedChange={(c) => onChange(path, "update", !!c)}
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
            checked={itemAccess.delete}
            onCheckedChange={(c) => onChange(path, "delete", !!c)}
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
  akses,
  onChange,
}: {
  group: (typeof menuGroups)[0];
  akses: Record<string, PermissionAccess>;
  onChange: (path: string, action: CRUDAction, value: boolean) => void;
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
                    akses={akses}
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

  const [hakAksesList, setHakAksesList] = useState<HakAksesItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: "",
    is_super_admin: false,
    akses: createEmptyPermissions(),
  });

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"role" | "created_at">("role");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch Data from API ──
  const fetchRolesData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(currentPage));
      queryParams.set('limit', String(itemsPerPage));
      if (search) queryParams.set('search', search);
      queryParams.set('sort_by', sortBy === 'role' ? 'nama' : 'created_at');
      queryParams.set('sort_order', 'desc');

      const result = await apiRequest<{
        success: boolean;
        data: HakAksesItem[];
        message?: string;
        pagination?: { total_pages: number };
      }>(`/api/roles?${queryParams}`);

      if (result.success) {
        setHakAksesList(result.data || []);
        setTotalPages(result.pagination?.total_pages || 1);
      } else {
        setError(result.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search, sortBy]);

  useEffect(() => {
    fetchRolesData();
  }, [fetchRolesData]);

  // ── Filtering & Sorting ──
  // Note: Filtering & sorting sekarang dihandle oleh API
  // Client-side filtering hanya sebagai fallback
  const filtered = hakAksesList
    .filter(
      (item) =>
        search === "" ||
        item.nama.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "role") return a.nama.localeCompare(b.nama);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const paginationStart = filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const paginationEnd = Math.min(currentPage * itemsPerPage, filtered.length);
  const paginated = filtered; // Data sudah paginated dari API

  // ── Form helpers ──
  const resetForm = () => {
    setFormData({ nama: "", is_super_admin: false, akses: createEmptyPermissions() });
    setFormMode("create");
    setEditingId(null);
  };

  const toggleForm = () => {
    if (showForm) resetForm();
    setShowForm(!showForm);
  };

  const handlePermissionChange = (path: string, action: CRUDAction, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      akses: {
        ...prev.akses,
        [path]: { ...prev.akses[path], [action]: value },
      },
    }));
  };

  const checkAll = () => {
    const next: Record<string, PermissionAccess> = {};
    allMenuItems.forEach((item) => {
      next[item.id] = { view: true, create: true, update: true, delete: true };
    });
    setFormData((prev) => ({ ...prev, akses: next }));
  };

  const uncheckAll = () => {
    setFormData((prev) => ({ ...prev, akses: createEmptyPermissions() }));
  };

  // ── Submit ──
  const submitForm = async () => {
    if (!formData.nama.trim()) {
      toast({ title: "Nama role wajib diisi", variant: "destructive" });
      return;
    }

    // Check if at least one permission is selected
    const hasAnyPermission = Object.values(formData.akses).some(
      (access) => access.view || access.create || access.update || access.delete
    );

    if (!hasAnyPermission) {
      toast({ title: "Pilih minimal satu menu untuk hak akses", variant: "destructive" });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        nama: formData.nama,
        is_super_admin: formData.is_super_admin,
        akses: formData.akses,
      };

      console.log('=== API REQUEST ===');
      console.log('Mode:', formMode);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('===================');

      let result: {
        success: boolean;
        data: HakAksesItem;
        message?: string;
      };

      if (formMode === 'edit' && editingId) {
        result = await apiRequest<{
          success: boolean;
          data: HakAksesItem;
          message?: string;
        }>(`/api/roles/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        result = await apiRequest<{
          success: boolean;
          data: HakAksesItem;
          message?: string;
        }>(`/api/roles`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (result.success) {
        toast({ title: formMode === "create" ? "Hak akses berhasil dibuat!" : "Hak akses berhasil diperbarui!" });

        // Reload data
        await fetchRolesData();
        resetForm();
        setShowForm(false);
      } else {
        setError(result.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      toast({ title: "Terjadi kesalahan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Actions ──
  const handleEdit = async (item: HakAksesItem) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest<{
        success: boolean;
        data: HakAksesItem;
        message?: string;
      }>(`/api/roles/${item.id}`);

      if (result.success) {
        setFormData({
          nama: result.data.nama,
          is_super_admin: result.data.is_super_admin,
          akses: result.data.akses || {},
        });
        setFormMode("edit");
        setEditingId(item.id);
        setShowForm(true);
      } else {
        setError(result.message || 'Gagal mengambil data role');
        toast({ title: "Terjadi kesalahan", variant: "destructive" });
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      toast({ title: "Terjadi kesalahan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: HakAksesItem) => {
    if (!window.confirm(`Hapus hak akses "${item.nama}"?`)) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest<{
        success: boolean;
        message?: string;
      }>(`/api/roles/${item.id}`, {
        method: 'DELETE',
      });

      if (result.success) {
        toast({ title: "Hak akses berhasil dihapus!" });

        // Reload data
        await fetchRolesData();
      } else {
        setError(result.message || 'Gagal menghapus data');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      toast({ title: "Terjadi kesalahan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Hak Akses</h1>
          <p className="text-muted-foreground">Kelola hak akses dan permissions untuk setiap role</p>
        </div>
        <Button onClick={toggleForm} disabled={loading}>
          {showForm ? <ChevronUp className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Tutup Form" : "Tambah Hak Akses"}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && !showForm && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300" />
        </div>
      )}

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
            {/* Nama Role & Super Admin */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Role *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  placeholder="Contoh: Super Admin, Admin Pusat"
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, nama: val }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_super_admin">Super Admin</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_super_admin"
                    checked={formData.is_super_admin}
                    onCheckedChange={(c) => setFormData((prev) => ({ ...prev, is_super_admin: !!c }))}
                  />
                  <span className="text-sm text-muted-foreground">Set sebagai Super Admin</span>
                </div>
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
                    akses={formData.akses}
                    onChange={handlePermissionChange}
                  />
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={toggleForm} disabled={loading}>
                Batal
              </Button>
              <Button type="button" onClick={submitForm} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    {formMode === "create" ? "Menyimpan..." : "Memperbarui..."}
                  </span>
                ) : (
                  formMode === "create" ? "Simpan" : "Perbarui"
                )}
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
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Urutkan</Label>
                <Select
                  value={sortBy}
                  onValueChange={(v) => {
                    setSortBy(v as typeof sortBy);
                    setCurrentPage(1);
                  }}
                  disabled={loading}
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
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300" />
              </div>
            ) : (
              <>
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
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} disabled={loading}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleEdit(item)} disabled={loading}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDelete(item)}
                                  disabled={loading}
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
                      onValueChange={(v) => {
                        setItemsPerPage(Number(v));
                        setCurrentPage(1);
                      }}
                      disabled={loading}
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
                        disabled={currentPage <= 1 || loading}
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
                        disabled={currentPage >= totalPages || loading}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!showForm && filtered.length === 0 && !loading && (
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
