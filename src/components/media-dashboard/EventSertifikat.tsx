import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, Search, Ticket } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentPaymentStatus } from "@/features/v4/utils";

const EventSertifikat = () => {
  const { profile } = useAuth();
  const payment = useCurrentPaymentStatus(profile?.status_payment);
  const [tokenInput, setTokenInput] = useState("");

  const handleClaimToken = () => {
    if (!payment.isActive) {
      toast({
        title: payment.label,
        description: "Aktifkan akun terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!tokenInput.trim()) {
      toast({
        title: "Error",
        description: "Masukkan token acara terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Fitur akan segera tersedia",
      description: "Klaim sertifikat belum tersedia.",
    });
    setTokenInput("");
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
                placeholder="Masukkan token acara"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="bg-white"
                disabled
              />
            </div>
            <Button 
              onClick={handleClaimToken}
              disabled
              className={payment.isActive ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-400 hover:bg-slate-400 cursor-not-allowed"}
            >
              <Award className="h-4 w-4 mr-2" />
              Segera Hadir
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Fitur klaim sertifikat akan segera tersedia.
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
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">Belum ada data</h3>
                      <p className="text-slate-400">Data akan tampil setelah tersedia</p>
                    </div>
                  </TableCell>
                  </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventSertifikat;
