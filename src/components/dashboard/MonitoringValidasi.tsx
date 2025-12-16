import { useState } from "react";
import { AlertTriangle, Shield, Clock, CheckCircle, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PendingValidation {
  id: string;
  userName: string;
  pesantrenName: string;
  regional: string;
  registeredAt: string;
  daysAgo: number;
  status: "waiting_regional" | "approved" | "force_approved";
}

// Mock data with takeover scenario
const initialValidations: PendingValidation[] = [
  {
    id: "VAL-001",
    userName: "Fulan bin Fulan",
    pesantrenName: "PP Al Furqon",
    regional: "MPJ Tapal Kuda",
    registeredAt: "2024-12-09",
    daysAgo: 7,
    status: "waiting_regional",
  },
  {
    id: "VAL-002",
    userName: "Ahmad Zaini",
    pesantrenName: "PP Darussalam",
    regional: "MPJ Malang Raya",
    registeredAt: "2024-12-12",
    daysAgo: 4,
    status: "waiting_regional",
  },
  {
    id: "VAL-003",
    userName: "Siti Aisyah",
    pesantrenName: "PP Nurul Huda",
    regional: "MPJ Surabaya Raya",
    registeredAt: "2024-12-14",
    daysAgo: 2,
    status: "waiting_regional",
  },
  {
    id: "VAL-004",
    userName: "Muhammad Ridwan",
    pesantrenName: "PP Al Hikam",
    regional: "MPJ Madura Raya",
    registeredAt: "2024-12-10",
    daysAgo: 6,
    status: "waiting_regional",
  },
  {
    id: "VAL-005",
    userName: "Fatimah Azzahra",
    pesantrenName: "PP Salafiyah",
    regional: "MPJ Kediri Raya",
    registeredAt: "2024-12-13",
    daysAgo: 3,
    status: "waiting_regional",
  },
  {
    id: "VAL-006",
    userName: "Hasan Basri",
    pesantrenName: "PP Al Mubarok",
    regional: "MPJ Jombang Raya",
    registeredAt: "2024-12-08",
    daysAgo: 8,
    status: "waiting_regional",
  },
];

const MonitoringValidasi = () => {
  const [validations, setValidations] = useState<PendingValidation[]>(initialValidations);
  const [filter, setFilter] = useState<string>("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    validation: PendingValidation | null;
  }>({ open: false, validation: null });

  const filteredValidations = validations.filter((v) => {
    if (filter === "all") return v.status === "waiting_regional";
    if (filter === "late") return v.status === "waiting_regional" && v.daysAgo > 3;
    return true;
  });

  const stats = {
    total: validations.filter((v) => v.status === "waiting_regional").length,
    late: validations.filter((v) => v.status === "waiting_regional" && v.daysAgo > 3).length,
    forceApproved: validations.filter((v) => v.status === "force_approved").length,
  };

  const handleForceApprove = (validation: PendingValidation) => {
    setConfirmDialog({ open: true, validation });
  };

  const confirmForceApprove = () => {
    if (!confirmDialog.validation) return;

    setValidations((prev) =>
      prev.map((v) =>
        v.id === confirmDialog.validation!.id
          ? { ...v, status: "force_approved" as const }
          : v
      )
    );

    toast.success("Force Approve berhasil!", {
      description: `Pendaftaran ${confirmDialog.validation.userName} telah disetujui oleh Pusat. Log: "Approved by Pusat (Takeover)"`,
    });

    setConfirmDialog({ open: false, validation: null });
  };

  const formatDaysAgo = (days: number) => {
    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    return `${days} hari yang lalu`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Monitoring Validasi</h1>
        <p className="text-slate-500">
          Pantau dan intervensi validasi yang terlambat ditangani regional
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Pending</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Terlambat ({">"} 3 Hari)</p>
                <p className="text-2xl font-bold text-red-600">{stats.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Force Approved (Bulan Ini)</p>
                <p className="text-2xl font-bold text-amber-600">{stats.forceApproved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Banner */}
      {stats.late > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Perhatian: Validasi Terlambat!</p>
            <p className="text-sm text-red-700">
              Terdapat {stats.late} pendaftaran yang belum divalidasi oleh Regional selama lebih dari 3 hari.
              Anda dapat melakukan "Force Approve" untuk bypass validasi regional.
            </p>
          </div>
        </div>
      )}

      {/* Filter & Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Antrian Validasi
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">Semua Pending</SelectItem>
                <SelectItem value="late">Terlambat {">"} 3 Hari</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-600">Pendaftar</TableHead>
                  <TableHead className="text-slate-600">Asal Pesantren</TableHead>
                  <TableHead className="text-slate-600">Wilayah</TableHead>
                  <TableHead className="text-slate-600">Waktu Daftar</TableHead>
                  <TableHead className="text-slate-600">Status</TableHead>
                  <TableHead className="text-slate-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredValidations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      {filter === "late"
                        ? "Tidak ada validasi yang terlambat"
                        : "Tidak ada validasi pending"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredValidations.map((validation) => (
                    <TableRow
                      key={validation.id}
                      className={cn(
                        "border-slate-100",
                        validation.daysAgo > 3 && "bg-red-50"
                      )}
                    >
                      <TableCell>
                        <p className="font-medium text-slate-800">{validation.userName}</p>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {validation.pesantrenName}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                          {validation.regional}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-sm",
                            validation.daysAgo > 3
                              ? "text-red-600 font-semibold"
                              : "text-slate-600"
                          )}
                        >
                          {formatDaysAgo(validation.daysAgo)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          Waiting Regional
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleForceApprove(validation)}
                          className={cn(
                            "gap-1",
                            validation.daysAgo > 3
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          )}
                        >
                          <Shield className="h-4 w-4" />
                          Force Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, validation: null })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Konfirmasi Force Approve
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Tindakan ini akan bypass validasi regional dan langsung menyetujui pendaftaran.
            </DialogDescription>
          </DialogHeader>

          {confirmDialog.validation && (
            <div className="space-y-4 py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Pendaftar:</strong> {confirmDialog.validation.userName}
                </p>
                <p className="text-sm text-amber-800">
                  <strong>Pesantren:</strong> {confirmDialog.validation.pesantrenName}
                </p>
                <p className="text-sm text-amber-800">
                  <strong>Regional:</strong> {confirmDialog.validation.regional}
                </p>
                <p className="text-sm text-red-600 mt-2">
                  <strong>Menunggu:</strong> {confirmDialog.validation.daysAgo} hari
                </p>
              </div>

              <div className="text-sm text-slate-600">
                <p className="font-medium">Efek dari Force Approve:</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-500">
                  <li>Status berubah menjadi APPROVED/WAITING_PAYMENT</li>
                  <li>Log aktivitas: "Approved by Pusat (Takeover)"</li>
                  <li>Regional Admin akan mendapat notifikasi</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, validation: null })}
            >
              Batal
            </Button>
            <Button
              onClick={confirmForceApprove}
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Ya, Force Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonitoringValidasi;
