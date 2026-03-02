import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, Edit, ToggleLeft, ToggleRight, Loader2, RefreshCw } from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api-client";

interface PricingPackage {
  id: string;
  name: string;
  category: "registration" | "renewal" | "upgrade";
  harga_paket: number;
  harga_diskon: number | null;
  is_active: boolean;
  created_at: string;
}

const FinanceHarga = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PricingPackage | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<string>("registration");
  const [formHarga, setFormHarga] = useState("");
  const [formDiskon, setFormDiskon] = useState("");

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ packages: PricingPackage[] }>("/api/admin/pricing-packages");
      setPackages(data.packages);
    } catch (error: any) {
      toast({ title: "Gagal memuat data", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "registration":
        return <Badge className="bg-blue-500 hover:bg-blue-500">Pendaftaran</Badge>;
      case "renewal":
        return <Badge className="bg-amber-500 hover:bg-amber-500">Perpanjangan</Badge>;
      case "upgrade":
        return <Badge className="bg-purple-500 hover:bg-purple-500">Upgrade</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  const openCreateDialog = () => {
    setEditingPackage(null);
    setFormName("");
    setFormCategory("registration");
    setFormHarga("");
    setFormDiskon("");
    setShowDialog(true);
  };

  const openEditDialog = (pkg: PricingPackage) => {
    setEditingPackage(pkg);
    setFormName(pkg.name);
    setFormCategory(pkg.category);
    setFormHarga(pkg.harga_paket.toString());
    setFormDiskon(pkg.harga_diskon?.toString() || "");
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formHarga.trim()) {
      toast({ title: "Lengkapi data", description: "Nama dan harga wajib diisi.", variant: "destructive" });
      return;
    }

    const hargaPaket = parseInt(formHarga);
    const hargaDiskon = formDiskon.trim() ? parseInt(formDiskon) : null;

    if (isNaN(hargaPaket) || hargaPaket <= 0) {
      toast({ title: "Harga tidak valid", description: "Masukkan harga paket yang valid.", variant: "destructive" });
      return;
    }

    if (hargaDiskon !== null && (isNaN(hargaDiskon) || hargaDiskon <= 0)) {
      toast({ title: "Diskon tidak valid", description: "Masukkan harga diskon yang valid.", variant: "destructive" });
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        name: formName.trim(),
        category: formCategory,
        hargaPaket,
        hargaDiskon,
      };

      console.log("[Pricing] Saving payload:", JSON.stringify(payload));
      console.log("[Pricing] Editing:", editingPackage?.id);

      if (editingPackage) {
        await apiRequest(`/api/admin/pricing-packages/${editingPackage.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast({ title: "Berhasil", description: `Paket "${formName}" berhasil diupdate.` });
      } else {
        await apiRequest("/api/admin/pricing-packages", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({ title: "Berhasil", description: `Paket "${formName}" berhasil ditambahkan.` });
      }

      setShowDialog(false);
      fetchPackages();
    } catch (error: any) {
      console.error("[Pricing] Save error:", error);
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleToggle = async (pkg: PricingPackage) => {
    setToggling(pkg.id);
    try {
      const result = await apiRequest<{ is_active: boolean }>(
        `/api/admin/pricing-packages/${pkg.id}/toggle`,
        { method: "PATCH" }
      );
      toast({
        title: result.is_active ? "Paket Diaktifkan" : "Paket Dinonaktifkan",
        description: `${pkg.name} sekarang ${result.is_active ? "aktif" : "nonaktif"}.`,
      });
      fetchPackages();
    } catch (error: any) {
      toast({ title: "Gagal toggle", description: error.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-lg">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Pengaturan Harga</h2>
                <p className="text-white/80 text-sm">
                  Kelola paket harga pendaftaran, perpanjangan & upgrade
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchPackages}
                className="text-white hover:bg-white/10 gap-1.5"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={openCreateDialog}
                className="bg-white text-emerald-700 hover:bg-white/90 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Tambah Paket
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Paket Harga ({packages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Belum ada paket harga</p>
              <p className="text-sm mt-1">Klik "Tambah Paket" untuk membuat yang pertama.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Paket</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Diskon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id} className={!pkg.is_active ? "opacity-50" : ""}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{getCategoryBadge(pkg.category)}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600">
                        {formatCurrency(pkg.harga_paket)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {pkg.harga_diskon ? (
                          <span className="text-amber-600">{formatCurrency(pkg.harga_diskon)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={pkg.is_active ? "default" : "secondary"}
                          className={pkg.is_active ? "bg-green-500 hover:bg-green-500" : ""}
                        >
                          {pkg.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(pkg)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(pkg)}
                            disabled={toggling === pkg.id}
                            className="h-8 w-8 p-0"
                          >
                            {toggling === pkg.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : pkg.is_active ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPackage ? "Edit Paket Harga" : "Tambah Paket Harga"}</DialogTitle>
            <DialogDescription>
              {editingPackage
                ? "Ubah detail paket harga yang sudah ada."
                : "Buat paket harga baru untuk layanan MPJ."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Paket</Label>
              <Input
                placeholder="Contoh: Pendaftaran Baru - Gold"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration">Pendaftaran</SelectItem>
                  <SelectItem value="renewal">Perpanjangan</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga Paket (Rp)</Label>
                <Input
                  type="number"
                  placeholder="250000"
                  value={formHarga}
                  onChange={(e) => setFormHarga(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Diskon (Rp) — opsional</Label>
                <Input
                  type="number"
                  placeholder="200000"
                  value={formDiskon}
                  onChange={(e) => setFormDiskon(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={processing}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
              {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingPackage ? "Simpan Perubahan" : "Tambah Paket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceHarga;
