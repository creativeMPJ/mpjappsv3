import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Lock, Award, IdCard, Eye, Info, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { VirtualCharter } from "@/components/shared/VirtualCharter";
import { VirtualMemberCard, PhysicalMemberCard } from "@/components/shared/MemberCard";
import { formatNIP, formatNIAM } from "@/lib/id-utils";
import { downloadElementAsJPG, generatePiagamFilename, generateEIDFilename } from "@/lib/charter-download";

type ProfileLevel = "basic" | "silver" | "gold" | "platinum";

interface KoordinatorData {
  nama: string;
  niam: string | null;
  jabatan: string;
  xp_level?: number;
  photoUrl?: string;
}

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
  // Real profile data from database
  realProfile?: {
    nip?: string | null;
    nama_pesantren?: string | null;
    nama_pengasuh?: string | null;
    alamat_singkat?: string | null;
    nama_media?: string | null;
    profile_level?: string;
  };
  // Approval date for piagam
  approvalDate?: string | null;
  // Koordinator data from crews table
  koordinator?: KoordinatorData;
}

/**
 * E-ID & Aset Page
 * - Piagam Pesantren: Single Virtual Charter (highest tier achieved) - uses institution data
 * - E-ID Koordinator: Virtual and Physical Member Card - uses CREW data (NIAM)
 * 
 * PAYWALL LOGIC:
 * - If status_payment === 'unpaid', download buttons are disabled with lock icon
 * - Tooltip shows message: 'Fitur ini hanya tersedia untuk anggota yang sudah melakukan aktivasi pembayaran.'
 * 
 * DATA BINDING:
 * - NIP: From profiles.nip (generated on payment approval)
 * - Nama Pesantren: From profiles.nama_pesantren
 * - Tanggal Terbit: From pesantren_claims.approved_at
 * - QR Code: Links to public profile /pesantren/[NIP]
 */
