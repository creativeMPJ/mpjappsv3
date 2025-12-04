import { useState } from "react";
import { 
  Home, 
  Database, 
  Calendar, 
  Award, 
  BarChart3, 
  LogOut,
  Menu,
  Users,
  TrendingUp,
  FileText
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sidebarItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Database, label: "Data Media", path: "/dashboard/media" },
  { icon: Calendar, label: "Event", path: "/dashboard/event" },
  { icon: Award, label: "Reward", path: "/dashboard/reward" },
  { icon: BarChart3, label: "Statistik", path: "/dashboard/statistik" },
];

const statsData = [
  { 
    title: "Total Media Pesantren", 
    value: "5", 
    subtitle: "Media aktif",
    change: "+12% dari bulan lalu",
    icon: FileText,
    positive: true
  },
  { 
    title: "Total Anggota", 
    value: "65", 
    subtitle: "Anggota aktif",
    change: "+8% dari bulan lalu",
    icon: Users,
    positive: true
  },
  { 
    title: "Event Aktif", 
    value: "3", 
    subtitle: "Event berlangsung",
    change: null,
    icon: Calendar,
    positive: false
  },
  { 
    title: "Total Poin Reward", 
    value: "155", 
    subtitle: "Poin disetujui",
    change: "+15% dari bulan lalu",
    icon: Award,
    positive: true
  },
];

const upcomingEvents = [
  { 
    title: "Workshop Digital Marketing Pesantren", 
    date: "15 Desember 2025", 
    location: "Surabaya",
    type: "workshop"
  },
  { 
    title: "Pelatihan Fotografi & Videografi", 
    date: "1 Desember 2025", 
    location: "Pasuruan",
    type: "pelatihan"
  },
];

const pendingRewards = [
  { 
    name: "Muhammad Ridwan", 
    organization: "PP Nurul Jadid",
    activity: "Partisipasi Workshop Digital Marketing",
    points: 100
  },
];

const regionalSummary = [
  { city: "Probolinggo", count: 1, members: 15 },
  { city: "Surabaya", count: 1, members: 12 },
  { city: "Malang", count: 1, members: 8 },
  { city: "Pasuruan", count: 1, members: 20 },
  { city: "Tuban", count: 1, members: 10 },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-secondary/30 flex w-full">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-primary text-primary-foreground flex flex-col transition-all duration-300 fixed lg:relative h-screen z-50",
          sidebarOpen ? "w-64" : "w-0 lg:w-20"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-primary-foreground/10">
          <h1 className={cn("font-bold transition-all", sidebarOpen ? "text-xl" : "text-sm text-center")}>
            {sidebarOpen ? "MPJ Apps" : "MPJ"}
          </h1>
          {sidebarOpen && (
            <p className="text-sm text-primary-foreground/70 mt-1">Pengurus Pusat</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 transition-all hover:bg-primary-foreground/10",
                  isActive && "bg-primary-foreground/20 border-r-4 border-accent"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-primary-foreground/10">
          <Link
            to="/"
            className="flex items-center gap-3 px-2 py-3 transition-all hover:bg-primary-foreground/10 rounded-lg"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Keluar</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-background border-b border-border p-4 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard Pengurus Pusat</h1>
              <p className="text-muted-foreground">Selamat datang, Ahmad Fauzi</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((stat, index) => (
              <Card key={index} className="bg-background border-border shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                      {stat.change && (
                        <p className="text-sm text-primary flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {stat.change}
                        </p>
                      )}
                    </div>
                    <div className="p-3 bg-secondary rounded-xl">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Two Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <Card className="bg-background border-border shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Event Mendatang</CardTitle>
                <p className="text-sm text-muted-foreground">Event yang akan berlangsung</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.date} • {event.location}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-border text-foreground">
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pending Rewards */}
            <Card className="bg-background border-border shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Reward Menunggu Validasi</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {pendingRewards.length} reward perlu divalidasi
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRewards.map((reward, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{reward.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reward.organization} • {reward.activity}
                      </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      +{reward.points} poin
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Regional Summary */}
          <Card className="bg-background border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Ringkasan Regional</CardTitle>
              <p className="text-sm text-muted-foreground">Media pesantren per wilayah</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {regionalSummary.map((region, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-primary/10 rounded-xl text-center border border-primary/20"
                  >
                    <p className="text-sm font-medium text-foreground">{region.city}</p>
                    <p className="text-3xl font-bold text-primary my-2">{region.count}</p>
                    <p className="text-sm text-muted-foreground">{region.members} anggota</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
