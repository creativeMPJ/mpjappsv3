import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Trophy, Compass, Calendar, IdCard, User, Bell, ChevronLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import CrewBerandaPage from "@/components/crew-dashboard/CrewBerandaPage";
import CrewEIDCardPage from "@/components/crew-dashboard/CrewEIDCardPage";
import CrewProfilPage from "@/components/crew-dashboard/CrewProfilPage";
import ComingSoonOverlay from "@/components/shared/ComingSoonOverlay";

type ViewType = "beranda" | "leaderboard" | "hub" | "event" | "eid" | "profil";

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isComingSoon: boolean;
}

const navItems: NavItem[] = [
  { id: "beranda", label: "Beranda", icon: Home, isActive: true, isComingSoon: false },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy, isActive: false, isComingSoon: true },
  { id: "hub", label: "MPJ HUB", icon: Compass, isActive: false, isComingSoon: true },
  { id: "event", label: "Event", icon: Calendar, isActive: false, isComingSoon: true },
  { id: "eid", label: "E-ID", icon: IdCard, isActive: true, isComingSoon: false },
  { id: "profil", label: "Profil", icon: User, isActive: true, isComingSoon: false },
];

const CrewDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>("beranda");
  const [institutionPaid, setInstitutionPaid] = useState(true);

  // Support debug mode via location.state
  const debugCrew = (location.state as any)?.debugCrew;
  const isDebugMode = (location.state as any)?.isDebugMode;

  const handleLogout = async () => {
    if (isDebugMode) {
      navigate('/debug-view');
      return;
    }
    await signOut();
    toast({
      title: "Berhasil keluar",
      description: "Anda telah logout dari sistem",
    });
    navigate('/login', { replace: true });
  };

  const handleNavClick = (item: NavItem) => {
    if (item.isComingSoon) {
      setActiveView(item.id);
    } else {
      setActiveView(item.id);
    }
  };

  const renderContent = () => {
    // Check if Coming Soon
    const currentNav = navItems.find(n => n.id === activeView);
    if (currentNav?.isComingSoon) {
      const titles: Record<string, string> = {
        leaderboard: "Leaderboard Militansi",
        hub: "MPJ HUB",
        event: "Event & Kegiatan",
      };
      const descriptions: Record<string, string> = {
        leaderboard: "Papan peringkat anggota berdasarkan XP Militansi akan segera hadir.",
        hub: "Pusat koneksi dan kolaborasi antar anggota MPJ se-Jawa Timur.",
        event: "Jadwal event, pendaftaran kegiatan, dan riwayat partisipasi.",
      };
      return (
        <ComingSoonOverlay 
          title={titles[activeView] || "Fitur Baru"} 
          description={descriptions[activeView]}
        />
      );
    }

    switch (activeView) {
      case "beranda":
        return <CrewBerandaPage onNavigate={setActiveView} debugCrew={debugCrew} />;
      case "eid":
        return <CrewEIDCardPage isGold={institutionPaid} onBack={() => setActiveView("profil")} debugCrew={debugCrew} />;
      case "profil":
        return <CrewProfilPage onNavigate={setActiveView} debugCrew={debugCrew} />;
      default:
        return <CrewBerandaPage onNavigate={setActiveView} debugCrew={debugCrew} />;
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case "beranda": return null;
      case "leaderboard": return "Leaderboard";
      case "hub": return "MPJ HUB";
      case "event": return "Event";
      case "eid": return "E-ID Card";
      case "profil": return "Profil";
      default: return null;
    }
  };

  const showHeader = activeView !== "beranda";

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-30 bg-card shadow-sm px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeView === "eid" && (
              <Button variant="ghost" size="icon" onClick={() => setActiveView("profil")}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold text-foreground">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation - 6 items */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40">
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all min-w-[50px] relative",
                  isActive
                    ? "text-primary"
                    : item.isComingSoon
                    ? "text-muted-foreground/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                  {item.isComingSoon && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 bg-amber-400 rounded-full" />
                  )}
                </div>
                <span className={cn("text-[10px]", isActive && "font-semibold")}>{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Testing Toggle (Debug only) */}
      {isDebugMode && (
        <div className="fixed bottom-24 right-4 z-50">
          <Button
            size="sm"
            variant={institutionPaid ? "default" : "secondary"}
            onClick={() => setInstitutionPaid(!institutionPaid)}
            className="shadow-lg text-xs"
          >
            {institutionPaid ? "🏅 Gold" : "🔒 Basic"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CrewDashboard;
