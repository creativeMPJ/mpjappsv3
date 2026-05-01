import { Bell, Zap, Award, ChevronRight, IdCard, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { XPLevelBadge } from "@/components/shared/LevelBadge";
import { formatNIAM, getXPLevel } from "@/lib/id-utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getTransactionXPTotal } from "@/lib/v4-core-rules";
import { isPaymentActive } from "@/features/v4/utils";
import { getCrewStatusClass, getCrewStatusLabel } from "./crew-state";

type ViewType = "beranda" | "leaderboard" | "hub" | "event" | "eid" | "profil";

interface CrewData {
  id?: string;
  nama?: string;
  niam?: string;
  jabatan?: string;
  xp_level?: number;
  xpTotal?: number;
  xp_total?: number;
  transactionXpTotal?: number;
  transaction_xp_total?: number;
  status?: string | null;
  paymentVerified?: boolean;
  skill?: string[];
  institution_name?: string;
  institution_nip?: string;
  pesantren_asal?: string;
  alamat_asal?: string;
  nama_panggilan?: string;
  whatsapp?: string;
  prinsip_hidup?: string;
}

interface CrewBerandaPageProps {
  onNavigate: (view: ViewType) => void;
  debugCrew?: CrewData;
}

const CrewBerandaPage = ({ onNavigate, debugCrew }: CrewBerandaPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signOut, profile } = useAuth();
  
  const isDebugMode = Boolean((location.state as { isDebugMode?: boolean } | null)?.isDebugMode);

  const crewName = debugCrew?.nama || "Belum ada data";
  const paymentActive = isPaymentActive(profile?.status_payment);
  const crewNIAM = debugCrew?.niam ?? null;
  const currentXP = getTransactionXPTotal(debugCrew as unknown as Record<string, unknown>);
  const jabatan = debugCrew?.jabatan || "-";
  const pesantrenAsal = debugCrew?.pesantren_asal || debugCrew?.institution_name || "Data akan tampil setelah tersedia";
  const statusLabel = getCrewStatusLabel(debugCrew?.status);
  
  const xpInfo = getXPLevel(currentXP);
  const stats = {
    currentXP,
    targetXP: xpInfo.maxXP === Infinity ? currentXP + 1000 : xpInfo.maxXP,
    totalCertificates: 0,
  };

  const handleLogout = async () => {
    if (isDebugMode) {
      navigate('/debug-view');
      return;
    }
    await signOut();
    toast({
      title: "Berhasil keluar",
      description: "Anda telah logout dari sistem",
    });
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header with Greeting, Institution, & Position */}
      <div className="bg-gradient-to-br from-primary to-primary/80 px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-primary-foreground/30">
                <AvatarFallback className="bg-primary-foreground text-primary font-bold text-lg">
                  {debugCrew?.nama ? crewName.split(' ').map(n => n[0]).join('').slice(0, 2) : "K"}
                </AvatarFallback>
              </Avatar>
              {/* Militansi Badge Overlay */}
              <div className="absolute -bottom-1 -right-1">
                <XPLevelBadge xp={currentXP} size="sm" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">{crewName}</h1>
              <p className="text-primary-foreground/80 text-sm">{pesantrenAsal}</p>
              <Badge variant="secondary" className="mt-1 mr-1 bg-primary-foreground/20 text-primary-foreground border-0 text-xs">
                {jabatan}
              </Badge>
              <Badge variant="outline" className={cn("mt-1 text-xs", getCrewStatusClass(debugCrew?.status))}>
                {statusLabel}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-primary-foreground/80 hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* NIAM Identity Card - Dominant Display */}
        <Card className="bg-primary-foreground/10 backdrop-blur border-primary-foreground/20 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <IdCard className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-primary-foreground/70 text-xs uppercase tracking-wider font-medium">
                    Nomor Induk Anggota Media
                  </p>
                  <p className="text-3xl font-mono font-bold text-primary-foreground tracking-widest">
                    {crewNIAM ? formatNIAM(crewNIAM, true) : "-"}
                  </p>
                  {!crewNIAM && (
                    <Badge className="mt-2 bg-primary-foreground/20 text-primary-foreground border-0">
                      Belum Aktif
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
        </Card>

        {/* XP Progress Card */}
        <Card className="bg-primary-foreground/15 backdrop-blur border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                <span className="text-primary-foreground/90 font-medium">Militansi XP</span>
              </div>
              <XPLevelBadge xp={currentXP} size="md" showXP />
            </div>
            
            <div className="flex items-center gap-4">
              {/* XP Number */}
              <div className="flex-1">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-primary-foreground">{stats.currentXP}</span>
                  <span className="text-primary-foreground/60 text-sm">XP</span>
                </div>
                <Progress 
                  value={((stats.currentXP - xpInfo.minXP) / (stats.targetXP - xpInfo.minXP)) * 100} 
                  className="h-2.5 bg-primary-foreground/20"
                />
                <p className="text-xs text-primary-foreground/60 mt-2">
                  {stats.targetXP === Infinity 
                    ? 'Level tertinggi tercapai'
                    : `${stats.targetXP - stats.currentXP} XP lagi ke ${xpInfo.level === 'bronze' ? 'Silver' : xpInfo.level === 'silver' ? 'Gold' : 'Platinum'}`
                  }
                </p>
              </div>
              
              {/* Badge Display */}
              <div className={`w-16 h-16 rounded-2xl ${xpInfo.color} flex items-center justify-center shadow-lg`}>
                <span className="text-3xl">{xpInfo.icon}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-4 relative z-10">
        <Card className="shadow-lg border-0">
          <CardContent className="p-4">
            <div 
              className={`flex items-center justify-between ${paymentActive ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
              onClick={() => {
                if (paymentActive) {
                  onNavigate("eid");
                  return;
                }

                toast({
                  title: "Belum aktif",
                  description: "Aktifkan akun terlebih dahulu",
                  variant: "destructive",
                });
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                  <IdCard className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <p className="text-foreground font-semibold">Lihat E-ID Card</p>
                  <p className="text-sm text-muted-foreground">
                    {paymentActive ? "Kartu identitas digital Anda" : "Aktifkan akun terlebih dahulu"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Counter */}
      <div className="px-4 mt-3">
        <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Sertifikat</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalCertificates}</p>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">Segera Hadir</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News Feed Section */}
      <div className="flex-1 px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Info Terkini</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            Lihat Semua
          </Button>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Award className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-foreground">Belum ada data</p>
            <p className="mt-1 text-sm text-muted-foreground">Data akan tampil setelah tersedia</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrewBerandaPage;
