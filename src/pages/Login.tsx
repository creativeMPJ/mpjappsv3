import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ArrowRight, Phone, Lock, KeyRound, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logoMpj from "@/assets/logo-mpj.png";

/**
 * LOGIN PAGE
 * 
 * Authenticates user via Supabase Auth.
 * After successful login, checks pesantren_claims table to determine redirect:
 * - approved/pusat_approved -> dashboard
 * - pending/regional_approved -> verification-pending
 * - no claim -> check-institution
 */
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCheckingClaim, setIsCheckingClaim] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();

  const handleSeedUsers = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-dev-users');
      
      if (error) {
        toast({
          title: "Seed Gagal",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Seed Berhasil!",
        description: `${data.results?.length || 0} akun dummy berhasil dibuat/diupdate`,
      });
      console.log("Seed results:", data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menjalankan seed function",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  /**
   * Check pesantren_claims and redirect based on claim status
   * This is the core logic for "1 User = 1 Pesantren" workflow
   */
  const checkClaimAndRedirect = async (userId: string, userRole: string) => {
    setIsCheckingClaim(true);
    
    try {
      // Admin roles bypass claim check - go directly to their dashboards
      if (userRole === 'admin_pusat' || userRole === 'admin_regional' || userRole === 'admin_finance') {
        redirectToDashboard(userRole);
        return;
      }

      // For regular users, check pesantren_claims
      const { data: claim, error } = await supabase
        .from('pesantren_claims')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking claim:', error);
        // On error, default to check-institution
        navigate('/check-institution', { replace: true });
        return;
      }

      if (!claim) {
        // No claim exists - user needs to register pesantren
        navigate('/check-institution', { replace: true });
        return;
      }

      // Route based on claim status
      switch (claim.status) {
        case 'approved':
        case 'pusat_approved':
          // Full access - go to dashboard
          navigate('/user', { replace: true });
          break;
        case 'pending':
        case 'regional_approved':
          // Still in verification - go to pending page
          navigate('/verification-pending', { replace: true });
          break;
        case 'rejected':
          // Claim rejected - show toast and logout
          toast({
            title: "Klaim Ditolak",
            description: "Pengajuan klaim pesantren Anda ditolak. Silakan hubungi admin.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          break;
        default:
          navigate('/check-institution', { replace: true });
      }
    } catch (error) {
      console.error('Error in claim check:', error);
      navigate('/check-institution', { replace: true });
    } finally {
      setIsCheckingClaim(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user && profile) {
      checkClaimAndRedirect(user.id, profile.role);
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
      case 'admin_finance':
        navigate('/finance', { replace: true });
        break;
      case 'user':
      default:
        navigate('/user', { replace: true });
        break;
    }
  };

  // Convert WhatsApp number to email format if needed
  const formatIdentifier = (identifier: string): string => {
    if (/^(0|62)\d+$/.test(identifier.replace(/\D/g, ''))) {
      const phoneNumber = identifier.replace(/\D/g, '');
      const normalizedPhone = phoneNumber.startsWith('62') 
        ? '0' + phoneNumber.slice(2) 
        : phoneNumber;
      return `${normalizedPhone}@mpj.local`;
    }
    return identifier;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.identifier || !formData.password) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon masukkan email/No WA dan password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const email = formatIdentifier(formData.identifier);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (error) {
        let errorMessage = "Terjadi kesalahan";
        
        if (error.message === "Invalid login credentials") {
          errorMessage = "Email/No WA atau password salah";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email belum dikonfirmasi";
        } else {
          errorMessage = error.message;
        }
        
        toast({
          title: "Login Gagal",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast({
          title: "Login Berhasil!",
          description: "Memeriksa status akun...",
        });
        // Auth context will update and useEffect will trigger checkClaimAndRedirect
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

  // Show loading if auth is initializing or checking claim
  if (authLoading || isCheckingClaim) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">
            {isCheckingClaim ? "Memeriksa status kepemilikan..." : "Memuat..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      {/* Logo */}
      <div className="mb-6">
        <img src={logoMpj} alt="MPJ Logo" className="h-16 w-auto" />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Selamat Datang</CardTitle>
          <CardDescription>Masuk ke akun MPJ Apps Anda</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / No WA */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Email atau No. WhatsApp
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="contoh@email.com atau 08xxxxxxxxxx"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                className="h-12"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline font-medium"
              >
                Lupa Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Masuk
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-card text-sm text-muted-foreground">atau</span>
            </div>
          </div>

          {/* Legacy Claim Link */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Khodim Lama?</p>
                <Link 
                  to="/legacy-claim" 
                  className="text-sm text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                >
                  Klaim Akun Legacy di sini →
                </Link>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Baru di MPJ Apps?{" "}
            <Link to="/check-institution" className="text-primary font-semibold hover:underline">
              Daftar Sekarang
            </Link>
          </p>

          {/* Dev Seed Button */}
          <div className="mt-6 pt-4 border-t border-dashed border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleSeedUsers}
              disabled={isSeeding}
              className="w-full text-xs h-9 text-muted-foreground hover:text-foreground"
            >
              {isSeeding ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Seeding...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  SEED DUMMY USERS (DEV)
                </span>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Password: password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;