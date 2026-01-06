import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Database,
  Calendar,
  Medal,
  Layers,
  Settings,
  LogOut, 
  Bell,
  Menu,
  X,
  Zap,
  Map,
  ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AdminPusatHome from "@/components/admin-pusat/AdminPusatHome";
import AdminPusatMasterData from "@/components/admin-pusat/AdminPusatMasterData";
import AdminPusatAdministrasi from "@/components/admin-pusat/AdminPusatAdministrasi";
import AdminPusatRegional from "@/components/admin-pusat/AdminPusatRegional";
import AdminPusatPengaturan from "@/components/admin-pusat/AdminPusatPengaturan";
import GlobalSearchNIPNIAM from "@/components/admin-pusat/GlobalSearchNIPNIAM";
import ComingSoonOverlay from "@/components/shared/ComingSoonOverlay";

// Super Admin email check
const SUPER_ADMIN_EMAIL = "superadmin@mpj.com";

type ViewType = 
  | "dashboard" 
  | "administrasi"
  | "master-data" 
  | "master-regional"
  | "manajemen-event"
  | "manajemen-militansi" 
  | "mpj-hub"
  | "pengaturan";

interface MenuItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  soon?: boolean;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "BERANDA", icon: LayoutDashboard },
  { id: "administrasi", label: "ADMINISTRASI", icon: ClipboardCheck },
  { id: "master-data", label: "MASTER DATA", icon: Database },
  { id: "master-regional", label: "MASTER REGIONAL", icon: Map },
  { id: "manajemen-event", label: "MANAJEMEN EVENT", icon: Calendar, soon: true },
  { id: "manajemen-militansi", label: "MANAJEMEN MILITANSI", icon: Medal, soon: true },
  { id: "mpj-hub", label: "MPJ HUB", icon: Layers, soon: true },
  { id: "pengaturan", label: "PENGATURAN", icon: Settings },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  
  // Debug mode check
  const isDebugMode = location.state?.isDebugMode === true;
  const debugProfile = location.state?.debugProfile;
  const debugData = location.state?.debugData;
  
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (isDebugMode) {
      navigate('/debug-view', { replace: true });
      return;
    }
    await signOut();
    toast({
      title: "Berhasil keluar",
      description: "Anda telah logout dari sistem",
    });
    navigate('/login', { replace: true });
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <AdminPusatHome onNavigate={setActiveView} isDebugMode={isDebugMode} debugData={debugData} />;
      case "administrasi":
        return <AdminPusatAdministrasi isDebugMode={isDebugMode} debugData={debugData} />;
      case "master-data":
        return <AdminPusatMasterData isDebugMode={isDebugMode} debugData={debugData} />;
      case "master-regional":
        return <AdminPusatRegional isDebugMode={isDebugMode} debugData={debugData} />;
      case "manajemen-event":
        return <ComingSoonOverlay title="Manajemen Event" description="Kelola event dan kegiatan pesantren se-Jawa Timur" />;
      case "manajemen-militansi":
        return <ComingSoonOverlay title="Manajemen Militansi" description="Leaderboard dan sistem gamifikasi XP" />;
      case "mpj-hub":
        return <ComingSoonOverlay title="MPJ HUB" description="Pusat kolaborasi dan resource sharing" />;
      case "pengaturan":
        return <AdminPusatPengaturan />;
      default:
        return <AdminPusatHome onNavigate={setActiveView} isDebugMode={isDebugMode} debugData={debugData} />;
    }
  };

  const handleMenuClick = (item: MenuItem) => {
    setActiveView(item.id);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Deep Emerald */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-[#166534] text-white transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-600">
          {sidebarOpen && (
            <span className="text-xl font-bold text-white tracking-wide">MPJ PUSAT</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-emerald-600 hidden lg:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-emerald-600 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                activeView === item.id
                  ? "bg-amber-500 text-slate-900 font-semibold"
                  : "text-white hover:bg-emerald-600"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {item.soon && (
                    <Badge variant="outline" className="text-[10px] border-emerald-400 text-emerald-200">
                      Soon
                    </Badge>
                  )}
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Super Admin Link */}
        {isSuperAdmin && (
          <div className="px-3 py-2 border-t border-emerald-600">
            <Link
              to="/super-admin"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors border border-red-500/30"
            >
              <Zap className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-semibold text-sm">⚡ SUPER ADMIN</span>
              )}
            </Link>
          </div>
        )}

        {/* Logout */}
        <div className="p-3 border-t border-emerald-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-200 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground hidden sm:block">
              Dashboard Admin Pusat
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Global Search */}
            <div className="hidden lg:block w-80">
              <GlobalSearchNIPNIAM />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">AP</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto pb-20">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
