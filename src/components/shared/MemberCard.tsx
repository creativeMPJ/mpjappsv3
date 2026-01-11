import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNIAM, getXPLevel } from "@/lib/id-utils";
import { XPLevelBadge } from "./LevelBadge";
import { cn } from "@/lib/utils";
import { RotateCcw, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import mpjVerticalWhite from "@/assets/mpj-vertical-white.png";
import mpjVerticalColor from "@/assets/mpj-vertical-color.png";
import mpjHorizontalColor from "@/assets/mpj-horizontal-color.png";

interface MemberCardProps {
  // Member data
  noId: string;
  name: string;
  asalMedia: string;
  alamat: string;
  role?: string;
  xp?: number;
  photoUrl?: string;
  lembagaNip?: string; // NIP of the institution for QR code URL
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  className?: string;
}

/**
 * Virtual Card Component - Landscape 16:9
 * Front: No ID, Name, Asal Media, Alamat (NO photo, NO barcode)
 * Back: Emerald background with large MPJ logo and social media
 */
export const VirtualMemberCard = ({
  noId,
  name,
  asalMedia,
  alamat,
  role = "Kru Media",
  xp = 0,
  socialMedia,
  className,
}: MemberCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const xpLevel = getXPLevel(xp);

  return (
    <div className={cn("perspective-1000", className)}>
      <div
        className={cn(
          "relative w-full max-w-md mx-auto transition-transform duration-700 transform-style-preserve-3d cursor-pointer",
          isFlipped && "rotate-y-180"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <Card className={cn(
          "overflow-hidden border-0 shadow-2xl backface-hidden",
          isFlipped && "invisible"
        )}>
          <CardContent className="p-0">
            <div className="aspect-video bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <pattern id="member-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                    <path d="M10 0L20 10L10 20L0 10Z" fill="currentColor" opacity="0.5" />
                  </pattern>
                  <rect width="100" height="100" fill="url(#member-pattern)" />
                </svg>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-auto">
                  <div>
                    <h3 className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
                      Kartu Anggota Digital
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-amber-400">MPJ</span>
                      <span className="text-sm text-white/80">Media Pondok Jawa Timur</span>
                    </div>
                  </div>
                  {xp > 0 && <XPLevelBadge xp={xp} size="sm" />}
                </div>

                {/* Main Content */}
                <div className="space-y-2 mt-4">
                  {/* Name & Role */}
                  <div>
                    <h2 className="text-lg font-bold text-white truncate">{name}</h2>
                    <p className="text-sm text-white/70">{role}</p>
                  </div>

                  {/* Asal Media */}
                  <p className="text-sm text-amber-400">{asalMedia}</p>

                  {/* Alamat */}
                  <p className="text-xs text-white/60 line-clamp-2">{alamat}</p>

                  {/* No ID */}
                  <div className="pt-2 border-t border-white/20">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">No. Anggota</p>
                    <p className="text-2xl font-mono font-bold text-amber-400 tracking-wider">{noId}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
            </div>
          </CardContent>
        </Card>

        {/* Back Side */}
        <Card className={cn(
          "overflow-hidden border-0 shadow-2xl backface-hidden absolute inset-0 rotate-y-180",
          !isFlipped && "invisible"
        )}>
          <CardContent className="p-0">
            <div className="aspect-video bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 relative overflow-hidden flex flex-col items-center justify-center">
              {/* Large MPJ Logo */}
              <img 
                src={mpjVerticalWhite} 
                alt="MPJ Logo" 
                className="h-32 w-auto mb-4 opacity-90 drop-shadow-lg"
              />

              {/* Social Media Icons */}
              {socialMedia && (
                <div className="flex items-center gap-4 mt-4">
                  {socialMedia.facebook && (
                    <div className="flex items-center gap-1 text-white/70 text-xs">
                      <Facebook className="h-4 w-4" />
                      <span>{socialMedia.facebook}</span>
                    </div>
                  )}
                  {socialMedia.instagram && (
                    <div className="flex items-center gap-1 text-white/70 text-xs">
                      <Instagram className="h-4 w-4" />
                      <span>{socialMedia.instagram}</span>
                    </div>
                  )}
                </div>
              )}
              {socialMedia && (
                <div className="flex items-center gap-4 mt-2">
                  {socialMedia.twitter && (
                    <div className="flex items-center gap-1 text-white/70 text-xs">
                      <Twitter className="h-4 w-4" />
                      <span>{socialMedia.twitter}</span>
                    </div>
                  )}
                  {socialMedia.youtube && (
                    <div className="flex items-center gap-1 text-white/70 text-xs">
                      <Youtube className="h-4 w-4" />
                      <span>{socialMedia.youtube}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flip Button */}
      <div className="flex justify-center mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {isFlipped ? "Lihat Depan" : "Lihat Belakang"}
        </Button>
      </div>
    </div>
  );
};

/**
 * Physical Card Component - Portrait for Events
 * Front: Logo, circular photo, name, asal media, alamat, QR code & No ID
 * Back: MPJ Logo and social media
 */
export const PhysicalMemberCard = ({
  noId,
  name,
  asalMedia,
  alamat,
  role = "Kru Media",
  xp = 0,
  photoUrl,
  lembagaNip,
  socialMedia,
  className,
}: MemberCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  // Generate QR code URL for crew profile
  const cleanNip = lembagaNip?.replace(/\./g, '') || '';
  const cleanNoId = noId.replace(/\./g, '');
  const niamSuffix = cleanNoId.slice(-2);
  const qrUrl = cleanNip ? `${window.location.origin}/pesantren/${cleanNip}/crew/${niamSuffix}` : '';

  return (
    <div className={cn("perspective-1000", className)}>
      <div
        className={cn(
          "relative w-full max-w-[280px] mx-auto transition-transform duration-700 transform-style-preserve-3d cursor-pointer",
          isFlipped && "rotate-y-180"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <Card className={cn(
          "overflow-hidden border-0 shadow-2xl backface-hidden",
          isFlipped && "invisible"
        )}>
          <CardContent className="p-0">
            <div className="aspect-[2/3] bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-900 relative overflow-hidden">
              {/* Header with Logo */}
              <div className="bg-white/10 py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <img src={mpjVerticalColor} alt="MPJ" className="w-10 h-10 object-contain bg-white rounded-full p-1" />
                  <div className="text-center">
                    <h2 className="text-sm font-bold text-white">MEDIA PONDOK</h2>
                    <p className="text-[9px] text-white/80">JAWA TIMUR</p>
                  </div>
                </div>
              </div>

              {/* Photo Section - Circular */}
              <div className="flex justify-center py-4">
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt={name}
                    className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white/30"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-emerald-800 text-3xl font-bold shadow-lg border-4 border-white/30">
                    {initials}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="px-4 text-center space-y-2">
                <div>
                  <h3 className="text-lg font-bold text-white">{name}</h3>
                  <p className="text-sm text-white/80">{asalMedia}</p>
                </div>
                <div className="bg-white/10 rounded-lg py-2 px-3">
                  <p className="text-[10px] text-white/70 line-clamp-2">{alamat}</p>
                </div>
              </div>

              {/* Footer with QR Code */}
              <div className="absolute bottom-0 left-0 right-0 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  {/* QR Code */}
                  <div className="bg-gray-100 p-2 rounded-lg shadow-inner">
                    {qrUrl ? (
                      <QRCodeSVG value={qrUrl} size={56} level="M" includeMargin={false} />
                    ) : (
                      <div className="h-14 w-14 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        No QR
                      </div>
                    )}
                  </div>
                  {/* ID Info */}
                  <div className="flex-1 text-right">
                    <p className="text-[10px] text-gray-500 uppercase">No. Anggota</p>
                    <p className="text-sm font-bold text-emerald-800 font-mono">{noId}</p>
                    <Badge className="mt-1 bg-emerald-800 text-white text-[9px]">
                      {role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Side */}
        <Card className={cn(
          "overflow-hidden border-0 shadow-2xl backface-hidden absolute inset-0 rotate-y-180",
          !isFlipped && "invisible"
        )}>
          <CardContent className="p-0">
            <div className="aspect-[2/3] bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-900 relative overflow-hidden flex flex-col items-center justify-center">
              {/* Large MPJ Logo */}
              <img 
                src={mpjVerticalWhite} 
                alt="MPJ Logo" 
                className="h-40 w-auto mb-4 opacity-90 drop-shadow-lg"
              />

              {/* Social Media Row */}
              {socialMedia && (
                <div className="absolute bottom-6 left-0 right-0 px-4">
                  <div className="flex items-center justify-center gap-3">
                    {socialMedia.instagram && (
                      <div className="flex items-center gap-1 text-white/70 text-[10px]">
                        <Instagram className="h-3 w-3" />
                        <span>{socialMedia.instagram}</span>
                      </div>
                    )}
                    {socialMedia.youtube && (
                      <div className="flex items-center gap-1 text-white/70 text-[10px]">
                        <Youtube className="h-3 w-3" />
                        <span>{socialMedia.youtube}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flip Button */}
      <div className="flex justify-center mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {isFlipped ? "Lihat Depan" : "Lihat Belakang"}
        </Button>
      </div>
    </div>
  );
};

export default { VirtualMemberCard, PhysicalMemberCard };
