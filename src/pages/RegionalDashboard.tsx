import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  Menu,
  Bell,
  Database,
  Settings,
  LayoutDashboard,
  CheckCircle,
  Calendar,
  Share2
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
import RegionalHub from "@/components/regional-dashboard/RegionalHub";
import Pengaturan from "@/components/regional-dashboard/Pengaturan";

type ViewType = "beranda" | "verifikasi" | "data-utama" | "event" | "regional-hub" | "pengaturan";

const menuItems = [
  { id: "beranda" as ViewType, label: "DASHBOARD BERANDA", icon: LayoutDashboard },
  { id: "verifikasi" as ViewType, label: "VERIFIKASI PESANTREN", icon: CheckCircle, badge: 5 },
  { id: "data-utama" as ViewType, label: "DATA UTAMA", icon: Database },
  { id: "event" as ViewType, label: "MANAJEMEN EVENT", icon: Calendar },
  { id: "regional-hub" as ViewType, label: "REGIONAL-HUB", icon: Share2 },
  { id: "pengaturan" as ViewType, label: "PENGATURAN", icon: Settings },
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
      case "verifikasi":
        return <ValidasiPendaftar />;
      case "data-utama":
        return <DataMasterRegional />;
      case "event":
        return <ManajemenEvent />;
      case "regional-hub":
        return <RegionalHub />;
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
      {/* Text-Only Branding */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold text-white tracking-wider">MPJ REGIONAL</h1>
        <p className="text-xs text-white/60 mt-1 font-medium">Admin Panel</p>
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
