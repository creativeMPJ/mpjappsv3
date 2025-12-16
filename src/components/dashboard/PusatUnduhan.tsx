import { useState } from "react";
import { 
  Download, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  Folder,
  Search,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface DownloadItem {
  id: string;
  name: string;
  type: "pdf" | "image" | "excel" | "doc";
  size: string;
  category: string;
  downloadCount: number;
}

const downloadData: DownloadItem[] = [
  { id: "1", name: "Panduan Registrasi Pesantren.pdf", type: "pdf", size: "2.5 MB", category: "panduan", downloadCount: 450 },
  { id: "2", name: "Template SK Kolektif.docx", type: "doc", size: "156 KB", category: "template", downloadCount: 320 },
  { id: "3", name: "Logo MPJ Official.png", type: "image", size: "512 KB", category: "branding", downloadCount: 890 },
  { id: "4", name: "Template Laporan Kegiatan.xlsx", type: "excel", size: "89 KB", category: "template", downloadCount: 210 },
  { id: "5", name: "Panduan Admin Regional.pdf", type: "pdf", size: "3.1 MB", category: "panduan", downloadCount: 180 },
  { id: "6", name: "Asset Kit Sosial Media.zip", type: "image", size: "15 MB", category: "branding", downloadCount: 560 },
  { id: "7", name: "Template Sertifikat Event.pptx", type: "doc", size: "1.2 MB", category: "template", downloadCount: 340 },
  { id: "8", name: "Data Export Pesantren.xlsx", type: "excel", size: "2.8 MB", category: "data", downloadCount: 95 },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf": return <FileText className="h-8 w-8 text-red-500" />;
    case "image": return <Image className="h-8 w-8 text-blue-500" />;
    case "excel": return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
    case "doc": return <FileText className="h-8 w-8 text-blue-600" />;
    default: return <Folder className="h-8 w-8 text-slate-500" />;
  }
};

const PusatUnduhan = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleDownload = (item: DownloadItem) => {
    toast.success(`Mengunduh ${item.name}...`);
  };

  const filteredData = downloadData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === "all" || item.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pusat Unduhan</h1>
          <p className="text-slate-500">Download template, panduan, dan asset resmi MPJ</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{downloadData.length}</p>
            <p className="text-sm text-slate-500">Total File</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {downloadData.reduce((acc, item) => acc + item.downloadCount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-slate-500">Total Download</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">4</p>
            <p className="text-sm text-slate-500">Kategori</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">25.3 MB</p>
            <p className="text-sm text-slate-500">Total Size</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">Semua</TabsTrigger>
          <TabsTrigger value="panduan" className="data-[state=active]:bg-white">Panduan</TabsTrigger>
          <TabsTrigger value="template" className="data-[state=active]:bg-white">Template</TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-white">Branding</TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-white">Data</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((item) => (
              <Card key={item.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      {getFileIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-800 truncate">{item.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{item.size}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {item.downloadCount} downloads
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleDownload(item)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PusatUnduhan;
