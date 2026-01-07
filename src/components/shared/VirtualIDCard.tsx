import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNIP, formatNIAM, getXPLevel } from "@/lib/id-utils";
import { XPLevelBadge, VerifiedBadge } from "./LevelBadge";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface VirtualIDCardProps {
  type: 'institution' | 'crew';
  // Institution data
  nip?: string | null;
  institutionName?: string;
  pengasuhName?: string;
  isVerified?: boolean;
  // Crew data
  niam?: string | null;
  crewName?: string;
  jabatan?: string;
  xp?: number;
  className?: string;
}

/**
 * Virtual ID Card Component (Landscape)
 * Simple and elegant without photo/QR
 * NIAM uses clean format (no dots)
 */
export const VirtualIDCard = ({
  type,
  nip,
  institutionName,
  pengasuhName,
  isVerified = false,
  niam,
  crewName,
  jabatan,
  xp = 0,
  className,
}: VirtualIDCardProps) => {
  const xpLevel = getXPLevel(xp);
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Card Container - Landscape */}
      <Card className="overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white border-0 shadow-xl aspect-[1.6/1] max-w-md mx-auto">
        <CardContent className="p-0 h-full relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <pattern id="id-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                <path d="M10 0L20 10L10 20L0 10Z" fill="currentColor" opacity="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#id-pattern)" />
            </svg>
          </div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-auto">
              <div>
                <h3 className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
                  {type === 'institution' ? 'Kartu Identitas Lembaga' : 'Kartu Identitas Kru'}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-amber-400">
                    MPJ
                  </span>
                  <span className="text-sm text-white/80">
                    Media Pondok Jawa Timur
                  </span>
                </div>
              </div>
              {type === 'crew' && xp > 0 && (
                <XPLevelBadge xp={xp} size="sm" />
              )}
            </div>
            
            {/* Main Content */}
            <div className="space-y-3">
              {type === 'institution' ? (
                <>
                  {/* Institution Name */}
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white truncate">
                      {institutionName || 'Nama Pesantren'}
                    </h2>
                    <VerifiedBadge isVerified={isVerified} size="md" />
                  </div>
                  
                  {/* Pengasuh */}
                  <p className="text-sm text-white/70">
                    {pengasuhName || 'Nama Pengasuh'}
                  </p>
                  
                  {/* NIP */}
                  <div className="pt-2">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                      Nomor Induk Pesantren
                    </p>
                    <p className="text-2xl font-mono font-bold text-amber-400 tracking-wider">
                      {nip ? formatNIP(nip, true) : '0000000'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Crew Name */}
                  <div>
                    <h2 className="text-lg font-bold text-white truncate">
                      {crewName || 'Nama Kru'}
                    </h2>
                    <p className="text-sm text-white/70">
                      {jabatan || 'Jabatan'}
                    </p>
                  </div>
                  
                  {/* NIAM - Clean format without dots */}
                  <div className="pt-2">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                      Nomor Induk Anggota Media
                    </p>
                    <p className="text-2xl font-mono font-bold text-amber-400 tracking-wider">
                      {niam ? formatNIAM(niam, true) : '—'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Bottom Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
        </CardContent>
      </Card>
      
      {/* Info Notice */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 max-w-md mx-auto">
        <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-amber-800">Virtual ID Card</p>
          <p className="text-amber-700 text-xs mt-0.5">
            ID Fisik (Portrait dengan Foto & QR Code) hanya dapat dicetak oleh Admin Pusat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualIDCard;
