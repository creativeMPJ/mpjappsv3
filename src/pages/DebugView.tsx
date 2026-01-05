import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Users, 
  MapPin, 
  Shield,
  ArrowRight,
  Sparkles,
  Eye
} from "lucide-react";
import { VirtualIDCard } from "@/components/shared/VirtualIDCard";
import { ProfileLevelBadge, XPLevelBadge, VerifiedBadge } from "@/components/shared/LevelBadge";
import { formatNIP, formatNIAM } from "@/lib/id-utils";

// Comprehensive mock data for debugging/audit
const MOCK_DATA = {
  regionalAdmin: {
    id: 'mock-regional-admin',
    nama_pesantren: 'Admin Regional Malang',
    region_id: 'malang-region-id',
    region_name: 'Malang Raya',
    city_name: 'Kota Malang',
    region_code: '01',
    role: 'admin_regional' as const,
    status_account: 'active' as const,
    status_payment: 'paid' as const,
    profile_level: 'gold' as const,
  },
  mediaPlatinum: {
    id: 'mock-media-platinum',
    nama_pesantren: 'Pondok Pesantren Al-Hikmah',
    nama_pengasuh: 'KH. Ahmad Fauzi',
    nama_media: 'Media Al-Hikmah TV',
    nip: '2601001', // Clean format without dots
    role: 'user' as const,
    status_account: 'active' as const,
    status_payment: 'paid' as const,
    profile_level: 'platinum' as const,
    region_id: 'malang-region-id',
    region_name: 'Malang Raya',
    city_name: 'Kota Malang',
    // Platinum requires all data complete
    alamat_singkat: 'Jl. Raya Pesantren No. 123, Singosari, Malang',
    jumlah_santri: 250,
    sejarah: 'Didirikan pada tahun 1980...',
    visi_misi: 'Mencetak generasi Qurani...',
    logo_url: '/placeholder.svg',
    foto_pengasuh_url: '/placeholder.svg',
    latitude: -7.9666,
    longitude: 112.6326,
  },
  crewMilitan: {
    id: 'mock-crew-militan',
    nama: 'Ahmad Rizky Militan',
    niam: 'AN260100102', // Clean format: AN + 26 + 01 + 001 + 02
    jabatan: 'Kru Media',
    jabatan_code: 'AN',
    xp_level: 2500, // Gold level (2000-5000)
    skill: ['Videografi', 'Editing', 'Desain Grafis'],
    profile_id: 'mock-media-platinum',
    // Parent institution data
    institution_name: 'Pondok Pesantren Al-Hikmah',
    institution_nip: '2601001',
    // Extended crew data for profile form
    pesantren_asal: 'Pondok Pesantren Al-Hikmah',
    alamat_asal: 'Jl. Raya Pesantren No. 45, Singosari, Malang, Jawa Timur',
    nama_panggilan: 'Rizky',
    whatsapp: '081234567890',
    prinsip_hidup: 'Salam Khidmah, Salam Militan',
  },
  // Full crew slots (3/3) for testing Golden 3 rule
  fullCrewSlots: [
    { id: '1', nama: 'Ahmad Rizky', niam: 'AN260100101', jabatan: 'Videografer', xp_level: 1500 },
    { id: '2', nama: 'Budi Santoso', niam: 'AN260100102', jabatan: 'Editor', xp_level: 2500 },
    { id: '3', nama: 'Cahya Dewi', niam: 'AN260100103', jabatan: 'Desainer', xp_level: 800 },
  ],
};

