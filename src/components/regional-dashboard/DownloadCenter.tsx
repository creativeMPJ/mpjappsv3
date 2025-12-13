import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  DownloadCloud,
  FileText,
  FileImage,
  Music,
  File,
  Download,
  Calendar,
} from "lucide-react";

interface FileItem {
  id: number;
  nama: string;
  tipe: "pdf" | "image" | "audio" | "document";
  ukuran: string;
  tanggalUpload: string;
  kategori: string;
}

const files: FileItem[] = [
  {
    id: 1,
    nama: "SOP Registrasi Pesantren.pdf",
    tipe: "pdf",
    ukuran: "2.4 MB",
    tanggalUpload: "10 Dec 2024",
    kategori: "SOP",
  },
  {
    id: 2,
    nama: "Mars MPJ.mp3",
    tipe: "audio",
    ukuran: "5.1 MB",
    tanggalUpload: "08 Dec 2024",
    kategori: "Audio",
  },
  {
    id: 3,
    nama: "Logo MPJ Official.png",
    tipe: "image",
    ukuran: "1.2 MB",
    tanggalUpload: "05 Dec 2024",
    kategori: "Branding",
  },
  {
    id: 4,
    nama: "Template Proposal Event.docx",
    tipe: "document",
    ukuran: "856 KB",
    tanggalUpload: "01 Dec 2024",
    kategori: "Template",
  },
  {
    id: 5,
    nama: "Panduan Validasi Regional.pdf",
    tipe: "pdf",
    ukuran: "3.8 MB",
    tanggalUpload: "28 Nov 2024",
    kategori: "SOP",
  },
  {
    id: 6,
    nama: "Backdrop Event 2024.jpg",
    tipe: "image",
    ukuran: "4.5 MB",
    tanggalUpload: "25 Nov 2024",
    kategori: "Branding",
  },
  {
    id: 7,
    nama: "Hymne Santri.mp3",
    tipe: "audio",
    ukuran: "4.2 MB",
    tanggalUpload: "20 Nov 2024",
    kategori: "Audio",
  },
  {
    id: 8,
    nama: "Laporan Tahunan 2024.pdf",
    tipe: "pdf",
    ukuran: "12.3 MB",
    tanggalUpload: "15 Nov 2024",
    kategori: "Laporan",
  },
];

const DownloadCenter = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getFileIcon = (tipe: string) => {
    switch (tipe) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "image":
        return <FileImage className="w-8 h-8 text-blue-500" />;
      case "audio":
        return <Music className="w-8 h-8 text-purple-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getCategoryColor = (kategori: string) => {
    switch (kategori) {
      case "SOP":
        return "bg-dashboard-sidebar text-white";
      case "Audio":
        return "bg-purple-500 text-white";
      case "Branding":
        return "bg-blue-500 text-white";
      case "Template":
        return "bg-dashboard-accent text-white";
      case "Laporan":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const handleDownload = (file: FileItem) => {
    toast({
      title: "Download Dimulai",
      description: `Mengunduh ${file.nama} via Node.js API...`,
      className: "bg-dashboard-sidebar text-white",
    });
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-sm border-0">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
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
            <DownloadCloud className="w-6 h-6 text-dashboard-sidebar" />
            Download Center
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Unduh file master dari MPJ Pusat untuk kebutuhan regional
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getFileIcon(file.tipe)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 group-hover:text-dashboard-sidebar transition-colors">
                      {file.nama}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge className={`${getCategoryColor(file.kategori)} text-xs`}>
                        {file.kategori}
                      </Badge>
                      <span className="text-xs text-gray-400">{file.ukuran}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {file.tanggalUpload}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="bg-dashboard-sidebar hover:bg-dashboard-sidebar/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadCenter;
