import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Clock, AlertTriangle } from "lucide-react";

interface BasicMemberBannerProps {
  onActivate: () => void;
  regionalApprovedAt?: string | null;
}

/**
 * Calculate days remaining until 7-day deadline
 */
const calculateDaysRemaining = (approvedAt: string | null): number | null => {
  if (!approvedAt) return null;
  
  const approvedDate = new Date(approvedAt);
  const deadline = new Date(approvedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  
  return diffDays;
};

/**
 * Banner displayed to Basic (unpaid) members to encourage NIP/NIAM activation
 * Shows countdown timer based on regional approval date
 */
const BasicMemberBanner = ({ onActivate, regionalApprovedAt }: BasicMemberBannerProps) => {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  
  useEffect(() => {
    const days = calculateDaysRemaining(regionalApprovedAt || null);
    setDaysRemaining(days);
    
    // Update every hour
    const interval = setInterval(() => {
      setDaysRemaining(calculateDaysRemaining(regionalApprovedAt || null));
    }, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [regionalApprovedAt]);
  
  const isExpired = daysRemaining !== null && daysRemaining <= 0;
  const isUrgent = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 2;
  
  if (isExpired) {
    return (
      <Alert className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-md mb-6">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
          <div className="flex-1">
            <p className="text-red-800 font-medium">
              Masa verifikasi awal telah habis.
            </p>
            <p className="text-red-700 text-sm mt-1">
              Mohon segera selesaikan aktivasi atau hubungi Admin Regional untuk konfirmasi ulang.
            </p>
          </div>
          <Button 
            onClick={onActivate}
            className="bg-red-600 hover:bg-red-700 text-white shrink-0"
          >
            Aktivasi Sekarang
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className={`bg-gradient-to-r ${isUrgent ? 'from-orange-50 to-amber-50 border-orange-200' : 'from-amber-50 to-yellow-50 border-amber-200'} shadow-md mb-6`}>
      <Sparkles className={`h-5 w-5 ${isUrgent ? 'text-orange-600' : 'text-amber-600'}`} />
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`${isUrgent ? 'text-orange-800' : 'text-amber-800'} font-medium`}>
              Akun Anda telah terverifikasi sebagai anggota <strong>Basic</strong>.
            </p>
            {daysRemaining !== null && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isUrgent 
                  ? 'bg-orange-200 text-orange-800' 
                  : 'bg-amber-200 text-amber-800'
              }`}>
                <Clock className="h-3 w-3" />
                {daysRemaining} hari tersisa
              </span>
            )}
          </div>
          <p className={`${isUrgent ? 'text-orange-700' : 'text-amber-700'} text-sm mt-1`}>
            Klik di sini untuk aktivasi pembayaran guna mendapatkan nomor ID digital yaitu <strong>NIP</strong> dan <strong>NIAM</strong>.
          </p>
        </div>
        <Button 
          onClick={onActivate}
          className={`${isUrgent ? 'bg-orange-600 hover:bg-orange-700' : 'bg-amber-600 hover:bg-amber-700'} text-white shrink-0`}
        >
          Aktivasi NIP/NIAM
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default BasicMemberBanner;
