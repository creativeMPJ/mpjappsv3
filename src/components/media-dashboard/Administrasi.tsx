import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CreditCard, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock,
  AlertTriangle,
  Receipt
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdministrasiProps {
  paymentStatus: "paid" | "unpaid";
  onPaymentStatusChange: (status: "paid" | "unpaid") => void;
}

const Administrasi = ({ paymentStatus, onPaymentStatusChange }: AdministrasiProps) => {
  const invoices = [
    {
      id: "INV-2024-001",
      description: "Iuran Keanggotaan 2024",
      amount: 500000,
      dueDate: "31 Januari 2024",
      status: paymentStatus === "paid" ? "paid" : "unpaid",
    },
    {
      id: "INV-2023-012",
      description: "Iuran Keanggotaan 2023",
      amount: 450000,
      dueDate: "31 Desember 2023",
      status: "paid",
    },
    {
      id: "INV-2023-006",
      description: "Biaya Sertifikasi Event",
      amount: 150000,
      dueDate: "15 Juli 2023",
      status: "paid",
    },
  ];

  const handlePayNow = () => {
    // Simulate payment
    toast({
      title: "Redirect ke Payment Gateway",
      description: "Anda akan diarahkan ke halaman pembayaran...",
    });
    // For demo, toggle payment status
    setTimeout(() => {
      onPaymentStatusChange("paid");
      toast({
        title: "Pembayaran Berhasil!",
        description: "Status akun Anda telah diaktifkan.",
      });
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalUnpaid = invoices
    .filter((inv) => inv.status === "unpaid")
    .reduce((acc, inv) => acc + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Administrasi</h1>
        <p className="text-slate-500">Kelola tagihan dan invoice lembaga Anda</p>
      </div>

      {/* Payment Status Alert */}
      {paymentStatus === "unpaid" && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span className="text-red-800">
              <strong>Tagihan Belum Lunas!</strong> Total: {formatCurrency(totalUnpaid)}
            </span>
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white ml-4"
              onClick={handlePayNow}
            >
              Bayar Sekarang
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {paymentStatus === "paid" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Status: AKTIF</strong> — Semua tagihan telah lunas. Terima kasih!
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Total Tagihan</h3>
              <Receipt className="h-5 w-5 text-slate-400" />
            </div>
            <p className={`text-3xl font-bold ${totalUnpaid > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(totalUnpaid)}
            </p>
            <p className="text-sm text-slate-500 mt-1">Belum dibayar</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Status Akun</h3>
              <CreditCard className="h-5 w-5 text-slate-400" />
            </div>
            <Badge className={`text-lg px-3 py-1 ${
              paymentStatus === "paid" 
                ? "bg-green-500 text-white" 
                : "bg-red-500 text-white"
            }`}>
              {paymentStatus === "paid" ? "ACTIVE" : "INACTIVE"}
            </Badge>
            <p className="text-sm text-slate-500 mt-2">
              {paymentStatus === "paid" 
                ? "Akses penuh tersedia" 
                : "Beberapa fitur terkunci"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Invoice</h3>
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-800">{invoices.length}</p>
            <p className="text-sm text-slate-500 mt-1">Total invoice</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#166534]" />
            Riwayat Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>No. Invoice</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Jatuh Tempo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell className="text-slate-600">{invoice.dueDate}</TableCell>
                  <TableCell>
                    {invoice.status === "paid" ? (
                      <Badge className="bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3 w-3" />
                        Lunas
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 flex items-center gap-1 w-fit">
                        <Clock className="h-3 w-3" />
                        Belum Bayar
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      {invoice.status === "unpaid" && (
                        <Button 
                          size="sm" 
                          className="bg-[#166534] hover:bg-[#14532d]"
                          onClick={handlePayNow}
                        >
                          Bayar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Metode Pembayaran</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="font-medium text-slate-800">Transfer Bank</p>
              <p className="text-sm text-slate-600">BCA: 1234567890</p>
              <p className="text-sm text-slate-500">a.n. Media Pondok Jatim</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="font-medium text-slate-800">E-Wallet</p>
              <p className="text-sm text-slate-600">GoPay / OVO / DANA</p>
              <p className="text-sm text-slate-500">081234567890</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="font-medium text-slate-800">QRIS</p>
              <p className="text-sm text-slate-600">Scan QR di aplikasi</p>
              <p className="text-sm text-slate-500">Tersedia di halaman bayar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Administrasi;