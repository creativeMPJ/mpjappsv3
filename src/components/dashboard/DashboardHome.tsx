import { TrendingUp, Clock, Building2, Trophy, AlertTriangle, Users, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ClusterMap from "./ClusterMap";

type ViewType = 
  | "dashboard" 
  | "regional-akun" 
  | "regional-mapping" 
  | "monitoring-validasi" 
  | "pusat-unduhan"
  | "database-pesantren" 
  | "gamifikasi"
  | "pengaturan";

interface Props {
  onNavigate?: (view: ViewType) => void;
}

const DashboardHome = ({ onNavigate }: Props) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <p className="text-slate-500 text-sm">Super Admin / Pusat</p>
        <h1 className="text-2xl md:text-3xl font-bold text-emerald-700">
          Pengurus Pusat (Khodim Harian Pusat)
        </h1>
      </div>

      {/* Stats Grid - Clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("database-pesantren")}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Pesantren</p>
                <p className="text-2xl font-bold text-slate-800">850</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("regional-mapping")}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Wilayah Aktif</p>
                <p className="text-2xl font-bold text-slate-800">17</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("database-pesantren")}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Kru</p>
                <p className="text-2xl font-bold text-slate-800">2,450</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.("gamifikasi")}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total XP Distributed</p>
                <p className="text-2xl font-bold text-slate-800">1.2M</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Total Omzet */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-slate-600 text-sm font-medium">Total Omzet (Bulan Ini)</p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">Rp 15.500.000</p>
                  <p className="text-emerald-500 text-sm mt-1 flex items-center gap-1">
                    <span className="inline-block">▲</span> 12% dari bulan lalu
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regional Teraktif */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Regional Teraktif (Bulan Ini)</p>
                  <p className="text-3xl font-bold text-emerald-700 mt-2">Malang Raya</p>
                  <p className="text-slate-500 text-sm mt-1">Berdasarkan jumlah pendaftar & event</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payment */}
          <Card 
            className="bg-white border-0 shadow-sm border-l-4 border-l-red-500 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate?.("monitoring-validasi")}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Pending Validasi</p>
                    <p className="text-3xl font-bold text-red-500 mt-1">12 Request</p>
                  </div>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Lihat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cluster Map */}
        <div className="lg:col-span-2">
          <ClusterMap />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
