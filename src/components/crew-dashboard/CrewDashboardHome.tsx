import { Award, Building, Calendar, IdCard, Pencil, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CrewDashboardHomeProps {
  onNavigate: (view: string) => void;
  institutionPaid: boolean;
}

const quickMenuItems = [
  { id: "profil", title: "Profil Saya", subtitle: "Data pribadi kru", icon: Pencil, color: "bg-amber-100 text-amber-600" },
  { id: "tim", title: "Tim Saya", subtitle: "Rekan satu tim", icon: Users, color: "bg-emerald-100 text-emerald-600" },
  { id: "idcard", title: "E-ID", subtitle: "Identitas digital", icon: IdCard, color: "bg-emerald-100 text-emerald-600" },
  { id: "kegiatan", title: "Event", subtitle: "Event akan tampil setelah tersedia", icon: Calendar, color: "bg-slate-100 text-slate-600", soon: true },
];

const CrewDashboardHome = ({ onNavigate, institutionPaid }: CrewDashboardHomeProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Building className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pesantren</p>
            <p className="font-bold text-lg text-foreground">Belum ada data</p>
            <p className="text-sm text-muted-foreground">Data akan tampil setelah tersedia</p>
          </div>
        </CardContent>
      </Card>

      {!institutionPaid && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            Aktifkan akun terlebih dahulu.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">XP Saya</h3>
            <p className="text-2xl font-bold text-foreground">0 XP</p>
            <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Sertifikat</h3>
                <p className="text-sm text-muted-foreground">Sertifikat akan tampil setelah diterbitkan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickMenuItems.map((item) => (
          <Card
            key={item.id}
            className={`bg-white transition-all ${item.soon || (item.id === "idcard" && !institutionPaid) ? "opacity-60" : "cursor-pointer hover:shadow-md"}`}
            onClick={() => {
              if (item.soon || (item.id === "idcard" && !institutionPaid)) return;
              onNavigate(item.id === "idcard" ? "profil" : item.id);
            }}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
              {(item.soon || (item.id === "idcard" && !institutionPaid)) && (
                <Badge variant="secondary" className="ml-auto">
                  {item.soon ? "Segera Hadir" : "Terkunci"}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CrewDashboardHome;
