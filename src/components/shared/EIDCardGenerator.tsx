import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";
import logoMpj from "@/assets/logo-mpj.png";

interface EIDCardGeneratorProps {
  type: "lembaga" | "kru";
  nomorId: string; // NIP for lembaga, NIAM for kru
  nama: string; // Nama Pesantren or Nama Personil
  jabatan?: string; // Role/Jabatan for kru
  lembagaInduk?: string; // Parent institution name for kru
  profileLevel?: "basic" | "silver" | "gold" | "platinum";
}

const EIDCardGenerator = ({
  type,
  nomorId,
  nama,
  jabatan,
  lembagaInduk,
  profileLevel = "basic",
}: EIDCardGeneratorProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `E-ID-${type === "lembaga" ? "Lembaga" : "Kru"}-${nomorId.replace(/\./g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast({
        title: "Berhasil!",
        description: "E-ID Card berhasil diunduh.",
      });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat mengunduh kartu.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    const printContent = cardRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>E-ID Card - ${nomorId}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .card { transform: scale(1.5); }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getLevelStyles = () => {
    switch (profileLevel) {
      case "gold":
        return {
          border: "border-amber-400",
          badge: "bg-amber-400 text-amber-900",
          accent: "bg-gradient-to-r from-amber-400 to-yellow-300",
        };
      case "platinum":
        return {
          border: "border-purple-400",
          badge: "bg-purple-500 text-white",
          accent: "bg-gradient-to-r from-purple-500 to-pink-400",
        };
      case "silver":
        return {
          border: "border-slate-400",
          badge: "bg-slate-400 text-slate-900",
          accent: "bg-gradient-to-r from-slate-400 to-slate-300",
        };
      default:
        return {
          border: "border-emerald-400",
          badge: "bg-emerald-600 text-white",
          accent: "bg-gradient-to-r from-emerald-600 to-emerald-400",
        };
    }
  };

  const styles = getLevelStyles();
  const qrValue = `${window.location.origin}/verify/${type}/${nomorId}`;

  return (
    <div className="space-y-4">
      {/* E-ID Card - Landscape Layout */}
      <div
        ref={cardRef}
        className={`w-full max-w-[400px] aspect-[1.6/1] rounded-xl shadow-2xl overflow-hidden border-2 ${styles.border}`}
        style={{ background: "linear-gradient(135deg, #166534 0%, #14532d 50%, #0f4429 100%)" }}
      >
        <div className="h-full flex flex-col p-4 text-white relative">
          {/* Decorative Wave */}
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10">
            <svg viewBox="0 0 400 60" className="w-full h-full">
              <path d="M0 30 Q100 0 200 30 T400 30 L400 60 L0 60 Z" fill="white" />
            </svg>
          </div>

          {/* Top Section - Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <img 
                src={logoMpj} 
                alt="MPJ Logo" 
                className="h-10 w-10 rounded-lg bg-white/10 p-1"
                crossOrigin="anonymous"
              />
              <div>
                <h3 className="text-sm font-bold tracking-wide">MPJ APPS</h3>
                <p className="text-[10px] text-emerald-200">Media Pondok Jawa Timur</p>
              </div>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles.badge}`}>
              {profileLevel.toUpperCase()}
            </div>
          </div>

          {/* Middle Section - Content */}
          <div className="flex-1 flex gap-4">
            {/* Left - Info */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="space-y-1.5">
                <div>
                  <p className="text-[10px] text-emerald-300 uppercase tracking-wider">
                    {type === "lembaga" ? "NIP (Nomor Induk Pesantren)" : "NIAM (Nomor Induk Anggota Media)"}
                  </p>
                  <p className="text-lg font-mono font-bold tracking-wider">{nomorId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-300 uppercase tracking-wider">
                    {type === "lembaga" ? "Nama Pesantren" : "Nama Personil"}
                  </p>
                  <p className="text-sm font-semibold leading-tight">{nama}</p>
                </div>
                {type === "kru" && jabatan && (
                  <div>
                    <p className="text-[10px] text-emerald-300 uppercase tracking-wider">Jabatan</p>
                    <p className="text-xs font-medium">{jabatan}</p>
                  </div>
                )}
                {type === "kru" && lembagaInduk && (
                  <div>
                    <p className="text-[10px] text-emerald-300 uppercase tracking-wider">Lembaga</p>
                    <p className="text-xs">{lembagaInduk}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right - QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-2 rounded-lg shadow-lg">
                <QRCodeSVG
                  value={qrValue}
                  size={70}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-[8px] text-emerald-300 mt-1 text-center">Scan untuk verifikasi</p>
            </div>
          </div>

          {/* Bottom Accent Line */}
          <div className={`h-1 rounded-full ${styles.accent} mt-2`} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleDownload} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
          <Download className="h-4 w-4 mr-2" />
          Unduh Kartu
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1">
          <Printer className="h-4 w-4 mr-2" />
          Cetak
        </Button>
      </div>
    </div>
  );
};

export default EIDCardGenerator;
