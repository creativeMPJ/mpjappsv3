import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, Shield, Lock, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { VirtualMemberCard, PhysicalMemberCard } from "@/components/shared/MemberCard";
import { formatNIAM } from "@/lib/id-utils";
import { XPLevelBadge } from "@/components/shared/LevelBadge";
import { getTransactionXPTotal } from "@/lib/v4-core-rules";
import { useAuth } from "@/contexts/AuthContext";
import { isPaymentActive } from "@/features/v4/utils";
import { canShowCrewIdentity, fieldOrDash, getCrewStatusLabel } from "./crew-state";

interface CrewEIDCardPageProps {
  canAccessEID: boolean;
  onBack: () => void;
  // Crew data from crews table - required for proper E-ID card generation
  debugCrew?: {
    nama?: string;
    niam?: string | null;
    jabatan?: string;
    xp_level?: number;
    xpTotal?: number;
    xp_total?: number;
    transactionXpTotal?: number;
    transaction_xp_total?: number;
    status?: string | null;
    paymentVerified?: boolean;
    skill?: string[];
    photoUrl?: string;
    // Institution context
    institution_name?: string;
    pesantren_asal?: string;
    alamat_asal?: string;
  };
}

const CrewEIDCardPage = ({ canAccessEID, debugCrew: propDebugCrew }: CrewEIDCardPageProps) => {
  const location = useLocation();
  const { profile } = useAuth();

  // Support debug mode via location.state OR props
  const locationState = location.state as { debugCrew?: CrewEIDCardPageProps["debugCrew"]; isDebugMode?: boolean } | null;
  const stateDebugCrew = locationState?.debugCrew;
  const debugCrew = propDebugCrew || stateDebugCrew;
  const paymentActive = isPaymentActive(profile?.status_payment);
  const crewNIAM = debugCrew?.niam ?? null;
  const canRenderCard = canAccessEID && canShowCrewIdentity(debugCrew?.status, profile?.status_payment, crewNIAM);

  const crewData = {
    name: fieldOrDash(debugCrew?.nama),
    noId: crewNIAM ? formatNIAM(crewNIAM, true) : "-",
    asalMedia: fieldOrDash(debugCrew?.institution_name || debugCrew?.pesantren_asal),
    alamatPesantren: fieldOrDash(debugCrew?.alamat_asal),
    role: fieldOrDash(debugCrew?.jabatan),
    xp: getTransactionXPTotal(debugCrew as unknown as Record<string, unknown>),
    photoUrl: debugCrew?.photoUrl,
  };

  const handleDownloadPDF = () => {
    if (!paymentActive) {
      toast({
        title: "Belum aktif",
        description: "Aktifkan akun terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Fitur akan segera tersedia",
      description: "Download E-ID belum tersedia.",
    });
  };

  if (!canRenderCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <Card className="w-full max-w-sm bg-muted relative overflow-hidden">
          <div className="blur-md opacity-50 pointer-events-none">
            <CardContent className="p-6">
              <div className="aspect-[85.6/53.98] bg-gradient-to-br from-primary to-primary/80 rounded-xl p-4">
                <div className="h-full flex flex-col justify-between">
                  <div className="text-center">
                    <div className="h-3 bg-primary-foreground/20 rounded w-20 mx-auto mb-1" />
                    <div className="h-2 bg-primary-foreground/20 rounded w-16 mx-auto" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-primary-foreground/20 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-primary-foreground/20 rounded w-3/4" />
                      <div className="h-2 bg-primary-foreground/20 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/60 backdrop-blur-sm">
            <div className="bg-card rounded-full p-4 mb-4 shadow-lg">
              <Lock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-primary-foreground mb-2">Fitur Terkunci</h3>
            <p className="text-primary-foreground/80 text-center text-sm mb-6 px-8">
              {paymentActive
                ? "Identitas resmi akan tampil setelah aktivasi selesai."
                : "Aktifkan akun terlebih dahulu."}
            </p>
            <Button
              disabled={!paymentActive}
              className={paymentActive ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-slate-400 hover:bg-slate-400 cursor-not-allowed"}
            >
              <Shield className="h-4 w-4 mr-2" />
              {paymentActive ? getCrewStatusLabel(debugCrew?.status) : "Aktifkan akun terlebih dahulu"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Tabs defaultValue="virtual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="virtual">Kartu Virtual</TabsTrigger>
          <TabsTrigger value="physical">Kartu Fisik</TabsTrigger>
        </TabsList>

        {/* TAB 1: Kartu Virtual - Landscape 16:9 */}
        <TabsContent value="virtual" className="space-y-4">
          {/* XP Badge Display */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Militansi Level:</span>
            <XPLevelBadge xp={crewData.xp} size="md" showXP />
          </div>
          
          {/* Virtual Member Card - Landscape with flip */}
          <VirtualMemberCard
            noId={crewData.noId}
            name={crewData.name}
            asalMedia={crewData.asalMedia}
            alamat={crewData.alamatPesantren}
            role={crewData.role}
            xp={crewData.xp}
          />

          {/* Info Notice */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 max-w-md mx-auto">
            <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Kartu Virtual</p>
              <p className="text-amber-700 text-xs mt-0.5">
                Tanpa foto & barcode untuk tampilan aplikasi. Klik kartu untuk melihat sisi belakang.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Kartu Fisik */}
        <TabsContent value="physical" className="space-y-4">
          {/* Physical Member Card - Portrait with flip */}
          <PhysicalMemberCard
            noId={crewData.noId}
            name={crewData.name}
            asalMedia={crewData.asalMedia}
            alamat={crewData.alamatPesantren}
            role={crewData.role}
            xp={crewData.xp}
            photoUrl={crewData.photoUrl}
          />

          {/* Download Button */}
          <Button 
            onClick={handleDownloadPDF}
            disabled={!paymentActive}
            className={paymentActive ? "w-full max-w-[280px] mx-auto flex bg-primary hover:bg-primary/90" : "w-full max-w-[280px] mx-auto flex bg-slate-400 hover:bg-slate-400 cursor-not-allowed"}
          >
            <Download className="h-4 w-4 mr-2" />
            {paymentActive ? "Segera Hadir" : "Aktifkan akun terlebih dahulu"}
          </Button>

          {/* Physical Card Info */}
          <Card className="max-w-[280px] mx-auto">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-2">Layout Kartu Cetak</h3>
              <p className="text-sm text-muted-foreground">
                Format kartu fisik akan tersedia setelah data identitas lengkap.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Card Info Section */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold text-foreground">Informasi Kartu Anggota</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status Keanggotaan</span>
              <span className="font-medium text-accent">{paymentActive ? "Aktif" : "Belum aktif"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Berlaku Hingga</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. ID</span>
              <span className="font-mono font-medium">{crewData.noId}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrewEIDCardPage;
