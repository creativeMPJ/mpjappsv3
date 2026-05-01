import { useState } from "react";
import { Award, Download, Search, KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getPaymentStateLabel, isPaymentActive } from "@/features/v4/utils";

interface Certificate {
  id: number;
  title: string;
  eventName: string;
  date: string;
  xpEarned: number;
  thumbnail: string;
}

const mockCertificates: Certificate[] = [
  {
    id: 1,
    title: "Sertifikat Peserta",
    eventName: "Kopdar Regional Malang Raya",
    date: "15 Okt 2024",
    xpEarned: 75,
    thumbnail: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=200&fit=crop",
  },
  {
    id: 2,
    title: "Sertifikat Peserta",
    eventName: "Training Content Creator 2024",
    date: "20 Nov 2024",
    xpEarned: 60,
    thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=200&fit=crop",
  },
  {
    id: 3,
    title: "Sertifikat Workshop",
    eventName: "Workshop Desain Grafis",
    date: "10 Sep 2024",
    xpEarned: 50,
    thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=300&h=200&fit=crop",
  },
  {
    id: 4,
    title: "Sertifikat Kehadiran",
    eventName: "Seminar Media Dakwah",
    date: "05 Aug 2024",
    xpEarned: 40,
    thumbnail: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop",
  },
  {
    id: 5,
    title: "Sertifikat Peserta",
    eventName: "Bootcamp Video Editing",
    date: "15 Jul 2024",
    xpEarned: 80,
    thumbnail: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=300&h=200&fit=crop",
  },
];

const CrewSertifikatPage = () => {
  const { profile } = useAuth();
  const [token, setToken] = useState("");
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const paymentActive = isPaymentActive(profile?.status_payment);
  const paymentLabel = getPaymentStateLabel(profile?.status_payment);

  const handleClaimToken = async () => {
    if (!paymentActive) {
      toast({
        title: paymentLabel,
        description: "Aktifkan akun terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!token.trim()) {
      toast({
        title: "Token Kosong",
        description: "Silakan masukkan token sertifikat terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (token === "TEST123") {
        const newCert: Certificate = {
          id: certificates.length + 1,
          title: "Sertifikat Baru",
          eventName: "Event Terbaru 2024",
          date: new Date().toLocaleDateString("id-ID"),
          xpEarned: 50,
          thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
        };
        setCertificates([newCert, ...certificates]);
        setToken("");
        toast({
          title: "Sertifikat Diklaim!",
          description: "Sertifikat berhasil ditambahkan ke koleksi Anda",
        });
      } else {
        toast({
          title: "Token Tidak Valid",
          description: "Token yang Anda masukkan tidak ditemukan",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDownload = (certificate: Certificate) => {
    if (!paymentActive) {
      toast({
        title: paymentLabel,
        description: "Aktifkan akun terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Mengunduh Sertifikat",
      description: `Sertifikat "${certificate.eventName}" sedang diunduh...`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Claim Section */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Klaim Sertifikat</h3>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Masukkan Token Sertifikat"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleClaimToken} 
                disabled={isLoading || !paymentActive}
                className={paymentActive ? "bg-primary hover:bg-primary/90 px-6" : "bg-slate-400 hover:bg-slate-400 px-6 cursor-not-allowed"}
              >
                {!paymentActive ? "Aktifkan akun terlebih dahulu" : isLoading ? "..." : "Klaim"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Token diberikan setelah menghadiri event. Coba: TEST123
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">
            Koleksi Sertifikat ({certificates.length})
          </h3>
        </div>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-2 gap-3 pb-4">
            {certificates.map((cert) => (
              <Card 
                key={cert.id} 
                className="overflow-hidden border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedCertificate(cert);
                  setShowPreview(true);
                }}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={cert.thumbnail}
                      alt={cert.eventName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <Badge className="bg-accent text-accent-foreground text-[10px] mb-1">
                        +{cert.xpEarned} XP
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Award className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-xs text-foreground line-clamp-2 mb-1">
                      {cert.eventName}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">{cert.date}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Certificate Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Detail Sertifikat</DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src={selectedCertificate.thumbnail}
                  alt={selectedCertificate.eventName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="text-primary-foreground">
                    <Badge className="bg-accent text-accent-foreground mb-2">
                      +{selectedCertificate.xpEarned} XP
                    </Badge>
                    <h3 className="font-bold">{selectedCertificate.title}</h3>
                    <p className="text-sm opacity-80">{selectedCertificate.eventName}</p>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Diterbitkan: {selectedCertificate.date}
              </div>
              <Button 
                disabled={!paymentActive}
                className={paymentActive ? "w-full bg-primary hover:bg-primary/90" : "w-full bg-slate-400 hover:bg-slate-400 cursor-not-allowed"}
                onClick={() => handleDownload(selectedCertificate)}
              >
                <Download className="h-4 w-4 mr-2" />
                {paymentActive ? "Download PDF" : "Aktifkan akun terlebih dahulu"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrewSertifikatPage;
