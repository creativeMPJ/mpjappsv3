import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Users, Calendar, ArrowRight, Zap, Sparkles } from "lucide-react";

const Index = () => {
  // Mobile header hide on scroll
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only apply hide behavior on mobile (screen width < 640px)
      if (window.innerWidth < 640) {
        if (currentScrollY > lastScrollY && currentScrollY > 60) {
          // Scrolling down & past threshold
          setShowHeader(false);
        } else {
          // Scrolling up
          setShowHeader(true);
        }
      } else {
        setShowHeader(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  const stats = [
    { label: "Anggota Aktif", value: "1000+", icon: Users, bgColor: "bg-primary/10", iconColor: "text-primary" },
    { label: "Event Terlaksana", value: "50+", icon: Calendar, bgColor: "bg-accent/15", iconColor: "text-accent" },
    { label: "Total XP Terdistribusi", value: "100K+", icon: Zap, bgColor: "bg-primary/10", iconColor: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
      {/* Navigation - Desktop shows buttons, Mobile hides them with smooth hide on scroll */}
      <nav 
        ref={headerRef}
        className={`sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50 z-50 transition-transform duration-300 ease-in-out ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-primary text-lg">MPJ Apps</span>
          {/* Desktop only buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="h-9 px-4 text-foreground hover:bg-secondary">
                Masuk
              </Button>
            </Link>
            <Link to="/check-institution">
              <Button
                size="sm"
                className="h-9 px-5 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-md"
              >
                Daftar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 pt-10 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">Platform Komunitas Media Pesantren</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-5">
                Media Pondok
                <br />
                Jawa Timur
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Bergabunglah dengan komunitas media pesantren terbesar di Indonesia. Kembangkan skill, raih militansi,
                dan jadilah bagian dari perubahan digital pesantren.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/check-institution">
                  <Button className="w-full sm:w-auto h-12 px-7 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg shadow-accent/25">
                    Mulai Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-6 rounded-full border-2 border-border hover:bg-secondary font-medium"
                  >
                    Pelajari Lebih Lanjut
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Stats Cards (Desktop) */}
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-primary/5 via-secondary to-accent/5 rounded-3xl p-6 shadow-soft">
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-2xl ${
                        index % 2 === 0 ? "bg-primary/8" : "bg-accent/10"
                      } transition-transform hover:scale-[1.02]`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Stats */}
      <section className="px-4 py-6 lg:hidden">
        <div className="flex justify-center gap-6 sm:gap-10">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-8">Fitur Unggulan</h2>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center hover:shadow-glow transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Profil Pesantren</h3>
              <p className="text-sm text-muted-foreground">Kelola identitas & data lembaga</p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center hover:shadow-glow transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Crew Management</h3>
              <p className="text-sm text-muted-foreground">Kelola tim media pesantren</p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center hover:shadow-glow transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Event & Sertifikat</h3>
              <p className="text-sm text-muted-foreground">Ikuti event & raih sertifikat</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 sm:p-10 text-center shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-3">Siap Bergabung?</h2>
            <p className="text-primary-foreground/80 mb-6 text-sm sm:text-base">
              Daftar sekarang & jadilah bagian dari komunitas media pesantren terbesar
            </p>
            <Link to="/check-institution">
              <Button className="h-12 px-8 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg">
                Daftar Gratis Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">MPJ Apps</span>
          <span>© 2026 Media Pondok Jawa Timur</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
