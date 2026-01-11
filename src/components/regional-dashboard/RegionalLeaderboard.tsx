import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, Award, TrendingUp, Flame, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

const RegionalLeaderboard = ({ isDebugMode }: RegionalLeaderboardProps) => {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"all" | "month">("all");
  const [leaderboardData, setLeaderboardData] = useState<RegionStats[]>([]);
  const [userRegionId, setUserRegionId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeFilter, user]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // Get current user's region
      if (user && !isDebugMode) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("region_id")
          .eq("id", user.id)
          .single();
        
        if (profileData?.region_id) {
          setUserRegionId(profileData.region_id);
        }
      }

      // Get all regions
      const { data: regionsData } = await supabase
        .from("regions")
        .select("id, name");

      if (!regionsData) {
        setLeaderboardData([]);
        return;
      }

      // Build date filter for this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get claims with regional_approved status or higher
      let claimsQuery = supabase
        .from("pesantren_claims")
        .select("id, region_id, status, regional_approved_at")
        .in("status", ["regional_approved", "pusat_approved", "approved"]);

      if (timeFilter === "month") {
        claimsQuery = claimsQuery.gte("regional_approved_at", startOfMonth.toISOString());
      }

      const { data: claimsData } = await claimsQuery;

      // Get profiles with active status (paid)
      let profilesQuery = supabase
        .from("profiles")
        .select("id, region_id, status_account, created_at")
        .eq("status_account", "active");

      const { data: profilesData } = await profilesQuery;

      // Calculate stats per region
      const regionStats: RegionStats[] = regionsData.map((region) => {
        const regionClaims = claimsData?.filter((c) => c.region_id === region.id) || [];
        const regionProfiles = profilesData?.filter((p) => p.region_id === region.id) || [];

        const totalVerified = regionClaims.length;
        const totalPaid = regionProfiles.length;
        const conversionRate = totalVerified > 0 
          ? Math.round((totalPaid / totalVerified) * 100) 
          : 0;

        return {
          region_id: region.id,
          region_name: region.name,
          total_verified: totalVerified,
          total_paid: totalPaid,
          conversion_rate: conversionRate,
        };
      });

      // Sort by conversion rate descending, then by total verified
      regionStats.sort((a, b) => {
        if (b.conversion_rate !== a.conversion_rate) {
          return b.conversion_rate - a.conversion_rate;
        }
        return b.total_verified - a.total_verified;
      });

      setLeaderboardData(regionStats);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-medium">{rank}</span>;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getMotivationalMessage = (rank: number, totalRegions: number) => {
    if (rank <= 3) {
      return {
        message: "Mantap! Regional Anda sangat militan.",
        icon: <Flame className="h-4 w-4 text-orange-500" />,
        color: "text-emerald-600",
      };
    }
    return {
      message: "Tetap semangat! Tingkatkan follow-up untuk memajukan media pesantren di regional Anda.",
      icon: <Heart className="h-4 w-4 text-pink-500" />,
      color: "text-amber-600",
    };
  };

  const userRank = leaderboardData.findIndex((r) => r.region_id === userRegionId) + 1;
  const motivationalData = userRank > 0 ? getMotivationalMessage(userRank, leaderboardData.length) : null;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Klasemen Regional
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Peringkat performa konversi pembayaran antar wilayah
          </p>
        </div>
        <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as "all" | "month")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter waktu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sepanjang Masa</SelectItem>
            <SelectItem value="month">Bulan Ini</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Motivational Message for Current User */}
      {motivationalData && userRank > 0 && (
        <Card className={`border-2 ${userRank <= 3 ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"}`}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              {motivationalData.icon}
              <div>
                <p className={`font-semibold ${motivationalData.color}`}>
                  Regional Anda berada di Peringkat #{userRank}
                </p>
                <p className="text-sm text-muted-foreground">{motivationalData.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card className="bg-card shadow-sm border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Peringkat Wilayah
          </CardTitle>
          <CardDescription>
            Diurutkan berdasarkan persentase konversi pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Wilayah</TableHead>
                  <TableHead className="text-center">Pesantren</TableHead>
                  <TableHead className="text-center">% Konversi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Belum ada data klasemen
                    </TableCell>
                  </TableRow>
                ) : (
                  leaderboardData.map((region, index) => {
                    const rank = index + 1;
                    const isCurrentUser = region.region_id === userRegionId;
                    
                    return (
                      <TableRow 
                        key={region.region_id}
                        className={`
                          ${isCurrentUser ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""}
                          ${rank <= 3 ? "font-medium" : ""}
                        `}
                      >
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Badge className={`${getRankBadgeClass(rank)} px-2 py-1 min-w-[32px]`}>
                              {getRankIcon(rank)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={isCurrentUser ? "text-emerald-700 font-semibold" : ""}>
                              {region.region_name}
                            </span>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-600">
                                Regional Saya
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold">{region.total_verified}</span>
                            <span className="text-xs text-muted-foreground">
                              ({region.total_paid} lunas)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={`
                              ${region.conversion_rate >= 70 
                                ? "bg-emerald-100 text-emerald-700" 
                                : region.conversion_rate >= 40 
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                              }
                            `}
                          >
                            {region.conversion_rate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium Display */}
      {leaderboardData.length >= 3 && (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">🏆 Top 3 Regional Militan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-4 pt-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <Medal className="h-8 w-8 text-gray-400 mb-2" />
                <div className="bg-gray-200 rounded-t-lg w-24 h-20 flex items-center justify-center">
                  <span className="font-bold text-2xl text-gray-600">2</span>
                </div>
                <div className="bg-gray-300 w-24 py-2 text-center rounded-b-lg">
                  <p className="text-xs font-medium truncate px-1">{leaderboardData[1].region_name}</p>
                  <p className="text-sm font-bold">{leaderboardData[1].conversion_rate}%</p>
                </div>
              </div>
              
              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <Trophy className="h-10 w-10 text-yellow-500 mb-2" />
                <div className="bg-yellow-200 rounded-t-lg w-28 h-28 flex items-center justify-center">
                  <span className="font-bold text-3xl text-yellow-700">1</span>
                </div>
                <div className="bg-yellow-300 w-28 py-2 text-center rounded-b-lg">
                  <p className="text-xs font-medium truncate px-1">{leaderboardData[0].region_name}</p>
                  <p className="text-sm font-bold">{leaderboardData[0].conversion_rate}%</p>
                </div>
              </div>
              
              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <Award className="h-7 w-7 text-amber-600 mb-2" />
                <div className="bg-amber-200 rounded-t-lg w-24 h-16 flex items-center justify-center">
                  <span className="font-bold text-2xl text-amber-700">3</span>
                </div>
                <div className="bg-amber-300 w-24 py-2 text-center rounded-b-lg">
                  <p className="text-xs font-medium truncate px-1">{leaderboardData[2].region_name}</p>
                  <p className="text-sm font-bold">{leaderboardData[2].conversion_rate}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RegionalLeaderboard;