const EIDAsetPage = ({ 
  paymentStatus, 
  profileLevel,
  debugProfile,
  realProfile,
  approvalDate,
  koordinator
}: EIDAsetPageProps) => {
  const [activeTab, setActiveTab] = useState("piagam");
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Refs for html2canvas capture
  const charterRef = useRef<HTMLDivElement>(null);

  // Use realProfile first, then fall back to debugProfile for testing
  const profile = realProfile || debugProfile;

  // Institution data (for Piagam) - prioritize real data
  const displayNIP = profile?.nip || "";
  const displayPesantrenName = profile?.nama_pesantren || "Pesantren Belum Terdaftar";
  const displayAddress = profile?.alamat_singkat || "Alamat belum diisi";
  const displayMediaName = profile?.nama_media || displayPesantrenName;
  
  // Koordinator data from crews table (for E-ID)
  const koordinatorName = koordinator?.nama || "Belum Ditunjuk";
  const koordinatorNIAM = koordinator?.niam || null;
  const koordinatorJabatan = koordinator?.jabatan || "Koordinator";
  const koordinatorXP = koordinator?.xp_level || 0;
  const koordinatorPhoto = koordinator?.photoUrl;

  // Get highest achieved level
  const getHighestLevel = (): "silver" | "gold" | "platinum" => {
    if (profileLevel === "platinum") return "platinum";
    if (profileLevel === "gold") return "gold";
    return "silver";
  };

  const highestLevel = getHighestLevel();
  const canAccessEID = paymentStatus === "paid" && (profileLevel === "gold" || profileLevel === "platinum");
  const hasKoordinator = koordinator && koordinator.niam;
  
  // Check if user is unpaid - for paywall logic
  const isUnpaid = paymentStatus === "unpaid";
  const hasValidNIP = !!displayNIP && displayNIP.length >= 7;
  const lockedTooltipMessage = "Fitur ini hanya tersedia untuk anggota yang sudah melakukan aktivasi pembayaran.";

  const getLevelBadgeColor = () => {
    switch (highestLevel) {
      case "platinum": return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white";
      case "gold": return "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900";
      default: return "bg-gradient-to-r from-slate-400 to-slate-500 text-white";
    }
  };

  // Download Piagam as JPG using html2canvas
  const handleDownloadPiagam = async () => {
    if (isUnpaid) {
      toast({
        title: "Fitur Terkunci",
        description: lockedTooltipMessage,
        variant: "destructive",
      });
      return;
    }

    if (!hasValidNIP) {
      toast({
        title: "NIP Belum Tersedia",
        description: "NIP akan diterbitkan setelah pembayaran diverifikasi oleh Admin Pusat.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const filename = generatePiagamFilename(displayPesantrenName);
      const success = await downloadElementAsJPG(charterRef.current, {
        filename,
        quality: 0.95,
        scale: 2,
      });

      if (success) {
        toast({
          title: "Download Berhasil",
          description: `Piagam telah disimpan sebagai ${filename}`,
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Gagal Download",
        description: "Terjadi kesalahan saat mengunduh piagam. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Download E-ID as JPG
  const handleDownloadEID = async () => {
    if (isUnpaid) {
      toast({
        title: "Fitur Terkunci",
        description: lockedTooltipMessage,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Fitur dalam Pengembangan",
      description: "Download E-ID Card akan segera tersedia.",
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
                Piagam Virtual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* NIP Status Info */}
              {!hasValidNIP && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">NIP Belum Diterbitkan</p>
                      <p className="text-xs text-amber-700">
                        Nomor Induk Pesantren (NIP) akan diterbitkan otomatis setelah pembayaran Anda diverifikasi oleh Admin Pusat.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-w-sm mx-auto">
                <VirtualCharter
                  ref={charterRef}
                  level={highestLevel}
                  noId={displayNIP || "XXXXXXX"}
                  namaPesantren={displayPesantrenName}
                  namaKoordinator={hasKoordinator ? koordinatorName : undefined}
                  alamat={displayAddress}
                  tanggalTerbit={approvalDate || undefined}
                  profileUrl={hasValidNIP ? `${window.location.origin}/pesantren/${formatNIP(displayNIP, true)}` : undefined}
                />
              </div>
              <div className="flex justify-center mt-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button 
                          onClick={handleDownloadPiagam}
                          className={isUnpaid || !hasValidNIP
                            ? "bg-slate-400 hover:bg-slate-400 cursor-not-allowed" 
                            : "bg-[#166534] hover:bg-[#14532d]"
                          }
                          disabled={isUnpaid || !hasValidNIP || isDownloading}
                        >
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : isUnpaid || !hasValidNIP ? (
                            <Lock className="h-4 w-4 mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          {isDownloading ? "Mengunduh..." : "Download Piagam"}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {(isUnpaid || !hasValidNIP) && (
                      <TooltipContent>
                        <p className="max-w-xs">
                          {isUnpaid ? lockedTooltipMessage : "NIP belum diterbitkan. Tunggu verifikasi pembayaran."}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: E-ID Koordinator - Uses CREW data with NIAM */}
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
          ) : !hasKoordinator ? (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-1">Koordinator Belum Ditunjuk</h3>
                    <p className="text-sm text-amber-700">
                      E-ID Card hanya dapat dibuat setelah menunjuk salah satu kru sebagai Koordinator.
                      Silakan tambahkan kru dengan jabatan "Koordinator" di menu Manajemen Kru.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Virtual Card - Uses NIAM */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[#166534]" />
                    Kartu Virtual (Landscape)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VirtualMemberCard
                    noId={koordinatorNIAM ? formatNIAM(koordinatorNIAM, true) : "—"}
                    name={koordinatorName}
                    asalMedia={displayMediaName}
                    alamat={displayAddress}
                    role={koordinatorJabatan}
                    xp={koordinatorXP}
                    socialMedia={{
                      instagram: "@mpj_jatim",
                      youtube: "Media Pondok Jatim"
                    }}
                  />
                </CardContent>
              </Card>

              {/* Physical Card Preview - Uses NIAM and crew photo */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-[#166534]" />
                    Pratinjau Fisik (Portrait)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PhysicalMemberCard
                    noId={koordinatorNIAM ? formatNIAM(koordinatorNIAM, true) : "—"}
                    name={koordinatorName}
                    asalMedia={displayMediaName}
                    alamat={displayAddress}
                    role={koordinatorJabatan}
                    xp={koordinatorXP}
                    photoUrl={koordinatorPhoto}
                    socialMedia={{
                      instagram: "@mpj_jatim",
                      youtube: "Media Pondok Jatim"
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {canAccessEID && hasKoordinator && (
            <div className="flex justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button 
                        onClick={handleDownloadEID}
                        className={isUnpaid 
                          ? "bg-slate-400 hover:bg-slate-400 cursor-not-allowed" 
                          : "bg-[#166534] hover:bg-[#14532d]"
                        }
                        disabled={isUnpaid}
                      >
                        {isUnpaid ? (
                          <Lock className="h-4 w-4 mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Download Layout Cetak (PDF)
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {isUnpaid && (
                    <TooltipContent>
                      <p className="max-w-xs">{lockedTooltipMessage}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EIDAsetPage;
