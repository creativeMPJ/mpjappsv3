import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  History,
  Ticket,
  Users,
  Calendar,
  Building2,
  UserCog,
  CreditCard,
  AlertTriangle,
  Award,
  CheckCircle2,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNIP } from "@/lib/id-utils";
import { VerifiedBadge } from "@/components/shared/LevelBadge";
import { formatDate, formatText, getPaymentStateLabel, isPaymentActive } from "@/features/v4/utils";
import { getEventList, type V4EventItem } from "@/features/v4/services/event.service";

type ViewType = "beranda" | "identitas" | "administrasi" | "tim" | "event" | "eid" | "hub" | "pengaturan";
type ProfileLevel = "basic" | "silver" | "gold" | "platinum";

interface MediaDashboardHomeProps {
  paymentStatus?: string;
  profileLevel?: ProfileLevel;
  onNavigate?: (view: ViewType) => void;
  routeMap?: Partial<Record<ViewType, string>>;
  debugProfile?: {
    nip?: string | null;
    profile_level?: ProfileLevel;
    status_payment?: string | null;
  };
}

const DEFAULT_VIEW_ROUTES: Record<ViewType, string> = {
  beranda:       '/media/beranda',
  identitas:     '/media/identitas',
  administrasi:  '/media/administrasi',
  tim:           '/media/tim',
  event:         '/media/event',
  eid:           '/media/eid',
  hub:           '/media/hub',
  pengaturan:    '/media/pengaturan',
};

