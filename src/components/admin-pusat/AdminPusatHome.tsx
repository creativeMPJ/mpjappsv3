import { useState, useEffect } from "react";
import { Building2, Users, MapPin, Clock, DollarSign, Percent, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatNIP } from "@/lib/id-utils";

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

interface LevelStats {
  basic: number;
  silver: number;
  gold: number;
  platinum: number;
}

const AdminPusatHome = ({ onNavigate, isDebugMode, debugData }: Props) => {
  const [stats, setStats] = useState({
    totalPesantren: 0,
    totalKru: 0,
    totalWilayah: 0,
    pendingPayments: 0,
    totalIncome: 0,
  });
  const [levelStats, setLevelStats] = useState<LevelStats>({
    basic: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total pesantren (active users)
        const { count: pesantrenCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("status_account", "active");

        // Fetch total crews
        const { count: crewCount } = await supabase
          .from("crews")
          .select("*", { count: "exact", head: true });

        // Fetch total regions
        const { count: regionCount } = await supabase
          .from("regions")
          .select("*", { count: "exact", head: true });

        // Fetch pending payments
        const { count: pendingPaymentCount } = await supabase
          .from("payments")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending_verification");

        // Fetch total verified payments for income
        const { data: verifiedPayments } = await supabase
          .from("payments")
          .select("total_amount")
          .eq("status", "verified");

        const totalIncome = verifiedPayments?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;

        // Fetch level distribution
        const { data: levelData } = await supabase
          .from("profiles")
          .select("profile_level")
          .eq("status_account", "active");

        const levels: LevelStats = { basic: 0, silver: 0, gold: 0, platinum: 0 };
        levelData?.forEach((p: any) => {
          if (p.profile_level in levels) {
            levels[p.profile_level as keyof LevelStats]++;
          }
        });

        // Fetch recent registrations with more data
        const { data: recentData } = await supabase
          .from("profiles")
          .select(`
            id,
            nama_pesantren,
            nip,
            status_account,
            profile_level,
            created_at,
            regions!profiles_region_id_fkey (name)
          `)
          .order("created_at", { ascending: false })
          .limit(8);

        setStats({
          totalPesantren: pesantrenCount || 0,
          totalKru: crewCount || 0,
          totalWilayah: regionCount || 0,
          pendingPayments: pendingPaymentCount || 0,
          totalIncome,
        });

        setLevelStats(levels);

        if (recentData) {
          setRecentUsers(
            recentData.map((item: any) => ({
              id: item.id,
              nama_pesantren: item.nama_pesantren,
              nip: item.nip,
              region_name: item.regions?.name || "-",
              status_account: item.status_account,
              profile_level: item.profile_level,
              created_at: item.created_at,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      basic: "bg-slate-100 text-slate-700",
      silver: "bg-gray-200 text-gray-700",
      gold: "bg-amber-100 text-amber-700",
      platinum: "bg-purple-100 text-purple-700",
    };
    return <Badge className={colors[level] || colors.basic}>{level.toUpperCase()}</Badge>;
  };

  const totalActive = levelStats.silver + levelStats.gold + levelStats.platinum;
  const platinumPercent = totalActive > 0 ? Math.round((levelStats.platinum / totalActive) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-emerald-800 to-emerald-600 border-0">
        <CardContent className="p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-white">Command Center MPJ Jawa Timur</h1>
          <p className="text-emerald-100 mt-1 text-sm md:text-base">Pantau seluruh data dan aktivitas pesantren se-Jawa Timur</p>
        </CardContent>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card 
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("master-data")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">Pesantren Aktif</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                  {stats.totalPesantren.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("master-data")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">Total Kru</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                  {stats.totalKru.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("master-regional")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">Total Wilayah</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                  {stats.totalWilayah}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("administrasi")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">Total Kas</p>
                <p className="text-lg md:text-2xl font-bold text-foreground mt-1">
                  Rp {formatCurrency(stats.totalIncome)}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Distribution */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Percent className="h-5 w-5 text-emerald-600" />
            Distribusi Level Pesantren
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-600">{levelStats.basic}</p>
              <p className="text-xs text-muted-foreground mt-1">Basic</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-100">
              <p className="text-2xl font-bold text-gray-600">{levelStats.silver}</p>
              <p className="text-xs text-muted-foreground mt-1">Silver</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50">
              <p className="text-2xl font-bold text-amber-600">{levelStats.gold}</p>
              <p className="text-xs text-muted-foreground mt-1">Gold</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50">
              <p className="text-2xl font-bold text-purple-600">{levelStats.platinum}</p>
              <p className="text-xs text-muted-foreground mt-1">Platinum</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-muted-foreground">
              {platinumPercent}% pesantren aktif sudah Platinum Verified
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Registrations */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Pendaftaran Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {recentUsers.length > 0 ? (
              recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{user.nama_pesantren || "Belum diisi"}</p>
                      <p className="text-xs text-muted-foreground">{user.region_name}</p>
                      {user.nip && (
                        <p className="text-xs font-mono text-emerald-600 mt-1">
                          NIP: {formatNIP(user.nip, true)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(user.status_account)}
                      {getLevelBadge(user.profile_level)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(user.created_at)}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">Belum ada pendaftaran</p>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nama Pesantren</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">NIP</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Wilayah</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Level</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3 px-2 font-medium">{user.nama_pesantren || "Belum diisi"}</td>
                      <td className="py-3 px-2 font-mono text-sm">
                        {user.nip ? formatNIP(user.nip, true) : "-"}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{user.region_name}</td>
                      <td className="py-3 px-2">{getStatusBadge(user.status_account)}</td>
                      <td className="py-3 px-2">{getLevelBadge(user.profile_level)}</td>
                      <td className="py-3 px-2 text-muted-foreground">{formatDate(user.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted-foreground py-8">
                      Belum ada pendaftaran terbaru
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPusatHome;
