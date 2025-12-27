import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Calendar,
  Zap,
  Building2,
  UserCog,
  CreditCard,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

type ViewType = "beranda" | "identitas" | "kru" | "administrasi" | "hub" | "pengaturan";

interface MediaDashboardHomeProps {
  paymentStatus: "paid" | "unpaid";
  profileLevel: "basic" | "silver" | "gold" | "platinum";
  onNavigate: (view: ViewType) => void;
}

const MediaDashboardHome = ({ paymentStatus, profileLevel, onNavigate }: MediaDashboardHomeProps) => {
  const getLevelColor = () => {
    switch (profileLevel) {
      case "silver": return "bg-slate-400";
      case "gold": return "bg-[#f59e0b]";
      case "platinum": return "bg-purple-500";
      default: return "bg-slate-300";
    }
  };

  const getLevelLabel = () => {
    switch (profileLevel) {
      case "silver": return "Silver";
      case "gold": return "Gold";
      case "platinum": return "Platinum";
      default: return "Basic";
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Alert */}
      {paymentStatus === "unpaid" && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Tagihan Belum Lunas!</strong> Beberapa fitur seperti Tambah Kru dan Klaim Sertifikat tidak dapat diakses.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Card */}
      <Card className="bg-[#166534] text-white border-0 overflow-hidden relative">
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
            <Badge className={`${getLevelColor()} text-white`}>
              {getLevelLabel()}
            </Badge>
            <Badge className={paymentStatus === "paid" ? "bg-green-500" : "bg-red-500"}>
              {paymentStatus === "paid" ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Ahlan wa Sahlan, Ahmad Fauzi
          </h1>
          <p className="text-emerald-100 text-lg">
            Selamat datang di dashboard Koordinator Media Pondok Jawa Timur.
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Kru */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Total Kru</h3>
              <Users className="h-5 w-5 text-[#166534]" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <Users className="h-7 w-7 text-[#166534]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">3</p>
                <p className="text-sm text-slate-500">Anggota aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Event */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Total Event</h3>
              <Calendar className="h-5 w-5 text-[#166534]" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-[#166534]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">5</p>
                <p className="text-sm text-slate-500">Event diikuti</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XP Lembaga */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">XP Lembaga</h3>
              <Zap className="h-5 w-5 text-[#f59e0b]" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
                <Zap className="h-7 w-7 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-[#f59e0b]">450</p>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +50 bulan ini
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Menu Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Identitas Pesantren */}
        <Card 
          className="bg-white hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onNavigate("identitas")}
        >
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Building2 className="h-8 w-8 text-[#166534]" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Identitas</h3>
            <p className="text-sm text-slate-500 mb-4">Kelola Profil Pesantren</p>
            <Button className="w-full bg-[#166534] hover:bg-[#14532d]">
              Kelola
            </Button>
          </CardContent>
        </Card>

        {/* Manage Crew */}
        <Card 
          className="bg-white hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onNavigate("kru")}
        >
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <UserCog className="h-8 w-8 text-[#166534]" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Crew</h3>
            <p className="text-sm text-slate-500 mb-4">Kelola Tim Media</p>
            <Button className="w-full bg-[#166534] hover:bg-[#14532d]">
              Kelola
            </Button>
          </CardContent>
        </Card>

        {/* Administrasi */}
        <Card 
          className={`bg-white transition-shadow cursor-pointer group ${
            paymentStatus === "unpaid" ? "ring-2 ring-red-300" : "hover:shadow-lg"
          }`}
          onClick={() => onNavigate("administrasi")}
        >
          <CardContent className="p-6 text-center">
            <div className={`h-16 w-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
              paymentStatus === "unpaid" ? "bg-red-50 group-hover:bg-red-100" : "bg-emerald-50 group-hover:bg-emerald-100"
            }`}>
              <CreditCard className={`h-8 w-8 ${paymentStatus === "unpaid" ? "text-red-500" : "text-[#166534]"}`} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Administrasi</h3>
            <p className="text-sm text-slate-500 mb-4">Tagihan & Invoice</p>
            <Button 
              className={`w-full ${
                paymentStatus === "unpaid" 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-[#166534] hover:bg-[#14532d]"
              }`}
            >
              {paymentStatus === "unpaid" ? "Bayar" : "Lihat"}
            </Button>
          </CardContent>
        </Card>

        {/* MPJ-Hub */}
        <Card 
          className="bg-white hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => onNavigate("hub")}
        >
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Zap className="h-8 w-8 text-[#f59e0b]" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">MPJ-Hub</h3>
            <p className="text-sm text-slate-500 mb-4">Resource Center</p>
            <Button className="w-full bg-[#f59e0b] hover:bg-amber-600 text-white">
              Jelajahi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MediaDashboardHome;