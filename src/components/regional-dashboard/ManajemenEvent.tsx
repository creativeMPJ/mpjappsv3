import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Send, FileText, Key, Clock, CheckCircle } from "lucide-react";

const ManajemenEvent = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    namaEvent: "",
    tanggal: "",
    deskripsi: "",
  });

  const pastEvents = [
    {
      id: 1,
      nama: "Seminar Santri Preneur",
      tanggal: "05 Nov 2024",
      peserta: 120,
      status: "completed",
    },
    {
      id: 2,
      nama: "Pelatihan Digital Marketing",
      tanggal: "20 Oct 2024",
      peserta: 85,
      status: "completed",
    },
    {
      id: 3,
      nama: "Workshop Kewirausahaan",
      tanggal: "15 Sep 2024",
      peserta: 150,
      status: "completed",
    },
    {
      id: 4,
      nama: "Musyawarah Regional",
      tanggal: "01 Sep 2024",
      peserta: 45,
      status: "completed",
    },
  ];

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaEvent || !formData.tanggal || !formData.deskripsi) {
      toast({
        title: "Form tidak lengkap",
        description: "Harap isi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Proposal Terkirim!",
      description: "Proposal event berhasil diajukan ke MPJ Pusat via Node.js API",
      className: "bg-dashboard-sidebar text-white",
    });

    setFormData({ namaEvent: "", tanggal: "", deskripsi: "" });
  };

  const handleSetupToken = () => {
    const token = `CERT-${Date.now().toString(36).toUpperCase()}`;
    toast({
      title: "Token Sertifikat Dibuat!",
      description: `Token: ${token} - Gunakan untuk verifikasi peserta`,
      className: "bg-dashboard-accent text-white",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white shadow-sm border-0">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-dashboard-sidebar" />
            Manajemen Event Regional
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="pengajuan" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
              <TabsTrigger
                value="pengajuan"
                className="data-[state=active]:bg-dashboard-sidebar data-[state=active]:text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Pengajuan Event
              </TabsTrigger>
              <TabsTrigger
                value="laporan"
                className="data-[state=active]:bg-dashboard-sidebar data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Laporan Event
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pengajuan" className="space-y-6">
              <form onSubmit={handleSubmitProposal} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="namaEvent" className="text-gray-700">
                      Nama Event
                    </Label>
                    <Input
                      id="namaEvent"
                      placeholder="Masukkan nama event"
                      value={formData.namaEvent}
                      onChange={(e) =>
                        setFormData({ ...formData, namaEvent: e.target.value })
                      }
                      className="border-gray-300 focus:border-dashboard-sidebar focus:ring-dashboard-sidebar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tanggal" className="text-gray-700">
                      Tanggal Event
                    </Label>
                    <Input
                      id="tanggal"
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) =>
                        setFormData({ ...formData, tanggal: e.target.value })
                      }
                      className="border-gray-300 focus:border-dashboard-sidebar focus:ring-dashboard-sidebar"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deskripsi" className="text-gray-700">
                    Deskripsi Event
                  </Label>
                  <Textarea
                    id="deskripsi"
                    placeholder="Jelaskan detail dan tujuan event..."
                    rows={4}
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData({ ...formData, deskripsi: e.target.value })
                    }
                    className="border-gray-300 focus:border-dashboard-sidebar focus:ring-dashboard-sidebar"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    className="bg-dashboard-sidebar hover:bg-dashboard-sidebar/90 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Ajukan Proposal
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSetupToken}
                    className="bg-dashboard-accent hover:bg-dashboard-accent/90 text-white"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Setup Token Sertifikat
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="laporan">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">Nama Event</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                    <TableHead className="font-semibold text-gray-700">Jumlah Peserta</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastEvents.map((event, index) => (
                    <TableRow
                      key={event.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-gray-100 transition-colors`}
                    >
                      <TableCell className="font-medium text-gray-800">{event.nama}</TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {event.tanggal}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{event.peserta} peserta</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700 border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Selesai
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManajemenEvent;
