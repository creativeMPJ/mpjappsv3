import { useState } from "react";
import { 
  Home, 
  LogOut, 
  Menu, 
  Bell,
  LayoutDashboard,
  CheckCircle,
  Map,
  FileText,
  DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import FinanceOverview from "@/components/finance-dashboard/FinanceOverview";
import ClearingHouse from "@/components/finance-dashboard/ClearingHouse";
import RegionalMonitoring from "@/components/finance-dashboard/RegionalMonitoring";
import FinanceReporting from "@/components/finance-dashboard/FinanceReporting";

type ViewType = "overview" | "verification" | "monitoring" | "reports";

const menuItems = [
  { id: "overview" as ViewType, label: "Dashboard", icon: LayoutDashboard },
  { id: "verification" as ViewType, label: "Clearing House", icon: CheckCircle, badge: 15 },
  { id: "monitoring" as ViewType, label: "Monitoring Regional", icon: Map },
  { id: "reports" as ViewType, label: "Reporting", icon: FileText },
];

const FinanceDashboard = () => {
  const [activeView, setActiveView] = useState<ViewType>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Mock role check - in production, this would come from auth context
  const userRole = "finance_admin"; // finance_admin, super_admin, verification_team
  const allowedRoles = ["finance_admin", "super_admin", "verification_team"];
  
  // Redirect unauthorized users (in production, use proper auth guard)
  if (!allowedRoles.includes(userRole)) {
    window.location.href = "/dashboard";
    return null;
  }

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <FinanceOverview />;
      case "verification":
        return <ClearingHouse />;
      case "monitoring":
        return <RegionalMonitoring />;
      case "reports":
        return <FinanceReporting />;
      default:
        return <FinanceOverview />;
    }
  };

  const handleMenuClick = (viewId: ViewType) => {
    setActiveView(viewId);
    setMobileSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">MPJ Finance</h1>
            <p className="text-xs text-white/60">Treasury Dashboard</p>
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
                  ? "bg-emerald-800 text-white border-l-4 border-amber-500 ml-[-4px] pl-[20px]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
              {item.badge && (
                <Badge className="ml-auto bg-amber-500 text-white text-xs px-2">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Badge */}
      <div className="px-4 py-3 mx-4 mb-2 bg-white/5 rounded-lg">
        <p className="text-xs text-white/50">Logged in as</p>
        <p className="text-sm text-amber-400 font-medium">Finance Admin</p>
      </div>

      {/* Logout */}
      <div className="p-4 mt-auto">
        <button
          onClick={() => window.location.href = "/"}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 min-h-[44px]"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-dashboard-bg flex w-full">
      {/* Desktop Sidebar - Solid Emerald Green with Gold Accents */}
      <aside className="hidden md:flex flex-col w-[250px] bg-sidebar fixed h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar using Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[250px] p-0 bg-sidebar border-none">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[250px]">
        {/* Top Bar */}
        <header className="bg-card shadow-sm border-b border-border px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground p-2 -ml-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-sidebar">Finance & Treasury</h2>
              <p className="text-xs text-muted-foreground">MPJ Apps Central Finance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="w-9 h-9 md:w-10 md:h-10 border-2 border-amber-500">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-sidebar text-sidebar-foreground text-sm">
                  FA
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-foreground">Finance Admin</span>
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

export default FinanceDashboard;
