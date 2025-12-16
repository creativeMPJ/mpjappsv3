import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Upload, 
  FileText, 
  Image, 
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LaporanItem {
  id: string;
  judul: string;
  jenis: "foto" | "dokumen";
  eventTerkait: string;
  tanggal: string;
  status: "pending" | "approved";
  fileCount: number;
}

const mockLaporan: LaporanItem[] = [
  {
    id: "1",
    judul: "Dokumentasi Kopdar Akbar Malang",
    jenis: "foto",
    eventTerkait: "Kopdar Akbar Malang",
    tanggal: "15 Des 2024",
    status: "approved",
    fileCount: 24,
  },
  {
    id: "2",
    judul: "Laporan Kegiatan Workshop Jurnalistik",
    jenis: "dokumen",
    eventTerkait: "Workshop Jurnalistik",
    tanggal: "10 Des 2024",
    status: "pending",
    fileCount: 1,
  },
  {
    id: "3",
    judul: "Foto Pelatihan Media Sosial",
    jenis: "foto",
    eventTerkait: "Pelatihan Media Sosial",
    tanggal: "05 Des 2024",
    status: "approved",
    fileCount: 18,
  },
];

const eventList = [
  "Kopdar Akbar Malang",
  "Workshop Jurnalistik",
  "Pelatihan Media Sosial",
  "Seminar Konten Islami",
];

const LaporanDokumentasi = () => {
  const { toast } = useToast();
  const [laporan, setLaporan] = useState<LaporanItem[]>(mockLaporan);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    judul: "",
    jenis: "foto" as "foto" | "dokumen",
    eventTerkait: "",
    deskripsi: "",
    files: null as FileList | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadForm({ ...uploadForm, files: e.target.files });
    }
  };

  const handleSubmit = () => {
    if (!uploadForm.judul || !uploadForm.eventTerkait) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi judul dan event terkait.",
        variant: "destructive",
      });
      return;
    }

    const newLaporan: LaporanItem = {
      id: Date.now().toString(),
      judul: uploadForm.judul,
      jenis: uploadForm.jenis,
      eventTerkait: uploadForm.eventTerkait,
      tanggal: new Date().toLocaleDateString("id-ID", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      }),
      status: "pending",
      fileCount: uploadForm.files?.length || 0,
    };

    setLaporan([newLaporan, ...laporan]);
    setUploadForm({
      judul: "",
      jenis: "foto",
      eventTerkait: "",
      deskripsi: "",
      files: null,
    });
    setShowUploadForm(false);

    toast({
      title: "Laporan berhasil diunggah",
      description: "Laporan Anda akan direview oleh Admin Pusat.",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getJenisBadge = (jenis: string) => {
    if (jenis === "foto") {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          <Image className="w-3 h-3 mr-1" />
          Foto
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
        <FileText className="w-3 h-3 mr-1" />
        Dokumen
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-600" />
            Laporan & Dokumentasi
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload dokumentasi kegiatan regional untuk laporan ke Pusat
          </p>
        </div>
        <Button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload Laporan
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card className="bg-card border-emerald-200 border-2">
          <CardHeader>
            <CardTitle className="text-lg">Form Upload Laporan</CardTitle>
            <CardDescription>
              Lengkapi informasi dan upload file dokumentasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="judul">Judul Laporan *</Label>
                <Input
                  id="judul"
                  placeholder="Masukkan judul laporan"
                  value={uploadForm.judul}
                  onChange={(e) => setUploadForm({ ...uploadForm, judul: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Jenis Laporan *</Label>
                <Select 
                  value={uploadForm.jenis} 
                  onValueChange={(value: "foto" | "dokumen") => 
                    setUploadForm({ ...uploadForm, jenis: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="foto">Dokumentasi Foto</SelectItem>
                    <SelectItem value="dokumen">Dokumen/PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Terkait *</Label>
              <Select 
                value={uploadForm.eventTerkait} 
                onValueChange={(value) => setUploadForm({ ...uploadForm, eventTerkait: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih event terkait" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {eventList.map((event) => (
                    <SelectItem key={event} value={event}>{event}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
              <Textarea
                id="deskripsi"
                placeholder="Tambahkan deskripsi atau catatan..."
                value={uploadForm.deskripsi}
                onChange={(e) => setUploadForm({ ...uploadForm, deskripsi: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload File</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept={uploadForm.jenis === "foto" ? "image/*" : ".pdf,.doc,.docx"}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Klik untuk upload atau drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {uploadForm.jenis === "foto" 
                      ? "PNG, JPG hingga 10MB per file" 
                      : "PDF, DOC hingga 25MB"
                    }
                  </p>
                </label>
                {uploadForm.files && (
                  <p className="text-sm text-emerald-600 mt-2 font-medium">
                    {uploadForm.files.length} file dipilih
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowUploadForm(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Upload Laporan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Laporan Table */}
      <Card className="bg-card shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Laporan</CardTitle>
          <CardDescription>
            Daftar laporan yang telah diunggah ke sistem
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Judul</TableHead>
                  <TableHead className="font-semibold">Jenis</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Event Terkait</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Tanggal</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laporan.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{item.judul}</p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {item.eventTerkait}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getJenisBadge(item.jenis)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {item.eventTerkait}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {item.tanggal}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
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

export default LaporanDokumentasi;
