import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LogOut, 
  Menu,
  Bell,
  Database,
  Settings,
  LayoutDashboard,
  CheckCircle,
  Calendar,
  Share2,
  Trophy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import RegionalDashboardHome from "@/components/regional-dashboard/RegionalDashboardHome";
import ValidasiPendaftar from "@/components/regional-dashboard/ValidasiPendaftar";
import ManajemenEvent from "@/components/regional-dashboard/ManajemenEvent";
import DataMasterRegional from "@/components/regional-dashboard/DataMasterRegional";
import RegionalHub from "@/components/regional-dashboard/RegionalHub";
import Pengaturan from "@/components/regional-dashboard/Pengaturan";

type ViewType = "beranda" | "verifikasi" | "data-regional" | "event" | "regional-hub" | "militansi" | "pengaturan";

interface MenuItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  comingSoon?: boolean;
}

const RegionalDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signOut, profile: authProfile } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Support debug mode via location.state
  const debugProfile = (location.state as any)?.debugProfile;
  const isDebugMode = (location.state as any)?.isDebugMode;
  
  // Use debug profile if available, otherwise use auth profile
  const profile = isDebugMode && debugProfile ? debugProfile : authProfile;

  // Fetch pending claims count
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!profile?.region_id) return;
      
      const { count, error } = await supabase
        .from('pesantren_claims')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', profile.region_id)
        .eq('status', 'pending');
      
      if (!error && count !== null) {
        setPendingCount(count);
      }
    };

    fetchPendingCount();
  }, [profile?.region_id]);

  // Dynamic menu items with real pending count - Strict Order
  const menuItems: MenuItem[] = [
    { id: "beranda", label: "BERANDA", icon: LayoutDashboard },
    { id: "verifikasi", label: "VERIFIKASI", icon: CheckCircle, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: "data-regional", label: "DATA REGIONAL", icon: Database },
    { id: "event", label: "EVENT", icon: Calendar, comingSoon: true },
    { id: "regional-hub", label: "REGIONAL HUB", icon: Share2, comingSoon: true },
    { id: "militansi", label: "MILITANSI", icon: Trophy, comingSoon: true },
    { id: "pengaturan", label: "PENGATURAN", icon: Settings },
  ];

  const handleLogout = async () => {
    if (isDebugMode) {
      navigate('/debug-view');
      return;
    }
    await signOut();
    toast({
      title: "Berhasil keluar",
      description: "Anda telah logout dari sistem",
    });
    navigate('/login', { replace: true });
  };

  // Coming Soon placeholder component
  const ComingSoonPlaceholder = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
          <Calendar className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-emerald-800">{title}</h3>
        <p className="text-emerald-600 max-w-md">
          Fitur ini sedang dalam pengembangan dan akan segera tersedia pada update berikutnya.
        </p>
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-4 py-2">
          Coming Soon
        </Badge>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case "beranda":
        return <RegionalDashboardHome />;
      case "verifikasi":
        return <ValidasiPendaftar isDebugMode={isDebugMode} />;
      case "data-regional":
        return <DataMasterRegional isDebugMode={isDebugMode} />;
      case "event":
        return <ComingSoonPlaceholder title="Event" />;
      case "regional-hub":
        return <ComingSoonPlaceholder title="Regional Hub" />;
      case "militansi":
        return <ComingSoonPlaceholder title="Militansi & Leaderboard" />;
      case "pengaturan":
        return <Pengaturan isDebugMode={isDebugMode} />;
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
              {item.comingSoon && (
                <Badge className="bg-amber-500/80 text-white text-[10px] px-1.5">
                  Soon
                </Badge>
              )}
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
                Halo, {profile?.nama_pesantren || 'Admin'} 👋
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
                <AvatarImage src={profile?.logo_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-emerald-600 text-white text-sm">
                  {profile?.nama_pesantren?.substring(0, 2).toUpperCase() || 'AR'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{profile?.nama_pesantren || 'Admin Regional'}</p>
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
