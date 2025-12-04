import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import logoMpj from "@/assets/logo-mpj.png";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/20 via-background to-accent/5 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card rounded-3xl shadow-soft p-8 border border-border/50">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logoMpj} alt="Media Pondok Jawa Timur" className="h-16 object-contain" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Petualangan Dimulai di Sini 🚀
            </h1>
            <p className="text-muted-foreground">
              Daftar dan bergabung dengan komunitas MPJ
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                className="h-12 rounded-xl border-border/50 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                className="h-12 rounded-xl border-border/50 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">No. HP / WhatsApp</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-4 h-12 rounded-xl border border-border/50 bg-muted/30">
                  <span className="text-sm font-medium text-foreground">+62</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="8123456789"
                  className="h-12 rounded-xl border-border/50 focus:border-primary flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat password yang kuat"
                  className="h-12 rounded-xl border-border/50 focus:border-primary pr-12"
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

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox id="terms" className="mt-1" />
              <label htmlFor="terms" className="text-sm text-foreground cursor-pointer leading-relaxed">
                Saya setuju dengan{" "}
                <Link to="/privacy-policy" className="text-accent hover:text-accent/80">
                  kebijakan privasi
                </Link>
                {" "}dan{" "}
                <Link to="/terms" className="text-accent hover:text-accent/80">
                  syarat & ketentuan
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-glow">
              Daftar Sekarang
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-8 text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;