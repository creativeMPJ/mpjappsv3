import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  FolderOpen, 
  Settings,
  LogOut, 
  Bell,
  Menu,
  X,
  Zap,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  { id: "beranda" as ViewType, label: "Beranda", icon: LayoutDashboard },
  { id: "identitas" as ViewType, label: "Identitas Pesantren", icon: Building2 },
  { id: "kru" as ViewType, label: "Manajemen Crew", icon: Users },
  { id: "administrasi" as ViewType, label: "Administrasi", icon: CreditCard },
  { id: "hub" as ViewType, label: "MPJ-Hub", icon: FolderOpen },
  { id: "pengaturan" as ViewType, label: "Pengaturan", icon: Settings },
];

const MediaDashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Get payment and level from AuthContext profile
  const paymentStatus = profile?.status_payment ?? 'unpaid';
  const profileLevel = profile?.profile_level ?? 'basic';

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
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
            onProfileLevelChange={() => {}} // Read-only from AuthContext
          />
        );
      case "kru":
        return <ManajemenKru paymentStatus={paymentStatus} />;
      case "administrasi":
        return (
          <Administrasi 
            paymentStatus={paymentStatus}
            onPaymentStatusChange={() => {}} // Read-only from AuthContext
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
      case "gold": return { label: "Gold", class: "bg-accent" };
      case "platinum": return { label: "Platinum", class: "bg-purple-500" };
      default: return { label: "Basic", class: "bg-slate-300" };
    }
  };

  const levelBadge = getLevelBadge();

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Deep Emerald Green using design system */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-sidebar-background text-sidebar-foreground transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <span className="text-xl font-bold text-sidebar-foreground">MPJ Media</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent hidden lg:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
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
                  ? "bg-sidebar-primary text-sidebar-primary-foreground border-l-4 border-accent"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Payment Alert */}
        {paymentStatus === "unpaid" && (
          <Alert className="rounded-none border-x-0 border-t-0 bg-destructive/10 border-destructive/30">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="flex items-center justify-between w-full">
              <span className="text-destructive">
                <strong>Masa Aktif Habis.</strong> Lunasi tagihan di menu Administrasi untuk membuka fitur.
              </span>
              <Button 
                size="sm" 
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground ml-4"
                onClick={() => handleMenuClick("administrasi")}
              >
                Bayar Sekarang
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
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
              <h2 className="text-lg font-semibold text-foreground">
                Dashboard Koordinator
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Pondok Pesantren Al-Hikmah</p>
                <span className={cn("text-xs px-2 py-0.5 rounded-full text-white", levelBadge.class)}>
                  {levelBadge.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* XP Badge - Golden Orange using design system */}
            <div className="flex items-center gap-1 bg-gradient-to-r from-accent to-amber-500 text-accent-foreground px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
              <Zap className="h-4 w-4" />
              <span>150 XP</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            </Button>
            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                AF
              </div>
              <span className="text-sm font-medium text-foreground hidden md:block">Ahmad Fauzi</span>
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