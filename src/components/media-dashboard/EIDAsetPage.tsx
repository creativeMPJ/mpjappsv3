import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Lock, Award, IdCard, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { VirtualCharter } from "@/components/shared/VirtualCharter";
import { VirtualMemberCard, PhysicalMemberCard } from "@/components/shared/MemberCard";
import { formatNIP } from "@/lib/id-utils";

type ProfileLevel = "basic" | "silver" | "gold" | "platinum";

interface EIDAsetPageProps {
  paymentStatus: "paid" | "unpaid";
  profileLevel: ProfileLevel;
  debugProfile?: {
    nip?: string;
    nama_pesantren?: string;
    nama_pengasuh?: string;
    alamat_singkat?: string;
    nama_media?: string;
    profile_level?: string;
  };
}

/**
 * E-ID & Aset Page
 * - Piagam Pesantren: Single Virtual Charter (highest tier achieved)
 * - E-ID Koordinator: Virtual and Physical Member Card for admin
 */
const EIDAsetPage = ({ 
  paymentStatus, 
  profileLevel,
  debugProfile 
}: EIDAsetPageProps) => {
  const [activeTab, setActiveTab] = useState("piagam");

  const displayNIP = debugProfile?.nip || "2601001";
  const displayName = debugProfile?.nama_pesantren || "Pondok Pesantren Al-Hikmah";
  const displayAddress = debugProfile?.alamat_singkat || "Jl. Raya No. 123, Malang";
  const displayMediaName = debugProfile?.nama_media || displayName;
  const adminName = debugProfile?.nama_pengasuh || "Ahmad Fauzi";

  // Get highest achieved level
  const getHighestLevel = (): "silver" | "gold" | "platinum" => {
    if (profileLevel === "platinum") return "platinum";
    if (profileLevel === "gold") return "gold";
    return "silver";
  };

  const highestLevel = getHighestLevel();
  const canAccessEID = paymentStatus === "paid" && (profileLevel === "gold" || profileLevel === "platinum");

  const getLevelBadgeColor = () => {
    switch (highestLevel) {
      case "platinum": return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white";
      case "gold": return "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900";
      default: return "bg-gradient-to-r from-slate-400 to-slate-500 text-white";
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download Piagam",
      description: "Fitur download sedang dalam pengembangan",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">E-ID & Aset Digital</h1>
          <p className="text-slate-500">Piagam dan kartu identitas digital lembaga</p>
        </div>
        <Badge className={getLevelBadgeColor()}>
          Level: {highestLevel.charAt(0).toUpperCase() + highestLevel.slice(1)}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100">
          <TabsTrigger 
            value="piagam" 
            className="data-[state=active]:bg-[#166534] data-[state=active]:text-white gap-2"
          >
            <Award className="h-4 w-4" />
            Piagam Pesantren
          </TabsTrigger>
          <TabsTrigger 
            value="eid" 
            className="data-[state=active]:bg-[#166534] data-[state=active]:text-white gap-2"
          >
            <IdCard className="h-4 w-4" />
            E-ID Koordinator
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Piagam Pesantren */}
        <TabsContent value="piagam" className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-[#166534]" />
                Piagam Virtual Keanggotaan
              </CardTitle>
              <p className="text-sm text-slate-500">
                Piagam digital dengan desain YouTube Play Button Style sesuai level tertinggi
              </p>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm mx-auto">
                <VirtualCharter
                  level={highestLevel}
                  noId={displayNIP}
                  namaMedia={displayMediaName}
                  alamat={displayAddress}
                />
              </div>
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={handleDownload}
                  className="bg-[#166534] hover:bg-[#14532d]"
                  disabled={paymentStatus === "unpaid"}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Piagam
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: E-ID Koordinator */}
        <TabsContent value="eid" className="space-y-6">
          {!canAccessEID ? (
            <Card className="bg-slate-100 relative overflow-hidden">
              <div className="blur-md opacity-50 pointer-events-none p-8">
                <div className="aspect-[1.6/1] max-w-md mx-auto bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60">
                <div className="bg-white rounded-full p-4 mb-4 shadow-lg">
                  <Lock className="h-12 w-12 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Fitur Terkunci</h3>
                <p className="text-slate-300 text-center mb-4 px-8 max-w-md">
                  {paymentStatus === "unpaid" 
                    ? "Lunasi administrasi untuk mengakses E-ID Card" 
                    : "Lengkapi profil ke level Gold untuk mengakses E-ID Card"}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Virtual Card */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[#166534]" />
                    Kartu Virtual (Landscape)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VirtualMemberCard
                    noId={displayNIP}
                    name={adminName}
                    asalMedia={displayMediaName}
                    alamat={displayAddress}
                    role="Koordinator"
                    xp={150}
                    socialMedia={{
                      instagram: "@mpj_jatim",
                      youtube: "Media Pondok Jatim"
                    }}
                  />
                </CardContent>
              </Card>

              {/* Physical Card Preview */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-[#166534]" />
                    Pratinjau Fisik (Portrait)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PhysicalMemberCard
                    noId={displayNIP}
                    name={adminName}
                    asalMedia={displayMediaName}
                    alamat={displayAddress}
                    role="Koordinator"
                    xp={150}
                    socialMedia={{
                      instagram: "@mpj_jatim",
                      youtube: "Media Pondok Jatim"
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {canAccessEID && (
            <div className="flex justify-center">
              <Button 
                onClick={handleDownload}
                className="bg-[#166534] hover:bg-[#14532d]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Layout Cetak (PDF)
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EIDAsetPage;
