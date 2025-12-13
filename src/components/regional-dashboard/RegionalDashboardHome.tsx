import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const RegionalDashboardHome = () => {
  const [loading, setLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: "Pendaftar Baru",
      value: "5",
      icon: Users,
      badge: "Need Action",
      badgeColor: "bg-dashboard-accent",
      valueColor: "text-dashboard-sidebar",
    },
    {
      title: "Total Pesantren",
      value: "120",
      icon: Building2,
      valueColor: "text-dashboard-sidebar",
    },
    {
      title: "Event Aktif",
      value: "2",
      icon: Calendar,
      valueColor: "text-gray-700",
    },
  ];

  const antrianValidasi = [
    { nama: "PP Al Hikmah", waktu: "2 jam lalu", status: "pending" },
    { nama: "PP Nurul Jadid", waktu: "3 jam lalu", status: "pending" },
    { nama: "PP Darul Ulum", waktu: "5 jam lalu", status: "pending" },
    { nama: "PP Al Falah", waktu: "6 jam lalu", status: "pending" },
    { nama: "PP Miftahul Huda", waktu: "8 jam lalu", status: "pending" },
  ];

  const logAktivitas = [
    { aksi: "Approve data PP Al Barokah", waktu: "10:30", status: "success" },
    { aksi: "Tolak data PP Nurul Huda", waktu: "09:45", status: "rejected" },
    { aksi: "Download SOP terbaru", waktu: "09:00", status: "info" },
    { aksi: "Approve data PP Hidayatullah", waktu: "08:30", status: "success" },
    { aksi: "Login ke sistem", waktu: "08:00", status: "info" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
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
            <Card key={index} className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className={`text-4xl font-bold ${stat.valueColor}`}>{stat.value}</p>
                    {stat.badge && (
                      <Badge className={`mt-2 ${stat.badgeColor} text-white`}>
                        {stat.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 bg-dashboard-sidebar/10 rounded-xl">
                    <Icon className="w-6 h-6 text-dashboard-sidebar" />
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
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-dashboard-accent" />
              Antrian Validasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {antrianValidasi.map((item, index) => (
                <li key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-dashboard-accent rounded-full animate-pulse" />
                    <div>
                      <p className="font-medium text-gray-800">{item.nama}</p>
                      <p className="text-sm text-gray-500">{item.waktu}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-dashboard-accent text-dashboard-accent">
                    Pending
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Log Aktivitas */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-dashboard-sidebar" />
              Log Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {logAktivitas.map((item, index) => (
                <li key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : item.status === "rejected" ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-300" />
                    )}
                    <p className="text-gray-700">{item.aksi}</p>
                  </div>
                  <span className="text-sm text-gray-400">{item.waktu}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegionalDashboardHome;
