import { useState, useEffect } from "react";
import { Building2, Users, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type ViewType = 
  | "dashboard" 
  | "verifikasi" 
  | "master-data" 
  | "manajemen-event"
  | "manajemen-militansi" 
  | "mpj-hub"
  | "pengaturan";

interface Props {
  onNavigate?: (view: ViewType) => void;
}

interface RecentUser {
  id: string;
  nama_pesantren: string | null;
  region_name: string | null;
  status_account: string;
  created_at: string;
}

const AdminPusatHome = ({ onNavigate }: Props) => {
  const [stats, setStats] = useState({
    totalPesantren: 0,
    totalKru: 0,
    totalWilayah: 0,
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

        // Fetch recent registrations
        const { data: recentData } = await supabase
          .from("profiles")
          .select(`
            id,
            nama_pesantren,
            status_account,
            created_at,
            regions!profiles_region_id_fkey (name)
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        setStats({
          totalPesantren: pesantrenCount || 0,
          totalKru: crewCount || 0,
          totalWilayah: regionCount || 0,
        });

        if (recentData) {
          setRecentUsers(
            recentData.map((item: any) => ({
              id: item.id,
              nama_pesantren: item.nama_pesantren,
              region_name: item.regions?.name || "Unknown",
              status_account: item.status_account,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#166534]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-emerald-800 to-emerald-600 border-0">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-white">Selamat Datang, Admin Pusat</h1>
          <p className="text-emerald-100 mt-1">Pantau seluruh data MPJ se-Jawa Timur</p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card 
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("master-data")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Pesantren</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {stats.totalPesantren.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-[#166534]" />
              </div>
            </div>
            <p className="text-xs text-[#166534] mt-3 font-medium">Lihat Master Data →</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("master-data")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Kru</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {stats.totalKru.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3 font-medium">Lihat Data Kru →</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("master-data")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Wilayah</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {stats.totalWilayah}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-3 font-medium">Lihat Wilayah →</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-slate-900 font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#166534]" />
            Pendaftaran Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-600">Nama Pesantren</TableHead>
                  <TableHead className="text-slate-600">Wilayah</TableHead>
                  <TableHead className="text-slate-600">Status</TableHead>
                  <TableHead className="text-slate-600">Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-slate-900">
                        {user.nama_pesantren || "Belum diisi"}
                      </TableCell>
                      <TableCell className="text-slate-600">{user.region_name}</TableCell>
                      <TableCell>{getStatusBadge(user.status_account)}</TableCell>
                      <TableCell className="text-slate-500">{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                      Belum ada pendaftaran terbaru
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPusatHome;
