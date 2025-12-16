import { useState } from "react";
import { 
  LogOut, 
  Menu, 
  Bell,
  Building2,
  MapPin,
  Users,
  User,
  BarChart3,
  Shield,
  Wallet
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import MajelisOverview from "@/components/majelis-dashboard/MajelisOverview";
import PusatLevel from "@/components/majelis-dashboard/PusatLevel";
import RegionalLevel from "@/components/majelis-dashboard/RegionalLevel";
import PesantrenLevel from "@/components/majelis-dashboard/PesantrenLevel";
import UserLevel from "@/components/majelis-dashboard/UserLevel";
import KeuanganMPJ from "@/components/majelis-dashboard/KeuanganMPJ";
import logoMpj from "@/assets/logo-mpj.png";

type ViewType = "overview" | "pusat" | "regional" | "pesantren" | "user" | "keuangan";

const menuItems = [
  { id: "overview" as ViewType, label: "Overview", icon: BarChart3 },
  { id: "pusat" as ViewType, label: "Level Pusat", icon: Shield },
  { id: "regional" as ViewType, label: "Level Regional", icon: MapPin },
  { id: "pesantren" as ViewType, label: "Level Pesantren", icon: Building2 },
  { id: "user" as ViewType, label: "Level User", icon: User },
  { id: "keuangan" as ViewType, label: "Keuangan MPJ", icon: Wallet },
];

const MajelisMilitanDashboard = () => {
  const [activeView, setActiveView] = useState<ViewType>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <MajelisOverview onNavigate={setActiveView} />;
      case "pusat":
        return <PusatLevel />;
      case "regional":
        return <RegionalLevel />;
      case "pesantren":
        return <PesantrenLevel />;
      case "user":
        return <UserLevel />;
      case "keuangan":
        return <KeuanganMPJ />;
      default:
        return <MajelisOverview onNavigate={setActiveView} />;
    }
  };

  const handleMenuClick = (viewId: ViewType) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3">
          <img src={logoMpj} alt="MPJ Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">Majelis Militan</h1>
            <p className="text-xs text-emerald-300/80">Command Center</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 text-left min-h-[44px] ${
                isActive
                  ? "bg-emerald-800 text-white border-l-4 border-amber-400 ml-[-4px] pl-[20px]"
                  : "text-white/80 hover:bg-emerald-700/50 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Role Badge */}
      <div className="px-4 py-3 mx-4 mb-2 bg-emerald-900/50 rounded-lg">
        <p className="text-xs text-white/50">Logged in as</p>
        <p className="text-sm text-amber-400 font-medium">Majelis Command</p>
      </div>

      {/* Logout */}
      <div className="p-4 mt-auto">
        <button
          onClick={() => window.location.href = "/"}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-white/80 hover:bg-emerald-700/50 hover:text-white transition-all duration-200 min-h-[44px]"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex w-full">
      {/* Desktop Sidebar - Emerald Green Theme */}
      <aside className="hidden md:flex flex-col w-[250px] bg-emerald-900 fixed h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar using Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[250px] p-0 bg-emerald-900 border-none">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[250px]">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-700 p-2 -ml-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">Majelis Militan</h2>
              <p className="text-xs text-slate-500">Comprehensive Reporting Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="w-9 h-9 md:w-10 md:h-10 border-2 border-emerald-500">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-emerald-800 text-white text-sm">
                  MM
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-slate-700">Majelis Admin</span>
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

export default MajelisMilitanDashboard;
