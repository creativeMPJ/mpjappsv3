import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  CheckCircle,
  History,
  Tag,
  BarChart3,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import FinanceBeranda from "@/components/finance-dashboard/FinanceBeranda";
import FinanceVerifikasi from "@/components/finance-dashboard/FinanceVerifikasi";
import FinanceRiwayat from "@/components/finance-dashboard/FinanceRiwayat";
import FinanceHarga from "@/components/finance-dashboard/FinanceHarga";
import FinanceLaporan from "@/components/finance-dashboard/FinanceLaporan";
import Sidebar from "@/components/shared/Sidebar";

type ViewType = "beranda" | "verifikasi" | "riwayat" | "harga" | "laporan";

const getViewFromPath = (pathname: string): ViewType => {
  const segment = pathname.split('/finance/')[1] as ViewType;
  const valid: ViewType[] = ["beranda", "verifikasi", "riwayat", "harga", "laporan"];
  return valid.includes(segment) ? segment : "beranda";
};

const menuItems = [
  { id: "beranda", label: "Dashboard Beranda", icon: LayoutDashboard },
  { id: "verifikasi", label: "Verifikasi", icon: CheckCircle, badge: 5 },
  { id: "riwayat", label: "Riwayat Transaksi", icon: History },
  { id: "harga", label: "Pengaturan Harga", icon: Tag },
  { id: "laporan", label: "Laporan", icon: BarChart3 },
];

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<ViewType>(() => getViewFromPath(location.pathname));
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Berhasil keluar", description: "Anda telah logout dari sistem" });
    navigate('/login', { replace: true });
  };

  const handleViewChange = (id: string) => {
    setActiveView(id as ViewType);
    navigate(id === "beranda" ? "/finance" : `/finance/${id}`);
  };

  const renderContent = () => {
    switch (activeView) {
      case "beranda": return <FinanceBeranda />;
      case "verifikasi": return <FinanceVerifikasi />;
      case "riwayat": return <FinanceRiwayat />;
      case "harga": return <FinanceHarga />;
      case "laporan": return <FinanceLaporan />;
      default: return <FinanceBeranda />;
    }
  };

  return (
    <Sidebar
      menuItems={menuItems}
      activeView={activeView}
      onViewChange={handleViewChange}
      onLogout={handleLogout}
      title="MPJ FINANCE"
      subtitle="Gatekeeper Dashboard"
      headerLeft={
        <div>
          <h2 className="text-lg font-bold text-[#166534]">MPJ FINANCE</h2>
          <p className="text-xs text-muted-foreground">Gatekeeper - Aktivasi Akun</p>
        </div>
      }
      headerRight={
        <>
          <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2">
            <Avatar className="w-9 h-9 border-2 border-amber-500">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-[#166534] text-white text-sm">FG</AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-foreground">Finance Admin</span>
          </div>
        </>
      }
    >
      {renderContent()}
    </Sidebar>
  );
};

export default FinanceDashboard;
