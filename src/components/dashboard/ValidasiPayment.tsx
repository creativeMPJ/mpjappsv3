import { useState } from "react";
import { Eye, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { toast } from "sonner";

const paymentData = [
  {
    id: 1,
    tanggal: "12 Dec 2024",
    namaLembaga: "PP Al Hikmah",
    bankPengirim: "BSI - Ahmad",
    nominal: "Rp 50.000",
    buktiTransfer: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
    status: "pending",
  },
  {
    id: 2,
    tanggal: "11 Dec 2024",
    namaLembaga: "PP Nurul Jadid",
    bankPengirim: "BRI - Mahmud",
    nominal: "Rp 75.000",
    buktiTransfer: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
    status: "pending",
  },
  {
    id: 3,
    tanggal: "11 Dec 2024",
    namaLembaga: "PP Salafiyah Syafi'iyah",
    bankPengirim: "BCA - Abdullah",
    nominal: "Rp 100.000",
    buktiTransfer: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
    status: "pending",
  },
  {
    id: 4,
    tanggal: "10 Dec 2024",
    namaLembaga: "PP Darul Ulum",
    bankPengirim: "Mandiri - Fauzi",
    nominal: "Rp 50.000",
    buktiTransfer: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
    status: "pending",
  },
  {
    id: 5,
    tanggal: "10 Dec 2024",
    namaLembaga: "PP Lirboyo",
    bankPengirim: "BSI - Hasan",
    nominal: "Rp 150.000",
    buktiTransfer: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
    status: "pending",
  },
];

const ValidasiPayment = () => {
  const [payments, setPayments] = useState(paymentData);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleConfirm = (id: number) => {
    setPayments(payments.filter((p) => p.id !== id));
    toast.success("Pembayaran berhasil dikonfirmasi! ID telah di-unlock.", {
      description: `Lembaga dengan ID #${id} sekarang sudah aktif.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Validasi Pembayaran Masuk</h1>
        <p className="text-slate-500">Konfirmasi pembayaran dan unlock akun pesantren</p>
      </div>

      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            Daftar Pembayaran Pending
            <span className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {payments.length} menunggu
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-600">Tanggal</TableHead>
                  <TableHead className="text-slate-600">Nama Lembaga</TableHead>
                  <TableHead className="text-slate-600">Bank Pengirim</TableHead>
                  <TableHead className="text-slate-600">Nominal</TableHead>
                  <TableHead className="text-slate-600">Bukti Transfer</TableHead>
                  <TableHead className="text-slate-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-slate-100">
                    <TableCell className="text-slate-700">{payment.tanggal}</TableCell>
                    <TableCell className="font-medium text-slate-800">{payment.namaLembaga}</TableCell>
                    <TableCell className="text-slate-600">{payment.bankPengirim}</TableCell>
                    <TableCell className="font-semibold text-emerald-600">{payment.nominal}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedImage(payment.buktiTransfer)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Lihat Bukti
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(payment.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm & Unlock ID
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {payments.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-slate-500">Semua pembayaran sudah divalidasi!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal for Bukti Transfer */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bukti Transfer</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={selectedImage || ""}
              alt="Bukti Transfer"
              className="w-full rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidasiPayment;
