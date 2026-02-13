import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface RegionalPerformanceStatsProps {
  isDebugMode?: boolean;
}

interface PerformanceData {
  totalVerified: number;
  premiumConverted: number;
  conversionRate: number;
  pendingFollowUp: number;
  weeklyFollowUps: number;
  stuckOver14Days: number;
}

const RegionalPerformanceStats = ({ isDebugMode = false }: RegionalPerformanceStatsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PerformanceData>({
    totalVerified: 0,
    premiumConverted: 0,
    conversionRate: 0,
    pendingFollowUp: 0,
    weeklyFollowUps: 0,
    stuckOver14Days: 0,
  });

  useEffect(() => {
    const load = async () => {
      if (isDebugMode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await apiRequest<PerformanceData>("/api/regional/performance");
        setData(res);
      } catch (error: any) {
        toast({ title: "Gagal", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isDebugMode]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Memuat statistik...</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader><CardTitle className="text-sm">Verifikasi Selesai</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{data.totalVerified}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Konversi Pembayaran</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold">{data.conversionRate}%</p>
          <Badge variant="outline">{data.premiumConverted} dari {data.totalVerified}</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Follow-up Mingguan</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold">{data.weeklyFollowUps}</p>
          <p className="text-xs text-muted-foreground">
            Pending: {data.pendingFollowUp} | {">"}14 hari: {data.stuckOver14Days}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalPerformanceStats;
