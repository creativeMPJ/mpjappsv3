import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, Award, User, Bell, ChevronLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import CrewBerandaPage from "@/components/crew-dashboard/CrewBerandaPage";
import CrewEventPage from "@/components/crew-dashboard/CrewEventPage";
import CrewSertifikatPage from "@/components/crew-dashboard/CrewSertifikatPage";
import CrewEIDCardPage from "@/components/crew-dashboard/CrewEIDCardPage";
import CrewProfilPage from "@/components/crew-dashboard/CrewProfilPage";

type ViewType = "beranda" | "event" | "sertifikat" | "eid" | "profil";

const navItems = [
  { id: "beranda" as ViewType, label: "Beranda", icon: Home },
  { id: "event" as ViewType, label: "Event", icon: Calendar },
  { id: "sertifikat" as ViewType, label: "Sertifikat", icon: Award },
  { id: "profil" as ViewType, label: "Profil", icon: User },
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

  const renderContent = () => {
    switch (activeView) {
      case "beranda":
        return <CrewBerandaPage onNavigate={setActiveView} debugCrew={debugCrew} />;
      case "event":
        return <CrewEventPage />;
      case "sertifikat":
        return <CrewSertifikatPage />;
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
      case "event": return "Event";
      case "sertifikat": return "Sertifikat";
      case "eid": return "E-ID Card";
      case "profil": return "Profil";
      default: return null;
    }
  };

  const showHeader = activeView !== "beranda" && activeView !== "eid";
  const showBackButton = activeView === "eid";

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-30 bg-card shadow-sm px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">{getPageTitle()}</h1>
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

      {/* Back Header for E-ID Card */}
      {showBackButton && (
        <header className="sticky top-0 z-30 bg-card shadow-sm px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setActiveView("profil")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{getPageTitle()}</h1>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = activeView === item.id || (activeView === "eid" && item.id === "profil");
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[64px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                <span className={cn("text-xs", isActive && "font-semibold")}>{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 w-12 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Testing Toggle */}
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
    </div>
  );
};

export default CrewDashboard;
