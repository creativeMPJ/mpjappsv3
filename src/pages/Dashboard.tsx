import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  CheckCircle,
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
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AdminPusatHome from "@/components/admin-pusat/AdminPusatHome";
import AdminPusatVerifikasi from "@/components/admin-pusat/AdminPusatVerifikasi";
import AdminPusatMasterData from "@/components/admin-pusat/AdminPusatMasterData";
import AdminPusatEvent from "@/components/admin-pusat/AdminPusatEvent";
import AdminPusatMilitansi from "@/components/admin-pusat/AdminPusatMilitansi";
import AdminPusatHub from "@/components/admin-pusat/AdminPusatHub";
import AdminPusatPengaturan from "@/components/admin-pusat/AdminPusatPengaturan";

// Super Admin email check
const SUPER_ADMIN_EMAIL = "superadmin@mpj.com";

type ViewType = 
  | "dashboard" 
  | "verifikasi" 
  | "master-data" 
  | "manajemen-event"
  | "manajemen-militansi" 
  | "mpj-hub"
  | "pengaturan";

interface MenuItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface ExternalLink {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "DASHBOARD BERANDA", icon: LayoutDashboard },
  { id: "verifikasi", label: "VERIFIKASI", icon: CheckCircle, badge: 6 },
  { id: "master-data", label: "MASTER DATA", icon: Database },
  { id: "manajemen-event", label: "MANAJEMEN EVENT", icon: Calendar },
  { id: "manajemen-militansi", label: "MANAJEMEN MILITANSI", icon: Medal },
  { id: "mpj-hub", label: "MPJ-HUB", icon: Layers },
  { id: "pengaturan", label: "PENGATURAN", icon: Settings },
];

const externalLinks: ExternalLink[] = [
  { to: "/admin-pusat/regional-mapping", label: "REGIONAL MAPPING", icon: Map },
  { to: "/admin-pusat/regional-akun", label: "DATA AKUN REGIONAL", icon: Users },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      case "dashboard":
        return <AdminPusatHome onNavigate={setActiveView} />;
      case "verifikasi":
        return <AdminPusatVerifikasi />;
      case "master-data":
        return <AdminPusatMasterData />;
      case "manajemen-event":
        return <AdminPusatEvent />;
      case "manajemen-militansi":
        return <AdminPusatMilitansi />;
      case "mpj-hub":
        return <AdminPusatHub />;
      case "pengaturan":
        return <AdminPusatPengaturan />;
      default:
        return <AdminPusatHome onNavigate={setActiveView} />;
    }
  };

  const handleMenuClick = (viewId: ViewType) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
              onClick={() => handleMenuClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                activeView === item.id
                  ? "bg-[#f59e0b] text-slate-900 font-semibold"
                  : "text-white hover:bg-emerald-600"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="flex-1 text-left text-sm">{item.label}</span>
              )}
              {sidebarOpen && item.badge && (
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* External Page Links */}
        <div className="px-3 py-2 border-t border-emerald-600">
          {sidebarOpen && (
            <span className="text-xs text-emerald-300 uppercase tracking-wider px-3 mb-2 block">
              Manajemen Regional
            </span>
          )}
          {externalLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-emerald-600 transition-colors mb-1"
            >
              <link.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm">{link.label}</span>
              )}
            </Link>
          ))}
        </div>

        {/* Super Admin Link */}
        {isSuperAdmin && (
          <div className="px-3 py-2">
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-600 hover:text-slate-800"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-slate-900">
              Dashboard Admin Pusat
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-[#166534] flex items-center justify-center">
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
