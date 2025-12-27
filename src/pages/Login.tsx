import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * LOGIN PAGE
 * 
 * Authenticates user via Supabase Auth.
 * After successful login, redirects based on role:
 * - admin_pusat → /admin-pusat
 * - admin_regional → /admin-regional
 * - user → /user
 * 
 * Pending/rejected status handling is done by ProtectedRoute.
 */
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user && profile) {
      // Status gates are handled by ProtectedRoute
      // Here we just redirect to the appropriate dashboard
      redirectToDashboard(profile.role);
    }
  }, [user, profile, authLoading]);

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case 'admin_pusat':
        navigate('/admin-pusat', { replace: true });
        break;
      case 'admin_regional':
        navigate('/admin-regional', { replace: true });
        break;
      case 'user':
      default:
        navigate('/user', { replace: true });
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon masukkan email dan password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Login Gagal",
          description: error.message === "Invalid login credentials" 
            ? "Email atau password salah" 
            : error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast({
          title: "Login Berhasil!",
          description: "Selamat datang di MPJ Apps",
        });
        // Auth context will update and useEffect will redirect
      }
    } catch (error) {
      toast({
        title: "Terjadi Kesalahan",
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-white">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary via-primary/90 to-primary">
      {/* Header */}
      <div className="flex-shrink-0 pt-10 pb-6 px-6 text-center">
        <h1 className="text-2xl font-bold text-primary-foreground">Selamat Datang</h1>
        <p className="text-sm text-primary-foreground/70 mt-1">Masuk ke akun MPJ Apps</p>
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-card rounded-t-3xl px-6 pt-6 pb-8 mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 rounded-xl border-border/50 bg-muted/30"
              autoComplete="email"
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
                autoComplete="current-password"
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
            Buat Akun Baru
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
