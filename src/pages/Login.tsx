import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.emailOrPhone || !formData.password) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon masukkan email/No. HP dan password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login Berhasil! 🎉",
        description: "Selamat datang kembali di MPJ Apps",
      });
      // Navigate to appropriate dashboard based on role
      navigate("/media-dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/20">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logoMpj} alt="Media Pondok Jawa Timur" className="h-16 object-contain" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Selamat Datang! 👋
            </h1>
            <p className="text-muted-foreground">
              Masuk ke akun MPJ Apps Anda
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone" className="text-foreground">Email atau No. HP</Label>
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="email@example.com atau 08xxx"
                value={formData.emailOrPhone}
                onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                className="h-12 rounded-xl border-border/50 focus:border-primary bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 rounded-xl border-border/50 focus:border-primary pr-12 bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                />
                <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">
                  Ingat saya
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-amber-500 hover:text-amber-400 font-medium transition-colors">
                Lupa password?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg"
            >
              {isLoading ? "Memproses..." : "Masuk"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          {/* Klaim Akun Legacy */}
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-sm text-foreground text-center">
              <span className="font-medium">Khodim Lama?</span>{" "}
              <Link to="/claim-account" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
                Klaim Akun di sini
              </Link>
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Dapatkan diskon aktivasi hanya Rp 20.000
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">atau</span>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground">
            Baru di MPJ Apps?{" "}
            <Link to="/register" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
              Daftar Pesantren Baru
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-1">
            Tarif pendaftaran: Rp 50.000
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;