import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Construction, Download, Folder, Megaphone } from "lucide-react";

const MPJHub = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">MPJ-Hub</h1>
          <p className="text-slate-500">Pusat resource dan materi untuk media pesantren</p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
          <Construction className="h-3 w-3" />
          Segera Hadir
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Template", icon: Folder },
          { label: "Panduan", icon: BookOpen },
          { label: "Materi", icon: Download },
          { label: "Pengumuman", icon: Megaphone },
        ].map((item) => (
          <Card key={item.label} className="bg-white border border-slate-200 opacity-75">
            <CardContent className="p-6 text-center">
              <item.icon className="h-10 w-10 mx-auto mb-3 text-slate-400" />
              <p className="font-semibold text-slate-700">{item.label}</p>
              <p className="text-sm text-slate-500">Fitur akan segera tersedia</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Pengumuman Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Megaphone className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-700">Belum ada data</p>
            <p className="text-sm text-slate-500">Data akan tampil setelah tersedia</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Folder className="h-5 w-5 text-[#166534]" />
            Resource
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Download className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-700">Belum ada data</p>
            <p className="text-sm text-slate-500">Data akan tampil setelah tersedia</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MPJHub;
