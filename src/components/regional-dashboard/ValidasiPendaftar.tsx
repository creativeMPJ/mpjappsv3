import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Eye, CheckCircle, XCircle, UserCheck } from "lucide-react";

interface Pendaftar {
  id: number;
  tanggal: string;
  namaPesantren: string;
  namaMedia: string;
  kecamatan: string;
  pengasuh: string;
  alamat: string;
  email: string;
  noHp: string;
  status: "pending" | "approved" | "rejected";
}

const dummyData: Pendaftar[] = [
  {
    id: 1,
    tanggal: "12 Dec 2024",
    namaPesantren: "PP Al Hikmah",
    namaMedia: "@alhikmah_official",
    kecamatan: "Lowokwaru",
    pengasuh: "KH. Ahmad Fauzi",
    alamat: "Jl. Sumbersari No. 45, Malang",
    email: "alhikmah@gmail.com",
    noHp: "081234567890",
    status: "pending",
  },
  {
    id: 2,
    tanggal: "11 Dec 2024",
    namaPesantren: "PP Nurul Jadid",
    namaMedia: "@nuruljadid_mlg",
    kecamatan: "Sukun",
    pengasuh: "KH. Mahmud Hasan",
    alamat: "Jl. Raya Tlogomas No. 12, Malang",
    email: "nuruljadid@gmail.com",
    noHp: "081345678901",
    status: "pending",
  },
  {
    id: 3,
    tanggal: "10 Dec 2024",
    namaPesantren: "PP Darul Ulum",
    namaMedia: "@darulum_malang",
    kecamatan: "Blimbing",
    pengasuh: "KH. Zainal Abidin",
    alamat: "Jl. Arjuno No. 78, Malang",
    email: "darulum@gmail.com",
    noHp: "081456789012",
    status: "pending",
  },
  {
    id: 4,
    tanggal: "09 Dec 2024",
    namaPesantren: "PP Al Falah",
    namaMedia: "@alfalah_media",
    kecamatan: "Kedungkandang",
    pengasuh: "KH. Ridwan Nawawi",
    alamat: "Jl. Sawojajar No. 33, Malang",
    email: "alfalah@gmail.com",
    noHp: "081567890123",
    status: "pending",
  },
  {
    id: 5,
    tanggal: "08 Dec 2024",
    namaPesantren: "PP Miftahul Huda",
    namaMedia: "@miftahulhuda_id",
    kecamatan: "Klojen",
    pengasuh: "KH. Syamsul Arifin",
    alamat: "Jl. Ijen No. 56, Malang",
    email: "miftahulhuda@gmail.com",
    noHp: "081678901234",
    status: "pending",
  },
];

const ValidasiPendaftar = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Pendaftar[]>([]);
  const [selectedPendaftar, setSelectedPendaftar] = useState<Pendaftar | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setData(dummyData);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handlePeriksaClick = (pendaftar: Pendaftar) => {
    setSelectedPendaftar(pendaftar);
    setDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedPendaftar) {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedPendaftar.id ? { ...item, status: "approved" as const } : item
        )
      );
      toast({
        title: "Data Approved!",
        description: `Data ${selectedPendaftar.namaPesantren} approved successfully via Node.js API`,
        className: "bg-dashboard-sidebar text-white",
      });
      setDialogOpen(false);
    }
  };

  const handleReject = () => {
    if (selectedPendaftar) {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedPendaftar.id ? { ...item, status: "rejected" as const } : item
        )
      );
      toast({
        title: "Data Rejected",
        description: `Data ${selectedPendaftar.namaPesantren} has been rejected`,
        variant: "destructive",
      });
      setDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      default:
        return <Badge className="bg-dashboard-accent text-white">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-sm border-0">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white shadow-sm border-0">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-dashboard-sidebar" />
            Validasi Anggota Baru
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                <TableHead className="font-semibold text-gray-700">Nama Pesantren</TableHead>
                <TableHead className="font-semibold text-gray-700">Nama Media</TableHead>
                <TableHead className="font-semibold text-gray-700">Kecamatan</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow 
                  key={item.id} 
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-gray-100 transition-colors`}
                >
                  <TableCell className="text-gray-600">{item.tanggal}</TableCell>
                  <TableCell className="font-medium text-gray-800">{item.namaPesantren}</TableCell>
                  <TableCell className="text-dashboard-sidebar font-medium">{item.namaMedia}</TableCell>
                  <TableCell className="text-gray-600">{item.kecamatan}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePeriksaClick(item)}
                      className="border-dashboard-sidebar text-dashboard-sidebar hover:bg-dashboard-sidebar hover:text-white"
                      disabled={item.status !== "pending"}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Periksa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-dashboard-sidebar flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Detail Data Pendaftar
            </DialogTitle>
          </DialogHeader>

          {selectedPendaftar && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Nama Lembaga</p>
                  <p className="font-medium text-gray-800">{selectedPendaftar.namaPesantren}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Nama Pengasuh</p>
                  <p className="font-medium text-gray-800">{selectedPendaftar.pengasuh}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Nama Media</p>
                  <p className="font-medium text-dashboard-sidebar">{selectedPendaftar.namaMedia}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Kecamatan</p>
                  <p className="font-medium text-gray-800">{selectedPendaftar.kecamatan}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Alamat Lengkap</p>
                <p className="font-medium text-gray-800">{selectedPendaftar.alamat}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{selectedPendaftar.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">No. HP / WhatsApp</p>
                  <p className="font-medium text-gray-800">{selectedPendaftar.noHp}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleReject}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Tolak
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-dashboard-sidebar hover:bg-dashboard-sidebar/90 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidasiPendaftar;
