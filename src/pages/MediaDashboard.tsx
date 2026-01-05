import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  IdCard,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { formatNIP, getProfileLevelInfo } from "@/lib/id-utils";
import { ProfileLevelBadge, VerifiedBadge } from "@/components/shared/LevelBadge";
import MediaDashboardHome from "@/components/media-dashboard/MediaDashboardHome";
import IdentitasPesantren from "@/components/media-dashboard/IdentitasPesantren";
import ManajemenKru from "@/components/media-dashboard/ManajemenKru";
import Administrasi from "@/components/media-dashboard/Administrasi";
import MPJHub from "@/components/media-dashboard/MPJHub";
import Pengaturan from "@/components/media-dashboard/Pengaturan";
import EventPage from "@/components/media-dashboard/EventPage";
import EIDAsetPage from "@/components/media-dashboard/EIDAsetPage";

// Menu order as per specification
type ViewType = "beranda" | "identitas" | "administrasi" | "tim" | "event" | "eid" | "hub" | "pengaturan";

// Menu order as per strict specification
const menuItems = [
  { id: "beranda" as ViewType, label: "BERANDA", icon: LayoutDashboard },
  { id: "identitas" as ViewType, label: "IDENTITAS PESANTREN", icon: Building },
  { id: "administrasi" as ViewType, label: "ADMINISTRASI", icon: CreditCard },
  { id: "tim" as ViewType, label: "TIM MEDIA", icon: Users },
  { id: "eid" as ViewType, label: "E-ID & ASET", icon: IdCard },
  { id: "event" as ViewType, label: "EVENT", icon: Calendar, comingSoon: true },
  { id: "hub" as ViewType, label: "MPJ HUB", icon: Layers, comingSoon: true },
  { id: "pengaturan" as ViewType, label: "PENGATURAN", icon: Settings },
];

const MediaDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile: authProfile, signOut } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { toast } = useToast();
  
  // Support debug mode via location.state
  const debugProfile = (location.state as any)?.debugProfile;
  const isDebugMode = (location.state as any)?.isDebugMode;
  
  // Use debug profile if available, otherwise use auth profile
  const profile = isDebugMode && debugProfile ? debugProfile : authProfile;
  
  const paymentStatus = profile?.status_payment ?? 'unpaid';
  const profileLevel = profile?.profile_level ?? 'basic';
  const levelInfo = getProfileLevelInfo(profileLevel);
  const isPlatinum = profileLevel === 'platinum';

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
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
          <Layers className="w-10 h-10 text-amber-600" />
        </div>
        <h3 className="text-2xl font-bold text-amber-800">{title}</h3>
        <p className="text-amber-600 max-w-md">
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
        return (
          <MediaDashboardHome 
            paymentStatus={paymentStatus} 
            profileLevel={profileLevel}
            onNavigate={handleMenuClick}
            debugProfile={isDebugMode ? profile : undefined}
          />
        );
      case "identitas":
        return (
          <IdentitasPesantren 
            paymentStatus={paymentStatus}
            profileLevel={profileLevel}
            onProfileLevelChange={() => {}}
            debugProfile={isDebugMode ? profile : undefined}
          />
        );
      case "tim":
        return <ManajemenKru paymentStatus={paymentStatus} debugProfile={isDebugMode ? profile : undefined} />;
      case "eid":
        return (
          <EIDAsetPage 
            paymentStatus={paymentStatus}
            profileLevel={profileLevel}
            debugProfile={isDebugMode ? profile : undefined}
          />
        );
      case "administrasi":
        return (
          <Administrasi 
            paymentStatus={paymentStatus}
            onPaymentStatusChange={() => {}}
            debugProfile={isDebugMode ? profile : undefined}
          />
        );
      case "event":
        return <EventPage />;
      case "hub":
        return <ComingSoonPlaceholder title="MPJ HUB" />;
      case "pengaturan":
        return <Pengaturan />;
      default:
        return (
          <MediaDashboardHome 
            paymentStatus={paymentStatus} 
            profileLevel={profileLevel}
            onNavigate={handleMenuClick}
            debugProfile={isDebugMode ? profile : undefined}
          />
        );
    }
  };

  const handleMenuClick = (viewId: ViewType) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
  };

  // Format NIP for display (clean, without dots)
  const displayNIP = profile?.nip ? formatNIP(profile.nip, true) : null;

  // Platinum Diamond Crystal Theme Classes
  const getPlatinumHeaderStyles = () => {
    if (isPlatinum) {
      return "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-cyan-400/30";
    }
    return "bg-white border-gray-200";
  };

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
              <span className="text-sm flex-1">{item.label}</span>
              {item.comingSoon && (
                <Badge className="bg-amber-500/80 text-white text-[10px] px-1.5">
                  Soon
                </Badge>
              )}
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

        {/* Top Bar - With Platinum Diamond Crystal Theme */}
        <header className={cn(
          "h-14 md:h-16 border-b flex items-center justify-between px-3 md:px-6 sticky top-0 z-30 shadow-sm",
          getPlatinumHeaderStyles()
        )}>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "lg:hidden",
                isPlatinum ? "text-white hover:bg-white/10" : "text-slate-700"
              )}
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            {/* Mobile: Simple title only */}
            <h2 className={cn(
              "text-base md:text-lg font-bold md:hidden",
              isPlatinum ? "text-white" : "text-slate-900"
            )}>
              MPJ MEDIA
            </h2>
            {/* Desktop: Full title with badge and NIP */}
            <div className="hidden md:block">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <h2 className={cn(
                    "text-lg font-bold",
                    isPlatinum ? "text-white" : "text-slate-900"
                  )}>
                    {profile?.nama_pesantren || 'Media Pesantren'}
                  </h2>
                  {isPlatinum && <VerifiedBadge isVerified={true} size="md" />}
                </div>
                {displayNIP && (
                  <Badge className={cn(
                    "font-mono text-sm",
                    isPlatinum 
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/30" 
                      : "bg-emerald-100 text-emerald-800"
                  )}>
                    NIP: {displayNIP}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-sm",
                  isPlatinum ? "text-cyan-200" : "text-slate-600"
                )}>
                  Dashboard Koordinator
                </p>
                <ProfileLevelBadge level={profileLevel} size="sm" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {/* NIP Badge - Mobile */}
            {displayNIP && (
              <div className={cn(
                "flex md:hidden items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-mono",
                isPlatinum 
                  ? "bg-cyan-500/20 text-cyan-300" 
                  : "bg-emerald-100 text-emerald-800"
              )}>
                {displayNIP}
              </div>
            )}
            {/* E-ID Badge - Icon only on mobile */}
            <div className={cn(
              "flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-lg text-xs font-semibold",
              isPlatinum 
                ? "bg-cyan-500/30 text-cyan-200" 
                : "bg-[#166534] text-white"
            )}>
              <IdCard className="h-4 w-4" />
              <span className="hidden md:inline">E-ID</span>
            </div>
            {/* XP Badge - Hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-1 bg-[#f59e0b] text-slate-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
              <Zap className="h-4 w-4" />
              <span>150 XP</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "relative h-9 w-9",
                isPlatinum ? "text-white hover:bg-white/10" : ""
              )}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            {/* User Avatar */}
            <div className={cn(
              "h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0",
              isPlatinum 
                ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-white" 
                : "bg-[#166534] text-white"
            )}>
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
