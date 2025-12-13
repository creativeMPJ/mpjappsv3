import { useState } from "react";
import { Award, Download, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const mockCertificates = [
  {
    id: 1,
    title: "Madrasah Media 2024",
    date: "15 Maret 2024",
    xpEarned: 50,
    status: "claimed",
  },
  {
    id: 2,
    title: "Workshop Desain Grafis",
    date: "22 Februari 2024",
    xpEarned: 30,
    status: "claimed",
  },
  {
    id: 3,
    title: "Seminar Jurnalistik Pesantren",
    date: "10 Januari 2024",
    xpEarned: 25,
    status: "available",
  },
];

const KegiatanSaya = () => {
  const [token, setToken] = useState("");
  const [certificates, setCertificates] = useState(mockCertificates);
  const { toast } = useToast();

  const handleClaimCertificate = () => {
    if (!token.trim()) {
      toast({
        title: "Token Diperlukan",
        description: "Masukkan token acara untuk klaim sertifikat.",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call
    toast({
      title: "Sertifikat Diklaim!",
      description: "Sertifikat berhasil ditambahkan ke portofolio Anda.",
    });
    setToken("");
  };

  const handleDownload = (certId: number) => {
    toast({
      title: "Mengunduh...",
      description: "Sertifikat sedang diunduh.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sertifikat & Event Saya</h1>
        <p className="text-muted-foreground">Klaim dan kelola sertifikat pribadi Anda</p>
      </div>

      {/* Claim Section */}
      <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-4">Klaim Sertifikat Baru</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-200" />
              <Input
                placeholder="Masukkan Token Acara"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-emerald-200"
              />
            </div>
            <Button
              onClick={handleClaimCertificate}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              <Award className="h-4 w-4 mr-2" />
              Klaim Sertifikat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Daftar Sertifikat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{cert.title}</h4>
                  <p className="text-sm text-muted-foreground">{cert.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                  +{cert.xpEarned} XP
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => handleDownload(cert.id)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download PDF
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default KegiatanSaya;
