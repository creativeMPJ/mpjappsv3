import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Building2, 
  MapPin,
  ChevronRight,
  Users,
  Filter
} from 'lucide-react';
import { ProfileLevelBadge } from '@/components/shared/LevelBadge';
import { formatNIP, type ProfileLevel } from '@/lib/id-utils';
import logoMPJ from '@/assets/logo-mpj.png';
import { Helmet } from 'react-helmet-async';

interface PesantrenItem {
  id: string;
  nama_pesantren: string | null;
  logo_url: string | null;
  nip: string | null;
  profile_level: ProfileLevel;
  region_id: string | null;
  region?: {
    name: string;
    code: string;
  };
}

interface Region {
  id: string;
  name: string;
  code: string;
}

const PublicDirektori = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pesantrenList, setPesantrenList] = useState<PesantrenItem[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'all');

  // Fetch regions and pesantren data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch regions
        const { data: regionsData } = await supabase
          .from('regions')
          .select('id, name, code')
          .order('name');

        if (regionsData) {
          setRegions(regionsData);
        }

        // Fetch active pesantren with NIP
        const { data: pesantrenData, error } = await supabase
          .from('profiles')
          .select(`
            id,
            nama_pesantren,
            logo_url,
            nip,
            profile_level,
            region_id,
            regions:region_id (name, code)
          `)
          .eq('status_account', 'active')
          .not('nip', 'is', null)
          .order('nama_pesantren');

        if (!error && pesantrenData) {
          const transformed = pesantrenData.map((p) => ({
            ...p,
            region: Array.isArray(p.regions) ? p.regions[0] : p.regions as { name: string; code: string } | undefined
          }));
          setPesantrenList(transformed);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter pesantren based on search and region
  const filteredPesantren = useMemo(() => {
    let filtered = pesantrenList;

    // Filter by region
    if (selectedRegion && selectedRegion !== 'all') {
      filtered = filtered.filter(p => p.region_id === selectedRegion);
    }

    // Filter by search query (name or NIP)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.nama_pesantren?.toLowerCase().includes(query) ||
        p.nip?.includes(query.replace(/\./g, ''))
      );
    }

    return filtered;
  }, [pesantrenList, searchQuery, selectedRegion]);

  // Update URL params
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set('region', value);
    } else {
      params.delete('region');
    }
    setSearchParams(params);
  };

  return (
    <>
      <Helmet>
        <title>Direktori Pesantren - Media Pondok Jawa Timur</title>
        <meta 
          name="description" 
          content="Cari dan temukan pesantren anggota resmi Media Pondok Jawa Timur. Verifikasi keanggotaan dan lihat profil lengkap pesantren." 
        />
        <meta property="og:title" content="Direktori Pesantren - Media Pondok Jawa Timur" />
        <meta 
          property="og:description" 
          content="Cari dan temukan pesantren anggota resmi Media Pondok Jawa Timur. Verifikasi keanggotaan dan lihat profil lengkap pesantren." 
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white py-6 px-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logoMPJ} alt="MPJ" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="font-bold text-xl">Media Pondok Jawa Timur</h1>
                <p className="text-sm text-emerald-100">Direktori Pesantren Anggota</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Search & Filter Section */}
          <Card className="border-emerald-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border-b border-emerald-100">
              <h2 className="font-semibold text-emerald-800 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Cari Pesantren
              </h2>
            </div>
            <CardContent className="p-4 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari berdasarkan nama pesantren atau NIP..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-12 text-base border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 transition-all"
                />
              </div>

              {/* Region Filter */}
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={selectedRegion} onValueChange={handleRegionChange}>
                  <SelectTrigger className="w-full sm:w-64 border-emerald-200">
                    <SelectValue placeholder="Semua Wilayah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Wilayah</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  Menampilkan <span className="font-semibold text-emerald-700">{filteredPesantren.length}</span> pesantren
                  {selectedRegion !== 'all' && regions.find(r => r.id === selectedRegion) && (
                    <> di <span className="font-semibold">{regions.find(r => r.id === selectedRegion)?.name}</span></>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredPesantren.length === 0 ? (
            <Card className="border-amber-200">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  {searchQuery 
                    ? `Tidak ditemukan pesantren dengan kata kunci "${searchQuery}"`
                    : "Tidak ada pesantren terdaftar untuk wilayah ini"
                  }
                </p>
                {(searchQuery || selectedRegion !== 'all') && (
                  <Button
                    variant="outline"
                    className="mt-4 border-amber-300 text-amber-600 hover:bg-amber-50"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRegion('all');
                      setSearchParams({});
                    }}
                  >
                    Reset Filter
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPesantren.map((pesantren) => (
                <Link
                  key={pesantren.id}
                  to={`/pesantren/${formatNIP(pesantren.nip, true)}`}
                  className="group"
                >
                  <Card className="border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Logo */}
                        <Avatar className="w-14 h-14 border-2 border-emerald-100 shadow-sm flex-shrink-0">
                          <AvatarImage src={pesantren.logo_url || ''} alt={pesantren.nama_pesantren || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 font-bold text-lg">
                            {pesantren.nama_pesantren?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors truncate">
                                {pesantren.nama_pesantren}
                              </h3>
                              <p className="text-sm text-amber-600 font-mono mt-0.5">
                                NIP: {formatNIP(pesantren.nip, false)}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>

                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {/* Region */}
                            {pesantren.region && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                <MapPin className="w-3 h-3" />
                                {pesantren.region.name}
                              </span>
                            )}
                            
                            {/* Level Badge */}
                            <ProfileLevelBadge 
                              level={pesantren.profile_level} 
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 py-6">
            <p>Database Resmi Anggota</p>
            <p className="font-semibold text-emerald-700">Media Pondok Jawa Timur</p>
            <p className="mt-2">© {new Date().getFullYear()} MPJ Jawa Timur</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicDirektori;