const MediaDashboardHome = ({
  paymentStatus: paymentStatusProp,
  profileLevel: profileLevelProp,
  onNavigate: onNavigateProp,
  routeMap,
  debugProfile,
}: MediaDashboardHomeProps = {}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const sourceProfile = debugProfile || profile;
  const paymentStatus = paymentStatusProp ?? sourceProfile?.status_payment ?? 'unpaid';
  const paymentActive = isPaymentActive(paymentStatus);
  const paymentLabel = getPaymentStateLabel(paymentStatus);
  const profileLevel: ProfileLevel = profileLevelProp ?? sourceProfile?.profile_level ?? 'basic';
  const viewRoutes: Record<ViewType, string> = { ...DEFAULT_VIEW_ROUTES, ...routeMap };
  const onNavigate = (view: ViewType) => onNavigateProp?.(view) ?? navigate(viewRoutes[view]);

  const isPlatinum = profileLevel === 'platinum';
  const displayNIP = sourceProfile?.nip ? formatNIP(sourceProfile.nip, true) : null;
  const displayName = sourceProfile?.nama_pesantren || "Media Pesantren";
  const [events, setEvents] = useState<V4EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Calculate profile completion based on level
  const getProfileCompletion = () => {
    switch (profileLevel) {
      case "platinum": return 100;
      case "gold": return 75;
      case "silver": return 50;
      default: return 25;
    }
  };

  const profileCompletion = getProfileCompletion();

  // Mission items for daily tasks
  const missionItems = [
    { label: "Data Dasar Lengkap", completed: profileLevel !== "basic" },
    { label: "Logo & Dokumen Terunggah", completed: profileLevel === "gold" || profileLevel === "platinum" },
    { label: "Profil Ensiklopedia", completed: profileLevel === "platinum" },
    { label: "Administrasi Lunas", completed: paymentActive },
  ];

  const getLevelInfo = () => {
    switch (profileLevel) {
      case "silver": return { color: "bg-slate-400", label: "Silver" };
      case "gold": return { color: "bg-[#f59e0b]", label: "Gold" };
      case "platinum": return { color: "bg-gradient-to-r from-cyan-500 to-blue-500", label: "Platinum" };
      default: return { color: "bg-slate-500", label: "Basic" };
    }
  };

  const levelInfo = getLevelInfo();
  const upcomingEvent = useMemo(() => {
    const sorted = [...events].sort((left, right) => {
      const leftDate = left.date ? new Date(left.date).getTime() : Number.POSITIVE_INFINITY;
      const rightDate = right.date ? new Date(right.date).getTime() : Number.POSITIVE_INFINITY;
      return leftDate - rightDate;
    });

    const now = Date.now();
    return sorted.find((event) => event.date && new Date(event.date).getTime() >= now) ?? sorted[0] ?? null;
  }, [events]);

  useEffect(() => {
    let mounted = true;

    getEventList().then((result) => {
      if (!mounted) return;
      setEvents(result.data ?? []);
      setEventsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 pb-20 bg-slate-50 min-h-screen -m-4 md:-m-6 p-4 md:p-6">
      {/* Payment Alert */}
      {!paymentActive && (
        <Alert className="bg-red-50 border-red-200 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 font-medium">
            <strong>{paymentLabel}.</strong> Aktifkan akun terlebih dahulu untuk membuka fitur sensitif.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Card - Clean White Theme with Premium Border */}
      <Card className={cn(
        "border overflow-hidden relative shadow-lg",
        isPlatinum
          ? "bg-white border-cyan-200 shadow-cyan-100/50"
          : "bg-white border-emerald-200 shadow-emerald-100/50"
      )}>
        {/* Decorative Pattern - Subtle */}
        <div className="absolute top-0 right-0 w-48 h-48 opacity-5">
          {isPlatinum ? (
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <pattern id="diamond-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                <polygon points="10,0 20,10 10,20 0,10" fill="currentColor" className="text-cyan-600" />
              </pattern>
              <rect width="200" height="200" fill="url(#diamond-pattern)" />
            </svg>
          ) : (
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <pattern id="islamic-pattern" patternUnits="userSpaceOnUse" width="40" height="40">
                <path d="M20 0L40 20L20 40L0 20Z" fill="currentColor" className="text-emerald-600" />
              </pattern>
              <rect width="200" height="200" fill="url(#islamic-pattern)" />
            </svg>
          )}
        </div>
        <CardContent className="p-6 md:p-8 relative z-10">
          {/* NIP & Verified Badge Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={cn(
              "font-mono text-lg px-3 py-1 shadow-sm",
              isPlatinum
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0"
                : "bg-emerald-600 text-white border-0"
            )}>
              NIP: {displayNIP ?? "-"}
            </Badge>
            {isPlatinum && <VerifiedBadge isVerified={true} size="lg" showLabel />}
          </div>

          {/* Institution Name - Bold & Elegant */}
          <div className="flex items-center gap-3 mb-2">
            <h1 className={cn(
              "text-2xl md:text-4xl font-bold tracking-tight",
              isPlatinum ? "text-slate-900" : "text-emerald-950"
            )}>
              {displayName}
            </h1>
          </div>

          {/* Welcome Message */}
          <p className={cn(
            "text-base md:text-lg font-medium",
            isPlatinum ? "text-slate-600" : "text-slate-700"
          )}>
            Selamat datang di dashboard Koordinator Media Pondok Jawa Timur.
          </p>

          {/* Level & Status Badges - Enhanced with 3D effect */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Badge className={cn(
              levelInfo.color,
              "text-white shadow-md border-0",
              profileLevel === "platinum" && "shadow-cyan-300/50",
              profileLevel === "gold" && "shadow-amber-300/50",
              profileLevel === "silver" && "shadow-slate-300/50"
            )}>
              {levelInfo.label}
            </Badge>
            <Badge className={cn(
              "shadow-sm",
              paymentActive
                ? "bg-green-500 text-white shadow-green-200/50"
                : "bg-red-500 text-white shadow-red-200/50"
            )}>
              {paymentActive ? "Akun aktif" : paymentLabel}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion Progress */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">Kelengkapan Profil</h3>
            </div>
            <span className="text-lg font-bold text-emerald-700">{profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion} className="h-3 mb-4" />

          {/* Mission Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {missionItems.map((mission, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border shadow-sm",
                  mission.completed
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-white border-slate-200"
                )}
              >
                {mission.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    mission.completed ? "text-emerald-900" : "text-slate-700"
                  )}>
                    {mission.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base font-semibold text-slate-900">Event Mendatang</CardTitle>
            </div>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              <ArrowRight className="mr-1 h-3.5 w-3.5" />
              Lihat Event
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            {eventsLoading ? (
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-slate-200/70" />
                <div className="h-4 w-56 rounded bg-slate-200/60" />
              </div>
            ) : upcomingEvent ? (
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 shadow-sm">
                  <Calendar className="h-7 w-7 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-base font-semibold text-slate-900">{formatText(upcomingEvent.name)}</p>
                  <p className="text-sm text-slate-600">{formatText(upcomingEvent.description)}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(upcomingEvent.date)}{upcomingEvent.location ? ` · ${formatText(upcomingEvent.location)}` : ""}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 shadow-sm">
                  <Calendar className="h-7 w-7 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-base font-semibold text-slate-900">Belum ada event mendatang</p>
                  <p className="text-sm text-slate-600">Event akan tampil setelah tersedia.</p>
                </div>
              </div>
            )}
            <Button variant="outline" className="w-full justify-between" onClick={() => onNavigate("event")}>
              <span>Lihat Event</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base font-semibold text-slate-900">Riwayat Event</CardTitle>
            </div>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
              <Ticket className="mr-1 h-3.5 w-3.5" />
              Lihat Riwayat
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 shadow-sm">
                <History className="h-7 w-7 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-3xl font-bold text-slate-900">0</p>
                <p className="text-sm text-slate-600">Belum ada riwayat event</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Aktivitas akan tampil setelah tersedia.</p>
            <Button variant="outline" className="w-full justify-between" onClick={() => onNavigate("event")}>
              <span>Lihat Riwayat</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Menu Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Profil Pesantren */}
        <Card
          className="bg-white border border-slate-200 hover:shadow-lg transition-all cursor-pointer group shadow-sm"
          onClick={() => onNavigate("identitas")}
        >
          <CardContent className="p-4 md:p-6 text-center">
            <div className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors shadow-sm">
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm md:text-base">Profil Pesantren</h3>
            <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4">Identitas & E-ID</p>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-sm">
              Kelola
            </Button>
          </CardContent>
        </Card>

        {/* Kelola Crew */}
        <Card
          className="bg-white border border-slate-200 hover:shadow-lg transition-all cursor-pointer group shadow-sm"
          onClick={() => onNavigate("tim")}
        >
          <CardContent className="p-4 md:p-6 text-center">
            <div className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors shadow-sm">
              <UserCog className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm md:text-base">Kelola Crew</h3>
            <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4">Manajemen anggota</p>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-sm">
              Kelola
            </Button>
          </CardContent>
        </Card>

        {/* Administrasi */}
        <Card
          className={cn(
            "bg-white border transition-all cursor-pointer group shadow-sm",
            paymentActive ? "hover:shadow-lg border-slate-200" : "ring-2 ring-red-300 border-red-200"
          )}
          onClick={() => onNavigate("administrasi")}
        >
          <CardContent className="p-4 md:p-6 text-center">
            <div className={cn(
              "h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 rounded-full flex items-center justify-center transition-colors shadow-sm",
              paymentActive ? "bg-emerald-100 group-hover:bg-emerald-200" : "bg-red-100 group-hover:bg-red-200"
            )}>
              <CreditCard className={cn("h-6 w-6 md:h-8 md:w-8", paymentActive ? "text-emerald-600" : "text-red-600")} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm md:text-base">Administrasi</h3>
            <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4">Tagihan</p>
            <Button
              className={cn(
                "w-full text-sm shadow-sm",
                paymentActive
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {paymentActive ? "Lihat" : "Bayar"}
            </Button>
          </CardContent>
        </Card>

        {/* MPJ Hub */}
        <Card
          className={cn(
            "bg-white border transition-all group shadow-sm",
            paymentActive ? "border-slate-200 hover:shadow-lg cursor-pointer" : "border-slate-200 opacity-75",
          )}
          onClick={() => {
            if (paymentActive) onNavigate("hub");
          }}
        >
          <CardContent className="p-4 md:p-6 text-center">
            <div className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors shadow-sm">
              <Globe className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm md:text-base">MPJ Hub</h3>
            <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4">Resource & publikasi</p>
            <Button
              disabled={!paymentActive}
              className={cn(
                "w-full text-white text-sm shadow-sm",
                paymentActive ? "bg-purple-600 hover:bg-purple-700" : "bg-slate-400 hover:bg-slate-400 cursor-not-allowed",
              )}
            >
              {paymentActive ? "Lihat" : "Aktifkan akun terlebih dahulu"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MediaDashboardHome;
