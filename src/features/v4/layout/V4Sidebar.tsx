import { LogOut, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { V4NavGroup } from "../navigation/v4-navigation";

export function V4Sidebar({
  title,
  subtitle,
  groups,
  onLogout,
  mobileOnly = false,
}: {
  title: string;
  subtitle: string;
  groups: V4NavGroup[];
  onLogout: () => void;
  mobileOnly?: boolean;
}) {
  const content = (
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
                item.enabled ? (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex min-h-[42px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ) : (
                  <div
                    key={item.path}
                    className="flex min-h-[42px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/35"
                    aria-disabled="true"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <Badge className="bg-white/10 text-[10px] text-white/55 hover:bg-white/10">Phase 2</Badge>
                  </div>
                )
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

  return (
    <>
      {!mobileOnly && <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">{content}</aside>}
      <Sheet>
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
          {content}
        </SheetContent>
      </Sheet>
    </>
  );
}
