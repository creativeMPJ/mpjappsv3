import { useState, useRef, useEffect } from "react";
import { QrCode, Search, CheckCircle, XCircle, Camera, History, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_PARTICIPANTS, MockParticipant } from "@/lib/event-mock-data";
import { useToast } from "@/hooks/use-toast";

const EventScanAbsensi = () => {
  const { toast } = useToast();
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<Array<{ p: MockParticipant, time: Date, success: boolean }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Focus input automatically so USB barcode scanners work immediately
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle Live Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (isScanning) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch(err => {
          console.error("Camera access denied or not available", err);
          toast({ title: "Kamera Tidak Tersedia", description: "Pastikan izin kamera diberikan.", variant: "destructive" });
          setIsScanning(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, toast]);

  const simulateRandomScan = () => {
    // Pick a random participant to simulate scan
    const randomP = MOCK_PARTICIPANTS[Math.floor(Math.random() * MOCK_PARTICIPANTS.length)];
    handleScan(randomP.ticket_code);
  };

  const handleScan = (code: string) => {
    if (!code) return;
    
    // Simulate finding participant
    const participant = MOCK_PARTICIPANTS.find(p => 
      p.ticket_code?.toLowerCase() === code.toLowerCase() || 
      p.id.toLowerCase() === code.toLowerCase()
    );

    if (participant) {
      if (participant.ticket_status === 'PAID') {
        // Success
        setRecentScans(prev => [{ p: participant, time: new Date(), success: true }, ...prev].slice(0, 5));
        toast({ title: "Check-in Berhasil", description: `${participant.full_name} berhasil hadir.`, variant: "default" });
        // Normally we'd update global state/API here
      } else if (participant.ticket_status === 'ATTENDED') {
        // Already scanned
        setRecentScans(prev => [{ p: participant, time: new Date(), success: false }, ...prev].slice(0, 5));
        toast({ title: "Gagal", description: "Peserta sudah check-in sebelumnya.", variant: "destructive" });
      } else {
        // Not paid
        setRecentScans(prev => [{ p: participant, time: new Date(), success: false }, ...prev].slice(0, 5));
        toast({ title: "Akses Ditolak", description: "Tiket belum lunas atau masih menunggu verifikasi.", variant: "destructive" });
      }
    } else {
      toast({ title: "Tidak Ditemukan", description: "Kode tiket tidak valid.", variant: "destructive" });
    }
    setManualCode("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Scan Absensi</h1>
        <p className="text-slate-500 text-sm mt-0.5">Check-in peserta menggunakan QR Code atau Kode Tiket</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video relative flex flex-col items-center justify-center border-4 border-slate-800 shadow-xl">
            {isScanning ? (
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-60" playsInline muted></video>
                <div className="relative z-10 w-64 h-64 border-2 border-emerald-500 rounded-2xl mb-4">
                  {/* Scan line animation */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 opacity-70 animate-scan" style={{boxShadow: '0 0 10px #10b981'}} />
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl -mt-0.5 -ml-0.5" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl -mt-0.5 -mr-0.5" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl -mb-0.5 -ml-0.5" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl -mb-0.5 -mr-0.5" />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <p className="text-emerald-400 font-mono text-sm bg-black/50 px-3 py-1 rounded-full">Mencari QR Code...</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={simulateRandomScan} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs">Simulasi Scan</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsScanning(false)} className="bg-slate-800/80 text-white border-slate-600 hover:bg-slate-700 rounded-xl text-xs">Matikan</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">Kamera Nonaktif</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                  Klik tombol di bawah untuk mengaktifkan kamera perangkat Anda untuk mulai melakukan scan.
                </p>
                <Button 
                  onClick={() => setIsScanning(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                >
                  Aktifkan Kamera
                </Button>
              </div>
            )}
            
            {/* Overlay Status */}
            <div className="absolute top-4 right-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isScanning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {isScanning ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" /> 
              Input Manual (Scanner USB)
            </h3>
            <form 
              onSubmit={(e) => { e.preventDefault(); handleScan(manualCode); }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  ref={inputRef}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Scan atau ketik kode tiket (misal: TKT-EVT001)..."
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                Check In
              </Button>
            </form>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[500px] lg:h-auto">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" /> 
              Riwayat Scan
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Sesi Ini</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {recentScans.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <QrCode className="w-10 h-10 opacity-20" />
                <p className="text-sm">Belum ada data scan</p>
              </div>
            ) : (
              recentScans.map((scan, i) => (
                <div key={i} className={`p-3 rounded-xl border ${scan.success ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} flex items-start gap-3`}>
                  {scan.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{scan.p.full_name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{scan.p.ticket_code}</p>
                    {!scan.success && (
                      <p className="text-[10px] text-red-600 font-semibold mt-1">
                        {scan.p.ticket_status === 'ATTENDED' ? 'Sudah Hadir' : 'Belum Lunas'}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {scan.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default EventScanAbsensi;