const DebugView = () => {
  const navigate = useNavigate();
  const [activePreview, setActivePreview] = useState<'none' | 'regional' | 'media' | 'crew'>('none');

  const navigateWithState = (path: string, state: Record<string, unknown>) => {
    navigate(path, { state: { ...state, isDebugMode: true } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-emerald-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              MPJ Debug View
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Halaman audit untuk menguji tampilan dashboard tanpa login. 
            Klik tombol di bawah untuk menavigasi ke dashboard dengan data simulasi lengkap.
          </p>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            Development Mode Only
          </Badge>
        </div>

        <Separator />

        {/* ID Format Examples */}
        <Card className="border-2 border-dashed border-emerald-200 bg-emerald-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Format ID Clean (Tanpa Titik/Pemisah)
            </CardTitle>
            <CardDescription>
              Format ID yang bersih dan profesional tanpa pemisah titik
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NIP Example */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">NIP (Nomor Induk Pesantren)</h4>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Format: [YY][RR][XXX]</p>
                  <p className="text-3xl font-mono font-bold text-emerald-700">
                    {formatNIP(MOCK_DATA.mediaPlatinum.nip, true)}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    26 = Tahun, 01 = Malang, 001 = Urutan
                  </p>
                </div>
              </div>
              
              {/* NIAM Example */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">NIAM (Nomor Induk Anggota Media)</h4>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Format: [ROLE][YY][RR][XXX][KK]</p>
                  <p className="text-3xl font-mono font-bold text-emerald-700">
                    {formatNIAM(MOCK_DATA.crewMilitan.niam, true)}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    AN = Kru, 26 = Tahun, 01 = Malang, 001 = Pesantren, 02 = Urutan Kru
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leveling System */}
        <Card className="border-2 border-dashed border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Sistem Leveling 3 Tahap
            </CardTitle>
            <CardDescription>
              Visual tiering berdasarkan kelengkapan profil dan status akun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Silver */}
              <div className="bg-white rounded-lg p-4 border border-slate-200 text-center">
                <ProfileLevelBadge level="silver" size="lg" className="mb-3" />
                <h4 className="font-semibold text-slate-800">Tier 1: SILVER</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Akun aktif (status: active)
                </p>
              </div>
              
              {/* Gold */}
              <div className="bg-white rounded-lg p-4 border border-amber-200 text-center">
                <ProfileLevelBadge level="gold" size="lg" className="mb-3" />
                <h4 className="font-semibold text-slate-800">Tier 2: GOLD</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Data profil tahap 2 lengkap
                </p>
              </div>
              
              {/* Platinum */}
              <div className="bg-white rounded-lg p-4 border border-cyan-200 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <ProfileLevelBadge level="platinum" size="lg" />
                  <VerifiedBadge isVerified={true} size="lg" />
                </div>
                <h4 className="font-semibold text-slate-800">Tier 3: PLATINUM</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Semua data ERD lengkap + Verified
                </p>
              </div>
            </div>
            
            {/* XP Kasta */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3">Militansi XP Badges</h4>
              <div className="flex flex-wrap gap-3">
                <XPLevelBadge xp={100} size="md" showXP />
                <XPLevelBadge xp={700} size="md" showXP />
                <XPLevelBadge xp={2500} size="md" showXP />
                <XPLevelBadge xp={6000} size="md" showXP />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Regional Dashboard */}
          <Card className="hover:shadow-lg transition-shadow border-emerald-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Regional Dashboard</CardTitle>
                  <CardDescription>Admin Regional Malang</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Role: admin_regional</Badge>
                <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
              </div>
              <p className="text-sm text-slate-600">
                Mock data untuk menguji dashboard Admin Regional dengan data wilayah Malang.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePreview(activePreview === 'regional' ? 'none' : 'regional')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => navigateWithState('/admin-regional', { 
                    debugProfile: MOCK_DATA.regionalAdmin 
                  })}
                >
                  Buka Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Media Dashboard */}
          <Card className="hover:shadow-lg transition-shadow border-cyan-200 ring-2 ring-cyan-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Media Dashboard</CardTitle>
                    <VerifiedBadge isVerified={true} size="sm" />
                  </div>
                  <CardDescription>Platinum Verified</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <ProfileLevelBadge level="platinum" size="sm" />
                <Badge variant="outline" className="font-mono">
                  NIP: {formatNIP(MOCK_DATA.mediaPlatinum.nip, true)}
                </Badge>
                <Badge className="bg-green-100 text-green-700">Paid</Badge>
              </div>
              <p className="text-sm text-slate-600">
                Mock data Platinum: Pembayaran Lunas, Slot Kru Penuh (3/3), Diamond Crystal Theme. 
                Nav Order: Beranda → Identitas → Administrasi → Tim Media → E-ID & Aset → Event (Soon) → MPJ HUB (Soon) → Pengaturan.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePreview(activePreview === 'media' ? 'none' : 'media')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  onClick={() => navigateWithState('/user', { 
                    debugProfile: MOCK_DATA.mediaPlatinum 
                  })}
                >
                  Buka Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Crew Dashboard */}
          <Card className="hover:shadow-lg transition-shadow border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Crew Dashboard</CardTitle>
                  <CardDescription>Kru Militan (Gold XP)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <XPLevelBadge xp={MOCK_DATA.crewMilitan.xp_level} size="sm" />
                <Badge variant="outline" className="font-mono">
                  NIAM: {formatNIAM(MOCK_DATA.crewMilitan.niam, true)}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">
                Mock data untuk menguji dashboard Crew dengan XP 2500 (Badge Gold).
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePreview(activePreview === 'crew' ? 'none' : 'crew')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button 
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900"
                  onClick={() => navigateWithState('/user/crew', { 
                    debugCrew: MOCK_DATA.crewMilitan 
                  })}
                >
                  Buka Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ID Card Preview */}
        {activePreview !== 'none' && (
          <Card className="border-2 border-dashed border-slate-300">
            <CardHeader>
              <CardTitle>Preview ID Card</CardTitle>
            </CardHeader>
            <CardContent>
              {activePreview === 'media' && (
                <VirtualIDCard 
                  type="institution"
                  nip={MOCK_DATA.mediaPlatinum.nip}
                  institutionName={MOCK_DATA.mediaPlatinum.nama_pesantren}
                  pengasuhName={MOCK_DATA.mediaPlatinum.nama_pengasuh}
                  isVerified={true}
                />
              )}
              {activePreview === 'crew' && (
                <VirtualIDCard 
                  type="crew"
                  niam={MOCK_DATA.crewMilitan.niam}
                  crewName={MOCK_DATA.crewMilitan.nama}
                  jabatan={MOCK_DATA.crewMilitan.jabatan}
                  xp={MOCK_DATA.crewMilitan.xp_level}
                />
              )}
              {activePreview === 'regional' && (
                <div className="text-center py-8 text-slate-500">
                  Regional Admin tidak memiliki ID Card personal.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 py-4">
          <p>
            Halaman ini hanya untuk development & audit. 
            Tidak tersedia di production.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DebugView;
