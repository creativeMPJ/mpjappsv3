import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Calendar,
  Zap,
  Building2,
  UserCog,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewType = "beranda" | "identitas" | "kru" | "administrasi" | "hub" | "pengaturan";
type ProfileLevel = "basic" | "silver" | "gold" | "platinum";
type PaymentStatus = "paid" | "unpaid";

interface MediaDashboardHomeProps {
  paymentStatus: PaymentStatus;
  profileLevel: ProfileLevel;
  onNavigate: (view: ViewType) => void;
}

const MediaDashboardHome = ({ paymentStatus, profileLevel, onNavigate }: MediaDashboardHomeProps) => {
  const getLevelInfo = () => {
    switch (profileLevel) {
      case "silver": return { color: "bg-slate-400", label: "Silver", progress: 50, icon: "🥈" };
      case "gold": return { color: "bg-accent", label: "Gold", progress: 75, icon: "🥇" };
      case "platinum": return { color: "bg-purple-500", label: "Platinum", progress: 100, icon: "💎" };
      default: return { color: "bg-slate-300", label: "Basic", progress: 25, icon: "🏅" };
    }
  };

  const levelInfo = getLevelInfo();

  return (
    <div className="space-y-6">
      {/* Payment Alert */}
      {paymentStatus === "unpaid" && (
        <Alert className="bg-destructive/10 border-destructive/30">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <strong>Tagihan Belum Lunas!</strong> Beberapa fitur seperti Tambah Kru dan Klaim Sertifikat tidak dapat diakses.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Card */}
      <Card className="bg-sidebar-background text-sidebar-foreground border-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <pattern id="islamic-pattern" patternUnits="userSpaceOnUse" width="40" height="40">
              <path d="M20 0L40 20L20 40L0 20Z" fill="currentColor" />
            </pattern>
            <rect width="200" height="200" fill="url(#islamic-pattern)" />
          </svg>
        </div>
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Badge className={cn(levelInfo.color, "text-white")}>
              {levelInfo.icon} {levelInfo.label}
            </Badge>
            <Badge className={paymentStatus === "paid" ? "bg-green-500" : "bg-destructive"}>
              {paymentStatus === "paid" ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Ahlan wa Sahlan, Ahmad Fauzi
          </h1>
          <p className="text-sidebar-foreground/80 text-lg">
            Selamat datang di dashboard Koordinator Media Pondok Jawa Timur.
          </p>
        </CardContent>
      </Card>

      {/* Level Progress Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-semibold text-foreground">Level Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Tingkatkan profil untuk membuka fitur eksklusif
                </p>
              </div>
            </div>
            <Badge className={cn(levelInfo.color, "text-white text-lg px-3 py-1")}>
              {levelInfo.icon} {levelInfo.label}
            </Badge>
          </div>
          <Progress value={levelInfo.progress} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Basic</span>
            <span>Silver</span>
            <span>Gold</span>
            <span>Platinum</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Santri */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Total Santri</h3>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">250</p>
                <p className="text-sm text-muted-foreground">Santri terdaftar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Kru */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Total Kru</h3>
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCog className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Anggota aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XP Lembaga */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Level XP</h3>
              <Zap className="h-5 w-5 text-accent" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
                <Zap className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">450</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +50 bulan ini
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events / Agenda */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Agenda Mendatang</h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Pelatihan Videografi</p>
                <p className="text-sm text-muted-foreground">28 Desember 2025 • 09:00 WIB</p>
              </div>
              <Badge variant="secondary">Upcoming</Badge>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Lomba Konten Digital</p>
                <p className="text-sm text-muted-foreground">5 Januari 2026 • 08:00 WIB</p>
              </div>
              <Badge variant="secondary">Upcoming</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Menu Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Identitas Pesantren */}
        <Card 
          className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onNavigate("identitas")}
        >
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Identitas</h3>
            <p className="text-sm text-muted-foreground mb-4">Kelola Profil Pesantren</p>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Kelola
            </Button>
          </CardContent>
        </Card>

        {/* Manage Crew */}
        <Card 
          className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onNavigate("kru")}
        >
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <UserCog className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Crew</h3>
            <p className="text-sm text-muted-foreground mb-4">Kelola Tim Media</p>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Kelola
            </Button>
          </CardContent>
        </Card>

        {/* Administrasi */}
        <Card 
          className={cn(
            "bg-card border-border transition-shadow cursor-pointer group",
            paymentStatus === "unpaid" ? "ring-2 ring-destructive/50" : "hover:shadow-lg"
          )}
          onClick={() => onNavigate("administrasi")}
        >
          <CardContent className="p-6 text-center">
            <div className={cn(
              "h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors",
              paymentStatus === "unpaid" ? "bg-destructive/10 group-hover:bg-destructive/20" : "bg-primary/10 group-hover:bg-primary/20"
            )}>
              <CreditCard className={cn("h-8 w-8", paymentStatus === "unpaid" ? "text-destructive" : "text-primary")} />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Administrasi</h3>
            <p className="text-sm text-muted-foreground mb-4">Tagihan & Invoice</p>
            <Button 
              className={cn(
                "w-full",
                paymentStatus === "unpaid" 
                  ? "bg-destructive hover:bg-destructive/90" 
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {paymentStatus === "unpaid" ? "Bayar" : "Lihat"}
            </Button>
          </CardContent>
        </Card>

        {/* MPJ-Hub */}
        <Card 
          className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onNavigate("hub")}
        >
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Zap className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">MPJ-Hub</h3>
            <p className="text-sm text-muted-foreground mb-4">Resource Center</p>
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Jelajahi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MediaDashboardHome;