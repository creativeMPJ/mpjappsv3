import { Camera, FileText, Heart, IdCard, Lock, MapPin, MessageCircle, Upload, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { formatNIAM } from "@/lib/id-utils";
import { useAuth } from "@/contexts/AuthContext";
import { getTransactionXPTotal } from "@/lib/v4-core-rules";
import { isPaymentActive } from "@/features/v4/utils";
import { fieldOrDash, getCrewStatusClass, getCrewStatusLabel } from "./crew-state";

type ViewType = "beranda" | "leaderboard" | "hub" | "event" | "eid" | "profil";

interface CrewProfilPageProps {
  onNavigate: (view: ViewType) => void;
  debugCrew?: {
    nama?: string;
    niam?: string;
    jabatan?: string;
    xp_level?: number;
    xpTotal?: number;
    xp_total?: number;
    transactionXpTotal?: number;
    transaction_xp_total?: number;
    status?: string | null;
    paymentVerified?: boolean;
    skill?: string[];
    institution_name?: string;
    pesantren_asal?: string;
    alamat_asal?: string;
    nama_panggilan?: string;
    whatsapp?: string;
    prinsip_hidup?: string;
  };
}

const CrewProfilPage = ({ onNavigate, debugCrew }: CrewProfilPageProps) => {
  const { profile } = useAuth();
  const paymentActive = isPaymentActive(profile?.status_payment);
  const niam = debugCrew?.niam ?? null;
  const xpTotal = getTransactionXPTotal(debugCrew as unknown as Record<string, unknown>);
  const initials = debugCrew?.nama ? debugCrew.nama.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "-";

  const handleUnavailable = () => {
    toast({
      title: "Fitur akan segera tersedia",
      description: "Perubahan profil belum tersedia saat ini.",
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-140px)]">
      <div className="p-4 space-y-4 pb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold text-foreground">{fieldOrDash(debugCrew?.nama)}</h2>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Badge className="bg-primary/10 text-primary">{fieldOrDash(debugCrew?.jabatan)}</Badge>
                <Badge variant="outline" className={getCrewStatusClass(debugCrew?.status)}>
                  {getCrewStatusLabel(debugCrew?.status)}
                </Badge>
              </div>

              <div className="mt-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs text-emerald-600 uppercase tracking-wider text-center">NIAM</p>
                <p className="text-xl font-mono font-bold text-emerald-800 tracking-widest text-center">
                  {niam ? formatNIAM(niam, true) : "-"}
                </p>
                {!niam && (
                  <Badge variant="outline" className="mt-2 w-full justify-center border-slate-300 bg-slate-50 text-slate-600">
                    Belum Aktif
                  </Badge>
                )}
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {xpTotal > 0 ? `${xpTotal} XP` : "Belum ada aktivitas"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-r from-primary/10 to-accent/10 transition-shadow ${paymentActive ? "cursor-pointer hover:shadow-md" : "cursor-not-allowed opacity-70"}`}
          onClick={() => {
            if (paymentActive) {
              onNavigate("eid");
              return;
            }

            toast({
              title: "Belum aktif",
              description: "Aktifkan akun terlebih dahulu",
              variant: "destructive",
            });
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <IdCard className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">E-ID Card</h3>
                <p className="text-sm text-muted-foreground">
                  {paymentActive ? "Identitas resmi akan tampil setelah aktivasi selesai" : "Aktifkan akun terlebih dahulu"}
                </p>
              </div>
              <Badge className="bg-accent text-accent-foreground text-xs">E-ID</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Data Pribadi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input value={fieldOrDash(debugCrew?.nama)} disabled />
              </div>
              <div className="space-y-2">
                <Label>Nama Panggilan</Label>
                <Input value={fieldOrDash(debugCrew?.nama_panggilan)} disabled />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  No. WhatsApp
                </Label>
                <Input value={fieldOrDash(debugCrew?.whatsapp)} disabled />
              </div>
              <div className="space-y-2">
                <Label>Pesantren Asal</Label>
                <Input value={fieldOrDash(debugCrew?.pesantren_asal || debugCrew?.institution_name)} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Alamat Asal
              </Label>
              <Textarea value={fieldOrDash(debugCrew?.alamat_asal)} disabled rows={2} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                Prinsip Hidup
              </Label>
              <Textarea value={fieldOrDash(debugCrew?.prinsip_hidup)} disabled rows={2} />
            </div>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Segera Hadir
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Manajemen Keahlian</CardTitle>
          </CardHeader>
          <CardContent>
            {debugCrew?.skill && debugCrew.skill.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {debugCrew.skill.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm font-medium text-foreground">Belum ada data</p>
                <p className="mt-1 text-xs text-muted-foreground">Data akan tampil setelah tersedia</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Tim Saya</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">Belum ada data</p>
              <p className="mt-1 text-xs text-muted-foreground">Data akan tampil setelah tersedia</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Arsip & Berkas Legal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[{ icon: Camera, label: "Update Foto Profil" }, { icon: Upload, label: "Upload CV / Portofolio" }].map((item) => (
              <div key={item.label} className="border-2 border-dashed border-border rounded-lg p-4 opacity-70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">Segera Hadir</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button className="w-full bg-slate-400 hover:bg-slate-400 cursor-not-allowed" onClick={handleUnavailable} disabled>
          Segera Hadir
        </Button>
      </div>
    </ScrollArea>
  );
};

export default CrewProfilPage;
