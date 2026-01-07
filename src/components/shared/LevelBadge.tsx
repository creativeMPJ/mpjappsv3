import { Badge } from "@/components/ui/badge";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProfileLevelInfo, getXPLevel, type ProfileLevel, type XPLevel } from "@/lib/id-utils";

interface ProfileLevelBadgeProps {
  level: ProfileLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

/**
 * Profile Level Badge (Silver/Gold/Platinum)
 * Visual tier badge for institution profile completeness
 */
export const ProfileLevelBadge = ({ 
  level, 
  size = 'md', 
  showIcon = true,
  className 
}: ProfileLevelBadgeProps) => {
  const info = getProfileLevelInfo(level);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  // Enhanced 3D shadow effect for white backgrounds
  const getShadowClass = () => {
    switch (level) {
      case "platinum": return "shadow-md shadow-cyan-200/60 ring-1 ring-cyan-300/30";
      case "gold": return "shadow-md shadow-amber-200/60 ring-1 ring-amber-300/30";
      case "silver": return "shadow-md shadow-slate-200/60 ring-1 ring-slate-300/30";
      default: return "shadow-sm";
    }
  };

  return (
    <Badge 
      className={cn(
        info.bgColor,
        info.borderColor,
        info.color,
        sizeClasses[size],
        "font-semibold border",
        getShadowClass(),
        className
      )}
    >
      {showIcon && <span className="mr-1">{info.icon}</span>}
      {info.label}
    </Badge>
  );
};

interface XPLevelBadgeProps {
  xp: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showXP?: boolean;
  className?: string;
}

/**
 * XP Level Badge (Bronze/Silver/Gold/Platinum)
 * Visual tier badge for militansi/XP gamification
 */
export const XPLevelBadge = ({ 
  xp, 
  size = 'md', 
  showIcon = true,
  showXP = false,
  className 
}: XPLevelBadgeProps) => {
  const info = getXPLevel(xp);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  return (
    <Badge 
      className={cn(
        info.color,
        sizeClasses[size],
        "font-semibold text-white shadow-sm border-0",
        className
      )}
    >
      {showIcon && <span className="mr-1">{info.icon}</span>}
      {info.label}
      {showXP && <span className="ml-1.5 opacity-80">({xp} XP)</span>}
    </Badge>
  );
};

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Verified Checkmark Badge
 * Blue checkmark for Platinum verified institutions
 */
export const VerifiedBadge = ({ 
  isVerified, 
  size = 'md',
  showLabel = false,
  className 
}: VerifiedBadgeProps) => {
  if (!isVerified) return null;
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  return (
    <span className={cn("inline-flex items-center gap-1 drop-shadow-sm", className)}>
      <BadgeCheck 
        className={cn(
          sizeClasses[size],
          "text-blue-500 fill-blue-100 drop-shadow-md"
        )} 
      />
      {showLabel && (
        <span className="text-xs text-blue-600 font-semibold drop-shadow-sm">Verified</span>
      )}
    </span>
  );
};

interface InstitutionNameWithVerifiedProps {
  name: string;
  isVerified: boolean;
  className?: string;
  nameClassName?: string;
}

/**
 * Institution Name with Verified Checkmark
 * Shows name with blue checkmark if platinum/verified
 */
export const InstitutionNameWithVerified = ({
  name,
  isVerified,
  className,
  nameClassName,
}: InstitutionNameWithVerifiedProps) => {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={nameClassName}>{name}</span>
      <VerifiedBadge isVerified={isVerified} size="md" />
    </div>
  );
};
