import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { History, Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/api-client";

interface Payment {
  id: string;
  total_amount: number;
  status: "verified" | "rejected";
  created_at: string;
  rejection_reason: string | null;
  verified_at: string | null;
  verified_by: string | null;
  pesantren_claims: {
    pesantren_name: string;
    nama_pengelola: string;
    jenis_pengajuan: string;
  };
}

const FinanceRiwayat = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest<{ payments: any[] }>("/api/admin/payments");
        const history = (data.payments || []).filter(
          (p) => p.status === "verified" || p.status === "rejected"
        );
        setTransactions(history);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTransactions = transactions.filter(t =>
    t.pesantren_claims.pesantren_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pesantren_claims.nama_pengelola.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const approvedCount = transactions.filter(t => t.status === "verified").length;
  const rejectedCount = transactions.filter(t => t.status === "rejected").length;
  const totalApproved = transactions
    .filter(t => t.status === "verified")
    .reduce((sum, t) => sum + t.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-lg">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Riwayat Transaksi</h2>
              <p className="text-white/80 text-sm">
                Catatan semua verifikasi pembayaran
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ditolak</p>
                <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Diterima</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(totalApproved)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Daftar Transaksi</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari pesantren..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada riwayat transaksi"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pesantren</TableHead>
                    <TableHead className="hidden md:table-cell">Pengelola</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Waktu Verifikasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{t.pesantren_claims.pesantren_name}</p>
                          {t.rejection_reason && (
                            <p className="text-xs text-red-500 mt-1">
                              Alasan: {t.rejection_reason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {t.pesantren_claims.nama_pengelola}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={t.pesantren_claims.jenis_pengajuan === "pesantren_baru" ? "default" : "secondary"}
                          className={t.pesantren_claims.jenis_pengajuan === "pesantren_baru" ? "bg-blue-500" : ""}
                        >
                          {t.pesantren_claims.jenis_pengajuan === "pesantren_baru" ? "Baru" : "Klaim"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(t.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={t.status === "verified" ? "default" : "destructive"}
                          className={t.status === "verified" ? "bg-green-500" : ""}
                        >
                          {t.status === "verified" ? "Disetujui" : "Ditolak"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {formatDate(t.verified_at || t.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceRiwayat;
