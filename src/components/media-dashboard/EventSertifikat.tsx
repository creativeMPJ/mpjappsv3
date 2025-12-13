import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, Download, Search, Ticket } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Event {
  id: string;
  name: string;
  date: string;
  representative: string;
  certificateStatus: "available" | "claimed" | "pending";
}

const EventSertifikat = () => {
  const [tokenInput, setTokenInput] = useState("");
  const [events] = useState<Event[]>([
    {
      id: "1",
      name: "Workshop Jurnalistik Santri 2024",
      date: "15 Januari 2024",
      representative: "Ahmad Fauzi",
      certificateStatus: "claimed",
    },
    {
      id: "2",
      name: "Pelatihan Videografi Dasar",
      date: "28 Februari 2024",
      representative: "Ahmad Fauzi, Budi Santoso",
      certificateStatus: "available",
    },
    {
      id: "3",
      name: "Seminar Media Digital",
      date: "10 Maret 2024",
      representative: "Ahmad Fauzi",
      certificateStatus: "pending",
    },
  ]);

  const handleClaimToken = () => {
    if (!tokenInput.trim()) {
      toast({
        title: "Error",
        description: "Masukkan token acara terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Token Diklaim",
      description: "Sertifikat untuk lembaga dan Anda sedang diproses via Node.js API",
    });
    setTokenInput("");
  };

  const handleDownloadCertificate = (eventName: string) => {
    toast({
      title: "Download Dimulai",
      description: `Sertifikat ${eventName} sedang diunduh...`,
    });
  };

  const getStatusBadge = (status: Event["certificateStatus"]) => {
    switch (status) {
      case "claimed":
        return <Badge className="bg-emerald-100 text-emerald-700">Sudah Diklaim</Badge>;
      case "available":
        return <Badge className="bg-amber-100 text-amber-700">Tersedia</Badge>;
      case "pending":
        return <Badge className="bg-slate-100 text-slate-600">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Event & Sertifikat</h1>
        <p className="text-slate-500">Arsip sertifikat lembaga dari event yang diikuti</p>
      </div>

      {/* Claim Token Section */}
      <Card className="bg-gradient-to-r from-emerald-50 to-amber-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ticket className="h-5 w-5 text-emerald-600" />
            Klaim Sertifikat dengan Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="token" className="sr-only">Token Acara</Label>
              <Input
                id="token"
                placeholder="Masukkan token acara (contoh: EVT-2024-ABCD)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button 
              onClick={handleClaimToken}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Award className="h-4 w-4 mr-2" />
              Klaim (Lembaga & Saya)
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Token didapatkan setelah menghadiri event. Klaim akan mendaftarkan sertifikat untuk lembaga dan perwakilan.
          </p>
        </CardContent>
      </Card>

      {/* Event History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Riwayat Event Lembaga</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari event..."
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Event</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Perwakilan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.representative}</TableCell>
                    <TableCell>{getStatusBadge(event.certificateStatus)}</TableCell>
                    <TableCell className="text-right">
                      {event.certificateStatus === "available" || event.certificateStatus === "claimed" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700"
                          onClick={() => handleDownloadCertificate(event.name)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <span className="text-sm text-slate-400">Menunggu</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {events.length === 0 && (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">Belum Ada Event</h3>
              <p className="text-slate-400">Ikuti event untuk mendapatkan sertifikat</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventSertifikat;
