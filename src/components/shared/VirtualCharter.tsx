import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatNIP } from "@/lib/id-utils";
import mpjVerticalColor from "@/assets/mpj-vertical-color.png";
import mpjVerticalWhite from "@/assets/mpj-vertical-white.png";

type CharterLevel = "silver" | "gold" | "platinum";

interface VirtualCharterProps {
  level: CharterLevel;
  noId: string;
  namaPesantren: string;
  namaKoordinator?: string;
  alamat: string;
  className?: string;
}

/**
 * Virtual Charter Component - A4 Portrait (YouTube Play Button Style)
 * Silver: Embossed silver logo - Lunas Administrasi
 * Gold: Embossed gold logo - Profil Lengkap
 * Platinum/Diamond: White logo with glow effect
 */
export const VirtualCharter = ({
  level,
  noId,
  namaPesantren,
  namaKoordinator,
  alamat,
  className,
}: VirtualCharterProps) => {
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

  return (
    <Card className={cn(
      "overflow-hidden border-2 shadow-2xl",
      styles.border,
      className
    )}>
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
          <div className="relative z-10 text-center mb-6">
            <p className={cn("text-xs tracking-[0.3em] uppercase mb-1", styles.textSecondary)}>
              {styles.badgeText}
            </p>
            <h2 className={cn("text-lg font-bold tracking-wide", styles.textGlow)}>
              PIAGAM KEANGGOTAAN
            </h2>
          </div>

          {/* Embossed Logo - YouTube Play Button Style */}
          <div className="relative z-10 mb-6">
            {/* Shadow/3D Effect Container */}
            <div className={cn(
              "relative rounded-2xl p-8",
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
                  "h-32 w-auto relative z-10",
                  styles.logoShadow
                )}
              />
            </div>
          </div>

          {/* Recipient Info */}
          <div className="relative z-10 text-center space-y-2">
            <p className={cn("text-xs uppercase tracking-wider", styles.textSecondary)}>
              Diberikan Kepada
            </p>
            <h3 className={cn("text-xl font-bold", styles.textGlow)}>
              {namaPesantren}
            </h3>
            <p className={cn("text-sm max-w-xs", styles.textSecondary)}>
              {alamat}
            </p>
            <div className="pt-3">
              <p className={cn("text-xs uppercase tracking-wider", styles.textSecondary)}>
                Koordinator
              </p>
              <p className={cn("text-base font-semibold", styles.textGlow)}>
                {koordinatorDisplay}
              </p>
            </div>
            <div className="pt-3">
              <p className={cn("text-xs uppercase tracking-wider", styles.textSecondary)}>
                Nomor Induk Pesantren
              </p>
              <p className={cn("text-lg font-mono font-bold tracking-wider", styles.textGlow)}>
                {formatNIP(noId, true)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className={cn(
            "absolute bottom-4 left-0 right-0 text-center",
            styles.textSecondary
          )}>
            <p className="text-[10px] uppercase tracking-wider">
              Media Pondok Jawa Timur
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualCharter;
