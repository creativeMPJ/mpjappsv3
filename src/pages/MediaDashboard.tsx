import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  CreditCard, 
  Layers, 
  Settings,
  LogOut, 
  Bell,
  Menu,
  X,
  Zap,
  AlertTriangle,
  IdCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import MediaDashboardHome from "@/components/media-dashboard/MediaDashboardHome";
import IdentitasPesantren from "@/components/media-dashboard/IdentitasPesantren";
import ManajemenKru from "@/components/media-dashboard/ManajemenKru";
import Administrasi from "@/components/media-dashboard/Administrasi";
import MPJHub from "@/components/media-dashboard/MPJHub";
import Pengaturan from "@/components/media-dashboard/Pengaturan";

type ViewType = "beranda" | "identitas" | "kru" | "administrasi" | "hub" | "pengaturan";

const menuItems = [
  { id: "beranda" as ViewType, label: "DASHBOARD BERANDA", icon: LayoutDashboard },
  { id: "identitas" as ViewType, label: "IDENTITAS PESANTREN", icon: Building },
  { id: "kru" as ViewType, label: "MANAJEMEN CREW (TIM MEDIA)", icon: Users },
  { id: "administrasi" as ViewType, label: "ADMINISTRASI", icon: CreditCard },
  { id: "hub" as ViewType, label: "MPJ-HUB", icon: Layers },
  { id: "pengaturan" as ViewType, label: "PENGATURAN", icon: Settings },
];

const MediaDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { toast } = useToast();
  
  const paymentStatus = profile?.status_payment ?? 'unpaid';
  const profileLevel = profile?.profile_level ?? 'basic';

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
        return (
          <MediaDashboardHome 
            paymentStatus={paymentStatus} 
            profileLevel={profileLevel}
            onNavigate={handleMenuClick} 
          />
        );
      case "identitas":
        return (
          <IdentitasPesantren 
            paymentStatus={paymentStatus}
            profileLevel={profileLevel}
            onProfileLevelChange={() => {}}
          />
        );
      case "kru":
        return <ManajemenKru paymentStatus={paymentStatus} />;
      case "administrasi":
        return (
          <Administrasi 
            paymentStatus={paymentStatus}
            onPaymentStatusChange={() => {}}
          />
        );
      case "hub":
        return <MPJHub />;
      case "pengaturan":
        return <Pengaturan />;
      default:
        return (
          <MediaDashboardHome 
            paymentStatus={paymentStatus} 
            profileLevel={profileLevel}
            onNavigate={handleMenuClick} 
          />
        );
    }
  };

  const handleMenuClick = (viewId: ViewType) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
  };

  const getLevelBadge = () => {
    switch (profileLevel) {
      case "silver": return { label: "Silver", class: "bg-slate-400" };
      case "gold": return { label: "Gold", class: "bg-[#f59e0b]" };
      case "platinum": return { label: "Platinum", class: "bg-purple-500" };
      default: return { label: "Basic", class: "bg-slate-500" };
    }
  };

  const levelBadge = getLevelBadge();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Deep Emerald Green */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-[#166534] text-white transition-transform duration-300",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/20">
          <span className="text-xl font-bold tracking-wide">MPJ MEDIA</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 lg:hidden"
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
                "w-full flex items-center gap-3 px-3 py-3.5 rounded-lg transition-all duration-200 text-left",
                activeView === item.id
                  ? "bg-white/20 text-white font-semibold border-l-4 border-[#f59e0b]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-200 hover:bg-red-500/30 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Payment Alert */}
        {paymentStatus === "unpaid" && (
          <Alert className="rounded-none border-x-0 border-t-0 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
              <span className="text-red-700 text-sm">
                <strong>Masa Aktif Habis.</strong> Lunasi tagihan di menu Administrasi.
              </span>
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleMenuClick("administrasi")}
              >
                Bayar Sekarang
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Top Bar - Mobile First, High Contrast */}
        <header className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-700"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            {/* Mobile: Simple title only */}
            <h2 className="text-base md:text-lg font-bold text-slate-900 md:hidden">
              MPJ MEDIA
            </h2>
            {/* Desktop: Full title with badge */}
            <div className="hidden md:block">
              <h2 className="text-lg font-bold text-slate-900">
                Dashboard Koordinator
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-600">Media Pesantren</p>
                <span className={cn("text-xs px-2 py-0.5 rounded-full text-white font-medium", levelBadge.class)}>
                  {levelBadge.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {/* E-ID Badge - Icon only on mobile */}
            <div className="flex items-center gap-1.5 bg-[#166534] text-white px-2 md:px-2.5 py-1.5 rounded-lg text-xs font-semibold">
              <IdCard className="h-4 w-4" />
              <span className="hidden md:inline">E-ID</span>
            </div>
            {/* XP Badge - Hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-1 bg-[#f59e0b] text-slate-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
              <Zap className="h-4 w-4" />
              <span>150 XP</span>
            </div>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            {/* User Avatar */}
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-[#166534] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              MP
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
