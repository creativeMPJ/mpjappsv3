import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Video, 
  Image, 
  BookOpen,
  ExternalLink,
  Folder,
  Play
} from "lucide-react";

const MPJHub = () => {
  const resources = [
    {
      category: "Template",
      items: [
        { title: "Template Poster Event", type: "PSD", size: "25 MB", icon: Image },
        { title: "Template Story Instagram", type: "AI", size: "12 MB", icon: Image },
        { title: "Template Sertifikat", type: "DOCX", size: "2 MB", icon: FileText },
      ],
    },
    {
      category: "Panduan",
      items: [
        { title: "SOP Media Pesantren", type: "PDF", size: "5 MB", icon: BookOpen },
        { title: "Panduan Branding", type: "PDF", size: "8 MB", icon: BookOpen },
        { title: "Etika Jurnalistik Santri", type: "PDF", size: "3 MB", icon: BookOpen },
      ],
    },
    {
      category: "Video Tutorial",
      items: [
        { title: "Editing Video Dasar", type: "MP4", size: "150 MB", icon: Video },
        { title: "Fotografi Produk", type: "MP4", size: "120 MB", icon: Video },
        { title: "Social Media Marketing", type: "MP4", size: "200 MB", icon: Video },
      ],
    },
  ];

  const announcements = [
    {
      title: "Lomba Video Pendek MPJ 2024",
      date: "20 Januari 2024",
      type: "Event",
    },
    {
      title: "Update Template Baru Tersedia",
      date: "15 Januari 2024",
      type: "Resource",
    },
    {
      title: "Workshop Editing Video Online",
      date: "10 Januari 2024",
      type: "Training",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">MPJ-Hub</h1>
        <p className="text-slate-500">Pusat resource dan materi untuk media pesantren</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#166534] to-[#14532d] text-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Folder className="h-10 w-10 mx-auto mb-3 opacity-90" />
            <p className="font-semibold">Template</p>
            <p className="text-sm opacity-80">15 files</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#f59e0b] to-amber-500 text-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-90" />
            <p className="font-semibold">Panduan</p>
            <p className="text-sm opacity-80">8 files</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Video className="h-10 w-10 mx-auto mb-3 opacity-90" />
            <p className="font-semibold">Video</p>
            <p className="text-sm opacity-80">12 videos</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <ExternalLink className="h-10 w-10 mx-auto mb-3 opacity-90" />
            <p className="font-semibold">Links</p>
            <p className="text-sm opacity-80">Useful tools</p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Pengumuman Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {announcements.map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  item.type === "Event" ? "bg-[#166534] text-white" :
                  item.type === "Resource" ? "bg-[#f59e0b] text-white" :
                  "bg-purple-500 text-white"
                }`}>
                  {item.type === "Event" ? <Play className="h-5 w-5" /> :
                   item.type === "Resource" ? <Download className="h-5 w-5" /> :
                   <Video className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.date}</p>
                </div>
              </div>
              <Badge variant="secondary" className={`${
                item.type === "Event" ? "bg-emerald-100 text-[#166534]" :
                item.type === "Resource" ? "bg-amber-100 text-amber-700" :
                "bg-purple-100 text-purple-700"
              }`}>
                {item.type}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resource Categories */}
      {resources.map((category) => (
        <Card key={category.category} className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Folder className="h-5 w-5 text-[#166534]" />
              {category.category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.items.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-[#166534] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.type} • {item.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-[#166534]">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MPJHub;