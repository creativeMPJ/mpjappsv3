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
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RegionalDashboardHome from "@/components/regional-dashboard/RegionalDashboardHome";
import ValidasiPendaftar from "@/components/regional-dashboard/ValidasiPendaftar";
import ManajemenEvent from "@/components/regional-dashboard/ManajemenEvent";
import DownloadCenter from "@/components/regional-dashboard/DownloadCenter";

type ViewType = "beranda" | "validasi" | "event" | "download";

const menuItems = [
  { id: "beranda" as ViewType, label: "Beranda", icon: Home },
  { id: "validasi" as ViewType, label: "Validasi Pendaftar", icon: UserCheck, badge: 5 },
  { id: "event" as ViewType, label: "Manajemen Event", icon: Calendar },
  { id: "download" as ViewType, label: "Download Center", icon: DownloadCloud },
];

const RegionalDashboard = () => {
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-white tracking-wide">MPJ Regional</h1>
        <p className="text-sm text-white/70 mt-1">Admin Wilayah</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                isActive
                  ? "bg-white/10 text-white border-l-4 border-dashboard-accent"
                  : "text-white/80 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <Badge className="ml-auto bg-dashboard-accent text-white text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => window.location.href = "/"}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/5 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-dashboard-sidebar transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-dashboard-sidebar z-50 transform transition-transform duration-300 md:hidden flex flex-col ${
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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <p className="text-sm text-gray-500">Wilayah</p>
              <h2 className="text-lg font-semibold text-dashboard-sidebar">Malang Raya</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-dashboard-accent rounded-full" />
            </button>
            <Avatar className="w-9 h-9 bg-dashboard-sidebar">
              <AvatarFallback className="bg-dashboard-sidebar text-white text-sm">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
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
