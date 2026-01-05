import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, Shield, Lock, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { VirtualMemberCard, PhysicalMemberCard } from "@/components/shared/MemberCard";
import { formatNIAM, getXPLevel } from "@/lib/id-utils";
import { XPLevelBadge } from "@/components/shared/LevelBadge";

interface CrewEIDCardPageProps {
  isGold: boolean;
  onBack: () => void;
  debugCrew?: {
    nama?: string;
    niam?: string;
    jabatan?: string;
    xp_level?: number;
    skill?: string[];
    institution_name?: string;
    pesantren_asal?: string;
    alamat_asal?: string;
  };
}

const CrewEIDCardPage = ({ isGold, onBack, debugCrew: propDebugCrew }: CrewEIDCardPageProps) => {
  const location = useLocation();

  // Support debug mode via location.state OR props
  const stateDebugCrew = (location.state as any)?.debugCrew;
  const isDebugMode = (location.state as any)?.isDebugMode || !!propDebugCrew;
  const debugCrew = propDebugCrew || stateDebugCrew;

  const userData = isDebugMode && debugCrew ? {
    name: debugCrew.nama,
    noId: debugCrew.niam || "AN260100102",
    asalMedia: debugCrew.institution_name || debugCrew.pesantren_asal || "PP. Al-Hikmah Malang",
    alamatPesantren: debugCrew.alamat_asal || "Jl. Raya Pesantren No. 45, Singosari, Malang, Jawa Timur",
    role: debugCrew.jabatan || "Kru Media",
    xp: debugCrew.xp_level || 2500,
    skills: debugCrew.skill || ["Fotografer", "Editor"],
    socialMedia: {
      facebook: "@mpj.alhikmah",
      instagram: "@mpj_alhikmah",
      twitter: "@mpj_alhikmah",
      youtube: "MPJ Al-Hikmah",
    },
  } : {
    name: "Ahmad Fauzi",
    noId: "AN260100101",
    asalMedia: "PP. Nurul Huda",
    alamatPesantren: "Jl. Raya Pesantren No. 45, Singosari, Malang, Jawa Timur",
    role: "Kru Media",
    xp: 150,
    skills: ["Fotografer", "Editor", "Desainer"],
    socialMedia: {
      facebook: "@mpj.nurulhuda",
      instagram: "@mpj_nurulhuda",
      twitter: "@mpj_nurulhuda",
      youtube: "MPJ Nurul Huda",
    },
  };

  const xpLevel = getXPLevel(userData.xp);

  const handleDownloadPDF = () => {
    toast({
      title: "Download PDF",
      description: "Layout cetak sedang diproses untuk diunduh...",
    });
  };

  if (!isGold && !isDebugMode) {
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
              Upgrade ke status Gold untuk mengakses E-Kartu Anggota
            </p>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Shield className="h-4 w-4 mr-2" />
              Upgrade to Gold
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
          <TabsTrigger value="physical">Pratinjau Fisik</TabsTrigger>
        </TabsList>

        {/* TAB 1: Kartu Virtual - Landscape 16:9 */}
        <TabsContent value="virtual" className="space-y-4">
          {/* XP Badge Display */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Militansi Level:</span>
            <XPLevelBadge xp={userData.xp} size="md" showXP />
          </div>
          
          {/* Virtual Member Card - Landscape with flip */}
          <VirtualMemberCard
            noId={userData.noId}
            name={userData.name}
            asalMedia={userData.asalMedia}
            alamat={userData.alamatPesantren}
            role={userData.role}
            xp={userData.xp}
            socialMedia={userData.socialMedia}
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

        {/* TAB 2: Pratinjau Fisik - Portrait for Events */}
        <TabsContent value="physical" className="space-y-4">
          {/* Physical Member Card - Portrait with flip */}
          <PhysicalMemberCard
            noId={userData.noId}
            name={userData.name}
            asalMedia={userData.asalMedia}
            alamat={userData.alamatPesantren}
            role={userData.role}
            xp={userData.xp}
            socialMedia={userData.socialMedia}
          />

          {/* Download Button */}
          <Button 
            onClick={handleDownloadPDF}
            className="w-full max-w-[280px] mx-auto flex bg-primary hover:bg-primary/90"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Layout Cetak (PDF)
          </Button>

          {/* Physical Card Info */}
          <Card className="max-w-[280px] mx-auto">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-2">Layout Kartu Cetak</h3>
              <p className="text-sm text-muted-foreground">
                Format kartu fisik (portrait) untuk keperluan cetak dan event. 
                Dilengkapi dengan foto dan QR Code untuk proses absensi.
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
              <span className="font-medium text-accent">Aktif</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Berlaku Hingga</span>
              <span className="font-medium">31 Desember 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. ID</span>
              <span className="font-mono font-medium">{userData.noId}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrewEIDCardPage;
