import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Building2, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface RegionDetail {
  id: string;
  name: string;
  code: string;
  cities: { name: string }[];
}

interface Stats {
  memberCount: number;
  pesantrenCount: number;
  adminCount: number;
}

interface RecentPesantren {
  id: string;
  nama_pesantren: string | null;
  nama_pengasuh: string | null;
  status_account: string;
  created_at: string | null;
}

const AdminRegionalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<RegionDetail | null>(null);
  const [stats, setStats] = useState<Stats>({ memberCount: 0, pesantrenCount: 0, adminCount: 0 });
  const [recentPesantren, setRecentPesantren] = useState<RecentPesantren[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchRegionData();
  }, [id]);

  const fetchRegionData = async () => {
    try {
      setLoading(true);

      // 1. Ambil Info Regional & Kota
      const { data: regionData, error: regionError } = await supabase
        .from("regions")
        .select(`id, name, code, cities (name)`)
        .eq("id", id)
        .single();

      if (regionError) throw regionError;
      setRegion(regionData as RegionDetail);

      // 2. Hitung Statistik (Realtime Count)
      const { count: memberCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("region_id", id)
        .eq("role", "user");

      const { count: pesantrenCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("region_id", id)
        .not("nama_pesantren", "is", null);

      const { count: adminCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("region_id", id)
        .eq("role", "admin_regional");

      setStats({
        memberCount: memberCount || 0,
        pesantrenCount: pesantrenCount || 0,
        adminCount: adminCount || 0
      });

      // 3. Ambil List Pesantren Terbaru (5 Terakhir)
      const { data: latestPesantren } = await supabase
        .from("profiles")
        .select("id, nama_pesantren, nama_pengasuh, status_account, created_at")
        .eq("region_id", id)
        .not("nama_pesantren", "is", null)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentPesantren((latestPesantren as RecentPesantren[]) || []);

    } catch (error) {
      console.error("Error fetching detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!region) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Data tidak ditemukan.</p>
        <Button onClick={() => navigate("/admin-pusat")}>Kembali</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            className="mb-4 gap-2"
            onClick={() => navigate("/admin-pusat")}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">KODE RR: {region.code}</Badge>
                <Badge variant="secondary">
                  <MapPin className="h-3 w-3 mr-1" />
                  {region.cities.length} Kota Cakupan
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{region.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesantren</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pesantrenCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Member/Kru</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.memberCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Regional</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* City Coverage & Recent Pesantren */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Cakupan Kota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {region.cities.map((city, idx) => (
                  <Badge key={idx} variant="secondary">{city.name}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pesantren Terbaru</CardTitle>
              <CardDescription>5 pesantren terakhir terdaftar</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pesantren</TableHead>
                    <TableHead>Pengasuh</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPesantren.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nama_pesantren}</TableCell>
                      <TableCell>{p.nama_pengasuh || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={p.status_account === 'active' ? 'default' : 'secondary'}>
                          {p.status_account}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentPesantren.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Belum ada pesantren terdaftar
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRegionalDetail;
