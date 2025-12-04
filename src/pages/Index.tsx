import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Calendar,
  ShoppingBag,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  Shield,
  TrendingUp
} from "lucide-react";
import logoMpj from "@/assets/logo-mpj.png";

const Index = () => {
  const features = [
    {
      icon: Award,
      title: "Sistem Gamifikasi",
      description: "Kumpulkan XP, raih badge, dan tingkatkan tier dari Silver hingga Platinum"
    },
    {
      icon: Calendar,
      title: "Event Management",
      description: "Kelola dan ikuti berbagai event komunitas dengan mudah"
    },
    {
      icon: ShoppingBag,
      title: "Shop & Merchandise",
      description: "Tukar poin dengan merchandise eksklusif MPJ"
    },
    {
      icon: Users,
      title: "Crew Management",
      description: "Daftar menjadi crew event dengan sistem slot yang terorganisir"
    }
  ];

  const stats = [
    { label: "Anggota Aktif", value: "1000+", icon: Users },
    { label: "Event Terlaksana", value: "50+", icon: Calendar },
    { label: "Total XP Terdistribusi", value: "100K+", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border/50 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoMpj} alt="MPJ" className="h-10 object-contain" />
            <span className="font-bold text-xl text-primary">MPJ Apps</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="rounded-xl">
                Masuk
              </Button>
            </Link>
            <Link to="/register">
              <Button className="rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow">
                Daftar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">Platform Komunitas Digital Pesantren</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Media Pondok Jawa Timur
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Bergabunglah dengan komunitas media pesantren terbesar di Jawa Timur.
                Kembangkan skill, raih achievement, dan jadilah bagian dari perubahan digital.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Link to="/register">
                  <Button size="lg" className="h-14 px-8 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-glow group">
                    Mulai Sekarang
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl border-border hover:bg-secondary">
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>
            <div className="flex-1 relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
                <div className="relative p-8 bg-card/50 backdrop-blur-sm">
                  <div className="space-y-4">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-border/30 hover:border-accent/50 transition-colors"
                      >
                        <div className="p-3 rounded-xl bg-primary/20">
                          <stat.icon className="h-6 w-6 text-primary" />
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Fitur Unggulan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Platform lengkap untuk mengembangkan komunitas media pesantren Anda
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-glow transition-all duration-300 border-border/50 hover:border-accent/50 rounded-2xl overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 w-fit mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-foreground">Mengapa MPJ Apps?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Sistem Membership Terintegrasi</h3>
                    <p className="text-muted-foreground">
                      Legacy data check otomatis, dashboard locked sampai aktivasi, dan reward system yang menarik
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-accent/10">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Gamifikasi yang Menyenangkan</h3>
                    <p className="text-muted-foreground">
                      Kumpulkan XP dari berbagai aktivitas, raih tier Platinum, dan dapatkan custom badge eksklusif
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Komunitas yang Solid</h3>
                    <p className="text-muted-foreground">
                      Terhubung dengan sesama content creator pesantren, berbagi pengalaman, dan berkembang bersama
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                <div className="aspect-square bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Award className="h-24 w-24 text-primary mx-auto mb-6 animate-float" />
                    <div className="text-4xl font-bold text-foreground mb-2">Tier System</div>
                    <div className="text-xl text-muted-foreground">Silver → Gold → Platinum</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary to-accent">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-primary-foreground">
            Siap Bergabung dengan MPJ?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Daftarkan diri Anda sekarang dan mulai perjalanan sebagai content creator pesantren profesional
          </p>
          <Link to="/register">
            <Button size="lg" className="h-14 px-8 rounded-xl bg-background text-primary hover:bg-background/90 font-semibold shadow-xl group">
              Daftar Gratis Sekarang
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={logoMpj} alt="MPJ" className="h-8 object-contain" />
              <span className="font-bold text-lg text-primary">Media Pondok Jawa Timur</span>
            </div>
            <div className="text-muted-foreground text-sm">
              © 2024 MPJ Apps. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;