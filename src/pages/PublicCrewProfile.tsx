import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertCircle,
  ShieldCheck,
  Building2,
  User,
  Briefcase,
  ArrowLeft,
  BadgeCheck
} from 'lucide-react';
import { XPLevelBadge } from '@/components/shared/LevelBadge';
import { formatNIAM } from '@/lib/id-utils';
import logoMPJ from '@/assets/logo-mpj.png';

interface CrewData {
  id: string;
  nama: string;
  niam: string | null;
  jabatan: string | null;
  xp_level: number | null;
  profile: {
    id: string;
    nama_pesantren: string | null;
    nip: string | null;
    logo_url: string | null;
  };
}

const PublicCrewProfile = () => {
  const { nip, niamSuffix } = useParams<{ nip: string; niamSuffix: string }>();
  const [crew, setCrew] = useState<CrewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCrewData = async () => {
      if (!nip || !niamSuffix) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const cleanNip = nip.replace(/\./g, '');

        // First get the profile by NIP
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, nama_pesantren, nip, logo_url')
          .eq('nip', cleanNip)
          .eq('status_account', 'active')
          .single();

        if (profileError || !profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Then find crew by NIAM suffix (last 2 digits)
        const { data: crewsData, error: crewsError } = await supabase
          .from('crews')
          .select('id, nama, niam, jabatan, xp_level')
          .eq('profile_id', profileData.id)
          .not('niam', 'is', null);

        if (crewsError || !crewsData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Find crew matching the suffix
        const matchingCrew = crewsData.find(c => 
          c.niam?.endsWith(niamSuffix.padStart(2, '0')) ||
          c.niam === niamSuffix
        );

        if (!matchingCrew) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setCrew({
          ...matchingCrew,
          profile: profileData
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crew:', error);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchCrewData();
  }, [nip, niamSuffix]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-red-200">
          <CardContent className="pt-8 pb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-red-700 mb-2">
              Data Tidak Ditemukan
            </h1>
            <p className="text-gray-600 mb-6">
              Mohon maaf, identitas ini tidak terdaftar atau belum diaktivasi dalam database MPJ Jawa Timur.
            </p>
            <Link to="/">
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                Kembali ke Beranda
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white py-4 px-4 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <img src={logoMPJ} alt="MPJ" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="font-bold text-lg">Media Pesantren Jawa Timur</h1>
            <p className="text-xs text-emerald-100">Verifikasi Personel Resmi</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Back to Pesantren */}
        <Link 
          to={`/pesantren/${nip}`}
          className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Lihat Profil Pesantren
        </Link>

        {/* Crew ID Card */}
        <Card className="border-emerald-200 shadow-xl overflow-hidden">
          {/* Card Header - Gradient */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 text-center text-white relative overflow-hidden">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/4 translate-y-1/4" />
            </div>

            <div className="relative z-10">
              <div className="relative inline-block">
                <Avatar className="w-28 h-28 border-4 border-white/30 shadow-2xl">
                  <AvatarImage src="" alt={crew?.nama || ''} />
                  <AvatarFallback className="bg-white text-emerald-700 text-3xl font-bold">
                    {crew?.nama?.charAt(0) || 'K'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-lg">
                  <BadgeCheck className="w-7 h-7 text-emerald-500 fill-emerald-100" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mt-4">{crew?.nama}</h2>
              <p className="text-emerald-100 text-sm mt-1">{crew?.jabatan || 'Kru Media'}</p>
              
              {crew?.xp_level !== null && crew?.xp_level !== undefined && (
                <div className="mt-3">
                  <XPLevelBadge xp={crew.xp_level} size="md" showXP />
                </div>
              )}
            </div>
          </div>

          {/* Verified Status */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-center border-b border-emerald-100">
            <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-800 px-4 py-2 rounded-full border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-semibold text-sm">PERSONEL TERVERIFIKASI</span>
            </div>
          </div>

          {/* Crew Details */}
          <CardContent className="p-5 space-y-4">
            {/* NIAM */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200 text-center">
              <p className="text-xs text-amber-600 font-medium mb-1 flex items-center justify-center gap-1">
                <User className="w-3 h-3" />
                Nomor Induk Anggota Media
              </p>
              <p className="font-bold text-amber-900 text-xl tracking-widest">
                {formatNIAM(crew?.niam, false)}
              </p>
            </div>

            {/* Jabatan */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                Jabatan
              </p>
              <p className="font-semibold text-blue-900 text-lg">
                {crew?.jabatan || 'Kru Media'}
              </p>
            </div>

            {/* Institution */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs text-slate-600 font-medium mb-2 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Lembaga
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-slate-200">
                  <AvatarImage src={crew?.profile.logo_url || ''} alt={crew?.profile.nama_pesantren || ''} />
                  <AvatarFallback className="bg-slate-100 text-slate-600">
                    {crew?.profile.nama_pesantren?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-800">{crew?.profile.nama_pesantren}</p>
                  <p className="text-xs text-slate-500">NIP: {crew?.profile.nip}</p>
                </div>
              </div>
            </div>

            {/* Official Statement */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-sm text-emerald-800 text-center leading-relaxed">
                <span className="font-semibold">{crew?.nama}</span> adalah kru media resmi dari{' '}
                <span className="font-semibold">{crew?.profile.nama_pesantren}</span>{' '}
                yang terdaftar dalam database MPJ Jawa Timur.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-4">
          <p>Data terverifikasi oleh</p>
          <p className="font-semibold text-emerald-700">Media Pesantren Jawa Timur</p>
          <p className="mt-2">© {new Date().getFullYear()} MPJ Jawa Timur</p>
        </div>
      </div>
    </div>
  );
};

export default PublicCrewProfile;
