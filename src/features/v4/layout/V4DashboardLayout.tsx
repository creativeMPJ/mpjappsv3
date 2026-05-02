import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { IS_DEV_AUTH_BYPASS_ENABLED, getDevPreviewRole, setDevPreviewRole } from "@/config/devAuth";
import { findV4NavItem, financeNav, crewNav, mediaNav, pusatNav, regionalNav, type V4NavGroup, type V4Role } from "../navigation/v4-navigation";
import { DesktopSidebar, MobileSidebar } from "./V4Sidebar";

function roleLabel(role: V4Role) {
  switch (role) {
    case "pusat":
      return "Admin Pusat";
    case "regional":
      return "Admin Regional";
    case "finance":
      return "Finance";
    case "media":
      return "Koordinator Media";
    case "crew":
      return "Kru";
    default:
      return "Dashboard";
  }
}

const crewLegacyTitleByPath: Record<string, string> = {
  "/crew/eid": "E-ID",
  "/crew/sertifikat": "Sertifikat",
};

const pusatLegacyTitleByPath: Record<string, string> = {
  "/pusat/master-regional": "Pengaturan Regional",
  "/pusat/pengaturan/profil": "Profil Pusat",
  "/pusat/pengaturan/tim-pusat": "Tim Pusat",
  "/pusat/pengaturan/regional": "Pengaturan Regional",
  "/pusat/militansi/leveling": "Pengaturan Leveling",
  "/pusat/pengaturan/harga-sku": "Harga & SKU",
  "/pusat/pengaturan/paket-slot": "Harga & SKU",
};

const mediaLegacyTitleByPath: Record<string, string> = {
  "/media/eid": "E-ID Card",
  "/media/pembayaran": "Administrasi",
  "/media/profil": "Profil Pesantren",
};

export default function V4DashboardLayout({ role }: { role: V4Role }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const navByRole: Record<V4Role, V4NavGroup[]> = {
    pusat: pusatNav,
    regional: regionalNav,
    finance: financeNav,
    media: mediaNav,
    crew: crewNav,
  };
  const groups = navByRole[role];
  const active = findV4NavItem(role, pathname);
  const displayName = user?.name || profile?.nama_pesantren || roleLabel(role);
  const displayRole = roleLabel(role);
  const pageTitle =
    (role === "pusat" ? pusatLegacyTitleByPath[pathname] : undefined) ||
    active?.label ||
    (role === "crew" ? crewLegacyTitleByPath[pathname] : undefined) ||
    (role === "media" ? mediaLegacyTitleByPath[pathname] : undefined) ||
    "Beranda";
  const initials = displayName.substring(0, 2).toUpperCase();

  useEffect(() => {
    if (!IS_DEV_AUTH_BYPASS_ENABLED) return;
    if (role === "media" && getDevPreviewRole() !== "user") {
      setDevPreviewRole("user");
    }
    if (role === "crew" && getDevPreviewRole() !== "crew") {
      setDevPreviewRole("crew");
    }
  }, [role]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DesktopSidebar title={`MPJ ${roleLabel(role)}`} subtitle="Dashboard v4" groups={groups} onLogout={handleLogout} />
      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm lg:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar title={`MPJ ${roleLabel(role)}`} subtitle="Dashboard v4" groups={groups} onLogout={handleLogout} />
            <div>
              <p className="text-xs text-muted-foreground">{roleLabel(role)}</p>
              <h2 className="text-base font-semibold text-emerald-800">{pageTitle}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            <Avatar className="h-9 w-9 border border-emerald-700">
              <AvatarImage src={profile?.logo_url || undefined} />
              <AvatarFallback className="bg-emerald-700 text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{displayName}</p>
              <p className="text-xs text-muted-foreground">{displayRole}</p>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl space-y-6 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
