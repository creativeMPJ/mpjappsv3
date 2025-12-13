import { useState } from "react";
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  IdCard, 
  Award, 
  LogOut, 
  Bell,
  Menu,
  X,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import MediaDashboardHome from "@/components/media-dashboard/MediaDashboardHome";
import ProfilPesantren from "@/components/media-dashboard/ProfilPesantren";
import ManajemenKru from "@/components/media-dashboard/ManajemenKru";
import EIDCard from "@/components/media-dashboard/EIDCard";
import EventSertifikat from "@/components/media-dashboard/EventSertifikat";

type ViewType = "beranda" | "profil" | "kru" | "eidcard" | "event";

const menuItems = [
  { id: "beranda" as ViewType, label: "Beranda", icon: LayoutDashboard },
  { id: "profil" as ViewType, label: "Profil Pesantren", icon: Building },
  { id: "kru" as ViewType, label: "Manajemen Kru", icon: Users },
  { id: "eidcard" as ViewType, label: "E-ID Card", icon: IdCard },
  { id: "event" as ViewType, label: "Event & Sertifikat", icon: Award },
];

const MediaDashboard = () => {
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isGoldStatus, setIsGoldStatus] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case "beranda":
        return <MediaDashboardHome isGold={isGoldStatus} onNavigate={handleMenuClick} />;
      case "profil":
        return <ProfilPesantren />;
      case "kru":
        return <ManajemenKru />;
      case "eidcard":
        return <EIDCard isGold={isGoldStatus} />;
      case "event":
        return <EventSertifikat />;
      default:
        return <MediaDashboardHome isGold={isGoldStatus} onNavigate={handleMenuClick} />;
    }
  };

  const handleMenuClick = (viewId: ViewType) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Status Toggle for Testing */}
      <div className="fixed bottom-4 right-4 z-[100] bg-white rounded-lg shadow-lg p-3 flex items-center gap-3">
        <span className="text-xs font-medium text-slate-600">Basic</span>
        <Switch checked={isGoldStatus} onCheckedChange={setIsGoldStatus} />
        <span className="text-xs font-medium text-amber-600">Gold</span>
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-[#166534] text-white transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-700">
          {sidebarOpen && (
            <span className="text-xl font-bold text-white">MPJ Media</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-emerald-700 hidden lg:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-emerald-700 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                activeView === item.id
                  ? "bg-[#064e3b] text-white border-l-4 border-amber-500"
                  : "text-emerald-100 hover:bg-emerald-700/50"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {item.id === "eidcard" && !isGoldStatus && sidebarOpen && (
                <span className="text-xs bg-slate-500 px-2 py-0.5 rounded">🔒</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-emerald-700">
          <button
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-emerald-100 hover:bg-emerald-700/50 transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Warning Banner for Basic Status */}
        {!isGoldStatus && (
          <div className="bg-amber-100 border-b border-amber-300 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-600">⚠️</span>
              <span className="text-sm text-amber-800">
                Status Akun: <strong>BASIC</strong>. Complete payment to unlock ID Card.{" "}
                <button className="underline font-semibold hover:text-amber-900">Klik di sini</button> untuk selesaikan pembayaran.
              </span>
            </div>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
              Bayar Sekarang
            </Button>
          </div>
        )}

        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Dashboard Koordinator
              </h2>
              <p className="text-sm text-slate-500">Media Pondok Jawa Timur</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* XP Badge */}
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
              <Zap className="h-4 w-4" />
              <span>150 XP</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                AF
              </div>
              <span className="text-sm font-medium text-slate-700 hidden md:block">Ahmad Fauzi</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MediaDashboard;
