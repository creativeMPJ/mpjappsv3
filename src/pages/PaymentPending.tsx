import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, Home, MessageCircle } from "lucide-react";
import logoMpj from "@/assets/logo-mpj.png";

const PaymentPending = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/20 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={logoMpj} alt="Media Pondok Jawa Timur" className="h-14 object-contain" />
          </div>

          {/* Status Icon */}
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-amber-500" />
          </div>

          {/* Header */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Menunggu Konfirmasi ⏳
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Bukti pembayaran Anda sedang diverifikasi oleh Admin Pusat
          </p>

          {/* Status Card */}
          <Card className="bg-muted/30 border-border/50 mb-6">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Bukti Transfer Terkirim</p>
                  <p className="text-xs text-muted-foreground">Selesai</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Verifikasi Admin</p>
                  <p className="text-xs text-muted-foreground">Dalam proses (1x24 jam)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-50">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Akun Aktif</p>
                  <p className="text-xs text-muted-foreground">Menunggu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-foreground">
              Setelah pembayaran dikonfirmasi, Anda akan mendapat notifikasi dan dapat mengakses fitur lengkap MPJ Apps termasuk <span className="font-semibold">E-ID Card</span>.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link to="/">
              <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>

            <a 
              href="https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20ingin%20konfirmasi%20pembayaran%20MPJ%20Apps"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full h-11 rounded-xl border-border/50">
                <MessageCircle className="mr-2 h-4 w-4" />
                Hubungi Admin via WhatsApp
              </Button>
            </a>
          </div>

          {/* Login Link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Sudah dikonfirmasi?{" "}
            <Link to="/login" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
              Masuk ke Akun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;