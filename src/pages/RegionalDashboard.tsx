import { useState } from "react";
import { 
  Home, 
  UserCheck, 
  Calendar, 
  DownloadCloud, 
  LogOut, 
  Menu, 
  X,
  Bell,
  User,
  LayoutDashboard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RegionalDashboardHome from "@/components/regional-dashboard/RegionalDashboardHome";
import ValidasiPendaftar from "@/components/regional-dashboard/ValidasiPendaftar";
import ManajemenEvent from "@/components/regional-dashboard/ManajemenEvent";
import DownloadCenter from "@/components/regional-dashboard/DownloadCenter";

type ViewType = "beranda" | "validasi" | "event" | "download";

const menuItems = [
  { id: "beranda" as ViewType, label: "Dashboard", icon: LayoutDashboard },
  { id: "validasi" as ViewType, label: "Validasi Data Pendaftar", icon: UserCheck, badge: 5 },
  { id: "event" as ViewType, label: "Input & Kelola Event", icon: Calendar },
  { id: "download" as ViewType, label: "Download Center", icon: DownloadCloud },
];

const RegionalDashboard = () => {
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case "beranda":
        return <RegionalDashboardHome />;
      case "validasi":
        return <ValidasiPendaftar />;
      case "event":
        return <ManajemenEvent />;
      case "download":
        return <DownloadCenter />;
      default:
        return <RegionalDashboardHome />;
    }
  };

  const handleMenuClick = (viewId: ViewType) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">MPJ Apps</h1>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                isActive
                  ? "bg-white/20 text-white border-l-4 border-accent ml-[-4px] pl-[20px]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge && (
                <Badge className="ml-auto bg-accent text-accent-foreground text-xs px-2">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 mt-auto">
        <button
          onClick={() => window.location.href = "/"}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      {/* Desktop Sidebar - Solid Emerald Green */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar fixed h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Solid Emerald Green */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar z-50 transform transition-transform duration-300 md:hidden flex flex-col ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="absolute top-4 right-4 text-white/80 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Top Bar */}
        <header className="bg-card shadow-sm border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-sidebar">Wilayah: Malang Raya</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-sidebar">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-sidebar text-sidebar-foreground text-sm">
                  AM
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-foreground">Admin Malang</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default RegionalDashboard;
