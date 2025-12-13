import { useState } from "react";
import { Home, Award, Users, UserCog, LogOut, Menu, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CrewDashboardHome from "@/components/crew-dashboard/CrewDashboardHome";
import KegiatanSaya from "@/components/crew-dashboard/KegiatanSaya";
import TimSaya from "@/components/crew-dashboard/TimSaya";
import ProfilPribadi from "@/components/crew-dashboard/ProfilPribadi";

const menuItems = [
  { id: "beranda", label: "Beranda", icon: Home },
  { id: "kegiatan", label: "Kegiatan Saya", icon: Award },
  { id: "tim", label: "Tim Saya", icon: Users },
  { id: "profil", label: "Profil Pribadi", icon: UserCog },
];

const CrewDashboard = () => {
  const [activeView, setActiveView] = useState("beranda");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [institutionPaid, setInstitutionPaid] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case "beranda":
        return <CrewDashboardHome onNavigate={setActiveView} institutionPaid={institutionPaid} />;
      case "kegiatan":
        return <KegiatanSaya />;
      case "tim":
        return <TimSaya />;
      case "profil":
        return <ProfilPribadi />;
      default:
        return <CrewDashboardHome onNavigate={setActiveView} institutionPaid={institutionPaid} />;
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#166534] flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🕌</span>
            </div>
            <span className="text-white font-bold text-xl">MPJ Apps</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white transition-all",
                activeView === item.id
                  ? "bg-[#064e3b] border-l-4 border-amber-400"
                  : "hover:bg-white/10"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/20">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                <AvatarFallback>AK</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="font-semibold text-foreground">Crew Member</p>
              </div>
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                <span className="mr-1">⚡</span> 50 XP
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://i.pravatar.cc/150?img=12" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Status Toggle for Testing */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant={institutionPaid ? "default" : "secondary"}
          onClick={() => setInstitutionPaid(!institutionPaid)}
          className="shadow-lg"
        >
          {institutionPaid ? "🏅 Gold" : "🔒 Basic"}
        </Button>
      </div>
    </div>
  );
};

export default CrewDashboard;
