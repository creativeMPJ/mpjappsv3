import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Users, RefreshCw, Lock, AlertTriangle, Zap, UserPlus, Shield } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { canIssueNIAM, getTransactionXPTotal } from "@/lib/v4-core-rules";
import { useNavigate } from "react-router-dom";

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

const DEFAULT_FREE_SLOT = 3; // fallback before API loads

// Fixed jabatan options as dropdown
const JABATAN_OPTIONS = [
  { value: "ketua", label: "Ketua" },
  { value: "videografer", label: "Videografer" },
  { value: "fotografer", label: "Fotografer" },
  { value: "desainer", label: "Desainer" },
  { value: "copywriter", label: "Copywriter" },
  { value: "admin", label: "Admin" },
];

const ManajemenKru = ({ paymentStatus: paymentStatusProp, onKoordinatorChange }: ManajemenKruProps = {}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const paymentStatus = paymentStatusProp ?? profile?.status_payment ?? 'unpaid';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [slotConfig, setSlotConfig] = useState({ freeSlotQuantity: DEFAULT_FREE_SLOT, addonSlotPrice: 10000 });

  const FREE_SLOT_LIMIT = slotConfig.freeSlotQuantity;
  const totalCrew = crews.length;
  const isFreeSlotFull = totalCrew >= FREE_SLOT_LIMIT;
  const canAddCrew = !isFreeSlotFull;

  const loadData = async () => {
    setLoading(true);
    try {
      const [crewData, config] = await Promise.all([
        apiRequest<{ crews: Crew[] }>("/api/media/crew"),
        apiRequest<{ freeSlotQuantity: number; addonSlotPrice: number }>("/api/media/slot-config").catch(() => ({ freeSlotQuantity: DEFAULT_FREE_SLOT, addonSlotPrice: 10000 })),
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
            niam: canIssueNIAM({ crewStatus: koordinator.status, paymentStatus, paymentVerified: koordinator.paymentVerified })
              ? koordinator.niam
              : null,
            jabatan: koordinator.jabatan || "Koordinator",
            xp_level: getTransactionXPTotal(koordinator as unknown as Record<string, unknown>),
            status: koordinator.status,
            xpTotal: getTransactionXPTotal(koordinator as unknown as Record<string, unknown>),
          }
          : undefined
      );
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async () => {
    if (!nama.trim()) {
      toast({ title: "Validasi", description: "Nama kru wajib diisi", variant: "destructive" });
      return;
    }
    if (!jabatan) {
      toast({ title: "Validasi", description: "Jabatan wajib dipilih", variant: "destructive" });
      return;
    }
    if (isFreeSlotFull) {
      toast({
        title: "Slot Gratis Penuh",
        description: "Anda telah menggunakan 3 slot gratis. Upgrade untuk menambah kru.",
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
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
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
    } catch (error: any) {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
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
            Kelola anggota tim media pesantren ({totalCrew}/{FREE_SLOT_LIMIT} slot gratis)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            size="sm"
            disabled={isFreeSlotFull}
            onClick={() => {
              if (isFreeSlotFull) return;
              document.getElementById("add-crew-form")?.scrollIntoView({ behavior: "smooth" });
            }}
            className={cn(
              isFreeSlotFull
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {isFreeSlotFull ? (
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

      {/* Slot Full Alert */}
      {isFreeSlotFull && (
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
              const hasValidNIAM = canIssueNIAM({
                crewStatus: crew.status,
                paymentStatus,
                paymentVerified: crew.paymentVerified,
              });
              const xpTotal = getTransactionXPTotal(crew as unknown as Record<string, unknown>);

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
                    </div>
                    <p className="text-sm text-slate-600">{crew.jabatan || "-"}</p>

                    {/* NIAM Badge */}
                    {crew.niam && hasValidNIAM && (
                      <Badge
                        variant="outline"
                        className="mt-2 font-mono text-xs border-emerald-300 text-emerald-700 bg-emerald-50"
                      >
                        {crew.niam}
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
                      onClick={() => handleDelete(crew.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 flex-shrink-0"
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
                  disabled={saving}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {saving ? "Menyimpan..." : "Tambah Kru"}
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
