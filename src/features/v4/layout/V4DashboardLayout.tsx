import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { findV4NavItem, pusatNav, regionalNav, type V4Role } from "../navigation/v4-navigation";
import { V4Sidebar } from "./V4Sidebar";

function roleLabel(role: V4Role) {
  return role === "pusat" ? "Admin Pusat" : "Admin Regional";
}

export default function V4DashboardLayout({ role }: { role: V4Role }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const groups = role === "pusat" ? pusatNav : regionalNav;
  const active = findV4NavItem(role, pathname);
  const displayName = profile?.nama_pesantren || roleLabel(role);
  const initials = displayName.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <V4Sidebar title={`MPJ ${roleLabel(role)}`} subtitle="Dashboard v4" groups={groups} onLogout={handleLogout} />
      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm lg:px-6">
          <div className="flex items-center gap-3">
            <V4Sidebar title={`MPJ ${roleLabel(role)}`} subtitle="Dashboard v4" groups={groups} onLogout={handleLogout} mobileOnly />
            <div>
              <p className="text-xs text-muted-foreground">{roleLabel(role)}</p>
              <h2 className="text-base font-semibold text-emerald-800">{active?.label || "Dashboard v4"}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            <Avatar className="h-9 w-9 border border-emerald-700">
              <AvatarImage src={profile?.logo_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-emerald-700 text-white">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl space-y-6 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
