import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Building2, 
  Calendar, 
  Clock, 
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const RegionalDashboardHome = () => {
  const [loading, setLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: "Pendaftar Baru",
      value: "5",
      icon: ClipboardList,
      badge: "Need Action",
      badgeColor: "bg-accent",
      valueColor: "text-sidebar",
      iconBg: "bg-primary/10",
    },
    {
      title: "Total Pesantren",
      value: "120",
      icon: Building2,
      trend: true,
      valueColor: "text-sidebar",
      iconBg: "bg-primary/10",
    },
    {
      title: "Event Bulan Ini",
      value: "3",
      icon: Calendar,
      badge: "Active",
      badgeColor: "bg-primary",
      valueColor: "text-sidebar",
      iconBg: "bg-primary/10",
    },
  ];

  const antrianValidasi = [
    { nama: "PP Al Hikmah", tanggal: "12/10/2023" },
    { nama: "PP Darul Ulum", tanggal: "11/10/2023" },
    { nama: "PP Nurul Jadid", tanggal: "10/10/2023" },
  ];

  const logAktivitas = [
    { waktu: "10:30 AM", aksi: "PP Al Hikmah updated profile data." },
    { waktu: "09:15 AM", aksi: "New Event 'Workshop Media' created by Admin Malang." },
    { waktu: "Yesterday", aksi: "PP Miftahul Ulum registration approved." },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-card shadow-sm border border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-2">{stat.title}</p>
                    <div className="flex items-center gap-2">
                      <p className={`text-5xl font-bold ${stat.valueColor}`}>{stat.value}</p>
                      {stat.trend && <TrendingUp className="w-5 h-5 text-sidebar" />}
                    </div>
                    {stat.badge && (
                      <Badge className={`mt-3 ${stat.badgeColor} text-primary-foreground font-medium`}>
                        {stat.badge}
                      </Badge>
                    )}
                  </div>
                  <div className={`p-4 ${stat.iconBg} rounded-xl`}>
                    <Icon className="w-10 h-10 text-sidebar" strokeWidth={1.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antrian Validasi */}
        <Card className="bg-card shadow-sm border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-foreground">
              Daftar Antrian Validasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {antrianValidasi.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-sidebar" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.nama}</p>
                    <p className="text-sm text-muted-foreground">{item.tanggal}</p>
                  </div>
                </div>
                <Button 
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-6"
                >
                  Review
                </Button>
              </div>
            ))}
            <button className="w-full text-center text-accent hover:text-accent/80 font-medium py-3 transition-colors">
              Lihat Semua
            </button>
          </CardContent>
        </Card>

        {/* Log Aktivitas */}
        <Card className="bg-card shadow-sm border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-foreground">
              Log Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logAktivitas.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">{item.waktu}</p>
                  <p className="text-foreground">{item.aksi}</p>
                </div>
              </div>
            ))}
            <button className="w-full text-center text-accent hover:text-accent/80 font-medium py-3 transition-colors">
              Lihat Seluruh Log
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegionalDashboardHome;
