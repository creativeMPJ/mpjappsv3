import { useState } from "react";
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Shield, 
  Download, 
  Database, 
  Settings,
  LogOut, 
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Gamepad2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DashboardHome from "@/components/dashboard/DashboardHome";
import MappingArea from "@/components/dashboard/MappingArea";
import MonitoringValidasi from "@/components/dashboard/MonitoringValidasi";
import RegionalAkun from "@/components/dashboard/RegionalAkun";
import Gamifikasi from "@/components/dashboard/Gamifikasi";
import DatabasePesantren from "@/components/dashboard/DatabasePesantren";
import PengaturanAdmin from "@/components/dashboard/PengaturanAdmin";
import PusatUnduhan from "@/components/dashboard/PusatUnduhan";

type ViewType = 
  | "dashboard" 
  | "regional-akun" 
  | "regional-mapping" 
  | "monitoring-validasi" 
  | "pusat-unduhan"
  | "database-pesantren" 
  | "gamifikasi"
  | "pengaturan";

interface MenuItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: { id: ViewType; label: string }[];
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { 
    id: "regional-akun", 
    label: "Regional", 
    icon: MapPin,
    children: [
      { id: "regional-akun", label: "Data Akun" },
      { id: "regional-mapping", label: "Mapping Area" },
    ]
  },
  { id: "monitoring-validasi", label: "Monitoring Validasi", icon: Shield, badge: 6 },
  { id: "database-pesantren", label: "Database Pesantren", icon: Database },
  { id: "gamifikasi", label: "Gamifikasi", icon: Gamepad2 },
  { id: "pusat-unduhan", label: "Pusat Unduhan", icon: Download },
  { id: "pengaturan", label: "Pengaturan", icon: Settings },
];

const Dashboard = () => {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["regional-akun"]);

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardHome onNavigate={setActiveView} />;
      case "regional-akun":
        return <RegionalAkun />;
      case "regional-mapping":
        return <MappingArea />;
      case "monitoring-validasi":
        return <MonitoringValidasi />;
      case "pusat-unduhan":
        return <PusatUnduhan />;
      case "database-pesantren":
        return <DatabasePesantren />;
      case "gamifikasi":
        return <Gamifikasi />;
      case "pengaturan":
        return <PengaturanAdmin />;
      default:
        return <DashboardHome onNavigate={setActiveView} />;
    }
  };

  const handleMenuClick = (viewId: ViewType) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
  };

  const toggleExpanded = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isMenuActive = (item: MenuItem) => {
    if (item.children) {
      return item.children.some((child) => child.id === activeView);
    }
    return item.id === activeView;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-emerald-800 text-white transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-700">
          {sidebarOpen && (
            <span className="text-xl font-bold text-white">MPJ Pusat</span>
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
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.includes(item.id);
            const isActive = isMenuActive(item);

            if (hasChildren) {
              return (
                <Collapsible
                  key={item.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(item.id)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-emerald-700 text-white"
                          : "text-emerald-100 hover:bg-emerald-700/50"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </>
                      )}
                    </button>
                  </CollapsibleTrigger>
                  {sidebarOpen && (
                    <CollapsibleContent className="pl-8 space-y-1 mt-1">
                      {item.children?.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleMenuClick(child.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                            activeView === child.id
                              ? "bg-amber-500 text-white font-medium"
                              : "text-emerald-200 hover:bg-emerald-700/50"
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {child.label}
                        </button>
                      ))}
                    </CollapsibleContent>
                  )}
                </Collapsible>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                  activeView === item.id
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-100 hover:bg-emerald-700/50"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {sidebarOpen && item.badge && (
                  <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-emerald-700">
          <button
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-emerald-100 hover:bg-emerald-700/50 transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
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
                Halo, Super Admin
              </h2>
              <p className="text-sm text-slate-500">Selamat datang di dashboard</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
