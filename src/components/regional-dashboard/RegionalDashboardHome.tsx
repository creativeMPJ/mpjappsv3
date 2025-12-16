import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Building2, 
  Calendar, 
  TrendingUp,
  Users,
  AlertTriangle,
  Wallet,
  ArrowRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, Bar, BarChart, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const monthlyGrowthData = [
  { month: "Jul", members: 2100 },
  { month: "Agu", members: 2200 },
  { month: "Sep", members: 2300 },
  { month: "Okt", members: 2380 },
  { month: "Nov", members: 2450 },
  { month: "Des", members: 2500 },
];

const eventActivityData = [
  { month: "Jul", hadir: 45, total: 60 },
  { month: "Agu", hadir: 52, total: 70 },
  { month: "Sep", hadir: 48, total: 65 },
  { month: "Okt", hadir: 60, total: 75 },
  { month: "Nov", hadir: 55, total: 68 },
  { month: "Des", hadir: 62, total: 72 },
];

const paymentStatusData = [
  { name: "Lunas", value: 1850, color: "hsl(160, 84%, 39%)" },
  { name: "Belum Lunas", value: 650, color: "hsl(38, 92%, 50%)" },
];

const chartConfig = {
  members: { label: "Member", color: "hsl(160, 84%, 39%)" },
  hadir: { label: "Hadir", color: "hsl(160, 84%, 39%)" },
  total: { label: "Total", color: "hsl(217, 91%, 60%)" },
};

const RegionalDashboardHome = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: "Pending Validasi",
      value: "5",
      icon: ClipboardList,
      badge: "Butuh Tindakan",
      badgeColor: "bg-red-500",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      alert: true,
    },
    {
      title: "Total Anggota",
      value: "2,500",
      icon: Users,
      trend: "+12%",
      trendUp: true,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Pesantren",
      value: "120",
      icon: Building2,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Keaktifan Event",
      value: "78%",
      icon: Calendar,
      badge: "Baik",
      badgeColor: "bg-emerald-500",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const antrianValidasi = [
    { nama: "PP Al Hikmah", tanggal: "12 Des 2024", forceApproved: false },
    { nama: "PP Darul Ulum", tanggal: "11 Des 2024", forceApproved: true },
    { nama: "PP Nurul Jadid", tanggal: "10 Des 2024", forceApproved: false },
    { nama: "PP Al Falah", tanggal: "10 Des 2024", forceApproved: false },
    { nama: "PP Miftahul Huda", tanggal: "09 Des 2024", forceApproved: false },
  ];

  const upcomingEvents = [
    { nama: "Kopdar Akbar Malang", tanggal: "20 Des 2024", peserta: 45 },
    { nama: "Workshop Jurnalistik", tanggal: "05 Jan 2025", peserta: 30 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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

  const attendanceRate = Math.round(
    (eventActivityData.reduce((acc, d) => acc + d.hadir, 0) / 
     eventActivityData.reduce((acc, d) => acc + d.total, 0)) * 100
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={`bg-card shadow-sm border hover:shadow-md transition-shadow ${
                stat.alert ? "border-red-200 bg-red-50/50" : "border-border"
              }`}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground font-medium mb-1 truncate">
                      {stat.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                      {stat.trend && (
                        <span className={`text-xs font-medium ${stat.trendUp ? "text-emerald-600" : "text-red-600"}`}>
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    {stat.badge && (
                      <Badge className={`mt-2 ${stat.badgeColor} text-white text-xs`}>
                        {stat.badge}
                      </Badge>
                    )}
                  </div>
                  <div className={`p-2 md:p-3 ${stat.iconBg} rounded-xl flex-shrink-0`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card className="bg-card shadow-sm border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Pertumbuhan Anggota
            </CardTitle>
            <CardDescription>Member baru per bulan (6 bulan terakhir)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <AreaChart data={monthlyGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={45} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="members"
                  stroke="hsl(160, 84%, 39%)"
                  strokeWidth={2}
                  fill="url(#growthGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Status Pie Chart */}
        <Card className="bg-card shadow-sm border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-amber-600" />
              Status Pembayaran
            </CardTitle>
            <CardDescription>Rasio member lunas vs belum lunas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <div className="h-[180px] w-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {paymentStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-lg font-bold">{item.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antrian Validasi */}
        <Card className="bg-card shadow-sm border border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-foreground">
                Antrian Validasi
              </CardTitle>
              <Badge className="bg-red-500 text-white">5 Pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {antrianValidasi.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  item.forceApproved 
                    ? "bg-amber-50 border border-amber-200" 
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.forceApproved ? "bg-amber-100" : "bg-emerald-100"
                  }`}>
                    <Building2 className={`w-5 h-5 ${
                      item.forceApproved ? "text-amber-600" : "text-emerald-600"
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm">{item.nama}</p>
                      {item.forceApproved && (
                        <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Force Approved
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.tanggal}</p>
                  </div>
                </div>
                <Button 
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                >
                  Review
                </Button>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-emerald-600 hover:text-emerald-700 mt-2">
              Lihat Semua
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-card shadow-sm border border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-foreground">
                Event Mendatang
              </CardTitle>
              <Badge className="bg-blue-500 text-white">2 Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.nama}</p>
                    <p className="text-xs text-muted-foreground">{item.tanggal}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{item.peserta}</p>
                  <p className="text-xs text-muted-foreground">Peserta</p>
                </div>
              </div>
            ))}
            
            {/* Event Activity Stats */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-3">Kehadiran Event</p>
              <ChartContainer config={chartConfig} className="h-[120px] w-full">
                <BarChart data={eventActivityData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hadir" fill="hsl(160, 84%, 39%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegionalDashboardHome;
