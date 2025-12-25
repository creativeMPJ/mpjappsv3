import { useState } from "react";
import { Download, QrCode, Shield, Lock, FileText, RotateCcw, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

interface CrewEIDCardPageProps {
  isGold: boolean;
  onBack: () => void;
}

const CrewEIDCardPage = ({ isGold, onBack }: CrewEIDCardPageProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const userData = {
    name: "Ahmad Fauzi",
    noId: "200100101",
    asalMedia: "PP. Nurul Huda",
    alamatPesantren: "Jl. Raya Pesantren No. 45, Singosari, Malang",
    role: "Kru Media",
    skills: ["Fotografer", "Editor", "Desainer"],
    socialMedia: {
      facebook: "@mpj.nurulhuda",
      instagram: "@mpj_nurulhuda",
      twitter: "@mpj_nurulhuda",
      youtube: "MPJ Nurul Huda",
    },
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Download PDF",
      description: "Layout cetak sedang diproses untuk diunduh...",
    });
  };

  if (!isGold) {
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
          <TabsTrigger value="virtual">Virtual Card</TabsTrigger>
          <TabsTrigger value="physical">Physical Card</TabsTrigger>
        </TabsList>

        {/* TAB 1: Virtual Card - Landscape (Credit Card Ratio) */}
        <TabsContent value="virtual" className="space-y-4">
          <div className="relative perspective-1000">
            <div 
              className={`relative transition-transform duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front Side */}
              <Card 
                className="overflow-hidden shadow-xl border-0"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <CardContent className="p-0">
                  <div className="aspect-[85.6/53.98] bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-5 relative overflow-hidden">
                    {/* MPJ Logo Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <img 
                        src={logoMpj} 
                        alt="MPJ Watermark" 
                        className="w-48 h-48 object-contain"
                      />
                    </div>

                    {/* Wave Pattern */}
                    <div className="absolute bottom-0 left-0 right-0 opacity-10">
                      <svg viewBox="0 0 400 100" className="w-full">
                        <path
                          d="M0 50 Q100 20 200 50 T400 50 L400 100 L0 100 Z"
                          fill="white"
                        />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <img src={logoMpj} alt="MPJ" className="w-8 h-8 object-contain" />
                          <div>
                            <h2 className="text-sm font-bold text-primary-foreground">MEDIA PONDOK</h2>
                            <p className="text-[9px] text-primary-foreground/70">Jawa Timur</p>
                          </div>
                        </div>
                        <Badge className="bg-accent text-accent-foreground text-[9px] font-bold">
                          MEMBER
                        </Badge>
                      </div>

                      {/* Main Info - NO PHOTO, NO BARCODE */}
                      <div className="flex-1 flex flex-col justify-center space-y-3">
                        <div>
                          <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">No. ID</p>
                          <p className="text-lg font-bold text-primary-foreground tracking-widest">{userData.noId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Nama Lengkap</p>
                          <p className="text-base font-semibold text-primary-foreground">{userData.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Asal Media</p>
                          <p className="text-sm text-primary-foreground/90">{userData.asalMedia}</p>
                        </div>
                      </div>

                      {/* Footer - Address */}
                      <div className="mt-2">
                        <p className="text-[9px] text-primary-foreground/60 line-clamp-2">{userData.alamatPesantren}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Back Side */}
              {isFlipped && (
                <Card 
                  className="overflow-hidden shadow-xl border-0 absolute inset-0"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <CardContent className="p-0">
                    <div className="aspect-[85.6/53.98] bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-5 relative overflow-hidden">
                      {/* MPJ Logo Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <img src={logoMpj} alt="MPJ Watermark" className="w-48 h-48 object-contain" />
                      </div>

                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col items-center justify-center">
                        <h3 className="text-sm font-bold text-primary-foreground mb-4">Social Media</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-primary-foreground/90">
                            <Facebook className="h-4 w-4" />
                            <span className="text-xs">{userData.socialMedia.facebook}</span>
                          </div>
                          <div className="flex items-center gap-2 text-primary-foreground/90">
                            <Instagram className="h-4 w-4" />
                            <span className="text-xs">{userData.socialMedia.instagram}</span>
                          </div>
                          <div className="flex items-center gap-2 text-primary-foreground/90">
                            <Twitter className="h-4 w-4" />
                            <span className="text-xs">{userData.socialMedia.twitter}</span>
                          </div>
                          <div className="flex items-center gap-2 text-primary-foreground/90">
                            <Youtube className="h-4 w-4" />
                            <span className="text-xs">{userData.socialMedia.youtube}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Flip Hint */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <RotateCcw className="h-4 w-4" />
            <span>Tap kartu untuk melihat sisi belakang</span>
          </div>

          {/* Virtual Card Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-2">Virtual Card</h3>
              <p className="text-sm text-muted-foreground">
                Kartu virtual ini digunakan untuk tampilan di dalam aplikasi. 
                Sesuai dengan SOP MPJ, kartu virtual tidak memuat foto dan barcode.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Physical Card - Portrait (ID Badge Ratio) */}
        <TabsContent value="physical" className="space-y-4">
          <Card className="overflow-hidden shadow-xl border-0 mx-auto max-w-[280px]">
            <CardContent className="p-0">
              {/* Portrait ID Badge - Standard ID ratio approx 2:3 */}
              <div className="aspect-[2/3] bg-gradient-to-b from-primary via-primary to-primary/90 relative overflow-hidden">
                {/* Header with Logo */}
                <div className="bg-primary-foreground/10 py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <img src={logoMpj} alt="MPJ" className="w-10 h-10 object-contain" />
                    <div className="text-center">
                      <h2 className="text-sm font-bold text-primary-foreground">MEDIA PONDOK</h2>
                      <p className="text-[9px] text-primary-foreground/80">JAWA TIMUR</p>
                    </div>
                  </div>
                </div>

                {/* Photo Section */}
                <div className="flex justify-center py-4">
                  <div className="w-24 h-24 bg-primary-foreground rounded-full flex items-center justify-center text-primary text-3xl font-bold shadow-lg border-4 border-primary-foreground/30">
                    AF
                  </div>
                </div>

                {/* User Info */}
                <div className="px-4 text-center space-y-2">
                  <div>
                    <h3 className="text-lg font-bold text-primary-foreground">{userData.name}</h3>
                    <p className="text-sm text-primary-foreground/80">{userData.asalMedia}</p>
                  </div>
                  <div className="bg-primary-foreground/10 rounded-lg py-2 px-3">
                    <p className="text-[10px] text-primary-foreground/70 line-clamp-2">{userData.alamatPesantren}</p>
                  </div>
                </div>

                {/* Footer with QR Code */}
                <div className="absolute bottom-0 left-0 right-0 bg-primary-foreground p-3">
                  <div className="flex items-center justify-between gap-3">
                    {/* QR Code */}
                    <div className="bg-white p-2 rounded-lg shadow-inner">
                      <QrCode className="h-14 w-14 text-primary" />
                    </div>
                    {/* ID Info */}
                    <div className="flex-1 text-right">
                      <p className="text-[10px] text-muted-foreground uppercase">No. Anggota</p>
                      <p className="text-sm font-bold text-primary">{userData.noId}</p>
                      <Badge className="mt-1 bg-primary text-primary-foreground text-[9px]">
                        {userData.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Button */}
          <Button 
            onClick={handleDownloadPDF}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Layout Cetak (PDF)
          </Button>

          {/* Physical Card Info */}
          <Card>
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
              <span className="font-medium">{userData.noId}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrewEIDCardPage;
