import { Layers, Upload, FileText, Link as LinkIcon, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const AdminPusatHub = () => {
  const { toast } = useToast();

  const handleLockedFeature = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `Fitur "${feature}" akan tersedia di update selanjutnya.`,
      variant: "default",
    });
  };

  // Dummy files for preview
  const pusatFiles = [
    { id: "1", nama: "Panduan Branding MPJ 2025", tipe: "PDF", tanggal: "10 Jan 2025" },
    { id: "2", nama: "Template Poster Event", tipe: "PSD", tanggal: "05 Jan 2025" },
    { id: "3", nama: "SOP Dokumentasi Kegiatan", tipe: "PDF", tanggal: "01 Jan 2025" },
  ];

  const regionalFiles = [
    { id: "1", nama: "Laporan Surabaya Q4 2024", tipe: "PDF", tanggal: "28 Dec 2024" },
    { id: "2", nama: "Rekap Malang Raya", tipe: "XLSX", tanggal: "20 Dec 2024" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">MPJ-HUB</h1>
          <p className="text-slate-500 mt-1">Pusat file dan resources MPJ</p>
        </div>
        <Button 
          onClick={() => handleLockedFeature("Upload File")}
          className="bg-slate-300 text-slate-600 cursor-not-allowed"
          disabled
        >
          <Lock className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex items-center gap-3">
          <Lock className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            Fitur Upload sedang dalam pengembangan. Saat ini Anda hanya dapat melihat daftar file.
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pusat">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="pusat">File Pusat</TabsTrigger>
          <TabsTrigger value="regional">File Regional</TabsTrigger>
        </TabsList>

        <TabsContent value="pusat">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#166534]" />
                File dari Pusat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pusatFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 border border-slate-200 rounded-lg flex items-center gap-4 hover:border-emerald-300 transition-colors"
                  >
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-[#166534]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">{file.nama}</h3>
                      <p className="text-sm text-slate-500">{file.tipe} • {file.tanggal}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-slate-500">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                File dari Regional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {regionalFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 border border-slate-200 rounded-lg flex items-center gap-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">{file.nama}</h3>
                      <p className="text-sm text-slate-500">{file.tipe} • {file.tanggal}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-slate-500">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-sm text-slate-500 text-center">
        * Data dummy untuk preview
      </p>
    </div>
  );
};

export default AdminPusatHub;
