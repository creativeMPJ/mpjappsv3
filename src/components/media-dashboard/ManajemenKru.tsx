import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Users } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface KoordinatorData {
  nama: string;
  niam: string | null;
  jabatan: string;
  xp_level?: number;
  photoUrl?: string;
}

interface ManajemenKruProps {
  paymentStatus: "paid" | "unpaid";
  debugProfile?: {
    nip?: string;
    nama_pesantren?: string;
  };
  onKoordinatorChange?: (koordinator: KoordinatorData | undefined) => void;
}

interface JabatanCode {
  id: string;
  name: string;
  code: string;
}

interface Crew {
  id: string;
  nama: string;
  jabatan: string | null;
  niam: string | null;
  jabatan_code_id?: string | null;
}

const ManajemenKru = ({ paymentStatus, onKoordinatorChange }: ManajemenKruProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [jabatanCodes, setJabatanCodes] = useState<JabatanCode[]>([]);
  const [nama, setNama] = useState("");
  const [jabatanCodeId, setJabatanCodeId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [crewData, codeData] = await Promise.all([
        apiRequest<{ crews: Crew[] }>("/api/media/crew"),
        apiRequest<{ jabatan_codes: JabatanCode[] }>("/api/media/jabatan-codes"),
      ]);
      setCrews(crewData.crews || []);
      setJabatanCodes(codeData.jabatan_codes || []);

      const koordinator = (crewData.crews || []).find((c) => c.jabatan?.toLowerCase() === "koordinator");
      onKoordinatorChange?.(
        koordinator
          ? {
              nama: koordinator.nama,
              niam: koordinator.niam,
              jabatan: koordinator.jabatan || "Koordinator",
            }
          : undefined
      );
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async () => {
    if (!nama.trim()) {
      toast({ title: "Validasi", description: "Nama kru wajib diisi", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiRequest("/api/media/crew", {
        method: "POST",
        body: JSON.stringify({
          nama: nama.trim(),
          jabatanCodeId: jabatanCodeId || null,
        }),
      });
      setNama("");
      setJabatanCodeId("");
      await loadData();
      toast({ title: "Berhasil", description: "Kru ditambahkan" });
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kru ini?")) return;
    try {
      await apiRequest(`/api/media/crew/${id}`, { method: "DELETE" });
      await loadData();
      toast({ title: "Berhasil", description: "Kru dihapus" });
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manajemen Kru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Nama Kru</Label>
              <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap" />
            </div>
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Select value={jabatanCodeId} onValueChange={setJabatanCodeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {jabatanCodes.map((j) => (
                    <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} disabled={saving || paymentStatus === "unpaid"} className="w-full">
                {saving ? "Menyimpan..." : "Tambah Kru"}
              </Button>
            </div>
          </div>
          {paymentStatus === "unpaid" && (
            <Badge variant="secondary">Akun unpaid: penambahan kru dibatasi sampai pembayaran aktif.</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat data kru...</p>
          ) : crews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada kru.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>NIAM</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crews.map((crew) => (
                  <TableRow key={crew.id}>
                    <TableCell>{crew.nama}</TableCell>
                    <TableCell>{crew.jabatan || "-"}</TableCell>
                    <TableCell className="font-mono text-xs">{crew.niam || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(crew.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManajemenKru;