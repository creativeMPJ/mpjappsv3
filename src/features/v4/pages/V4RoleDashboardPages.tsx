import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Home, Users, WalletCards, ShieldCheck, FolderOpen } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DisabledActionCell, EmptyState, MetricCard, PageHeader, DataTableShell, StatusBadge } from "../components/v4-components";
import { v4AdminService, type PusatHomeSummary } from "../services/v4-services";
import { formatCurrency, formatText } from "../utils";
import { canAccessEID } from "@/lib/v4-core-rules";
import { useAuth } from "@/contexts/AuthContext";
import MediaDashboardHome from "@/components/media-dashboard/MediaDashboardHome";
import IdentitasPesantren from "@/components/media-dashboard/IdentitasPesantren";
import Administrasi from "@/components/media-dashboard/Administrasi";
import ManajemenKru from "@/components/media-dashboard/ManajemenKru";
import EIDAsetPage from "@/components/media-dashboard/EIDAsetPage";
import EventPage from "@/components/media-dashboard/EventPage";
import MPJHub from "@/components/media-dashboard/MPJHub";
import CrewBerandaPage from "@/components/crew-dashboard/CrewBerandaPage";
import CrewEIDCardPage from "@/components/crew-dashboard/CrewEIDCardPage";
import CrewEventPage from "@/components/crew-dashboard/CrewEventPage";
import CrewSertifikatPage from "@/components/crew-dashboard/CrewSertifikatPage";
import CrewProfilPage from "@/components/crew-dashboard/CrewProfilPage";
import FinanceReportPage from "@/components/finance-dashboard/FinanceLaporan";
import FinanceVerificationPage from "@/components/finance-dashboard/FinanceVerifikasi";

const MEDIA_ROUTES = {
  beranda: "/media/beranda",
  administrasi: "/media/administrasi",
  identitas: "/media/identitas",
  profil: "/media/identitas",
  tim: "/media/tim",
  eid: "/media/eid",
  event: "/media/event",
  hub: "/media/hub",
  pengaturan: "/media/pengaturan",
  aktivasi: "/media/administrasi",
} as const;

const CREW_ROUTES = {
  beranda: "/crew/beranda",
  profil: "/crew/profil",
  leaderboard: "/crew/militansi",
  militansi: "/crew/militansi",
  hub: "/crew/hub",
  event: "/crew/event",
  eid: "/crew/eid",
  sertifikat: "/crew/sertifikat",
} as const;

type MediaRouteKey = keyof typeof MEDIA_ROUTES;
type CrewRouteKey = keyof typeof CREW_ROUTES;

function buildCrewPreview(userName?: string | null, profileName?: string | null, statusAccount?: string | null, paymentStatus?: string | null, logoUrl?: string | null) {
  return {
    nama: userName ?? profileName ?? "Dev Kru",
    niam: null,
    jabatan: "Kru",
    status: statusAccount ?? "active",
    paymentVerified: paymentStatus === "paid",
    institution_name: profileName ?? userName ?? "Dev Kru",
    pesantren_asal: profileName ?? userName ?? "Dev Kru",
    alamat_asal: null,
    nama_panggilan: null,
    whatsapp: null,
    prinsip_hidup: null,
    photoUrl: logoUrl ?? undefined,
  };
}

function pickLabel(record: Record<string, unknown>) {
  const keys = ["action", "activity", "title", "name", "description", "label", "user", "status"];
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" || typeof value === "number") {
      const text = formatText(value);
      if (text !== "-") {
        return text;
      }
    }
  }
  return "-";
}

function resolveStatus(value: unknown) {
  return typeof value === "string" ? value : null;
}

function CrewEmptyState({
  title,
  description,
  actionLabel = "Segera Hadir",
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={<Button disabled>{actionLabel}</Button>}
    />
  );
}

export function FinanceBerandaPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PusatHomeSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    v4AdminService.homeSummary().then((result) => {
      if (!mounted) return;
      setSummary(result.data);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && !summary) {
    return (
      <div className="space-y-6">
        <PageHeader title="Beranda Finance" description="Monitoring data keuangan." />
        <EmptyState title="Belum ada data" description="Data akan tampil setelah tersedia" />
      </div>
    );
  }

  const stats = summary?.stats ?? {};
  const recentRows = summary?.recentUsers ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beranda Finance"
        description="Monitoring data keuangan."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Pemasukan" value={formatCurrency(stats.totalIncome ?? null)} icon={WalletCards} loading={loading} />
        <MetricCard title="Menunggu Verifikasi" value={stats.pendingPayments ?? 0} icon={FileText} loading={loading} />
        <MetricCard title="Total Pesantren" value={stats.totalPesantren ?? 0} icon={Users} loading={loading} />
        <MetricCard title="Total Kru" value={stats.totalKru ?? 0} icon={Home} loading={loading} />
      </div>
      <DataTableShell
        title="Aktivitas Terkini"
        description="Monitoring data transaksi keuangan."
        columns={["Aktivitas", "Status", "Aksi"]}
        rows={recentRows}
        loading={loading}
        emptyTitle="Belum ada data"
        emptyDescription="Data akan tampil setelah tersedia"
        renderRow={(row, index) => {
          const item = row as Record<string, unknown>;

          return (
            <TableRow key={`finance-${index}`}>
              <TableCell className="font-medium">{pickLabel(item)}</TableCell>
              <TableCell><StatusBadge status={resolveStatus(item.status ?? item.state)} /></TableCell>
              <DisabledActionCell />
            </TableRow>
          );
        }}
      />
    </div>
  );
}

