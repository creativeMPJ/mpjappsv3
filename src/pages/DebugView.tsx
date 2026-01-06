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
  // Admin Pusat mock data
  adminPusat: {
    id: 'mock-admin-pusat',
    nama_pesantren: 'Admin Pusat MPJ',
    region_id: null,
    region_name: null,
    role: 'admin_pusat' as const,
    status_account: 'active' as const,
    status_payment: 'paid' as const,
    profile_level: 'platinum' as const,
  },
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
    { id: '1', nama: 'Ahmad Rizky', niam: 'AN260100101', jabatan: 'Videografer', xp_level: 1500, skill: ['Videografi'], jabatan_code_id: null },
    { id: '2', nama: 'Budi Santoso', niam: 'AN260100102', jabatan: 'Editor', xp_level: 2500, skill: ['Editing'], jabatan_code_id: null },
    { id: '3', nama: 'Cahya Dewi', niam: 'AN260100103', jabatan: 'Desainer', xp_level: 800, skill: ['Desain Grafis'], jabatan_code_id: null },
  ],
  // 10 Pesantren from 4 regions for Master Data testing
  pesantrenMultiRegion: [
    // Malang (01)
    { id: 'p1', nama_pesantren: 'PP Al-Hikmah Singosari', nip: '2601001', region_id: 'malang-id', region_name: 'Malang Raya', status_account: 'active', profile_level: 'platinum', nama_pengasuh: 'KH. Ahmad Fauzi' },
    { id: 'p2', nama_pesantren: 'PP Nurul Huda Kepanjen', nip: '2601002', region_id: 'malang-id', region_name: 'Malang Raya', status_account: 'active', profile_level: 'gold', nama_pengasuh: 'KH. Zainuddin' },
    { id: 'p3', nama_pesantren: 'PP Darul Ulum Pakis', nip: '2601003', region_id: 'malang-id', region_name: 'Malang Raya', status_account: 'pending', profile_level: 'silver', nama_pengasuh: 'Nyai Hj. Fatimah' },
    // Kediri (02)
    { id: 'p4', nama_pesantren: 'PP Lirboyo', nip: '2602001', region_id: 'kediri-id', region_name: 'Kediri Raya', status_account: 'active', profile_level: 'platinum', nama_pengasuh: 'KH. Anwar Mansur' },
    { id: 'p5', nama_pesantren: 'PP Al-Falah Ploso', nip: '2602002', region_id: 'kediri-id', region_name: 'Kediri Raya', status_account: 'active', profile_level: 'gold', nama_pengasuh: 'KH. Misbahul Munir' },
    // Jombang (07)
    { id: 'p6', nama_pesantren: 'PP Tebuireng', nip: '2607001', region_id: 'jombang-id', region_name: 'Jombang', status_account: 'active', profile_level: 'platinum', nama_pengasuh: 'KH. Abdul Hakim' },
    { id: 'p7', nama_pesantren: 'PP Darul Ulum Rejoso', nip: '2607002', region_id: 'jombang-id', region_name: 'Jombang', status_account: 'active', profile_level: 'gold', nama_pengasuh: 'KH. Tamim Romli' },
    { id: 'p8', nama_pesantren: 'PP Bahrul Ulum Tambakberas', nip: '2607003', region_id: 'jombang-id', region_name: 'Jombang', status_account: 'active', profile_level: 'silver', nama_pengasuh: 'KH. Syaiful Bahri' },
    // Probolinggo (10)
    { id: 'p9', nama_pesantren: 'PP Nurul Jadid Paiton', nip: '2610001', region_id: 'probolinggo-id', region_name: 'Probolinggo', status_account: 'active', profile_level: 'platinum', nama_pengasuh: 'KH. Zaini' },
    { id: 'p10', nama_pesantren: 'PP Zainul Hasan Genggong', nip: '2610002', region_id: 'probolinggo-id', region_name: 'Probolinggo', status_account: 'active', profile_level: 'gold', nama_pengasuh: 'KH. Hasan' },
  ],
  // Regions for filter testing
  regionsForFilter: [
    { id: 'malang-id', name: 'Malang Raya', code: '01' },
    { id: 'kediri-id', name: 'Kediri Raya', code: '02' },
    { id: 'jombang-id', name: 'Jombang', code: '07' },
    { id: 'probolinggo-id', name: 'Probolinggo', code: '10' },
  ],
  // Kru from multiple pesantren
  crewMultiPesantren: [
    { id: 'c1', nama: 'Ahmad Rizky', niam: 'AN260100101', jabatan: 'Videografer', pesantren_name: 'PP Al-Hikmah Singosari', region_name: 'Malang Raya' },
    { id: 'c2', nama: 'Budi Santoso', niam: 'AN260100102', jabatan: 'Editor', pesantren_name: 'PP Al-Hikmah Singosari', region_name: 'Malang Raya' },
    { id: 'c3', nama: 'Dewi Kartika', niam: 'AN260200101', jabatan: 'Admin Media', pesantren_name: 'PP Lirboyo', region_name: 'Kediri Raya' },
    { id: 'c4', nama: 'Eko Prasetyo', niam: 'AN260700101', jabatan: 'Fotografer', pesantren_name: 'PP Tebuireng', region_name: 'Jombang' },
    { id: 'c5', nama: 'Fatimah Zahra', niam: 'AN261000101', jabatan: 'Penulis', pesantren_name: 'PP Nurul Jadid Paiton', region_name: 'Probolinggo' },
  ],
  // Payment history mock data for Administrasi testing
  paymentsPaid: [
    {
      id: 'pay-001',
      base_amount: 500000,
      unique_code: 123,
      total_amount: 500123,
      status: 'verified' as const,
      created_at: '2025-01-15T10:00:00Z',
      verified_at: '2025-01-16T14:30:00Z',
      proof_file_url: '/placeholder.svg',
      rejection_reason: null,
    },
    {
      id: 'pay-002',
      base_amount: 450000,
      unique_code: 456,
      total_amount: 450456,
      status: 'verified' as const,
      created_at: '2024-01-10T09:00:00Z',
      verified_at: '2024-01-11T11:00:00Z',
      proof_file_url: '/placeholder.svg',
      rejection_reason: null,
    },
  ],
  paymentsUnpaid: [
    {
      id: 'pay-003',
      base_amount: 500000,
      unique_code: 789,
      total_amount: 500789,
      status: 'pending_payment' as const,
      created_at: '2025-01-20T08:00:00Z',
      verified_at: null,
      proof_file_url: null,
      rejection_reason: null,
    },
    {
      id: 'pay-004',
      base_amount: 450000,
      unique_code: 321,
      total_amount: 450321,
      status: 'pending_verification' as const,
      created_at: '2025-01-18T10:00:00Z',
      verified_at: null,
      proof_file_url: '/placeholder.svg',
      rejection_reason: null,
    },
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              MPJ Debug View
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto px-4">
            Halaman audit untuk menguji tampilan dashboard tanpa login. 
            Klik tombol di bawah untuk menavigasi ke dashboard dengan data simulasi.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              Development Mode Only
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              Mobile Friendly PWA
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Tip: Gunakan tombol device di atas preview untuk menguji tampilan Mobile/Tablet/Desktop
          </p>
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
              <p className="text-xs sm:text-sm text-slate-600">
                Menu: Beranda → Verifikasi (Baru/Legacy) → Data Regional → Event (Soon) → Regional Hub (Soon) → Militansi (Soon) → Pengaturan
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ✓ Mobile Cards, Read-Only Data, Filter Akun Baru/Lama, Detail View
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
                <Badge variant="outline" className="font-mono text-xs">
                  NIP: {formatNIP(MOCK_DATA.mediaPlatinum.nip, true)}
                </Badge>
                <Badge className="bg-green-100 text-green-700">Paid</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Platinum: Paid, Slot 3/3, Card-based UI. 
                Urutan: Beranda → Identitas → Administrasi → Tim Media → E-ID & Aset → Event → MPJ HUB → Pengaturan.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ✓ Mobile Friendly: List Cards, Touch-friendly, Auto-save, Update Data button
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
