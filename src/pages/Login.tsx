import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ArrowRight, Phone, Lock, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import logoMpj from "@/assets/logo-mpj.png";
import { z } from "zod";

// Validation schema
const loginSchema = z.object({
  identifier: z.string()
    .trim()
    .min(1, "Email atau No. WhatsApp wajib diisi")
    .refine((val) => {
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(val)) return true;
      
      // Check if it's a valid Indonesian phone number (08xx or 628xx)
      const phoneRegex = /^(0|62)\d{9,13}$/;
      const cleanPhone = val.replace(/\D/g, '');
      return phoneRegex.test(cleanPhone);
    }, "Format email atau nomor WhatsApp tidak valid"),
  password: z.string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password maksimal 100 karakter"),
});

/**
 * LOGIN PAGE
 * 
 * Authenticates user via local API (/api/auth/login).
 */
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, setAuthToken, refreshAuth } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3001";

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user && profile) {
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
      case 'admin_finance':
        navigate('/finance', { replace: true });
        break;
      case 'user':
      default:
        navigate('/check-institution', { replace: true });
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
    setErrors({});
    
    // Validate with zod
    const result = loginSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: { identifier?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as 'identifier' | 'password';
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const email = formatIdentifier(formData.identifier);

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        toast({
          title: "Login Gagal",
          description: "Email/No WA atau password salah",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setAuthToken(data.token);
      await refreshAuth();
      redirectToDashboard(data.user.role);
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
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Memuat...</p>
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
                onChange={(e) => {
                  setFormData({ ...formData, identifier: e.target.value });
                  if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }));
                }}
                className={`h-12 ${errors.identifier ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                autoComplete="email"
              />
              {errors.identifier && (
                <p className="text-sm text-destructive">{errors.identifier}</p>
              )}
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
                  placeholder="Masukkan password (min. 6 karakter)"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`h-12 pr-12 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
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

        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
