import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Calendar,
  Building2,
  UserCog,
  CreditCard,
  AlertTriangle,
  Layers,
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
      case "silver": return { color: "bg-slate-400", label: "Silver", icon: "🥈" };
      case "gold": return { color: "bg-[#f59e0b]", label: "Gold", icon: "🥇" };
      case "platinum": return { color: "bg-purple-500", label: "Platinum", icon: "💎" };
      default: return { color: "bg-slate-500", label: "Basic", icon: "🏅" };
    }
  };

  const levelInfo = getLevelInfo();

  return (
    <div className="space-y-6 pb-20">
      {/* Payment Alert */}
      {paymentStatus === "unpaid" && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>Tagihan Belum Lunas!</strong> Beberapa fitur seperti Tambah Kru dan Klaim Sertifikat tidak dapat diakses.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Card - Emerald Gradient for High Contrast */}
      <Card className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white border-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <pattern id="islamic-pattern" patternUnits="userSpaceOnUse" width="40" height="40">
              <path d="M20 0L40 20L20 40L0 20Z" fill="currentColor" />
            </pattern>
            <rect width="200" height="200" fill="url(#islamic-pattern)" />
          </svg>
        </div>
        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className={cn(levelInfo.color, "text-white")}>
              {levelInfo.icon} {levelInfo.label}
            </Badge>
            <Badge className={paymentStatus === "paid" ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
              {paymentStatus === "paid" ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-white">
            Ahlan wa Sahlan
          </h1>
          <p className="text-white/90 text-base md:text-lg">
            Selamat datang di dashboard Koordinator Media Pondok Jawa Timur.
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid - 2 Cards Only (MVP) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Total Santri */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Total Santri</h3>
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <Users className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">250</p>
                <p className="text-sm text-slate-600">Santri terdaftar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Kru */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Total Kru</h3>
              <UserCog className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <UserCog className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">3</p>
                <p className="text-sm text-slate-600">Anggota aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events / Agenda */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">Agenda Mendatang</h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
              <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">Pelatihan Videografi</p>
                <p className="text-sm text-slate-600">28 Desember 2025 • 09:00 WIB</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 hidden sm:inline-flex">Upcoming</Badge>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
              <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">Lomba Konten Digital</p>
                <p className="text-sm text-slate-600">5 Januari 2026 • 08:00 WIB</p>
              </div>
              <Badge className="bg-amber-100 text-amber-700 hidden sm:inline-flex">Upcoming</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Menu Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Identitas Pesantren */}
        <Card 
          className="bg-white border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onNavigate("identitas")}
        >
          <CardContent className="p-4 md:p-6 text-center">
            <div className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm md:text-base">Identitas</h3>
            <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4">Profil Pesantren</p>
            <Button className="w-full bg-[#166534] hover:bg-emerald-700 text-white text-sm">
              Kelola
            </Button>
          </CardContent>
        </Card>

        {/* Manage Crew */}
        <Card 
          className="bg-white border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onNavigate("kru")}
        >
          <CardContent className="p-4 md:p-6 text-center">
            <div className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <UserCog className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm md:text-base">Crew</h3>
            <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4">Tim Media</p>
            <Button className="w-full bg-[#166534] hover:bg-emerald-700 text-white text-sm">
              Kelola
            </Button>
          </CardContent>
        </Card>

        {/* Administrasi */}
        <Card 
          className={cn(
            "bg-white border-gray-200 transition-shadow cursor-pointer group",
            paymentStatus === "unpaid" ? "ring-2 ring-red-300" : "hover:shadow-lg"
          )}
          onClick={() => onNavigate("administrasi")}
        >
          <CardContent className="p-4 md:p-6 text-center">
            <div className={cn(
              "h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 rounded-full flex items-center justify-center transition-colors",
              paymentStatus === "unpaid" ? "bg-red-100 group-hover:bg-red-200" : "bg-emerald-100 group-hover:bg-emerald-200"
            )}>
              <CreditCard className={cn("h-6 w-6 md:h-8 md:w-8", paymentStatus === "unpaid" ? "text-red-600" : "text-emerald-600")} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm md:text-base">Administrasi</h3>
            <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4">Tagihan</p>
            <Button 
              className={cn(
                "w-full text-sm",
                paymentStatus === "unpaid" 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-[#166534] hover:bg-emerald-700 text-white"
              )}
            >
              {paymentStatus === "unpaid" ? "Bayar" : "Lihat"}
            </Button>
          </CardContent>
        </Card>

        {/* MPJ-Hub */}
        <Card 
          className="bg-white border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onNavigate("hub")}
        >
          <CardContent className="p-4 md:p-6 text-center">
            <div className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Layers className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm md:text-base">MPJ-Hub</h3>
            <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4">Resources</p>
            <Button className="w-full bg-[#f59e0b] hover:bg-amber-600 text-slate-900 text-sm font-semibold">
              Jelajahi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MediaDashboardHome;
