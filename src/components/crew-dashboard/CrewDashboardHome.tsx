import { Award, Users, IdCard, Calendar, Pencil, Download, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CrewDashboardHomeProps {
  onNavigate: (view: string) => void;
  institutionPaid: boolean;
}

const CrewDashboardHome = ({ onNavigate, institutionPaid }: CrewDashboardHomeProps) => {
  const stats = {
    totalXP: 50,
    targetXP: 150,
    certificates: 2,
    eventsAttended: 5,
  };

  const quickMenuItems = [
    {
      id: "profil",
      title: "Personal Profile",
      subtitle: "Ubah Data Pribadi",
      icon: Pencil,
      color: "bg-amber-100 text-amber-600",
    },
    {
      id: "tim",
      title: "My Team",
      subtitle: "Lihat Anggota Tim (Read Only)",
      icon: Users,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      id: "idcard",
      title: "My ID Card",
      subtitle: "Akses E-ID Card Pribadi",
      icon: IdCard,
      color: "bg-emerald-100 text-emerald-600",
      locked: !institutionPaid,
    },
    {
      id: "kegiatan",
      title: "Events",
      subtitle: "Lihat Event Tersedia",
      icon: Calendar,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Institution Info Bar */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Building className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Linked to:</p>
            <p className="font-bold text-lg text-foreground">PP Al Hikmah</p>
          </div>
        </CardContent>
      </Card>

      {/* Unpaid Institution Alert */}
      {!institutionPaid && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            💡 Hubungi Koordinator Anda untuk aktivasi ID Card.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* XP Card */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">My XP</h3>
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {stats.totalXP} XP
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Personal progress</span>
                <span>{stats.targetXP} XP</span>
              </div>
              <Progress value={(stats.totalXP / stats.targetXP) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {Math.round((stats.totalXP / stats.targetXP) * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Card */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">My Certificates</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center relative">
                  <Award className="h-6 w-6 text-emerald-600" />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                    ⭐
                  </span>
                </div>
                <span className="text-lg font-semibold">
                  {stats.certificates} Sertifikat Tersedia
                </span>
              </div>
              <Button
                size="icon"
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => onNavigate("kegiatan")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickMenuItems.map((item) => (
          <Card
            key={item.id}
            className={`bg-white cursor-pointer hover:shadow-md transition-all ${
              item.locked ? "opacity-60" : ""
            }`}
            onClick={() => !item.locked && onNavigate(item.id === "idcard" ? "profil" : item.id)}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
              {item.locked && (
                <Badge variant="secondary" className="ml-auto">
                  🔒
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
