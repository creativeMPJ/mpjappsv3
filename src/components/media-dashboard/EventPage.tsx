import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  UserCheck, 
  Play, 
  Calendar, 
  Award, 
  FileText,
  Construction 
} from "lucide-react";
import ComingSoonOverlay from "@/components/shared/ComingSoonOverlay";

/**
 * Event Page - Sequential Engine with 6 Tabs
 * All tabs are Coming Soon for MVP
 */
const EventPage = () => {
  const tabs = [
    { id: "pendaftaran", label: "Pendaftaran", icon: ClipboardList },
    { id: "verifikasi", label: "Verifikasi", icon: UserCheck },
    { id: "pelaksanaan", label: "Pelaksanaan", icon: Play },
    { id: "absensi", label: "Absensi", icon: Calendar },
    { id: "sertifikat", label: "E-Sertifikat", icon: Award },
    { id: "laporan", label: "Laporan", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Event</h1>
          <p className="text-slate-500">Sequential Engine untuk pengelolaan event pesantren</p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
          <Construction className="h-3 w-3" />
          Coming Soon
        </Badge>
      </div>

      <Tabs defaultValue="pendaftaran" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6 bg-slate-100 h-auto p-1">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id} 
              className="flex flex-col gap-1 py-2 px-2 text-xs data-[state=active]:bg-[#166534] data-[state=active]:text-white"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <Card className="border-dashed border-2 border-slate-300">
              <CardContent className="p-0">
                <ComingSoonOverlay 
                  title={`Modul ${tab.label}`}
                  description={`Fitur ${tab.label} Event sedang dalam pengembangan dan akan segera tersedia.`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Event Quick Overview */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#166534]" />
            Agenda Event Mendatang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-10">
                <Badge className="bg-amber-500 text-white">Coming Soon</Badge>
              </div>
              <p className="text-3xl font-bold text-slate-300">0</p>
              <p className="text-sm text-slate-400">Event Terdaftar</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-10">
                <Badge className="bg-amber-500 text-white">Coming Soon</Badge>
              </div>
              <p className="text-3xl font-bold text-slate-300">0</p>
              <p className="text-sm text-slate-400">Sertifikat Diklaim</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-10">
                <Badge className="bg-amber-500 text-white">Coming Soon</Badge>
              </div>
              <p className="text-3xl font-bold text-slate-300">0</p>
              <p className="text-sm text-slate-400">Laporan Selesai</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventPage;
