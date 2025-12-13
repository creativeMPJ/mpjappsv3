import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const pesantrenData = [
  {
    id: "MPJ-001",
    namaPesantren: "PP Al Hikmah",
    regional: "Malang Raya",
    status: "active",
    pendingDays: 0,
  },
  {
    id: "MPJ-002",
    namaPesantren: "PP Nurul Jadid",
    regional: "Probolinggo Raya",
    status: "active",
    pendingDays: 0,
  },
  {
    id: "MPJ-003",
    namaPesantren: "PP Salafiyah Syafi'iyah",
    regional: "Situbondo",
    status: "pending",
    pendingDays: 5,
  },
  {
    id: "MPJ-004",
    namaPesantren: "PP Darul Ulum",
    regional: "Jombang",
    status: "active",
    pendingDays: 0,
  },
  {
    id: "MPJ-005",
    namaPesantren: "PP Lirboyo",
    regional: "Kediri Raya",
    status: "active",
    pendingDays: 0,
  },
  {
    id: "MPJ-006",
    namaPesantren: "PP Sidogiri",
    regional: "Sidoarjo-Pasuruan",
    status: "pending",
    pendingDays: 4,
  },
  {
    id: "MPJ-007",
    namaPesantren: "PP Tebuireng",
    regional: "Jombang",
    status: "pending",
    pendingDays: 2,
  },
  {
    id: "MPJ-008",
    namaPesantren: "PP Bahrul Ulum",
    regional: "Jombang",
    status: "active",
    pendingDays: 0,
  },
  {
    id: "MPJ-009",
    namaPesantren: "PP Miftahul Ulum",
    regional: "Madura Raya",
    status: "pending",
    pendingDays: 7,
  },
  {
    id: "MPJ-010",
    namaPesantren: "PP Mambaul Ma'arif",
    regional: "Jember-Lumajang",
    status: "active",
    pendingDays: 0,
  },
];

const DataMaster = () => {
  const [data, setData] = useState(pesantrenData);

  const handleForceApprove = (id: string) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, status: "active", pendingDays: 0 } : item
      )
    );
    toast.success("Force Approve berhasil!", {
      description: `Pesantren ${id} telah diaktifkan secara manual.`,
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
          <CheckCircle className="h-3 w-3" />
          Aktif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Database Seluruh Jatim</h1>
        <p className="text-slate-500">Kelola data pesantren se-Jawa Timur</p>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800">Perhatian!</p>
          <p className="text-sm text-amber-700">
            Terdapat {data.filter((d) => d.pendingDays > 3).length} pesantren dengan status pending lebih dari 3 hari.
            Segera lakukan validasi atau force approve jika diperlukan.
          </p>
        </div>
      </div>

      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Data Pesantren
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-600">ID</TableHead>
                  <TableHead className="text-slate-600">Nama Pesantren</TableHead>
                  <TableHead className="text-slate-600">Regional</TableHead>
                  <TableHead className="text-slate-600">Status Akun</TableHead>
                  <TableHead className="text-slate-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "border-slate-100",
                      item.pendingDays > 3 && "bg-red-50"
                    )}
                  >
                    <TableCell className="font-mono text-slate-700">
                      {item.id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {item.namaPesantren}
                    </TableCell>
                    <TableCell className="text-slate-600">{item.regional}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        {item.pendingDays > 3 && (
                          <span className="text-xs text-red-600 font-medium">
                            ({item.pendingDays} hari)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.status === "pending" && item.pendingDays > 3 ? (
                        <Button
                          size="sm"
                          onClick={() => handleForceApprove(item.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Force Approve (Take Over)
                        </Button>
                      ) : item.status === "pending" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-slate-600"
                        >
                          Menunggu Validasi
                        </Button>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataMaster;
