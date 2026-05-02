import { useState, useEffect } from "react";
import { Users, Building2, MapPin, Activity, ArrowRight, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/api-client";
import JatimMap from "./JatimMap";

type ViewType =
  | "dashboard"
  | "administrasi"
  | "master-data"
  | "master-regional"
  | "manajemen-event"
  | "manajemen-militansi"
  | "mpj-hub"
  | "pengaturan";

interface DebugData {
  pesantren?: unknown[];
  crews?: unknown[];
  regions?: unknown[];
  payments?: unknown[];
  claims?: unknown[];
}

interface Props {
  onNavigate?: (view: ViewType) => void;
  isDebugMode?: boolean;
  debugData?: DebugData;
}

interface RecentUser {
  id: string;
  nama_pesantren: string | null;
  nip: string | null;
  region_name: string | null;
  status_account: string;
  profile_level: string;
  created_at: string;
}

interface ActivityItem {
  id: string;
  text: string;
  timeAgo: string;
}

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function buildActivities(users: RecentUser[]): ActivityItem[] {
  return users.slice(0, 8).map((u) => {
    const name = u.nama_pesantren || "Pesantren baru";
    const region = u.region_name || "wilayah";
    let text = "";
    switch (u.status_account) {
      case "active":
        text = `${name} (${region}) telah aktif di sistem`;
        break;
      case "rejected":
        text = `Pendaftaran ${name} ditolak oleh admin regional`;
        break;
      default:
        text = `${name} mendaftar dari ${region}`;
    }
    return { id: u.id, text, timeAgo: timeAgo(u.created_at) };
  });
}

const LEVEL_CARDS = [
  { key: "basic",    label: "Basic",    bg: "bg-gray-50",   border: "border-gray-200",  text: "text-gray-700"   },
  { key: "silver",   label: "Silver",   bg: "bg-gray-100",  border: "border-gray-200",  text: "text-gray-600"   },
  { key: "gold",     label: "Gold",     bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-600"  },
  { key: "platinum", label: "Platinum", bg: "bg-purple-50", border: "border-purple-200",text: "text-purple-600" },
] as const;

const AdminPusatHome = ({ onNavigate, isDebugMode, debugData }: Props) => {
  const [stats, setStats] = useState({
    totalPesantren: 0,
    totalKru: 0,
    totalWilayah: 0,
    pendingPayments: 0,
    totalIncome: 0,
  });
  const [levelStats, setLevelStats] = useState({ basic: 0, silver: 0, gold: 0, platinum: 0 });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDebugMode && debugData) {
      const pesantrenData = (debugData.pesantren || []) as Array<Record<string, unknown>>;
      const crewData = (debugData.crews || []) as Array<Record<string, unknown>>;
      const regionData = (debugData.regions || []) as Array<Record<string, unknown>>;
      const paymentData = (debugData.payments || []) as Array<Record<string, unknown>>;

      const activePesantren = pesantrenData.filter((p) => p.status_account === "active");
      const verifiedPayments = paymentData.filter((p) => p.status === "verified");
      const pendingPayments = paymentData.filter((p) => p.status === "pending_verification");
      const totalIncome = verifiedPayments.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);

      setStats({
        totalPesantren: activePesantren.length,
        totalKru: crewData.length,
        totalWilayah: regionData.length,
        pendingPayments: pendingPayments.length,
        totalIncome,
      });

      const ls = { basic: 0, silver: 0, gold: 0, platinum: 0 };
      activePesantren.forEach((p) => {
        const lvl = String(p.profile_level || "basic") as keyof typeof ls;
        if (lvl in ls) ls[lvl]++;
      });
      setLevelStats(ls);

      const mockUsers = pesantrenData.slice(0, 8).map((item) => ({
        id: String(item.id),
        nama_pesantren: (item.nama_pesantren as string) || null,
        nip: (item.nip as string) || null,
        region_name: (item.region_name as string) || "-",
        status_account: String(item.status_account || "pending"),
        profile_level: String(item.profile_level || "basic"),
        created_at: (item.created_at as string) || new Date().toISOString(),
      }));
      setActivities(buildActivities(mockUsers));
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await apiRequest<{
          stats: {
            totalPesantren: number;
            totalKru: number;
            totalWilayah: number;
            pendingPayments: number;
            totalIncome: number;
          };
          levelStats: { basic: number; silver: number; gold: number; platinum: number };
          recentUsers: RecentUser[];
        }>("/api/admin/home-summary");

        setStats(data.stats);
        setLevelStats(data.levelStats ?? { basic: 0, silver: 0, gold: 0, platinum: 0 });
        setActivities(buildActivities(data.recentUsers || []));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isDebugMode, debugData]);

  const platinumPct = stats.totalPesantren > 0
    ? Math.round((levelStats.platinum / stats.totalPesantren) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards — 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pesantren Aktif */}
        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Pesantren Aktif</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats.totalPesantren.toLocaleString("id-ID")}
                </p>
                <button
                  onClick={() => onNavigate?.("master-data")}
                  className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2 hover:underline"
                >
                  Lihat Database <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Kru */}
        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Kru</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats.totalKru.toLocaleString("id-ID")}
                </p>
                <button
                  onClick={() => onNavigate?.("master-data")}
                  className="flex items-center gap-1 text-xs text-blue-600 font-medium mt-2 hover:underline"
                >
                  Lihat Database Kru <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Wilayah */}
        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Wilayah</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.totalWilayah}</p>
                <button
                  onClick={() => onNavigate?.("master-regional")}
                  className="flex items-center gap-1 text-xs text-amber-600 font-medium mt-2 hover:underline"
                >
                  Pengaturan Regional <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Kas */}
        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Kas</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  Rp {stats.totalIncome.toLocaleString("id-ID")}
                </p>
                <button
                  onClick={() => onNavigate?.("administrasi")}
                  className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2 hover:underline"
                >
                  Lihat Pembayaran <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribusi Level Pesantren */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-5">
          <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
            <span className="text-emerald-600 font-bold text-lg">%</span>
            Distribusi Level Pesantren
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LEVEL_CARDS.map(({ key, label, bg, border, text }) => (
              <div
                key={key}
                className={`${bg} border ${border} rounded-xl p-4 text-center`}
              >
                <p className={`text-3xl font-bold ${text}`}>
                  {levelStats[key].toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-emerald-600 font-medium mt-4 flex items-center justify-center gap-1">
            <span>↗</span>
            <span>{platinumPct}% pesantren aktif sudah Platinum Verified</span>
          </p>
        </CardContent>
      </Card>

      {/* Map + Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map - takes 2/3 */}
        <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
          <CardContent className="p-5 h-full flex flex-col" style={{ minHeight: 380 }}>
            <JatimMap
              totalAnggota={stats.totalKru}
              totalPesantren={stats.totalPesantren}
              totalWilayah={stats.totalWilayah}
            />
          </CardContent>
        </Card>

        {/* Activity Feed - takes 1/3 */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-emerald-600" />
              Aktivitas Terkini
            </h3>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada aktivitas terbaru
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((item) => (
                  <div key={item.id} className="space-y-0.5">
                    <p className="text-sm text-foreground leading-snug">{item.text}</p>
                    <p className="text-xs text-emerald-600 font-medium">{item.timeAgo}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPusatHome;
