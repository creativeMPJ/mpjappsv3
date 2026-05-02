import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { isV4NavItemActive, type NavItem, type V4NavGroup } from "../navigation/v4-navigation";

const V4_SIDEBAR_OPEN_STORAGE_KEY = "v4_sidebar_open";

interface V4SidebarProps {
  title: string;
  subtitle: string;
  groups: V4NavGroup[];
  onLogout: () => void;
}

interface SidebarContentProps extends V4SidebarProps {
  onNavigate?: () => void;
}

function getItemKey(item: NavItem) {
  return item.path || item.label;
}

function getStoredOpenKey() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(V4_SIDEBAR_OPEN_STORAGE_KEY);
}

function setStoredOpenKey(key: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (key) {
    window.localStorage.setItem(V4_SIDEBAR_OPEN_STORAGE_KEY, key);
    return;
  }

  window.localStorage.removeItem(V4_SIDEBAR_OPEN_STORAGE_KEY);
}

function findActiveParentKey(groups: V4NavGroup[], pathname: string) {
  for (const group of groups) {
    for (const item of group.items) {
      const activeParentKey = findActiveParentKeyInItem(item, pathname);

      if (activeParentKey) {
        return activeParentKey;
      }
    }
  }

  return null;
}

function findActiveParentKeyInItem(item: NavItem, pathname: string): string | null {
  if (!item.children?.length) {
    return null;
  }

  if (item.children.some((child) => isV4NavItemActive(child, pathname))) {
    return getItemKey(item);
  }

  for (const child of item.children) {
    const activeParentKey = findActiveParentKeyInItem(child, pathname);

    if (activeParentKey) {
      return activeParentKey;
    }
  }

  return null;
}

function SidebarContent({
  title,
  subtitle,
  groups,
  onLogout,
  onNavigate,
}: SidebarContentProps) {
  const { pathname } = useLocation();
  const activeParentKey = useMemo(() => findActiveParentKey(groups, pathname), [groups, pathname]);
  const [openKey, setOpenKey] = useState<string | null>(() => activeParentKey || getStoredOpenKey());

  useEffect(() => {
    if (activeParentKey) {
      setOpenKey(activeParentKey);
      setStoredOpenKey(activeParentKey);
    }
  }, [activeParentKey]);

  const toggleItem = (item: NavItem) => {
    const key = getItemKey(item);
    setOpenKey((current) => {
      const nextKey = current === key ? null : key;
      setStoredOpenKey(nextKey);
      return nextKey;
    });
  };

  return (
    <div className="flex h-full flex-col bg-[#14532d] text-white">
      <div className="border-b border-white/15 p-4">
        <p className="text-lg font-bold">{title}</p>
        <p className="text-xs text-white/65">{subtitle}</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-white/50">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem
                  key={getItemKey(item)}
                  item={item}
                  level={0}
                  pathname={pathname}
                  openKey={openKey}
                  onToggle={toggleItem}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/15 p-3">
        <button
          onClick={onLogout}
          className="flex min-h-[42px] w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-100 hover:bg-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

function SidebarItem({
  item,
  level,
  pathname,
  openKey,
  onToggle,
  onNavigate,
}: {
  item: NavItem;
  level: number;
  pathname: string;
  openKey: string | null;
  onToggle: (item: NavItem) => void;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);
  const itemKey = getItemKey(item);
  const isOpen = openKey === itemKey;
  const isActive = isV4NavItemActive(item, pathname);
  const isDisabled = item.enabled !== true && Boolean(item.path);
  const childIndent = level > 0 ? "pl-6" : "";

  if (hasChildren) {
    return (
      <div>
        <div
          className={cn(
            "group relative flex min-h-[42px] items-center gap-2 overflow-hidden rounded-md text-sm transition-colors duration-200 ease-in-out",
            isActive ? "bg-muted font-medium text-primary shadow-sm" : "font-medium text-white/80 hover:bg-muted/50 hover:text-white",
            childIndent,
          )}
        >
          {item.path && item.enabled === true ? (
            <NavLink
              to={item.path}
              onClick={onNavigate}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2"
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{item.label}</span>
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={() => onToggle(item)}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2 text-left"
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{item.label}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onToggle(item)}
            className={cn(
              "mr-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-200 ease-in-out",
              isActive ? "text-primary/70 hover:bg-primary/10 hover:text-primary" : "text-white/70 hover:bg-muted/50 hover:text-white",
            )}
            aria-label={isOpen ? `Tutup ${item.label}` : `Buka ${item.label}`}
          >
            <ChevronDown className={cn("h-4 w-4 rotate-0 transition-transform duration-200 ease-in-out", isOpen && "rotate-90")} />
          </button>
        </div>
        <div
          className={cn(
            "overflow-hidden transition-all duration-200 ease-in-out",
            isOpen ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="mt-1 space-y-1 border-l border-white/10 pl-3">
            {item.children?.map((child) => (
              <SidebarItem
                key={getItemKey(child)}
                item={child}
                level={level + 1}
                pathname={pathname}
                openKey={openKey}
                onToggle={onToggle}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isDisabled || !item.path) {
    return (
      <div
        className={cn(
          "flex min-h-[42px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/35",
          childIndent,
        )}
        aria-disabled="true"
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <Badge className="bg-white/10 text-[10px] text-white/55 hover:bg-white/10">Segera Hadir</Badge>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive: isExactActive }) =>
        cn(
          "relative flex min-h-[42px] items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm transition-colors duration-200 ease-in-out",
          childIndent,
          isExactActive || isActive ? "bg-primary/10 font-semibold text-white shadow-sm" : "font-medium text-white/80 hover:bg-muted/50 hover:text-white",
        )
      }
    >
      {isActive && <span className="absolute bottom-0 left-0 top-0 w-1 rounded-r bg-primary" />}
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

export function DesktopSidebar(props: V4SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
      <SidebarContent {...props} />
    </aside>
  );
}

export function MobileSidebar(props: V4SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-none p-0">
        <div className="absolute right-3 top-3 z-10">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </SheetTrigger>
        </div>
        <SidebarContent {...props} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
