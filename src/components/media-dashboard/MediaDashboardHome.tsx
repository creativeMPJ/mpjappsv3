import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ClipboardList, 
  Users, 
  Shield, 
  Edit, 
  UserCog, 
  IdCard, 
  Calendar,
  Lock
} from "lucide-react";

interface MediaDashboardHomeProps {
  isGold: boolean;
  onNavigate: (view: "beranda" | "profil" | "kru" | "eidcard" | "event") => void;
}

const MediaDashboardHome = ({ isGold, onNavigate }: MediaDashboardHomeProps) => {
  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <Card className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white border-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <pattern id="islamic-pattern" patternUnits="userSpaceOnUse" width="40" height="40">
              <path d="M20 0L40 20L20 40L0 20Z" fill="currentColor" />
            </pattern>
            <rect width="200" height="200" fill="url(#islamic-pattern)" />
          </svg>
        </div>
        <CardContent className="p-8 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Ahlan wa Sahlan, Ahmad Fauzi
          </h1>
          <p className="text-emerald-100 text-lg">
            Selamat datang di dashboard Koordinator Media Pondok Jawa Timur.
            <br />
            Semoga hari Anda penuh berkah.
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mission Progress */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Mission Progress</h3>
              <ClipboardList className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#166534"
                    strokeWidth="3"
                    strokeDasharray="65, 100"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-700">
                  65%
                </span>
              </div>
              <span className="text-slate-600 font-medium">Misi Bulan Ini</span>
            </div>
          </CardContent>
        </Card>

        {/* Crew Slots */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Crew Slots</h3>
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="h-12 w-12 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-700">
                  <Users className="h-6 w-6" />
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-emerald-700 font-bold">
                  +2
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">1/3 Terisi</p>
                <p className="text-sm text-slate-500">Sisa 2 Slot Kru Media</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Status</h3>
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                isGold ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'
              }`}>
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isGold ? 'text-amber-600' : 'text-slate-600'}`}>
                  {isGold ? 'Gold' : 'Basic'}
                </p>
                <p className="text-sm text-slate-500">
                  {isGold ? 'Akses penuh tersedia' : 'Aktifkan ID Card untuk akses penuh'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Menu Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Edit Profile */}
        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Edit className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Edit Profile</h3>
            <p className="text-sm text-slate-500 mb-4">Ubah Profil & Data Pesantren</p>
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onNavigate("profil")}
            >
              Edit Sekarang
            </Button>
          </CardContent>
        </Card>

        {/* Manage Crew */}
        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <UserCog className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Manage Crew</h3>
            <p className="text-sm text-slate-500 mb-4">Atur Tim Media & Kru</p>
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onNavigate("kru")}
            >
              Kelola Kru
            </Button>
          </CardContent>
        </Card>

        {/* ID Card */}
        <Card className={`bg-white transition-shadow cursor-pointer group ${!isGold ? 'opacity-75' : 'hover:shadow-lg'}`}>
          <CardContent className="p-6 text-center relative">
            {!isGold && (
              <div className="absolute inset-0 bg-slate-100/80 rounded-lg flex items-center justify-center z-10">
                <Lock className="h-8 w-8 text-slate-400" />
              </div>
            )}
            <div className="h-16 w-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <IdCard className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">ID Card</h3>
            <p className="text-sm text-slate-500 mb-4">Akses E-ID Card</p>
            <Button 
              className="w-full"
              variant={isGold ? "default" : "secondary"}
              disabled={!isGold}
              onClick={() => onNavigate("eidcard")}
            >
              {isGold ? 'Lihat ID Card' : '🔒 Terkunci'}
            </Button>
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Calendar className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Events</h3>
            <p className="text-sm text-slate-500 mb-4">Lihat Event & Sertifikat</p>
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onNavigate("event")}
            >
              Lihat Event
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MediaDashboardHome;
