import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface RegionStats {
  region_id: string;
  region_name: string;
  total_verified: number;
  total_paid: number;
  conversion_rate: number;
}

interface RegionalLeaderboardProps {
  isDebugMode?: boolean;
}

const RegionalLeaderboard = ({ isDebugMode = false }: RegionalLeaderboardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RegionStats[]>([]);
  const [userRegionId, setUserRegionId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isDebugMode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await apiRequest<{ leaderboard: RegionStats[]; user_region_id: string | null }>(
          "/api/regional/leaderboard"
        );
        setRows(data.leaderboard || []);
        setUserRegionId(data.user_region_id || null);
      } catch (error: any) {
        toast({ title: "Gagal", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isDebugMode]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard Regional</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat leaderboard...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Regional</TableHead>
                <TableHead>Terverifikasi</TableHead>
                <TableHead>Sudah Bayar</TableHead>
                <TableHead>Konversi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.region_id} className={r.region_id === userRegionId ? "bg-emerald-50" : ""}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    {r.region_name} {r.region_id === userRegionId && <Badge className="ml-2">Wilayah Anda</Badge>}
                  </TableCell>
                  <TableCell>{r.total_verified}</TableCell>
                  <TableCell>{r.total_paid}</TableCell>
                  <TableCell>{r.conversion_rate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionalLeaderboard;