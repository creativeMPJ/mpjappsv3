import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Trash2, Users, RefreshCw, Lock, AlertTriangle, Zap, UserPlus, Shield } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { getTransactionXPTotal } from "@/lib/v4-core-rules";
import { useNavigate } from "react-router-dom";
import { useCurrentPaymentStatus } from "@/features/v4/utils";

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
  xp_level?: number;
  jabatan_code_id?: string | null;
  is_pic?: boolean;
  status?: string | null;
  paymentVerified?: boolean;
  xp_total?: number;
  xpTotal?: number;
  transaction_xp_total?: number;
  transactionXpTotal?: number;
}

// Fixed jabatan options as dropdown
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

const getCrewStatusMeta = (status?: string | null) => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "active") return { label: "Aktif", className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  if (normalized === "pending") return { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" };
  if (normalized === "inactive") return { label: "Inactive", className: "bg-slate-100 text-slate-700 border-slate-200" };
  if (normalized === "alumni") return { label: "Alumni", className: "bg-blue-100 text-blue-700 border-blue-200" };
  return { label: "-", className: "bg-slate-100 text-slate-600 border-slate-200" };
};

const ManajemenKru = ({ paymentStatus: paymentStatusProp, onKoordinatorChange }: ManajemenKruProps = {}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const paymentStatus = paymentStatusProp ?? profile?.status_payment ?? 'unpaid';
  const payment = useCurrentPaymentStatus(paymentStatus);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [slotConfig, setSlotConfig] = useState<{ freeSlotQuantity: number; addonSlotPrice: number } | null>(null);

  const FREE_SLOT_LIMIT = slotConfig?.freeSlotQuantity ?? 0;
  const totalCrew = crews.length;
  const isFreeSlotFull = Boolean(slotConfig && totalCrew >= FREE_SLOT_LIMIT);
  const canAddCrew = payment.isActive && Boolean(slotConfig) && !isFreeSlotFull;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [crewData, config] = await Promise.all([
        apiRequest<{ crews: Crew[] }>("/api/media/crew"),
        apiRequest<{ freeSlotQuantity: number; addonSlotPrice: number }>("/api/media/slot-config").catch(() => null),
      ]);
      setSlotConfig(config);
      setCrews(crewData.crews ?? []);

      const koordinator = (crewData.crews ?? []).find(
        (c) => c.jabatan?.toLowerCase() === "koordinator" || c.jabatan?.toLowerCase() === "ketua"
      );
      onKoordinatorChange?.(
        koordinator
          ? {
            nama: koordinator.nama,
            niam: koordinator.niam ?? null,
            jabatan: koordinator.jabatan || "Koordinator",
            xp_level: getTransactionXPTotal(koordinator as unknown as Record<string, unknown>),
            status: koordinator.status,
            xpTotal: getTransactionXPTotal(koordinator as unknown as Record<string, unknown>),
          }
          : undefined
      );
    } catch (error: unknown) {
      toast({ title: "Gagal", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [onKoordinatorChange, toast]);

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
      toast({
        title: payment.label,
        description: "Aktifkan akun terlebih dahulu",
        variant: "destructive",
      });
      return;
    }
    if (!slotConfig) {
      toast({
        title: "Data slot belum tersedia",
        description: "Coba refresh halaman sebelum menambah kru.",
        variant: "destructive",
      });
      return;
    }
    if (isFreeSlotFull) {
      toast({
        title: "Slot Gratis Penuh",
        description: `Anda telah menggunakan ${FREE_SLOT_LIMIT} slot gratis. Upgrade untuk menambah kru.`,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const jabatanLabel = JABATAN_OPTIONS.find((j) => j.value === jabatan)?.label || jabatan;
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

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kru ini?")) return;
    try {
      await apiRequest(`/api/media/crew/${id}`, { method: "DELETE" });
      await loadData();
      toast({ title: "Berhasil", description: "Kru dihapus" });
    } catch (error: unknown) {
      toast({ title: "Gagal", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Tim Media</h1>
          <p className="text-sm text-slate-600">
            Kelola anggota tim media pesantren ({totalCrew}/{slotConfig?.freeSlotQuantity ?? "-"} slot gratis)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            size="sm"
            disabled={!canAddCrew}
            onClick={() => {
              if (!canAddCrew) return;
              document.getElementById("add-crew-form")?.scrollIntoView({ behavior: "smooth" });
            }}
            className={cn(
              !canAddCrew
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {!payment.isActive ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Aktifkan akun terlebih dahulu
              </>
            ) : !slotConfig ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Data slot belum tersedia
              </>
            ) : isFreeSlotFull ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Tambah Kru Baru
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah Kru Baru
              </>
            )}
          </Button>
        </div>
      </div>

      {!payment.isActive && (
        <Alert className="bg-slate-50 border-slate-200">
          <Lock className="h-4 w-4 text-slate-600" />
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
            <span className="text-slate-700 font-medium">
              {payment.label}. Aktifkan akun terlebih dahulu untuk menambah kru.
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate("/payment")}>
              <CreditCard className="h-3 w-3 mr-1.5" />
              Aktifkan Akun
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Slot Full Alert */}
      {isFreeSlotFull && slotConfig && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
            <span className="text-amber-800 font-medium">
              <strong>Slot Gratis Penuh:</strong> Anda telah menggunakan {FREE_SLOT_LIMIT} slot gratis.
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={() => navigate("/payment")}
            >
              <Users className="h-3 w-3 mr-1.5" />
              Beli Slot (Rp {slotConfig.addonSlotPrice.toLocaleString("id-ID")}/slot)
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Crew Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
          <span className="text-slate-600">Memuat data kru...</span>
        </div>
      ) : crews.length === 0 ? (
        <Card className="bg-white border border-slate-200">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Belum ada kru</p>
            <p className="text-sm text-slate-500 mt-1">Tambahkan anggota tim media Anda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crews.map((crew, index) => (
            (() => {
              const xpTotal = getTransactionXPTotal(crew as unknown as Record<string, unknown>);
              const statusMeta = getCrewStatusMeta(crew.status);

              return (
            <Card
              key={crew.id}
              className={cn(
                "bg-white border shadow-sm hover:shadow-md transition-all",
                index === 0 ? "border-emerald-200" : "border-slate-200"
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
                      getAvatarColor(index)
                    )}
                  >
                    {getInitials(crew.nama)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 truncate">{crew.nama}</h3>
                      {index === 0 && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5">
                          PIC
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn("text-[10px] px-1.5", statusMeta.className)}>
                        {statusMeta.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{crew.jabatan || "-"}</p>

                    {/* NIAM Badge */}
                    {crew.niam ? (
                      <Badge
                        variant="outline"
                        className="mt-2 font-mono text-xs border-emerald-300 text-emerald-700 bg-emerald-50"
                      >
                        {crew.niam}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="mt-2 text-xs border-slate-300 text-slate-600 bg-slate-50"
                      >
                        Belum Aktif
                      </Badge>
                    )}

                    {/* XP */}
                    {xpTotal > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 text-amber-600 text-xs font-medium">
                        <Zap className="h-3 w-3" />
                        <span>{xpTotal} XP</span>
                      </div>
                    )}
                  </div>

                  {/* Delete Button - don't allow deleting PIC */}
                  {index !== 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (!payment.isActive) return;
                        handleDelete(crew.id);
                      }}
                      disabled={!payment.isActive}
                      className={cn(
                        "h-8 w-8 flex-shrink-0",
                        payment.isActive
                          ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                          : "text-slate-300 cursor-not-allowed"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
              );
            })()
          ))}
        </div>
      )}

      {/* Add Crew Form */}
      {!isFreeSlotFull && (
        <Card id="add-crew-form" className="bg-white border border-slate-200">
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Tambah Anggota Kru
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nama Kru</Label>
                <Input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama lengkap"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Jabatan</Label>
                <Select value={jabatan} onValueChange={setJabatan}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {JABATAN_OPTIONS.map((j) => (
                      <SelectItem key={j.value} value={j.value}>
                        {j.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAdd}
                  disabled={saving || !canAddCrew}
                  className={cn(
                    "w-full h-11 text-white",
                    canAddCrew ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-400 hover:bg-slate-400 cursor-not-allowed",
                  )}
                >
                  {!payment.isActive ? "Aktifkan akun terlebih dahulu" : !slotConfig ? "Data slot belum tersedia" : saving ? "Menyimpan..." : "Tambah Kru"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules Info */}
      <Card className="bg-emerald-50/50 border border-emerald-200/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Aturan The Golden 3</h4>
              <p className="text-sm text-slate-600 mt-1">
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
