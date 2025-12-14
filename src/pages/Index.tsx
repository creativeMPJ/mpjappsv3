import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Award,
  Calendar,
  Users,
  Zap,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import logoMpj from "@/assets/logo-mpj.png";

const Index = () => {
  const stats = [
    { label: "Anggota Aktif", value: "1000+", icon: Users },
    { label: "Event", value: "50+", icon: Calendar },
    { label: "Total XP", value: "100K+", icon: Zap },
  ];

  const features = [
    { icon: Award, title: "Gamifikasi", desc: "Raih XP & badge" },
    { icon: Calendar, title: "Event", desc: "Ikuti kegiatan" },
    { icon: Users, title: "Crew", desc: "Kelola tim media" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900">
      {/* Compact Mobile Navigation */}
      <nav className="sticky top-0 bg-emerald-900/95 backdrop-blur-sm border-b border-emerald-700/50 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoMpj} alt="MPJ" className="h-8 w-8 object-contain" />
            <span className="font-bold text-white text-sm">MPJ Apps</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-white hover:bg-emerald-700/50 h-8 px-3 text-sm">
                Masuk
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white h-8 px-3 text-sm">
                Daftar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="px-4 pt-8 pb-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
            <Zap className="h-3 w-3 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">Platform Digital Pesantren</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
            Media Pondok<br />Jawa Timur
          </h1>
          
          <p className="text-sm text-emerald-100/80 mb-6 max-w-xs mx-auto leading-relaxed">
            Komunitas media pesantren terbesar. Kembangkan skill & raih achievement.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="w-full sm:w-auto">
              <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg">
                Mulai Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats - Compact Grid */}
      <section className="px-4 py-6">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-emerald-800/50 border border-emerald-700/50 rounded-xl p-3 text-center"
            >
              <stat.icon className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-[10px] text-emerald-200/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features - Horizontal Cards */}
      <section className="px-4 py-6">
        <h2 className="text-lg font-bold text-white mb-4 text-center">Fitur Unggulan</h2>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-emerald-800/40 border border-emerald-700/40 rounded-xl p-3"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                <p className="text-xs text-emerald-200/70">{feature.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-emerald-400/50" />
            </div>
          ))}
        </div>
      </section>

      {/* Badge System Preview */}
      <section className="px-4 py-6">
        <div className="bg-gradient-to-br from-emerald-700/50 to-emerald-800/50 border border-emerald-600/30 rounded-2xl p-4">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-2xl mb-1">🥈</div>
              <div className="text-[10px] text-emerald-200/70">Silver</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🟡</div>
              <div className="text-[10px] text-emerald-200/70">Gold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">💎</div>
              <div className="text-[10px] text-emerald-200/70">Platinum</div>
            </div>
          </div>
          <p className="text-xs text-center text-emerald-200/80">
            Tingkatkan tier dengan melengkapi profil & ikuti event
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-8">
        <div className="bg-amber-500 rounded-2xl p-5 text-center">
          <h2 className="text-lg font-bold text-white mb-2">
            Siap Bergabung?
          </h2>
          <p className="text-sm text-amber-100/90 mb-4">
            Daftar sekarang & jadilah bagian dari komunitas
          </p>
          <Link to="/register">
            <Button className="w-full h-10 bg-white text-amber-600 hover:bg-amber-50 font-semibold rounded-xl">
              Daftar Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="px-4 py-6 border-t border-emerald-700/30">
        <div className="flex items-center justify-between text-xs text-emerald-300/60">
          <div className="flex items-center gap-2">
            <img src={logoMpj} alt="MPJ" className="h-5 w-5 object-contain opacity-70" />
            <span>MPJ Apps</span>
          </div>
          <span>© 2024</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;