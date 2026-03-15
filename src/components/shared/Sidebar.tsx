import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  soon?: boolean;
  highlight?: boolean;
}

interface SidebarProps {
  menuItems: SidebarMenuItem[];
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  title: string;
  subtitle?: string;
  sidebarBg?: string;
  /** Desktop sidebar dapat di-collapse (icon-only mode) */
  collapsible?: boolean;
  /** Slot konten tambahan di bawah nav (misal link super admin) */
  sidebarExtra?: React.ReactNode;
  /** Konten kiri header (setelah hamburger) */
  headerLeft?: React.ReactNode;
  /** Konten kanan header */
  headerRight?: React.ReactNode;
  /** Alert/banner sticky di atas konten utama */
  topAlert?: React.ReactNode;
  children: React.ReactNode;
}

const Sidebar = ({
  menuItems,
  activeView,
  onViewChange,
  onLogout,
  title,
  subtitle,
  sidebarBg = "bg-[#166534]",
  collapsible = false,
  sidebarExtra,
  headerLeft,
  headerRight,
  topAlert,
  children,
}: SidebarProps) => {

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsible && collapsed ? "w-20" : "w-64";

  const handleViewChange = (id: string) => {
    onViewChange(id);
    setMobileOpen(false);
  };

  const NavItems = ({ showLabels }: { showLabels: boolean }) => (
    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {menuItems.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left min-h-[44px]",
              isActive
                ? "bg-black/20 text-white border-l-4 border-amber-500 pl-[8px]"
                : "text-white/80 hover:bg-white/10 hover:text-white",
              item.highlight && !isActive && "bg-amber-500/20 text-amber-200 border-l-4 border-amber-400 pl-[8px]"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {showLabels && (
              <>
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {item.soon && (
                  <Badge className="bg-amber-500/80 text-white text-[10px] px-1.5">
                    Soon
                  </Badge>
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-2">
                    {item.badge}
                  </Badge>
                )}
                {item.highlight && !isActive && (
                  <Badge className="bg-amber-500 text-white text-[10px] px-1.5">
                    NEW
                  </Badge>
                )}
              </>
            )}
          </button>
        );
      })}
    </nav>
  );

  const SidebarInner = ({ showLabels = true }: { showLabels?: boolean }) => (
    <div className={cn("flex flex-col h-full text-white", sidebarBg)}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/20 flex-shrink-0">
        {showLabels && (
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-wide truncate">{title}</h1>
            {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
          </div>
        )}
        {collapsible && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hidden lg:flex flex-shrink-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 lg:hidden flex-shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Nav */}
      <NavItems showLabels={showLabels} />

      {/* Slot extra (misal link Super Admin) */}
      {sidebarExtra && showLabels && (
        <div className="px-3 py-2 border-t border-white/20">
          {sidebarExtra}
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-white/20 flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-200 hover:bg-red-500/20 hover:text-white transition-colors min-h-[44px]"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {showLabels && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col flex-shrink-0 fixed h-screen z-30 transition-all duration-300",
          sidebarWidth
        )}
      >
        <SidebarInner showLabels={!(collapsible && collapsed)} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 border-none">
          <SidebarInner showLabels />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300",
          collapsible && collapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {topAlert}

        {/* Header */}
        <header className="sticky top-0 z-20 bg-card border-b shadow-sm px-4 md:px-6 h-16 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {headerLeft}
          </div>
          {headerRight && (
            <div className="flex items-center gap-2 md:gap-4">
              {headerRight}
            </div>
          )}
        </header>

        {/* Konten */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto pb-20">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
