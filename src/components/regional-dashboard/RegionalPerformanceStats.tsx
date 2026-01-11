import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import {
  CheckCircle,
  Crown,
  TrendingUp,
  Clock,
  Award,
  AlertTriangle,
  Target,
  MessageCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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

const chartConfig = {
  basic: { label: "Belum Bayar", color: "hsl(38, 92%, 50%)" },
  premium: { label: "Sudah Bayar", color: "hsl(160, 84%, 39%)" },
};

const calculateDaysOverdue = (approvedAt: string): number => {
  const approvedDate = new Date(approvedAt);
  const deadline = new Date(approvedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = now.getTime() - deadline.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
};

const MOCK_DATA: PerformanceData = {
  totalVerified: 45,
  premiumConverted: 32,
  conversionRate: 71.1,
  pendingFollowUp: 5,
  weeklyFollowUps: 8,
  stuckOver14Days: 2,
};

const RegionalPerformanceStats = ({ isDebugMode = false }: RegionalPerformanceStatsProps) => {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    totalVerified: 0,
    premiumConverted: 0,
    conversionRate: 0,
    pendingFollowUp: 0,
    weeklyFollowUps: 0,
    stuckOver14Days: 0,
  });
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchPerformanceData = async () => {
    if (isDebugMode) {
      setPerformanceData(MOCK_DATA);
      setLoading(false);
      return;
    }

    if (!profile?.region_id) {
      setLoading(false);
      return;
    }

    try {
      // 1. Total Verified (regional_approved + approved/pusat_approved)
      const { count: totalVerifiedCount } = await supabase
        .from('pesantren_claims')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', profile.region_id)
        .in('status', ['regional_approved', 'approved', 'pusat_approved']);

      // 2. Premium Converted (approved/pusat_approved = account active)
      const { count: premiumCount } = await supabase
        .from('pesantren_claims')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', profile.region_id)
        .in('status', ['approved', 'pusat_approved']);

      // 3. Claims that are regional_approved > 7 days ago and still unpaid
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: lateClaims } = await supabase
        .from('pesantren_claims')
        .select('id, user_id, regional_approved_at')
        .eq('region_id', profile.region_id)
        .eq('status', 'regional_approved')
        .not('regional_approved_at', 'is', null)
        .lt('regional_approved_at', sevenDaysAgo);

      // Get follow-up logs for these late claims
      let pendingFollowUp = 0;
      let stuckOver14Days = 0;
      
      if (lateClaims && lateClaims.length > 0) {
        // Check profiles for unpaid status
        const userIds = lateClaims.map(c => c.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, status_payment')
          .in('id', userIds)
          .eq('status_payment', 'unpaid');

        const unpaidUserIds = new Set(profiles?.map(p => p.id) || []);
        const unpaidLateClaims = lateClaims.filter(c => unpaidUserIds.has(c.user_id));

        // Check which claims have been followed up
        const claimIds = unpaidLateClaims.map(c => c.id);
        const { data: followUpLogs } = await supabase
          .from('follow_up_logs')
          .select('claim_id')
          .in('claim_id', claimIds);

        const followedUpClaimIds = new Set(followUpLogs?.map(f => f.claim_id) || []);

        unpaidLateClaims.forEach(claim => {
          if (!followedUpClaimIds.has(claim.id)) {
            pendingFollowUp++;
          }
          // Check if stuck > 14 days
          if (claim.regional_approved_at) {
            const daysOverdue = calculateDaysOverdue(claim.regional_approved_at);
            if (daysOverdue > 7) { // 7 days overdue = 14 days since approval
              stuckOver14Days++;
            }
          }
        });
      }

      // 4. Weekly follow-ups by current admin
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: weeklyFollowUpsCount } = await supabase
        .from('follow_up_logs')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', profile.id)
        .gte('created_at', oneWeekAgo);

      const totalVerified = totalVerifiedCount || 0;
      const premiumConverted = premiumCount || 0;
      const conversionRate = totalVerified > 0 
        ? Math.round((premiumConverted / totalVerified) * 1000) / 10 
        : 0;

      setPerformanceData({
        totalVerified,
        premiumConverted,
        conversionRate,
        pendingFollowUp,
        weeklyFollowUps: weeklyFollowUpsCount || 0,
        stuckOver14Days,
      });
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        title: "Gagal memuat statistik",
        description: "Tidak dapat memuat data performa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [profile?.region_id, isDebugMode]);

  // Chart data
  const paymentChartData = useMemo(() => [
    { 
      name: "Sudah Bayar (Premium)", 
      value: performanceData.premiumConverted, 
      color: "hsl(160, 84%, 39%)" 
    },
    { 
      name: "Belum Bayar (Basic)", 
      value: performanceData.totalVerified - performanceData.premiumConverted, 
      color: "hsl(38, 92%, 50%)" 
    },
  ], [performanceData]);

  // Performance label
  const performanceLabel = useMemo(() => {
    if (performanceData.conversionRate >= 70) {
      return { label: "Militan", color: "bg-emerald-500", icon: Award };
    } else if (performanceData.stuckOver14Days > 3) {
      return { label: "Perlu Ditingkatkan", color: "bg-amber-500", icon: AlertTriangle };
    } else {
      return { label: "Baik", color: "bg-blue-500", icon: Target };
    }
  }, [performanceData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const PerformanceIcon = performanceLabel.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Performance Badge */}
      <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${performanceLabel.color}`}>
                <PerformanceIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Label Performa Anda</p>
                <p className="text-xl font-bold text-foreground">{performanceLabel.label}</p>
              </div>
            </div>
            <Badge className={`${performanceLabel.color} text-white px-3 py-1 text-sm`}>
              {performanceData.conversionRate}% Conversion
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Terverifikasi */}
        <Card className="bg-card shadow-sm border hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground font-medium mb-1 truncate">
                  Total Terverifikasi
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {performanceData.totalVerified}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Pesantren di wilayah</p>
              </div>
              <div className="p-2 md:p-3 bg-emerald-100 rounded-xl flex-shrink-0">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Konversi Premium */}
        <Card className="bg-card shadow-sm border hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground font-medium mb-1 truncate">
                  Konversi Premium
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {performanceData.premiumConverted}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Sudah lunas</p>
              </div>
              <div className="p-2 md:p-3 bg-amber-100 rounded-xl flex-shrink-0">
                <Crown className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-card shadow-sm border hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground font-medium mb-1 truncate">
                  Conversion Rate
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {performanceData.conversionRate}%
                </p>
                <Badge className={`mt-2 ${performanceData.conversionRate >= 70 ? 'bg-emerald-500' : 'bg-amber-500'} text-white text-xs`}>
                  {performanceData.conversionRate >= 70 ? 'Target Tercapai' : 'Belum Target'}
                </Badge>
              </div>
              <div className="p-2 md:p-3 bg-blue-100 rounded-xl flex-shrink-0">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menunggu Follow-up */}
        <Card className={`shadow-sm border hover:shadow-md transition-shadow ${
          performanceData.pendingFollowUp > 0 ? 'border-red-200 bg-red-50/50' : 'bg-card'
        }`}>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground font-medium mb-1 truncate">
                  Menunggu Follow-up
                </p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {performanceData.pendingFollowUp}
                </p>
                <p className="text-xs text-muted-foreground mt-1">&gt;7 hari belum diklik</p>
              </div>
              <div className={`p-2 md:p-3 ${performanceData.pendingFollowUp > 0 ? 'bg-red-100' : 'bg-gray-100'} rounded-xl flex-shrink-0`}>
                <Clock className={`w-5 h-5 md:w-6 md:h-6 ${performanceData.pendingFollowUp > 0 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Pie Chart */}
        <Card className="bg-card shadow-sm border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Perbandingan Status Pembayaran
            </CardTitle>
            <CardDescription>Belum Bayar (Basic) vs Sudah Bayar (Premium)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <div className="h-[180px] w-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {paymentChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-lg font-bold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Tracker */}
        <Card className="bg-card shadow-sm border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Tracker Follow-up
            </CardTitle>
            <CardDescription>Performa follow-up Anda minggu ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Weekly Stats */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                <div>
                  <p className="text-sm text-muted-foreground">Follow-up Minggu Ini</p>
                  <p className="text-3xl font-bold text-green-700">{performanceData.weeklyFollowUps}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Belum Di-follow-up</p>
                  <p className="text-xl font-bold text-foreground">{performanceData.pendingFollowUp}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Stuck &gt;14 Hari</p>
                  <p className={`text-xl font-bold ${performanceData.stuckOver14Days > 0 ? 'text-red-600' : 'text-foreground'}`}>
                    {performanceData.stuckOver14Days}
                  </p>
                </div>
              </div>

              {/* Encouragement Message */}
              <div className={`p-4 rounded-xl ${
                performanceData.conversionRate >= 70 
                  ? 'bg-emerald-50 border border-emerald-200' 
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <p className={`text-sm font-medium ${
                  performanceData.conversionRate >= 70 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {performanceData.conversionRate >= 70 
                    ? '🎉 Luar biasa! Anda adalah admin yang militan dengan conversion rate tinggi!'
                    : performanceData.stuckOver14Days > 3
                      ? '⚠️ Perlu ditingkatkan. Ada beberapa pesantren yang stuck >14 hari, segera lakukan follow-up.'
                      : '💪 Terus tingkatkan performa follow-up Anda untuk mencapai target 70%!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegionalPerformanceStats;
