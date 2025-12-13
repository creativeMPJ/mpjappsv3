import { useState } from "react";
import { 
  LayoutDashboard, 
  CreditCard, 
  CalendarDays, 
  Database, 
  LogOut, 
  Bell,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DashboardHome from "@/components/dashboard/DashboardHome";
import ValidasiPayment from "@/components/dashboard/ValidasiPayment";
import MonitoringSOP from "@/components/dashboard/MonitoringSOP";
import DataMaster from "@/components/dashboard/DataMaster";

type ViewType = "beranda" | "validasi" | "monitoring" | "datamaster";

const menuItems = [
  { id: "beranda" as ViewType, label: "Beranda", icon: LayoutDashboard },
  { id: "validasi" as ViewType, label: "Validasi Payment", icon: CreditCard, badge: 12 },
  { id: "monitoring" as ViewType, label: "Monitoring & SOP", icon: CalendarDays },
  { id: "datamaster" as ViewType, label: "Data Master", icon: Database },
];

const Dashboard = () => {
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case "beranda":
        return <DashboardHome />;
      case "validasi":
        return <ValidasiPayment />;
      case "monitoring":
        return <MonitoringSOP />;
      case "datamaster":
        return <DataMaster />;
      default:
        return <DashboardHome />;
    }
  };

  const handleMenuClick = (viewId: ViewType) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
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
        <nav className="flex-1 py-4 px-3 space-y-1">
          {menuItems.map((item) => (
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
          ))}
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
