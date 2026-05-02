import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import mpjLogo from "@/assets/mpj-vertical-color.png";
import {
  LayoutDashboard,
  Building,
  Users,
  CreditCard,
  Layers,
  Settings,
  Bell,
  Zap,
  AlertTriangle,
  IdCard,
  Calendar,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { formatNIP, getProfileLevelInfo } from "@/lib/id-utils";
import { getTransactionXPTotal } from "@/lib/v4-core-rules";
import { ProfileLevelBadge, VerifiedBadge } from "@/components/shared/LevelBadge";
import { apiRequest } from "@/lib/api-client";
import MediaDashboardHome from "@/components/media-dashboard/MediaDashboardHome";
import IdentitasPesantren from "@/components/media-dashboard/IdentitasPesantren";
import ManajemenKru from "@/components/media-dashboard/ManajemenKru";
import Administrasi from "@/components/media-dashboard/Administrasi";
import MPJHub from "@/components/media-dashboard/MPJHub";
import Pengaturan from "@/components/media-dashboard/Pengaturan";
import EventPage from "@/components/media-dashboard/EventPage";
import EIDAsetPage from "@/components/media-dashboard/EIDAsetPage";
import AktivasiNIPNIAM from "@/components/media-dashboard/AktivasiNIPNIAM";
import BasicMemberBanner from "@/components/shared/BasicMemberBanner";
import Sidebar, { type SidebarMenuItem } from "@/components/shared/Sidebar";

interface KoordinatorData {
  nama: string;
  niam: string | null;
  jabatan: string;
  xp_level?: number;
  status?: string | null;
  paymentVerified?: boolean;
  xpTotal?: number;
  xp_total?: number;
  transactionXpTotal?: number;
  transaction_xp_total?: number;
  photoUrl?: string;
}

type ViewType = "beranda" | "identitas" | "administrasi" | "tim" | "event" | "eid" | "hub" | "pengaturan" | "aktivasi";
type ProfileLevel = "basic" | "silver" | "gold" | "platinum";
type MediaMenuItem = SidebarMenuItem & { id: ViewType };

interface DebugProfileData {
  nip?: string | null;
  nama_pesantren?: string | null;
  nama_pengasuh?: string | null;
  alamat_singkat?: string | null;
  nama_media?: string | null;
  profile_level?: ProfileLevel;
  status_payment?: string | null;
  logo_url?: string | null;
}

interface MediaDashboardLocationState {
  debugProfile?: DebugProfileData;
  koordinator?: KoordinatorData;
  isDebugMode?: boolean;
}

const getViewFromPath = (pathname: string): ViewType => {
  const cmsToView: Record<string, ViewType> = {
    "user-beranda": "beranda",
    identitas: "identitas",
    pembayaran: "administrasi",
    tim: "tim",
    eid: "eid",
    "user-event": "event",
    hub: "hub",
    pengaturan: "pengaturan",
  };
  const segment = pathname.replace('/cms/', '');
  const valid: ViewType[] = ["beranda","identitas","administrasi","tim","event","eid","hub","pengaturan","aktivasi"];
  return cmsToView[segment] || (valid.includes(segment as ViewType) ? segment as ViewType : "beranda");
};

const VIEW_ROUTES: Record<ViewType, string> = {
  beranda: "/cms/user-beranda",
  identitas: "/cms/identitas",
  administrasi: "/cms/pembayaran",
  tim: "/cms/tim",
  event: "/cms/user-event",
  eid: "/cms/eid",
  hub: "/cms/hub",
  pengaturan: "/cms/pengaturan",
  aktivasi: "/cms/pembayaran",
};

const getMenuItems = (showAktivasi: boolean) => {
  const baseItems: MediaMenuItem[] = [
    { id: "beranda" as ViewType, label: "BERANDA", icon: LayoutDashboard },
    { id: "identitas" as ViewType, label: "IDENTITAS PESANTREN", icon: Building },
    { id: "administrasi" as ViewType, label: "ADMINISTRASI", icon: CreditCard },
    { id: "tim" as ViewType, label: "TIM MEDIA", icon: Users },
    { id: "eid" as ViewType, label: "E-ID & ASET", icon: IdCard },
    { id: "event" as ViewType, label: "EVENT", icon: Calendar, soon: true },
    { id: "hub" as ViewType, label: "MPJ HUB", icon: Layers, soon: true },
    { id: "pengaturan" as ViewType, label: "PENGATURAN", icon: Settings },
  ];

  if (showAktivasi) {
    baseItems.splice(3, 0, {
      id: "aktivasi" as ViewType,
      label: "AKTIVASI AKUN",
      icon: Sparkles,
      highlight: true,
    });
  }

  return baseItems;
};

const MediaDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile: authProfile, signOut, user, refreshAuth } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>(() => getViewFromPath(location.pathname));
  const [koordinator, setKoordinator] = useState<KoordinatorData | undefined>();
  const [regionalApprovedAt, setRegionalApprovedAt] = useState<string | null>(null);
  const [pusatApprovedAt, setPusatApprovedAt] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { toast } = useToast();

  const locationState = location.state as MediaDashboardLocationState | null;
  const debugProfile = locationState?.debugProfile;
  const debugKoordinator = locationState?.koordinator;
  const isDebugMode = locationState?.isDebugMode;
  const profile = isDebugMode && debugProfile ? debugProfile : authProfile;

  const paymentStatus = profile?.status_payment ?? 'unpaid';
  const profileLevel = profile?.profile_level ?? 'basic';
  const levelInfo = getProfileLevelInfo(profileLevel);
  const isPlatinum = profileLevel === 'platinum';

  useEffect(() => {
    if (paymentStatus === 'unpaid' && !sessionStorage.getItem('mpj_welcome_shown')) {
      setShowWelcomeModal(true);
    }
  }, [paymentStatus]);

  useEffect(() => {
    const fetchApprovalDates = async () => {
      if (isDebugMode || !user?.id) return;
      try {
        const data = await apiRequest<{ regionalApprovedAt: string | null; pusatApprovedAt: string | null; }>("/api/media/dashboard-context");
        if (data.regionalApprovedAt) setRegionalApprovedAt(data.regionalApprovedAt);
        if (data.pusatApprovedAt) setPusatApprovedAt(data.pusatApprovedAt);
      } catch (error) {
        console.error('Error fetching approval dates:', error);
      }
    };
    fetchApprovalDates();
  }, [user?.id, isDebugMode]);

  useEffect(() => {
    const fetchKoordinator = async () => {
      if (isDebugMode && debugKoordinator) { setKoordinator(debugKoordinator); return; }
      if (!user?.id) return;
      try {
        const data = await apiRequest<{ koordinator: KoordinatorData | null; }>("/api/media/dashboard-context");
        if (data.koordinator) {
          setKoordinator({ ...data.koordinator, jabatan: data.koordinator.jabatan || 'Koordinator' });
        }
      } catch (error) {
        console.error('Error fetching koordinator:', error);
      }
    };
    fetchKoordinator();
  }, [user?.id, isDebugMode, debugKoordinator]);

  const handleLogout = async () => {
    if (isDebugMode) { navigate('/debug-view'); return; }
    await signOut();
    toast({ title: "Berhasil keluar", description: "Anda telah logout dari sistem" });
    navigate('/login', { replace: true });
  };

  const handleMenuClick = (viewId: ViewType) => {
    setActiveView(viewId);
    navigate(VIEW_ROUTES[viewId]);
  };

  const handleDismissWelcome = () => {
    sessionStorage.setItem('mpj_welcome_shown', '1');
    setShowWelcomeModal(false);
  };

  const handleActivateFromWelcome = () => {
    handleDismissWelcome();
    handleMenuClick("aktivasi");
  };

  const displayNIP = profile?.nip ? formatNIP(profile.nip, true) : null;
  const showAktivasiMenu = paymentStatus === 'unpaid';
  const menuItems = getMenuItems(showAktivasiMenu);
  const headerXP = getTransactionXPTotal(koordinator as unknown as Record<string, unknown>);

  const renderContent = () => {
    switch (activeView) {
      case "beranda":
        return (
          <>
            {paymentStatus === 'unpaid' && (
              <BasicMemberBanner onActivate={() => handleMenuClick("aktivasi")} regionalApprovedAt={regionalApprovedAt} />
            )}
            <MediaDashboardHome paymentStatus={paymentStatus} profileLevel={profileLevel} onNavigate={handleMenuClick} debugProfile={profile || undefined} />
          </>
        );
      case "identitas":
        return <IdentitasPesantren paymentStatus={paymentStatus} profileLevel={profileLevel} onProfileLevelChange={() => refreshAuth()} />;
      case "tim":
        return <ManajemenKru paymentStatus={paymentStatus} debugProfile={profile || undefined} onKoordinatorChange={setKoordinator} />;
      case "eid":
        return (
          <EIDAsetPage
            paymentStatus={paymentStatus}
            profileLevel={profileLevel}
            debugProfile={profile || undefined}
            realProfile={!isDebugMode ? { nip: profile?.nip, nama_pesantren: profile?.nama_pesantren, nama_pengasuh: profile?.nama_pengasuh, alamat_singkat: profile?.alamat_singkat, nama_media: profile?.nama_media, profile_level: profile?.profile_level } : undefined}
            approvalDate={pusatApprovedAt}
            koordinator={koordinator}
          />
        );
      case "administrasi":
        return <Administrasi paymentStatus={paymentStatus} onPaymentStatusChange={() => { }} debugProfile={profile || undefined} />;
      case "aktivasi":
        return <AktivasiNIPNIAM />;
      case "event":
        return <EventPage />;
      case "hub":
        return <MPJHub />;
      case "pengaturan":
        return <Pengaturan />;
      default:
        return (
          <>
            {paymentStatus === 'unpaid' && (
              <BasicMemberBanner onActivate={() => handleMenuClick("aktivasi")} regionalApprovedAt={regionalApprovedAt} />
            )}
            <MediaDashboardHome paymentStatus={paymentStatus} profileLevel={profileLevel} onNavigate={handleMenuClick} debugProfile={profile || undefined} />
          </>
        );
    }
  };

  return (
    <>
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center">
            <img src={mpjLogo} alt="Media Pondok Jawa Timur" className="h-24 mb-6 object-contain" />
            <h2 className="text-2xl font-bold text-[#166534] mb-4 leading-tight">
              Ahlan wa Sahlan<br />Khodim MPJ!
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Status akun: <strong>Belum aktif</strong>. ID Card terkunci.
            </p>
            <button onClick={handleActivateFromWelcome} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-4 rounded-xl text-base transition-colors mb-4">
              Aktifkan Akun
            </button>
            <button onClick={handleDismissWelcome} className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors">
              Nanti Saja
            </button>
          </div>
        </div>
      )}

      <Sidebar
        menuItems={menuItems}
        activeView={activeView}
        onViewChange={(id) => handleMenuClick(id as ViewType)}
        onLogout={handleLogout}
        title="MPJ MEDIA"
        topAlert={
          paymentStatus === "unpaid" ? (
            <Alert className="rounded-none border-x-0 border-t-0 bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
                <span className="text-red-700 text-sm">
                  <strong>Belum aktif.</strong> Selesaikan pembayaran di menu Administrasi.
                </span>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleMenuClick("administrasi")}>
                  Bayar Sekarang
                </Button>
              </AlertDescription>
            </Alert>
          ) : null
        }
        headerLeft={
          <>
            {/* Mobile title */}
            <h2 className={cn("text-base font-bold md:hidden", isPlatinum ? "text-white" : "text-slate-900")}>
              MPJ MEDIA
            </h2>
            {/* Desktop title */}
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <h2 className={cn("text-lg font-bold", isPlatinum ? "text-white" : "text-slate-900")}>
                  {profile?.nama_pesantren || 'Media Pesantren'}
                </h2>
                {isPlatinum && <VerifiedBadge isVerified={true} size="md" />}
                {displayNIP && (
                  <Badge className={cn("font-mono text-sm", isPlatinum ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/30" : "bg-emerald-100 text-emerald-800")}>
                    NIP: {displayNIP}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className={cn("text-sm", isPlatinum ? "text-cyan-200" : "text-slate-600")}>Dashboard Koordinator</p>
                <ProfileLevelBadge level={profileLevel} size="sm" />
              </div>
            </div>
          </>
        }
        headerRight={
          <>
            {displayNIP && (
              <div className={cn("flex md:hidden items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-mono", isPlatinum ? "bg-cyan-500/20 text-cyan-300" : "bg-emerald-100 text-emerald-800")}>
                {displayNIP}
              </div>
            )}
            <div className={cn("flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-lg text-xs font-semibold", isPlatinum ? "bg-cyan-500/30 text-cyan-200" : "bg-[#166534] text-white")}>
              <IdCard className="h-4 w-4" />
              <span className="hidden md:inline">E-ID</span>
            </div>
            {headerXP > 0 && (
              <div className="hidden sm:flex items-center gap-1 bg-[#f59e0b] text-slate-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                <Zap className="h-4 w-4" />
                <span>{headerXP} XP</span>
              </div>
            )}
            <Button variant="ghost" size="icon" className={cn("relative h-9 w-9", isPlatinum ? "text-white hover:bg-white/10" : "")}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            <div className={cn("h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0", isPlatinum ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-white" : "bg-[#166534] text-white")}>
              MP
            </div>
          </>
        }
      >
        {renderContent()}
      </Sidebar>
    </>
  );
};

export default MediaDashboard;