export function FinanceVerifikasiPage() {
  return <FinanceVerificationPage />;
}

export function FinanceLaporanPage() {
  return <FinanceReportPage />;
}

export function MediaBerandaPage() {
  const navigate = useNavigate();
  const handleNavigate = useCallback((view: string) => {
    const key = view as MediaRouteKey;
    navigate(MEDIA_ROUTES[key] ?? MEDIA_ROUTES.beranda);
  }, [navigate]);

  return <MediaDashboardHome onNavigate={handleNavigate} />;
}

export function MediaAdministrasiPage() {
  return <Administrasi />;
}

export function MediaIdentitasPage() {
  return <IdentitasPesantren />;
}

export function MediaPengaturanPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan" description="Fitur akan segera tersedia." />
      <EmptyState title="Belum ada data" description="Data akan tampil setelah tersedia" />
    </div>
  );
}

export function MediaTimPage() {
  return <ManajemenKru />;
}

export function MediaEIDPage() {
  return <EIDAsetPage />;
}

export function MediaEventPage() {
  return <EventPage />;
}

export function MediaHubPage() {
  return <MPJHub />;
}

export function CrewBerandaPageView() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const crewPreview = buildCrewPreview(user?.name, profile?.nama_pesantren, profile?.status_account, profile?.status_payment, profile?.logo_url);

  const handleNavigate = useCallback((view: string) => {
    const key = view as CrewRouteKey;
    navigate(CREW_ROUTES[key] ?? CREW_ROUTES.beranda);
  }, [navigate]);

  return <CrewBerandaPage onNavigate={handleNavigate as (view: "beranda" | "leaderboard" | "hub" | "event" | "eid" | "profil") => void} debugCrew={crewPreview} />;
}

export function CrewEIDPageView() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const crewPreview = buildCrewPreview(user?.name, profile?.nama_pesantren, profile?.status_account, profile?.status_payment, profile?.logo_url);
  const canAccess = canAccessEID({ crewStatus: profile?.status_account, profileLevel: profile?.profile_level });

  return <CrewEIDCardPage canAccessEID={canAccess} onBack={() => navigate("/crew/profil")} debugCrew={crewPreview} />;
}

export function CrewEventPageView() {
  return <CrewEventPage />;
}

export function CrewMilitansiPageView() {
  const { profile } = useAuth();
  const xpTotal = 0;
  const status = profile?.status_account;

  return (
    <div className="space-y-6">
      <PageHeader title="Militansi" description="Monitoring data militansi." />
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total XP" value={xpTotal} icon={ShieldCheck} />
      </div>
      <CrewEmptyState
        title="Belum ada aktivitas"
        description="Data akan tampil setelah tersedia"
      />
    </div>
  );
}

export function CrewHubPageView() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="MPJ-Hub" description="Monitoring data MPJ-Hub." />
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={profile?.status_account} />
      </div>
      <CrewEmptyState
        title="Belum ada data"
        description="Data akan tampil setelah tersedia"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard title="Resource" value="-" icon={FolderOpen} />
        <MetricCard title="Status" value="Segera Hadir" icon={ShieldCheck} />
      </div>
    </div>
  );
}

export function CrewSertifikatPageView() {
  return <CrewSertifikatPage />;
}

export function CrewProfilPageView() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const crewPreview = buildCrewPreview(user?.name, profile?.nama_pesantren, profile?.status_account, profile?.status_payment, profile?.logo_url);
  const handleNavigate = useCallback((view: string) => {
    const key = view as CrewRouteKey;
    navigate(CREW_ROUTES[key] ?? CREW_ROUTES.beranda);
  }, [navigate]);

  return <CrewProfilPage onNavigate={handleNavigate as (view: "beranda" | "leaderboard" | "hub" | "event" | "eid" | "profil") => void} debugCrew={crewPreview} />;
}
