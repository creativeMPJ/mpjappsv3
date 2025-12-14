import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

// Demo accounts for testing
const demoAccounts = [
  { email: "admin@mpj.com", password: "admin123", role: "super-admin", redirect: "/dashboard" },
  { email: "regional@mpj.com", password: "regional123", role: "regional", redirect: "/regional-dashboard" },
  { email: "media@mpj.com", password: "media123", role: "coordinator", redirect: "/media-dashboard" },
  { email: "kru@mpj.com", password: "kru123", role: "crew", redirect: "/crew-dashboard" },
];

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
    
    // Check demo accounts
    const demoAccount = demoAccounts.find(
      acc => acc.email === formData.emailOrPhone && acc.password === formData.password
    );

    setTimeout(() => {
      setIsLoading(false);
      
      if (demoAccount) {
        toast({
          title: "Login Berhasil!",
          description: `Selamat datang, ${demoAccount.role}`,
        });
        navigate(demoAccount.redirect);
      } else {
        // Default navigation for any other login
        toast({
          title: "Login Berhasil!",
          description: "Selamat datang di MPJ Apps",
        });
        navigate("/media-dashboard");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
      {/* Header with Logo */}
      <div className="flex-shrink-0 pt-8 pb-4 px-6 text-center">
        <img src={logoMpj} alt="MPJ" className="h-12 w-12 mx-auto mb-3 object-contain" />
        <h1 className="text-xl font-bold text-white">Selamat Datang</h1>
        <p className="text-sm text-emerald-200/70 mt-1">Masuk ke akun MPJ Apps</p>
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-card rounded-t-3xl px-6 pt-6 pb-8 mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailOrPhone" className="text-sm text-foreground">Email atau No. HP</Label>
            <Input
              id="emailOrPhone"
              type="text"
              placeholder="email@example.com atau 08xxx"
              value={formData.emailOrPhone}
              onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
              className="h-12 rounded-xl border-border/50 bg-muted/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 rounded-xl border-border/50 pr-12 bg-muted/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
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
              <label htmlFor="remember" className="text-sm text-foreground">
                Ingat saya
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm text-amber-500 font-medium">
              Lupa password?
            </Link>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {isLoading ? "Memproses..." : "Masuk"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        {/* Klaim Akun */}
        <div className="mt-5 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-sm text-foreground text-center">
            <span className="font-medium">Khodim Lama?</span>{" "}
            <Link to="/claim-account" className="text-amber-500 font-semibold">
              Klaim Akun di sini
            </Link>
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/30"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-card text-sm text-muted-foreground">atau</span>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground">
          Baru di MPJ Apps?{" "}
          <Link to="/register" className="text-emerald-500 font-semibold">
            Daftar Pesantren Baru
          </Link>
        </p>

        {/* Demo Accounts Info */}
        <div className="mt-6 p-3 bg-muted/30 rounded-xl">
          <p className="text-xs text-center text-muted-foreground mb-2 font-medium">Demo Akun:</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• admin@mpj.com / admin123 (Super Admin)</p>
            <p>• regional@mpj.com / regional123 (Regional)</p>
            <p>• media@mpj.com / media123 (Koordinator)</p>
            <p>• kru@mpj.com / kru123 (Kru)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;