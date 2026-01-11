import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BadgeCheck, 
  Building2, 
  MapPin, 
  User, 
  Users, 
  Globe, 
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Instagram,
  Youtube,
  ExternalLink,
  Search
} from 'lucide-react';
import { ProfileLevelBadge, VerifiedBadge } from '@/components/shared/LevelBadge';
import { formatNIP, formatNIAM, type ProfileLevel } from '@/lib/id-utils';
import logoMPJ from '@/assets/logo-mpj.png';

interface PesantrenData {
  id: string;
  nama_pesantren: string | null;
  nama_pengasuh: string | null;
  nama_media: string | null;
  logo_url: string | null;
  nip: string | null;
  profile_level: ProfileLevel;
  region_id: string | null;
  status_account: string;
  social_links: Record<string, string> | null;
  region?: {
    name: string;
  };
}

interface CrewData {
  id: string;
  nama: string;
  niam: string | null;
  jabatan: string | null;
}

const PublicPesantrenProfile = () => {
  const { nip } = useParams<{ nip: string }>();
  const [pesantren, setPesantren] = useState<PesantrenData | null>(null);
  const [crews, setCrews] = useState<CrewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPesantrenData = async () => {
      if (!nip) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // Clean NIP format (remove dots if any)
        const cleanNip = nip.replace(/\./g, '');

        // Fetch pesantren profile by NIP
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            nama_pesantren,
            nama_pengasuh,
            nama_media,
            logo_url,
            nip,
            profile_level,
            region_id,
            status_account,
            social_links,
            regions:region_id (name)
          `)
          .eq('nip', cleanNip)
          .eq('status_account', 'active')
          .single();

        if (profileError || !profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Transform data - handle nested region object
        const transformedData: PesantrenData = {
          ...profileData,
          social_links: profileData.social_links as Record<string, string> | null,
          region: Array.isArray(profileData.regions) 
            ? profileData.regions[0] 
            : profileData.regions as { name: string } | undefined
        };

        setPesantren(transformedData);

        // Fetch crews with NIAM for this pesantren
        const { data: crewsData, error: crewsError } = await supabase
          .from('crews')
          .select('id, nama, niam, jabatan')
          .eq('profile_id', profileData.id)
          .not('niam', 'is', null)
          .order('niam', { ascending: true });

        if (!crewsError && crewsData) {
          setCrews(crewsData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching pesantren:', error);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchPesantrenData();
  }, [nip]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
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

  const isVerified = pesantren?.profile_level === 'platinum' || pesantren?.profile_level === 'gold';
  const ogTitle = `${pesantren?.nama_pesantren || 'Pesantren'} - Anggota Resmi Media Pondok Jawa Timur`;
  const ogDescription = `Terverifikasi dengan NIP ${formatNIP(pesantren?.nip, false)}. Lihat profil resmi media pesantren ini di MPJ Apps.`;
  const ogImage = pesantren?.logo_url || `${window.location.origin}/favicon.ico`;

  return (
    <>
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${window.location.origin}/pesantren/${nip}`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white py-4 px-4 shadow-lg">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={logoMPJ} alt="MPJ" className="h-10 w-10 object-contain" />
              <div>
                <h1 className="font-bold text-lg">Media Pesantren Jawa Timur</h1>
                <p className="text-xs text-emerald-100">Sistem Verifikasi Anggota Resmi</p>
              </div>
            </div>
            <Link to="/direktori">
              <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Search className="w-4 h-4 mr-1.5" />
                Direktori
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-lg mx-auto p-4 space-y-4">
          {/* Profile Header Card */}
        <Card className="border-emerald-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-center text-white">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                <AvatarImage src={pesantren?.logo_url || ''} alt={pesantren?.nama_pesantren || ''} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
                  {pesantren?.nama_pesantren?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <BadgeCheck className="w-7 h-7 text-blue-500 fill-blue-100" />
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold mt-4 flex items-center justify-center gap-2">
              {pesantren?.nama_pesantren || 'Pesantren'}
              {isVerified && <VerifiedBadge isVerified={true} size="lg" />}
            </h2>
            
            {pesantren?.nama_media && (
              <p className="text-emerald-100 text-sm mt-1">
                {pesantren.nama_media}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-center border-b border-emerald-100">
            <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-800 px-4 py-2 rounded-full border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-semibold text-sm">ANGGOTA AKTIF MPJ JAWA TIMUR</span>
            </div>
          </div>

          {/* Core Info Grid */}
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* NIP */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-3 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Nomor Induk Pesantren
                </p>
                <p className="font-bold text-amber-900 text-lg tracking-wider">
                  {formatNIP(pesantren?.nip, false)}
                </p>
              </div>

              {/* Profile Level */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium mb-1">
                  Level Keanggotaan
                </p>
                <ProfileLevelBadge 
                  level={pesantren?.profile_level || 'basic'} 
                  size="md"
                  className="mt-1"
                />
              </div>

              {/* Region */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Wilayah
                </p>
                <p className="font-semibold text-blue-900 text-sm">
                  {pesantren?.region?.name || 'Jawa Timur'}
                </p>
              </div>

              {/* Pengasuh */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-600 font-medium mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Pengasuh
                </p>
                <p className="font-semibold text-slate-900 text-sm truncate">
                  {pesantren?.nama_pengasuh || '-'}
                </p>
              </div>
            </div>

            {/* Social Links */}
            {pesantren?.social_links && Object.keys(pesantren.social_links).length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-2">Hubungi Media:</p>
                <div className="flex flex-wrap gap-2">
                  {pesantren.social_links.instagram && (
                    <a
                      href={`https://instagram.com/${pesantren.social_links.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      Instagram
                    </a>
                  )}
                  {pesantren.social_links.youtube && (
                    <a
                      href={pesantren.social_links.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      YouTube
                    </a>
                  )}
                  {pesantren.social_links.website && (
                    <a
                      href={pesantren.social_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-slate-700 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Official Crew List */}
        {crews.length > 0 && (
          <Card className="border-emerald-200 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
                <Users className="w-5 h-5" />
                Kru Media Resmi ({crews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {crews.map((crew) => (
                <Link
                  key={crew.id}
                  to={`/pesantren/${nip}/crew/${crew.niam?.slice(-2) || crew.id}`}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                      {crew.nama?.charAt(0) || 'K'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{crew.nama}</p>
                      <p className="text-xs text-gray-500">
                        {crew.jabatan || 'Kru'} • {formatNIAM(crew.niam, false)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-4">
          <p>Data terverifikasi oleh</p>
          <p className="font-semibold text-emerald-700">Media Pesantren Jawa Timur</p>
          <p className="mt-2">© {new Date().getFullYear()} MPJ Jawa Timur</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default PublicPesantrenProfile;
