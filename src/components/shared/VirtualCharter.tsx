import { useRef, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatNIP } from "@/lib/id-utils";
import { QRCodeSVG } from "qrcode.react";
import mpjVerticalColor from "@/assets/mpj-vertical-color.png";
import mpjVerticalWhite from "@/assets/mpj-vertical-white.png";

type CharterLevel = "silver" | "gold" | "platinum";

interface VirtualCharterProps {
  level: CharterLevel;
  noId: string;
  namaPesantren: string;
  namaKoordinator?: string;
  alamat: string;
  tanggalTerbit?: string;
  profileUrl?: string;
  className?: string;
}

/**
 * Virtual Charter Component - A4 Portrait
 * Silver: Embossed silver logo
 * Gold: Embossed gold logo
 * Platinum/Diamond: Pure white logo for exclusivity
 * 
 * Now includes:
 * - QR Code linking to public profile
 * - Issue date (tanggal terbit)
 * - forwardRef for html2canvas capture
 */
export const VirtualCharter = forwardRef<HTMLDivElement, VirtualCharterProps>(({
  level,
  noId,
  namaPesantren,
  namaKoordinator,
  alamat,
  tanggalTerbit,
  profileUrl,
  className,
}, ref) => {
  const getLevelStyles = () => {
    switch (level) {
      case "platinum":
        return {
          bg: "from-slate-900 via-slate-800 to-slate-900",
          border: "border-cyan-300/30",
          logoShadow: "drop-shadow-[0_0_30px_rgba(103,232,249,0.6)]",
          textGlow: "text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]",
          textSecondary: "text-cyan-200/80",
          badgeText: "PLATINUM",
          useLightLogo: true,
        };
      case "gold":
        return {
          bg: "from-amber-50 via-amber-100 to-yellow-50",
          border: "border-amber-300/50",
          logoShadow: "drop-shadow-[0_4px_20px_rgba(245,158,11,0.4)]",
          textGlow: "text-amber-700",
          textSecondary: "text-amber-600/80",
          badgeText: "GOLD",
          useLightLogo: false,
        };
      case "silver":
      default:
        return {
          bg: "from-slate-100 via-slate-200 to-slate-100",
          border: "border-slate-300/50",
          logoShadow: "drop-shadow-[0_4px_15px_rgba(100,116,139,0.3)]",
          textGlow: "text-slate-700",
          textSecondary: "text-slate-600/80",
          badgeText: "SILVER",
          useLightLogo: false,
        };
    }
  };

  const styles = getLevelStyles();
  const koordinatorDisplay = namaKoordinator || "Belum Ditunjuk";
  const formattedNIP = formatNIP(noId, true);
  const displayNIP = formatNIP(noId, false); // With dots for display
  
  // Format tanggal terbit
  const formattedDate = tanggalTerbit 
    ? new Date(tanggalTerbit).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;
  
  // Generate profile URL for QR code
  const qrUrl = profileUrl || `${window.location.origin}/pesantren/${formattedNIP}`;

  return (
    <Card 
      ref={ref}
      className={cn(
        "overflow-hidden border-2 shadow-2xl",
        styles.border,
        className
      )}
    >
      <CardContent className="p-0">
        <div className={cn(
          "aspect-[3/4] relative overflow-hidden bg-gradient-to-br p-6 flex flex-col items-center justify-center",
          styles.bg
        )}>
          {/* Decorative Pattern for Platinum */}
          {level === "platinum" && (
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <pattern id="diamond-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                  <polygon points="10,0 20,10 10,20 0,10" fill="currentColor" className="text-cyan-400" opacity="0.3" />
                </pattern>
                <rect width="100" height="100" fill="url(#diamond-pattern)" />
              </svg>
            </div>
          )}

          {/* Header Text */}
          <div className="relative z-10 text-center mb-4">
            <p className={cn("text-xs tracking-[0.3em] uppercase mb-1", styles.textSecondary)}>
              {styles.badgeText}
            </p>
            <h2 className={cn("text-lg font-bold tracking-wide", styles.textGlow)}>
              PIAGAM KEANGGOTAAN
            </h2>
          </div>

          {/* Embossed Logo - YouTube Play Button Style */}
          <div className="relative z-10 mb-4">
            {/* Shadow/3D Effect Container */}
            <div className={cn(
              "relative rounded-2xl p-6",
              level === "platinum" ? "bg-gradient-to-br from-slate-700/50 to-slate-800/50" : "bg-white/80",
              "shadow-[inset_0_2px_20px_rgba(0,0,0,0.1),_0_10px_40px_rgba(0,0,0,0.2)]"
            )}>
              {/* Holographic Effect for Platinum */}
              {level === "platinum" && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-400/20 via-purple-400/10 to-pink-400/20 animate-pulse" />
              )}
              
              <img 
                src={styles.useLightLogo ? mpjVerticalWhite : mpjVerticalColor}
                alt="MPJ Logo"
                className={cn(
                  "h-24 w-auto relative z-10",
                  styles.logoShadow
                )}
              />
            </div>
          </div>

          {/* Recipient Info */}
          <div className="relative z-10 text-center space-y-1.5">
            <p className={cn("text-xs uppercase tracking-wider", styles.textSecondary)}>
              Diberikan Kepada
            </p>
            <h3 className={cn("text-lg font-bold", styles.textGlow)}>
              {namaPesantren}
            </h3>
            <p className={cn("text-xs max-w-xs", styles.textSecondary)}>
              {alamat}
            </p>
            <div className="pt-2">
              <p className={cn("text-[10px] uppercase tracking-wider", styles.textSecondary)}>
                Koordinator
              </p>
              <p className={cn("text-sm font-semibold", styles.textGlow)}>
                {koordinatorDisplay}
              </p>
            </div>
            <div className="pt-2">
              <p className={cn("text-[10px] uppercase tracking-wider", styles.textSecondary)}>
                Nomor Induk Pesantren
              </p>
              <p className={cn("text-base font-mono font-bold tracking-wider", styles.textGlow)}>
                {displayNIP}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="relative z-10 mt-3">
            <div className={cn(
              "p-2 rounded-lg",
              level === "platinum" ? "bg-white/90" : "bg-white"
            )}>
              <QRCodeSVG 
                value={qrUrl} 
                size={60}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Issue Date */}
          {formattedDate && (
            <div className={cn(
              "relative z-10 mt-2 text-center",
              styles.textSecondary
            )}>
              <p className="text-[9px] uppercase tracking-wider">
                Diterbitkan: {formattedDate}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className={cn(
            "absolute bottom-3 left-0 right-0 text-center",
            styles.textSecondary
          )}>
            <p className="text-[9px] uppercase tracking-wider">
              Media Pondok Jawa Timur
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

VirtualCharter.displayName = "VirtualCharter";

export default VirtualCharter;
