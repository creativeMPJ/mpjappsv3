import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CreditCard, Info, Lock, RefreshCw, Shield, UserPlus, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { IS_DEV_AUTH_BYPASS_ENABLED, getDevPreviewRole, setDevPreviewRole } from "@/config/devAuth";
import { ApiError, apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { getTransactionXPTotal } from "@/lib/v4-core-rules";
import { useCurrentPaymentStatus } from "@/features/v4/utils";
import { EmptyState, PageHeader } from "@/features/v4/components/v4-components";
import { getMasterDataPreviewSnapshot, type V4MasterCrew } from "@/features/v4/services/master-data.service";

interface KoordinatorData {
  nama: string;
  niam: string | null;
  jabatan: string;
  xp_level?: number;
  status?: string | null;
  xpTotal?: number;
  photoUrl?: string;
}

interface ManajemenKruProps {
  paymentStatus?: string;
  debugProfile?: {
    nip?: string;
    nama_pesantren?: string;
  };
  onKoordinatorChange?: (koordinator: KoordinatorData | undefined) => void;
}

interface Crew {
  id: string;
  nama: string;
  jabatan: string | null;
  niam: string | null;
  status?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  roleCode?: string | null;
  jabatan_media?: string | null;
  catatan?: string | null;
  xp_level?: number;
  paymentVerified?: boolean;
  xp_total?: number;
  xpTotal?: number;
  transaction_xp_total?: number;
  transactionXpTotal?: number;
}

interface SlotConfig {
  freeSlotQuantity: number;
  addonSlotPrice: number;
}

type ProfileTrace = {
  id?: string | null;
  role?: string | null;
  region_id?: string | null;
  nama_pesantren?: string | null;
};

type CrewLoadIssueKind = "unauthorized" | "missing" | "network" | "error";
type CrewDataSource = "management" | "master_data_preview" | "error";

interface CrewLoadIssue {
  kind: CrewLoadIssueKind;
  title: string;
  description: string;
  details: string;
}

const JABATAN_OPTIONS = [
  { value: "ketua", label: "Ketua" },
  { value: "videografer", label: "Videografer" },
  { value: "fotografer", label: "Fotografer" },
  { value: "desainer", label: "Desainer" },
  { value: "copywriter", label: "Copywriter" },
  { value: "admin", label: "Admin" },
];

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Terjadi kesalahan";

const getResponseMessage = (body: unknown, fallback: string) => {
  if (!body) return fallback;
  if (typeof body === "string") {
    const trimmed = body.trim();
    return trimmed || fallback;
  }
  if (typeof body === "object" && !Array.isArray(body)) {
    const record = body as Record<string, unknown>;
    const message = record.message ?? record.error ?? record.detail ?? record.details;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }
  return fallback;
};

const buildCrewLoadIssue = (error: unknown, profile: ProfileTrace | null): CrewLoadIssue => {
  const apiError = error instanceof ApiError ? error : null;
  const status = apiError?.status ?? null;
  const responseMessage = apiError ? getResponseMessage(apiError.body, apiError.message) : getErrorMessage(error);
  const identityTrace = [
    `Role: ${profile?.role || "-"}`,
    `Profile ID: ${profile?.id || "-"}`,
    `Region ID: ${profile?.region_id || "-"}`,
  ].join(" · ");
  const details = [status ? `HTTP ${status}` : "HTTP -", responseMessage, identityTrace].join(" · ");

  if (status === 401 || status === 403) {
    return {
      kind: "unauthorized",
      title: "Akses tidak tersedia untuk role ini",
      description: "Periksa role dev atau login ulang.",
      details,
    };
  }

  if (status === 404) {
    return {
      kind: "missing",
      title: "Data kru belum tersedia",
      description: "Endpoint data kru belum tersedia atau data belum disediakan.",
      details,
    };
  }

  if (status === null) {
    return {
      kind: "network",
      title: "Gagal memuat data kru",
      description: "Periksa koneksi atau coba lagi.",
      details,
    };
  }

  return {
    kind: "error",
    title: "Gagal memuat data kru",
    description: "Periksa koneksi atau coba lagi.",
    details,
  };
};

const getCrewStatusMeta = (status?: string | null) => {
  const normalized = (status || "").trim().toLowerCase();
  if (normalized === "active") return { label: "Aktif", className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  if (normalized === "pending") return { label: "Menunggu aktivasi", className: "bg-amber-100 text-amber-700 border-amber-200" };
  if (normalized === "inactive") return { label: "Tidak aktif", className: "bg-slate-100 text-slate-700 border-slate-200" };
  if (normalized === "alumni") return { label: "Alumni", className: "bg-blue-100 text-blue-700 border-blue-200" };
  return { label: "-", className: "bg-slate-100 text-slate-600 border-slate-200" };
};

const normalizeCrewRows = (payload: unknown): Crew[] => {
  if (Array.isArray(payload)) return payload as Crew[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.crews)) return record.crews as Crew[];
  if (Array.isArray(record.crew)) return record.crew as Crew[];

  const nested = record.data;
  if (nested && typeof nested === "object") {
    const nestedRecord = nested as Record<string, unknown>;
    if (Array.isArray(nestedRecord.crews)) return nestedRecord.crews as Crew[];
    if (Array.isArray(nestedRecord.crew)) return nestedRecord.crew as Crew[];
  }

  return [];
};

const mapMasterCrewToCrew = (crew: V4MasterCrew): Crew => ({
  id: crew.id,
  nama: crew.nama || "-",
  jabatan: crew.jabatan,
  niam: crew.niam,
  status: crew.niam ? "active" : null,
  email: null,
  whatsapp: null,
  roleCode: crew.jabatan,
  jabatan_media: crew.jabatan,
  catatan: null,
  xp_level: crew.xp_level ?? undefined,
});

const findKoordinatorFromMasterData = (crews: V4MasterCrew[]) => {
  const byKoordinator = crews.find((crew) => (crew.jabatan || "").toLowerCase().includes("koordinator"));
  return byKoordinator ?? crews[0] ?? null;
};

const normalizeSlotConfig = (payload: unknown): SlotConfig | null => {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const freeSlotQuantity = record.freeSlotQuantity ?? record.free_slot_quantity;
  const addonSlotPrice = record.addonSlotPrice ?? record.addon_slot_price;

  if (typeof freeSlotQuantity !== "number" || typeof addonSlotPrice !== "number") return null;

  return { freeSlotQuantity, addonSlotPrice };
};

const isCountedCrew = (status?: string | null) => {
  const normalized = (status || "").trim().toLowerCase();
  return normalized === "active" || normalized === "pending";
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getAvatarColor = (index: number) => {
  const colors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];
  return colors[index % colors.length];
};

const ManajemenKru = ({ paymentStatus: paymentStatusProp, onKoordinatorChange }: ManajemenKruProps = {}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const paymentStatus = paymentStatusProp ?? profile?.status_payment ?? "unpaid";
  const payment = useCurrentPaymentStatus(paymentStatus);
  const isMediaRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/media");
  const isDevMediaMismatch = IS_DEV_AUTH_BYPASS_ENABLED && isMediaRoute && profile?.role !== "user";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dataSource, setDataSource] = useState<CrewDataSource>("error");
  const [crewError, setCrewError] = useState<CrewLoadIssue | null>(null);
  const [slotConfigError, setSlotConfigError] = useState<string | null>(null);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [slotConfig, setSlotConfig] = useState<SlotConfig | null>(null);
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");

  const usedSlotCount = useMemo(() => crews.filter((crew) => isCountedCrew(crew.status)).length, [crews]);
  const isReadOnlyPreview = dataSource === "master_data_preview";
  const slotMetricsReady = dataSource === "management" && Boolean(slotConfig);
  const freeSlotLeft = slotMetricsReady && slotConfig ? Math.max(slotConfig.freeSlotQuantity - usedSlotCount, 0) : null;
  const isFreeSlotFull = Boolean(slotMetricsReady && slotConfig && usedSlotCount >= slotConfig.freeSlotQuantity);
  const canAddCrew = payment.isActive && Boolean(slotConfig) && !isFreeSlotFull && !isReadOnlyPreview;

  useEffect(() => {
    if (!IS_DEV_AUTH_BYPASS_ENABLED || !isMediaRoute) return;
    if (profile?.role !== "user") {
      setDevPreviewRole("user");
    }
  }, [isMediaRoute, profile?.role]);

  const loadData = useCallback(async () => {
    if (isDevMediaMismatch) {
      setLoading(false);
      setDataSource("error");
      setCrews([]);
      setSlotConfig(null);
      setCrewError({
        kind: "unauthorized",
        title: "Role dev tidak sesuai untuk dashboard media",
        description: "Pilih role Dev Koordinator di panel debug.",
        details: [
          `Role: ${profile?.role || "-"}`,
          `Profile ID: ${profile?.id || "-"}`,
          `Role preview: ${getDevPreviewRole()}`,
        ].join(" · "),
      });
      onKoordinatorChange?.(undefined);
      return;
    }

    setLoading(true);
    setDataSource("error");
    setCrewError(null);
    setSlotConfigError(null);

    try {
      const [crewResult, slotResult] = await Promise.all([
        apiRequest<unknown>("/api/media/crew")
          .then((data) => ({ ok: true as const, data: normalizeCrewRows(data) }))
          .catch((error: unknown) => ({ ok: false as const, error })),
        apiRequest<unknown>("/api/media/slot-config")
          .then((data) => ({ ok: true as const, data: normalizeSlotConfig(data) }))
          .catch((error: unknown) => ({ ok: false as const, error })),
      ]);

      let nextSource: CrewDataSource = "error";
      let nextCrews: Crew[] = [];
      let nextCrewError: CrewLoadIssue | null = null;
      let nextSlotConfig: SlotConfig | null = null;
      let nextSlotConfigError: string | null = null;
      let nextKoordinator: KoordinatorData | undefined;

      if (crewResult.ok) {
        nextSource = "management";
        nextCrews = crewResult.data;
        const koordinator = crewResult.data.find(
          (crew) => crew.jabatan?.toLowerCase() === "koordinator" || crew.jabatan?.toLowerCase() === "ketua"
        );
        nextKoordinator =
          koordinator
            ? {
                nama: koordinator.nama,
                niam: koordinator.niam ?? null,
                jabatan: koordinator.jabatan || "Koordinator",
                xp_level: getTransactionXPTotal(koordinator as unknown as Record<string, unknown>),
                status: koordinator.status,
                xpTotal: getTransactionXPTotal(koordinator as unknown as Record<string, unknown>),
              }
            : undefined;
      } else {
        const apiError = crewResult.error instanceof ApiError ? crewResult.error : null;
        const shouldUsePreviewFallback =
          IS_DEV_AUTH_BYPASS_ENABLED && isMediaRoute && (apiError?.status === 401 || apiError?.status === 403);

        if (shouldUsePreviewFallback) {
          const preview = await getMasterDataPreviewSnapshot();
          const previewHasRows = preview.data?.profiles.length > 0 || preview.data?.crews.length > 0;

          if (previewHasRows || !preview.error) {
            nextSource = "master_data_preview";
            nextCrews = (preview.data?.crews ?? []).map(mapMasterCrewToCrew);
            const koordinatorPreview = findKoordinatorFromMasterData(preview.data?.crews ?? []);
            nextKoordinator = koordinatorPreview
              ? {
                  nama: koordinatorPreview.nama ?? "-",
                  niam: koordinatorPreview.niam ?? null,
                  jabatan: koordinatorPreview.jabatan || "Koordinator",
                  xp_level: koordinatorPreview.xp_level ?? undefined,
                  status: koordinatorPreview.niam ? "active" : null,
                  xpTotal: koordinatorPreview.xp_level ?? 0,
                }
              : undefined;
            nextCrewError = null;
            nextSlotConfig = null;
            nextSlotConfigError = "Data slot belum tersedia";
          } else {
            nextCrewError = buildCrewLoadIssue(crewResult.error, profile);
            nextCrews = [];
            nextKoordinator = undefined;
          }
        } else {
          nextCrews = [];
          nextCrewError = buildCrewLoadIssue(crewResult.error, profile);
          nextKoordinator = undefined;
        }
      }

      if (slotResult.ok) {
        nextSlotConfig = nextSource === "management" ? slotResult.data : nextSlotConfig;
      } else {
        nextSlotConfig = nextSource === "management" ? null : nextSlotConfig;
        nextSlotConfigError = nextSource === "management" ? getErrorMessage(slotResult.error) : nextSlotConfigError ?? "Data slot belum tersedia";
      }

      setDataSource(nextSource);
      setCrews(nextCrews);
      setCrewError(nextCrewError);
      setSlotConfig(nextSlotConfig);
      setSlotConfigError(nextSlotConfigError);
      onKoordinatorChange?.(nextKoordinator);
    } catch (error) {
      setDataSource("error");
      setCrews([]);
      setCrewError(buildCrewLoadIssue(error, profile));
      setSlotConfig(null);
      setSlotConfigError(null);
      onKoordinatorChange?.(undefined);
    } finally {
      setLoading(false);
    }
  }, [onKoordinatorChange, profile, isDevMediaMismatch, isMediaRoute]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async () => {
    if (!nama.trim()) {
      toast({ title: "Validasi", description: "Nama kru wajib diisi", variant: "destructive" });
      return;
    }
    if (!jabatan) {
      toast({ title: "Validasi", description: "Jabatan wajib dipilih", variant: "destructive" });
      return;
    }
    if (!payment.isActive) {
      toast({ title: payment.label, description: "Aktifkan akun terlebih dahulu", variant: "destructive" });
      return;
    }
    if (!slotConfig) {
      toast({ title: "Data slot belum tersedia", description: "Data slot belum tersedia.", variant: "destructive" });
      return;
    }
    if (isFreeSlotFull) {
      toast({
        title: "Slot Gratis Penuh",
        description: `Anda telah menggunakan ${slotConfig.freeSlotQuantity} slot gratis. Upgrade untuk menambah kru.`,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const jabatanLabel = JABATAN_OPTIONS.find((item) => item.value === jabatan)?.label || jabatan;
      await apiRequest("/api/media/crew", {
        method: "POST",
        body: JSON.stringify({
          nama: nama.trim(),
          jabatan: jabatanLabel,
        }),
      });
      setNama("");
      setJabatan("");
      await loadData();
      toast({ title: "Berhasil", description: "Kru ditambahkan" });
    } catch (error: unknown) {
      toast({ title: "Gagal", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const retry = () => loadData();

  if (crewError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tim Media"
          description="Kelola anggota tim media pesantren."
          actions={(
            <Button variant="outline" size="sm" onClick={retry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
          )}
        />
        <Card className={cn(
          "border shadow-sm",
          crewError.kind === "unauthorized" ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"
        )}>
          <CardContent className="space-y-4 p-5">
            <Alert className={cn(
              crewError.kind === "unauthorized" ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"
            )}>
              <AlertTriangle className={cn(
                "h-4 w-4",
                crewError.kind === "unauthorized" ? "text-amber-600" : "text-red-600"
              )} />
              <AlertDescription className="space-y-2">
                <div className="font-medium text-slate-900">{crewError.title}</div>
                <p className="text-sm text-slate-700">{crewError.description}</p>
                {IS_DEV_AUTH_BYPASS_ENABLED && (
                  <p className="text-xs text-slate-500">{crewError.details}</p>
                )}
              </AlertDescription>
            </Alert>
            <EmptyState
              title={crewError.title}
              description={crewError.description}
              action={(
                <Button onClick={retry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Coba Lagi
                </Button>
              )}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tim Media"
        description="Kelola anggota tim media pesantren."
        actions={(
          <>
            <Button variant="outline" size="sm" onClick={retry} disabled={loading}>
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              size="sm"
              disabled={!canAddCrew}
              onClick={() => document.getElementById("add-crew-form")?.scrollIntoView({ behavior: "smooth" })}
              className={cn(
                !canAddCrew ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
              )}
              >
              {isReadOnlyPreview ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Segera Hadir
                </>
              ) : !payment.isActive ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Aktifkan akun terlebih dahulu
                </>
              ) : !slotConfig ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Data slot belum tersedia
                </>
              ) : isFreeSlotFull ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Tambah Kru Baru
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Tambah Kru Baru
                </>
              )}
            </Button>
          </>
        )}
      />

      {isReadOnlyPreview && (
        <Alert className="border-sky-200 bg-sky-50">
          <Info className="h-4 w-4 text-sky-600" />
          <AlertDescription className="space-y-1">
            <div className="font-medium text-slate-900">Mode preview DEV: data kru ditampilkan dari Master Data.</div>
            <p className="text-sm text-slate-700">
              Master Data adalah sumber identitas resmi. Aksi manajemen tetap diproses melalui modul Manajemen Kru.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Used</p>
            <p className="mt-2 text-3xl font-bold">{slotMetricsReady ? usedSlotCount : "-"}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Free</p>
            <p className="mt-2 text-3xl font-bold">{slotMetricsReady ? freeSlotLeft ?? "-" : "-"}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Addon</p>
            <p className="mt-2 text-lg font-semibold">
              {slotMetricsReady && slotConfig ? `Rp ${slotConfig.addonSlotPrice.toLocaleString("id-ID")}/slot` : "Data slot belum tersedia"}
            </p>
          </CardContent>
        </Card>
      </div>

      {!payment.isActive && (
        <Alert className="bg-slate-50 border-slate-200">
          <Lock className="h-4 w-4 text-slate-600" />
          <AlertDescription className="flex w-full flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <span className="font-medium text-slate-700">
              {payment.label}. Aktifkan akun terlebih dahulu untuk menambah kru.
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate("/payment")}>
              <CreditCard className="mr-1.5 h-3 w-3" />
              Aktifkan Akun
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {slotConfigError && (
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex w-full flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <span className="font-medium text-amber-800">Data slot belum tersedia</span>
            <Button variant="outline" size="sm" onClick={() => navigate("/payment")}>
              Beli Slot
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {slotMetricsReady && slotConfig && isFreeSlotFull && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex w-full flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <span className="font-medium text-amber-800">
              <strong>Slot Gratis Penuh:</strong> Anda telah menggunakan {slotConfig.freeSlotQuantity} slot gratis.
            </span>
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => navigate("/payment")}>
              Beli Slot
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="mr-2 h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-slate-600">Memuat data kru...</span>
        </div>
      ) : crews.length === 0 ? (
        <EmptyState
          title="Belum ada kru"
          description="Tambahkan kru setelah akun aktif."
          action={(
            <Button
              disabled={!canAddCrew}
              onClick={() => canAddCrew && document.getElementById("add-crew-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              {isReadOnlyPreview ? "Segera Hadir" : !payment.isActive ? "Aktifkan akun terlebih dahulu" : "Tambah Kru"}
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {crews.map((crew, index) => {
            const xpTotal = getTransactionXPTotal(crew as unknown as Record<string, unknown>);
            const statusMeta = getCrewStatusMeta(crew.status);

            return (
              <Card
                key={crew.id}
                className={cn(
                  "border shadow-sm transition-all hover:shadow-md",
                  index === 0 ? "border-emerald-200" : "border-slate-200"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                        getAvatarColor(index)
                      )}
                    >
                      {getInitials(crew.nama)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-slate-900">{crew.nama}</h3>
                        {index === 0 && <Badge className="border-emerald-200 bg-emerald-100 px-1.5 text-[10px] text-emerald-700">PIC</Badge>}
                        <Badge variant="outline" className={cn("px-1.5 text-[10px]", statusMeta.className)}>
                          {statusMeta.label}
                        </Badge>
                      </div>
                      <div className="mt-1 grid gap-1 text-sm text-slate-600">
                        <p>Jabatan Media: {crew.jabatan_media || crew.jabatan || "-"}</p>
                        <p>Email: {crew.email || "-"}</p>
                        <p>WhatsApp: {crew.whatsapp || "-"}</p>
                        <p>Role Khodim: {crew.roleCode || "-"}</p>
                        <p>NIAM: {crew.niam || "Belum Aktif"}</p>
                      </div>

                      {crew.niam ? (
                        <Badge variant="outline" className="mt-2 border-emerald-300 bg-emerald-50 font-mono text-xs text-emerald-700">
                          {crew.niam}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-2 border-slate-300 bg-slate-50 text-xs text-slate-600">
                          Belum Aktif
                        </Badge>
                      )}

                      {xpTotal > 0 && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-amber-600">
                          <Zap className="h-3 w-3" />
                          <span>{xpTotal} XP</span>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Button variant="outline" size="sm" disabled>
                          Boyong Kru
                        </Button>
                        <p className="text-xs text-slate-500">{isReadOnlyPreview ? "Aksi manajemen membutuhkan sesi akun media yang aktif." : "Fitur akan segera tersedia."}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card id="add-crew-form" className="border border-slate-200 bg-white">
        <CardContent className="p-5">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            Tambah Anggota Kru
          </h3>
          <p className="mb-4 text-sm text-slate-600">
            Data identitas resmi akan aktif setelah pembayaran/verifikasi selesai.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nama Lengkap</Label>
              <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap" className="h-11" disabled={isReadOnlyPreview} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Jabatan / Role Khodim</Label>
              <Select value={jabatan} onValueChange={setJabatan} disabled={isReadOnlyPreview}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pilih role/jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {JABATAN_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <Input disabled placeholder="Segera Hadir" className="h-11 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">WhatsApp</Label>
              <Input disabled placeholder="Segera Hadir" className="h-11 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Posisi / Jabatan Media</Label>
              <Input disabled placeholder="Segera Hadir" className="h-11 bg-slate-50" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">Catatan Opsional</Label>
              <Input disabled placeholder="Segera Hadir" className="h-11 bg-slate-50" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Email dan WhatsApp disiapkan untuk aktivasi kru, penyimpanan penuh menunggu dukungan sistem.
              </p>
              <Button
                onClick={handleAdd}
                disabled={saving || !canAddCrew}
                className={cn(
                  "h-11 w-full text-white sm:w-auto",
                  canAddCrew ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-400 hover:bg-slate-400 cursor-not-allowed"
                )}
              >
                {isReadOnlyPreview ? "Segera Hadir" : !payment.isActive ? "Aktifkan akun terlebih dahulu" : !slotConfig ? "Data slot belum tersedia" : saving ? "Menyimpan..." : "Tambah Kru"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-emerald-200/50 bg-emerald-50/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Aturan The Golden 3</h4>
              <p className="mt-1 text-sm text-slate-600">
                Setiap pesantren mendapat <strong>3 slot gratis</strong> untuk anggota kru media.
                Slot pertama otomatis ditetapkan sebagai <strong>PIC (Person In Charge)</strong> yaitu
                orang yang mendaftarkan akun pesantren. Untuk menambah lebih dari 3 kru,
                diperlukan upgrade paket premium.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManajemenKru;
