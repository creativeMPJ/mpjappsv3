import { useState } from "react";
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
import MediaDashboardHome from "@/components/media-dashboard/MediaDashboardHome";
import IdentitasPesantren from "@/components/media-dashboard/IdentitasPesantren";
import ManajemenKru from "@/components/media-dashboard/ManajemenKru";
import Administrasi from "@/components/media-dashboard/Administrasi";
import MPJHub from "@/components/media-dashboard/MPJHub";
import Pengaturan from "@/components/media-dashboard/Pengaturan";

type ViewType = "beranda" | "identitas" | "kru" | "administrasi" | "hub" | "pengaturan";
type PaymentStatus = "paid" | "unpaid";
type ProfileLevel = "basic" | "silver" | "gold" | "platinum";

const menuItems = [
  { id: "beranda" as ViewType, label: "Beranda", icon: LayoutDashboard },
  { id: "identitas" as ViewType, label: "Identitas Pesantren", icon: Building2 },
  { id: "kru" as ViewType, label: "Manajemen Crew", icon: Users },
  { id: "administrasi" as ViewType, label: "Administrasi", icon: CreditCard },
  { id: "hub" as ViewType, label: "MPJ-Hub", icon: FolderOpen },
  { id: "pengaturan" as ViewType, label: "Pengaturan", icon: Settings },
];

const MediaDashboard = () => {
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Global State Simulation
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [profileLevel, setProfileLevel] = useState<ProfileLevel>("basic");

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
            onProfileLevelChange={setProfileLevel}
          />
        );
      case "kru":
        return <ManajemenKru paymentStatus={paymentStatus} />;
      case "administrasi":
        return (
          <Administrasi 
            paymentStatus={paymentStatus}
            onPaymentStatusChange={setPaymentStatus}
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

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex">
      {/* Dev Status Toggle */}
      <div className="fixed bottom-4 right-4 z-[100] bg-white rounded-lg shadow-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Payment:</span>
          <select 
            value={paymentStatus} 
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Level:</span>
          <select 
            value={profileLevel} 
            onChange={(e) => setProfileLevel(e.target.value as ProfileLevel)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="basic">Basic</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Deep Emerald Green #166534 */}
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
                  ? "bg-[#064e3b] text-white border-l-4 border-[#f59e0b]"
                  : "text-emerald-100 hover:bg-emerald-700"
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
        <div className="p-3 border-t border-emerald-700">
          <button
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-emerald-100 hover:bg-emerald-700 transition-colors"
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
          <Alert className="rounded-none border-x-0 border-t-0 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="flex items-center justify-between w-full">
              <span className="text-red-800">
                <strong>Masa Aktif Habis.</strong> Harap lunasi tagihan di menu Administrasi.
              </span>
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white ml-4"
                onClick={() => handleMenuClick("administrasi")}
              >
                Bayar Sekarang
              </Button>
            </AlertDescription>
          </Alert>
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
              <p className="text-sm text-slate-500">Pondok Pesantren Al-Hikmah</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* XP Badge - Golden Orange */}
            <div className="flex items-center gap-1 bg-gradient-to-r from-[#f59e0b] to-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
              <Zap className="h-4 w-4" />
              <span>150 XP</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-[#166534] font-semibold">
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