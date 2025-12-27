import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  UserCheck, 
  Calendar, 
  LogOut, 
  Menu,
  Bell,
  Database,
  Settings,
  LayoutDashboard,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import RegionalDashboardHome from "@/components/regional-dashboard/RegionalDashboardHome";
import ValidasiPendaftar from "@/components/regional-dashboard/ValidasiPendaftar";
import ManajemenEvent from "@/components/regional-dashboard/ManajemenEvent";
import DataMasterRegional from "@/components/regional-dashboard/DataMasterRegional";
import LaporanDokumentasi from "@/components/regional-dashboard/LaporanDokumentasi";
import Pengaturan from "@/components/regional-dashboard/Pengaturan";
import logoMpj from "@/assets/logo-mpj.png";

type ViewType = "beranda" | "validasi" | "datamaster" | "event" | "laporan" | "pengaturan";

const menuItems = [
  { id: "beranda" as ViewType, label: "Beranda", icon: LayoutDashboard },
  { id: "validasi" as ViewType, label: "Validasi Anggota", icon: UserCheck, badge: 5 },
  { id: "event" as ViewType, label: "Manajemen Event", icon: Calendar },
  { id: "datamaster" as ViewType, label: "Database Wilayah", icon: Database },
  { id: "laporan" as ViewType, label: "Laporan & Dokumentasi", icon: FileText },
  { id: "pengaturan" as ViewType, label: "Pengaturan", icon: Settings },
];

const RegionalDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Berhasil keluar",
      description: "Anda telah logout dari sistem",
    });
    navigate('/login', { replace: true });
  };

  const renderContent = () => {
    switch (activeView) {
      case "beranda":
        return <RegionalDashboardHome />;
      case "validasi":
        return <ValidasiPendaftar />;
      case "datamaster":
        return <DataMasterRegional />;
      case "event":
        return <ManajemenEvent />;
      case "laporan":
        return <LaporanDokumentasi />;
      case "pengaturan":
        return <Pengaturan />;
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
          <img src={logoMpj} alt="MPJ Logo" className="w-10 h-10 rounded-lg" />
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">MPJ Regional</h1>
            <p className="text-xs text-white/70">Malang Raya</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 space-y-1 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 text-left min-h-[44px] ${
                isActive
                  ? "bg-emerald-800 text-white border-l-4 border-amber-500 ml-[-4px] pl-[20px]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm flex-1">{item.label}</span>
              {item.badge && (
                <Badge className="bg-red-500 text-white text-xs px-2">
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
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 min-h-[44px]"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex w-full">
      {/* Desktop Sidebar - Solid Emerald Green */}
      <aside className="hidden md:flex flex-col w-[250px] bg-emerald-700 fixed h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar using Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[250px] p-0 bg-emerald-700 border-none">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[250px]">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-700 p-2 -ml-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <p className="text-sm text-gray-500">Selamat datang kembali,</p>
              <h2 className="text-lg md:text-xl font-bold text-emerald-700">
                Halo, Admin Malang Raya 👋
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="w-9 h-9 md:w-10 md:h-10 border-2 border-emerald-600">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-emerald-600 text-white text-sm">
                  AM
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Admin Malang</p>
                <p className="text-xs text-gray-500">Regional Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default RegionalDashboard;
