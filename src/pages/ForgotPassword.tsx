import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone, Loader2, CheckCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";
import { z } from "zod";

const identifierSchema = z.object({
    identifier: z.string()
        .trim()
        .min(1, "Email atau No. WhatsApp wajib diisi")
        .refine((val) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(val)) return true;
            const phoneRegex = /^(0|62)\d{9,13}$/;
            const cleanPhone = val.replace(/\D/g, '');
            return phoneRegex.test(cleanPhone);
        }, "Format email atau nomor WhatsApp tidak valid"),
});

const ForgotPassword = () => {
    const [identifier, setIdentifier] = useState("");
    const [errors, setErrors] = useState<{ identifier?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { toast } = useToast();
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3001";

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

        const result = identifierSchema.safeParse({ identifier });

        if (!result.success) {
            const fieldErrors: { identifier?: string } = {};
            result.error.errors.forEach((err) => {
                fieldErrors.identifier = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setIsLoading(true);

        try {
            const email = formatIdentifier(identifier);

            const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: "Gagal",
                    description: data.message || "Terjadi kesalahan. Silakan coba lagi.",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            setIsSubmitted(true);
            toast({
                title: "Berhasil!",
                description: "Permintaan reset password telah dikirim.",
            });
        } catch {
            toast({
                title: "Terjadi Kesalahan",
                description: "Tidak dapat terhubung ke server. Silakan coba lagi.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Success state
    if (isSubmitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
                <div className="mb-6">
                    <img src={logoMpj} alt="MPJ Logo" className="h-16 w-auto" />
                </div>

                <Card className="w-full max-w-md shadow-lg border-border/50">
                    <CardContent className="pt-8 pb-8">
                        <div className="text-center space-y-4">
                            {/* Success Icon */}
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="h-10 w-10 text-emerald-500" />
                            </div>

                            <h2 className="text-xl font-bold text-foreground">
                                Permintaan Terkirim!
                            </h2>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Jika akun dengan <span className="font-semibold text-foreground">{identifier}</span> terdaftar,
                                admin kami akan segera memproses permintaan reset password Anda.
                            </p>

                            {/* Info Card */}
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left">
                                <p className="text-sm font-medium text-foreground mb-2">Langkah selanjutnya:</p>
                                <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                                    <li>Admin akan memverifikasi identitas Anda</li>
                                    <li>Password baru akan dikirim via WhatsApp</li>
                                    <li>Segera ganti password setelah login</li>
                                </ol>
                            </div>

                            {/* Info Box */}
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                                <p className="text-xs text-foreground">
                                    Proses biasanya selesai dalam <span className="font-semibold">1x24 jam kerja</span>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="w-full h-11 rounded-xl border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                    disabled
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    Hubungi admin MPJ melalui kanal resmi
                                </Button>

                                <Link to="/login">
                                    <Button className="w-full h-11 rounded-xl mt-2">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Kembali ke Login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
            {/* Logo */}
            <div className="mb-6">
                <img src={logoMpj} alt="MPJ Logo" className="h-16 w-auto" />
            </div>

            {/* Forgot Password Card */}
            <Card className="w-full max-w-md shadow-lg border-border/50">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl font-bold">Lupa Kata Sandi?</CardTitle>
                    <CardDescription>
                        Masukkan email atau nomor WhatsApp yang terdaftar untuk memulai proses reset password
                    </CardDescription>
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
                                value={identifier}
                                onChange={(e) => {
                                    setIdentifier(e.target.value);
                                    if (errors.identifier) setErrors({});
                                }}
                                className={`h-12 ${errors.identifier ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                autoComplete="email"
                                autoFocus
                            />
                            {errors.identifier && (
                                <p className="text-sm text-destructive">{errors.identifier}</p>
                            )}
                        </div>

                        {/* Info */}
                        <div className="bg-muted/50 border border-border/50 rounded-xl p-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Kami akan mengirimkan permintaan reset password ke admin.
                                Password baru akan dikirim melalui WhatsApp yang terdaftar.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Memproses...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Kirim Permintaan Reset
                                    <Send className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke halaman Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
