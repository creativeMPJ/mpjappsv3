import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface JabatanCode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string | null;
}

const JabatanCodesManagement = () => {
  const [jabatanCodes, setJabatanCodes] = useState<JabatanCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });

  const fetchJabatanCodes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("jabatan_codes")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data kode jabatan.",
        variant: "destructive",
      });
    } else {
      setJabatanCodes(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchJabatanCodes();
  }, []);

  const resetForm = () => {
    setFormData({ code: "", name: "", description: "" });
    setEditingId(null);
  };

  const openDialog = (jabatan?: JabatanCode) => {
    if (jabatan) {
      setFormData({
        code: jabatan.code,
        name: jabatan.name,
        description: jabatan.description || "",
      });
      setEditingId(jabatan.id);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Kode dan nama jabatan wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    // Validate code format (2-3 uppercase letters)
    if (!/^[A-Z]{2,3}$/.test(formData.code.toUpperCase())) {
      toast({
        title: "Format Kode Salah",
        description: "Kode harus terdiri dari 2-3 huruf kapital (contoh: AM, AN, DM).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from("jabatan_codes")
          .update({
            code: formData.code.toUpperCase(),
            name: formData.name,
            description: formData.description || null,
          })
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Kode jabatan berhasil diperbarui.",
        });
      } else {
        // Insert new
        const { error } = await supabase
          .from("jabatan_codes")
          .insert({
            code: formData.code.toUpperCase(),
            name: formData.name,
            description: formData.description || null,
          });

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Kode jabatan baru berhasil ditambahkan.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchJabatanCodes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menyimpan.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Hapus kode jabatan "${code}"?`)) return;

    const { error } = await supabase
      .from("jabatan_codes")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus kode jabatan. Pastikan tidak ada kru yang menggunakan kode ini.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Kode jabatan berhasil dihapus.",
      });
      fetchJabatanCodes();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manajemen Kode Jabatan (NIAM)</CardTitle>
            <CardDescription>
              Kelola kode singkatan jabatan untuk sistem NIAM dinamis
            </CardDescription>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kode
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : jabatanCodes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Belum ada kode jabatan. Klik "Tambah Kode" untuk menambahkan.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Kode</TableHead>
                <TableHead>Nama Jabatan</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="w-24 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jabatanCodes.map((jabatan) => (
                <TableRow key={jabatan.id}>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm font-bold">
                      {jabatan.code}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium">{jabatan.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {jabatan.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDialog(jabatan)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(jabatan.id, jabatan.code)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Kode Jabatan" : "Tambah Kode Jabatan Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode Singkatan *</Label>
              <Input
                id="code"
                placeholder="Contoh: AM, AN, DM"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                maxLength={3}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                2-3 huruf kapital yang akan digunakan dalam format NIAM
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Jabatan *</Label>
              <Input
                id="name"
                placeholder="Contoh: Admin Media"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi singkat tentang jabatan ini..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default JabatanCodesManagement;
