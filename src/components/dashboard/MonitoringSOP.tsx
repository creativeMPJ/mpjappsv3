import { useState } from "react";
import { Upload, FileText, Music, CheckCircle, Clock, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const eventData = [
  {
    id: 1,
    name: "Halaqoh Akbar MPJ",
    regional: "Malang Raya",
    date: "15 Dec 2024",
    status: "upcoming",
  },
  {
    id: 2,
    name: "Workshop Media Dakwah",
    regional: "Surabaya-Gresik",
    date: "20 Dec 2024",
    status: "upcoming",
  },
  {
    id: 3,
    name: "Pelatihan Video Editing",
    regional: "Kediri Raya",
    date: "10 Dec 2024",
    status: "completed",
  },
  {
    id: 4,
    name: "Rapat Koordinasi Regional",
    regional: "Jember-Lumajang",
    date: "22 Dec 2024",
    status: "upcoming",
  },
  {
    id: 5,
    name: "Launching Podcast MPJ",
    regional: "Sidoarjo-Pasuruan",
    date: "05 Dec 2024",
    status: "completed",
  },
];

const masterFiles = [
  { id: 1, name: "Mars MPJ.mp3", type: "audio", size: "4.2 MB" },
  { id: 2, name: "SOP Event Regional.pdf", type: "document", size: "1.8 MB" },
  { id: 3, name: "Template Proposal.docx", type: "document", size: "256 KB" },
  { id: 4, name: "Jingle MPJ.mp3", type: "audio", size: "3.1 MB" },
  { id: 5, name: "Panduan Branding.pdf", type: "document", size: "5.4 MB" },
];

const MonitoringSOP = () => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    toast.success("File berhasil diupload!", {
      description: "File master akan segera tersedia untuk semua regional.",
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
          <CheckCircle className="h-3 w-3" />
          Selesai
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
        <Clock className="h-3 w-3" />
        Upcoming
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Event Command Center</h1>
        <p className="text-slate-500">Monitoring event regional dan kelola aset master</p>
      </div>

      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-0">
          <Tabs defaultValue="monitoring" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="monitoring"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
              >
                Monitoring Event
              </TabsTrigger>
              <TabsTrigger
                value="sop"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
              >
                Kelola Aset (SOP)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring" className="p-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-600">Nama Event</TableHead>
                    <TableHead className="text-slate-600">Regional</TableHead>
                    <TableHead className="text-slate-600">Tanggal</TableHead>
                    <TableHead className="text-slate-600">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventData.map((event) => (
                    <TableRow key={event.id} className="border-slate-100">
                      <TableCell className="font-medium text-slate-800">
                        {event.name}
                      </TableCell>
                      <TableCell className="text-slate-600">{event.regional}</TableCell>
                      <TableCell className="text-slate-600">{event.date}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="sop" className="p-6 space-y-6">
              {/* Master Files */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  File Master Aktif
                </h3>
                <div className="grid gap-3">
                  {masterFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {file.type === "audio" ? (
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Music className="h-5 w-5 text-purple-600" />
                          </div>
                        ) : (
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{file.name}</p>
                          <p className="text-sm text-slate-500">{file.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-slate-500">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Zone */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Upload Baru
                </h3>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-12 text-center transition-all",
                    isDragging
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-300 hover:border-slate-400"
                  )}
                >
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-700 mb-2">
                    Upload Master File untuk Regional
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Drag & drop file atau klik untuk memilih
                  </p>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                    Pilih File
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringSOP;
