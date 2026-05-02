import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  Calendar,
  Medal,
  Layers,
  Settings,
  Bell,
  Zap,
  Map,
  ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AdminPusatHome from "@/components/admin-pusat/AdminPusatHome";
import AdminPusatMasterData from "@/components/admin-pusat/AdminPusatMasterData";
import AdminPusatAdministrasi from "@/components/admin-pusat/AdminPusatAdministrasi";
import AdminPusatRegional from "@/components/admin-pusat/AdminPusatRegional";
import AdminPusatPengaturan from "@/components/admin-pusat/AdminPusatPengaturan";
import AdminPusatEvent from "@/components/admin-pusat/AdminPusatEvent";
import GlobalSearchNIPNIAM from "@/components/admin-pusat/GlobalSearchNIPNIAM";
import ComingSoonOverlay from "@/components/shared/ComingSoonOverlay";
import Sidebar from "@/components/shared/Sidebar";

const SUPER_ADMIN_EMAIL = "superadmin@mpj.com";

type ViewType =
  | "dashboard"
  | "administrasi"
  | "master-data"
  | "master-regional"
  | "manajemen-event"
  | "manajemen-militansi"
  | "mpj-hub"
  | "pengaturan";

const menuItems = [
  { id: "dashboard", label: "BERANDA", icon: LayoutDashboard },
  { id: "administrasi", label: "ADMINISTRASI", icon: ClipboardCheck },
  { id: "master-data", label: "MASTER DATA", icon: Database },
  { id: "master-regional", label: "PENGATURAN REGIONAL", icon: Map },
  { id: "manajemen-event", label: "MANAJEMEN EVENT", icon: Calendar },
  { id: "manajemen-militansi", label: "MANAJEMEN MILITANSI", icon: Medal, soon: true },
  { id: "mpj-hub", label: "MPJ HUB", icon: Layers, soon: true },
  { id: "pengaturan", label: "PENGATURAN", icon: Settings },
];

const getViewFromPath = (pathname: string): ViewType => {
  const segment = pathname.split('/admin-pusat/')[1] as ViewType;
  const valid: ViewType[] = ["dashboard","administrasi","master-data","master-regional","manajemen-event","manajemen-militansi","mpj-hub","pengaturan"];
  return valid.includes(segment) ? segment : "dashboard";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>(() => getViewFromPath(location.pathname));

  const isDebugMode = location.state?.isDebugMode === true;
  const debugData = location.state?.debugData;
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  const handleLogout = async () => {
    if (isDebugMode) {
      navigate('/debug-view', { replace: true });
      return;
    }
    await signOut();
    toast({ title: "Berhasil keluar", description: "Anda telah logout dari sistem" });
    navigate('/login', { replace: true });
  };

  const handleViewChange = (id: string) => {
    setActiveView(id as ViewType);
    navigate(id === "dashboard" ? "/admin-pusat" : `/admin-pusat/${id}`);
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <AdminPusatHome onNavigate={setActiveView} isDebugMode={isDebugMode} debugData={debugData} />;
      case "administrasi":
        return <AdminPusatAdministrasi isDebugMode={isDebugMode} debugData={debugData} />;
      case "master-data":
        return <AdminPusatMasterData isDebugMode={isDebugMode} debugData={debugData} />;
      case "master-regional":
        return <AdminPusatRegional isDebugMode={isDebugMode} debugData={debugData} />;
      case "manajemen-event":
        return <AdminPusatEvent />;
      case "manajemen-militansi":
        return <ComingSoonOverlay title="Manajemen Militansi" description="Leaderboard dan sistem gamifikasi XP" />;
      case "mpj-hub":
        return <ComingSoonOverlay title="MPJ HUB" description="Pusat kolaborasi dan resource sharing" />;
      case "pengaturan":
        return <AdminPusatPengaturan />;
      default:
        return <AdminPusatHome onNavigate={setActiveView} isDebugMode={isDebugMode} debugData={debugData} />;
    }
  };

  return (
    <Sidebar
      menuItems={menuItems}
      activeView={activeView}
      onViewChange={handleViewChange}
      onLogout={handleLogout}
      title="MPJ PUSAT"
      collapsible
      sidebarExtra={
        isSuperAdmin ? (
          <Link
            to="/super-admin"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors border border-red-500/30"
          >
            <Zap className="h-5 w-5 flex-shrink-0" />
            <span className="font-semibold text-sm">SUPER ADMIN</span>
          </Link>
        ) : null
      }
      headerLeft={
        <h2 className="text-lg font-semibold text-foreground">
          Halo, {isSuperAdmin ? "Super Admin" : "Admin Pusat"}
        </h2>
      }
      headerRight={
        <>
          <div className="hidden lg:block w-80">
            <GlobalSearchNIPNIAM />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {isSuperAdmin ? "SA" : "AP"}
            </span>
          </div>
        </>
      }
    >
      {renderContent()}
    </Sidebar>
  );
};

export default Dashboard;
