import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  Database,
  Settings,
  LayoutDashboard,
  CheckCircle,
  Calendar,
  Share2,
  Trophy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api-client";
import RegionalDashboardHome from "@/components/regional-dashboard/RegionalDashboardHome";
import ValidasiPendaftar from "@/components/regional-dashboard/ValidasiPendaftar";
import ManajemenEvent from "@/components/regional-dashboard/ManajemenEvent";
import DataMasterRegional from "@/components/regional-dashboard/DataMasterRegional";
import RegionalHub from "@/components/regional-dashboard/RegionalHub";
import Pengaturan from "@/components/regional-dashboard/Pengaturan";
import AsistenRegionalManagement from "@/components/regional-dashboard/AsistenRegionalManagement";
import Sidebar from "@/components/shared/Sidebar";

type ViewType = "beranda" | "verifikasi" | "data-regional" | "event" | "regional-hub" | "asisten" | "pengaturan";

const RegionalDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signOut, profile: authProfile } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [pendingCount, setPendingCount] = useState(0);

  const debugProfile = (location.state as any)?.debugProfile;
  const isDebugMode = (location.state as any)?.isDebugMode;
  const profile = isDebugMode && debugProfile ? debugProfile : authProfile;

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!profile?.region_id || isDebugMode) return;
      try {
        const data = await apiRequest<{ count?: number }>("/api/claims/pending-count");
        if (typeof data?.count === "number") setPendingCount(data.count);
      } catch (error) {
        console.error("Failed to fetch pending count:", error);
      }
    };
    fetchPendingCount();
  }, [profile?.region_id, isDebugMode]);

  const menuItems = [
    { id: "beranda", label: "BERANDA", icon: LayoutDashboard },
    { id: "verifikasi", label: "VERIFIKASI", icon: CheckCircle, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: "data-regional", label: "DATA REGIONAL", icon: Database },
    { id: "event", label: "EVENT", icon: Calendar, soon: true },
    { id: "regional-hub", label: "REGIONAL HUB", icon: Share2, soon: true },
    { id: "asisten", label: "ASISTEN", icon: Trophy },
    { id: "pengaturan", label: "PENGATURAN", icon: Settings },
  ];

  const handleLogout = async () => {
    if (isDebugMode) { navigate('/debug-view'); return; }
    await signOut();
    toast({ title: "Berhasil keluar", description: "Anda telah logout dari sistem" });
    navigate('/login', { replace: true });
  };

  const renderContent = () => {
    switch (activeView) {
      case "beranda": return <RegionalDashboardHome />;
      case "verifikasi": return <ValidasiPendaftar isDebugMode={isDebugMode} />;
      case "data-regional": return <DataMasterRegional isDebugMode={isDebugMode} />;
      case "event": return <ManajemenEvent />;
      case "regional-hub": return <RegionalHub />;
      case "asisten": return <AsistenRegionalManagement isDebugMode={isDebugMode} />;
      case "pengaturan": return <Pengaturan isDebugMode={isDebugMode} />;
      default: return <RegionalDashboardHome />;
    }
  };

  return (
    <Sidebar
      menuItems={menuItems}
      activeView={activeView}
      onViewChange={(id) => setActiveView(id as ViewType)}
      onLogout={handleLogout}
      title="MPJ REGIONAL"
      subtitle="Admin Panel"
      sidebarBg="bg-emerald-700"
      headerLeft={
        <div>
          <p className="text-sm text-muted-foreground">Selamat datang kembali,</p>
          <h2 className="text-lg font-bold text-emerald-700">
            Halo, {profile?.nama_pesantren || 'Admin'} 👋
          </h2>
        </div>
      }
      headerRight={
        <>
          <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2">
            <Avatar className="w-9 h-9 border-2 border-emerald-600">
              <AvatarImage src={profile?.logo_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-emerald-600 text-white text-sm">
                {profile?.nama_pesantren?.substring(0, 2).toUpperCase() || 'AR'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{profile?.nama_pesantren || 'Admin Regional'}</p>
              <p className="text-xs text-muted-foreground">Regional Admin</p>
            </div>
          </div>
        </>
      }
    >
      {renderContent()}
    </Sidebar>
  );
};

export default RegionalDashboard;
