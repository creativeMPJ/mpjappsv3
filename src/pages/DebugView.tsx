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
  Eye,
  Crown
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
    { id: 'p1', nama_pesantren: 'PP Al-Hikmah Singosari', nip: '2601001', region_id: 'malang-id', region_name: 'Malang Raya', status_account: 'active', profile_level: 'platinum', nama_pengasuh: 'KH. Ahmad Fauzi', nama_media: 'Media Al-Hikmah TV', city_name: 'Kota Malang' },
    { id: 'p2', nama_pesantren: 'PP Nurul Huda Kepanjen', nip: '2601002', region_id: 'malang-id', region_name: 'Malang Raya', status_account: 'active', profile_level: 'gold', nama_pengasuh: 'KH. Zainuddin', nama_media: 'Media Nurul Huda', city_name: 'Kab. Malang' },
    { id: 'p3', nama_pesantren: 'PP Darul Ulum Pakis', nip: '2601003', region_id: 'malang-id', region_name: 'Malang Raya', status_account: 'pending', profile_level: 'silver', nama_pengasuh: 'Nyai Hj. Fatimah', nama_media: 'Media Darul Ulum', city_name: 'Kab. Malang' },
    // Kediri (02)
    { id: 'p4', nama_pesantren: 'PP Lirboyo', nip: '2602001', region_id: 'kediri-id', region_name: 'Kediri Raya', status_account: 'active', profile_level: 'platinum', nama_pengasuh: 'KH. Anwar Mansur', nama_media: 'Media Lirboyo', city_name: 'Kota Kediri' },
    { id: 'p5', nama_pesantren: 'PP Al-Falah Ploso', nip: '2602002', region_id: 'kediri-id', region_name: 'Kediri Raya', status_account: 'active', profile_level: 'gold', nama_pengasuh: 'KH. Misbahul Munir', nama_media: 'Media Al-Falah', city_name: 'Kab. Kediri' },
    // Jombang (07)
    { id: 'p6', nama_pesantren: 'PP Tebuireng', nip: '2607001', region_id: 'jombang-id', region_name: 'Jombang', status_account: 'active', profile_level: 'platinum', nama_pengasuh: 'KH. Abdul Hakim', nama_media: 'Media Tebuireng', city_name: 'Jombang' },
    { id: 'p7', nama_pesantren: 'PP Darul Ulum Rejoso', nip: '2607002', region_id: 'jombang-id', region_name: 'Jombang', status_account: 'active', profile_level: 'gold', nama_pengasuh: 'KH. Tamim Romli', nama_media: 'Media Darul Ulum Rejoso', city_name: 'Jombang' },
    { id: 'p8', nama_pesantren: 'PP Bahrul Ulum Tambakberas', nip: '2607003', region_id: 'jombang-id', region_name: 'Jombang', status_account: 'active', profile_level: 'silver', nama_pengasuh: 'KH. Syaiful Bahri', nama_media: 'Media Bahrul Ulum', city_name: 'Jombang' },
    // Probolinggo (10)
    { id: 'p9', nama_pesantren: 'PP Nurul Jadid Paiton', nip: '2610001', region_id: 'probolinggo-id', region_name: 'Probolinggo', status_account: 'active', profile_level: 'platinum', nama_pengasuh: 'KH. Zaini', nama_media: 'Media Nurul Jadid', city_name: 'Probolinggo' },
    { id: 'p10', nama_pesantren: 'PP Zainul Hasan Genggong', nip: '2610002', region_id: 'probolinggo-id', region_name: 'Probolinggo', status_account: 'active', profile_level: 'gold', nama_pengasuh: 'KH. Hasan', nama_media: 'Media Zainul Hasan', city_name: 'Probolinggo' },
  ],
  // Regions for filter testing
  regionsForFilter: [
    { id: 'malang-id', name: 'Malang Raya', code: '01' },
    { id: 'kediri-id', name: 'Kediri Raya', code: '02' },
    { id: 'jombang-id', name: 'Jombang', code: '07' },
    { id: 'probolinggo-id', name: 'Probolinggo', code: '10' },
  ],
  // 10 Kru from multiple pesantren across 4 regions
  crewMultiPesantren: [
    // Malang
    { id: 'c1', nama: 'Ahmad Rizky', niam: 'AN260100101', jabatan: 'Videografer', pesantren_name: 'PP Al-Hikmah Singosari', region_id: 'malang-id', region_name: 'Malang Raya', xp_level: 1500 },
    { id: 'c2', nama: 'Budi Santoso', niam: 'AN260100102', jabatan: 'Editor', pesantren_name: 'PP Al-Hikmah Singosari', region_id: 'malang-id', region_name: 'Malang Raya', xp_level: 2500 },
    { id: 'c3', nama: 'Siti Aminah', niam: 'AN260100201', jabatan: 'Admin', pesantren_name: 'PP Nurul Huda Kepanjen', region_id: 'malang-id', region_name: 'Malang Raya', xp_level: 800 },
    // Kediri
    { id: 'c4', nama: 'Dewi Kartika', niam: 'AN260200101', jabatan: 'Admin Media', pesantren_name: 'PP Lirboyo', region_id: 'kediri-id', region_name: 'Kediri Raya', xp_level: 3500 },
    { id: 'c5', nama: 'Rudi Hartono', niam: 'AN260200102', jabatan: 'Fotografer', pesantren_name: 'PP Lirboyo', region_id: 'kediri-id', region_name: 'Kediri Raya', xp_level: 1200 },
    // Jombang
    { id: 'c6', nama: 'Eko Prasetyo', niam: 'AN260700101', jabatan: 'Videografer', pesantren_name: 'PP Tebuireng', region_id: 'jombang-id', region_name: 'Jombang', xp_level: 4800 },
    { id: 'c7', nama: 'Nur Hidayah', niam: 'AN260700102', jabatan: 'Desainer', pesantren_name: 'PP Tebuireng', region_id: 'jombang-id', region_name: 'Jombang', xp_level: 950 },
    { id: 'c8', nama: 'Hadi Wijaya', niam: 'AN260700201', jabatan: 'Editor', pesantren_name: 'PP Darul Ulum Rejoso', region_id: 'jombang-id', region_name: 'Jombang', xp_level: 2100 },
    // Probolinggo
    { id: 'c9', nama: 'Fatimah Zahra', niam: 'AN261000101', jabatan: 'Penulis', pesantren_name: 'PP Nurul Jadid Paiton', region_id: 'probolinggo-id', region_name: 'Probolinggo', xp_level: 6200 },
    { id: 'c10', nama: 'Ali Mahmud', niam: 'AN261000102', jabatan: 'Videografer', pesantren_name: 'PP Nurul Jadid Paiton', region_id: 'probolinggo-id', region_name: 'Probolinggo', xp_level: 1800 },
  ],
  // Payment verification scenarios
  paymentsForVerification: [
    // Pending Payment (belum upload bukti)
    { id: 'pay-001', user_id: 'u1', pesantren_claim_id: 'claim-1', base_amount: 500000, unique_code: 123, total_amount: 500123, status: 'pending_payment', created_at: '2026-01-05T08:00:00Z', proof_file_url: null, rejection_reason: null, pesantren_name: 'PP Baru Malang', nama_pengelola: 'Ahmad Supriyadi', region_name: 'Malang Raya', jenis_pengajuan: 'pesantren_baru' },
    { id: 'pay-002', user_id: 'u2', pesantren_claim_id: 'claim-2', base_amount: 450000, unique_code: 456, total_amount: 450456, status: 'pending_payment', created_at: '2026-01-04T10:00:00Z', proof_file_url: null, rejection_reason: null, pesantren_name: 'PP Al-Muttaqin', nama_pengelola: 'Hj. Siti Khadijah', region_name: 'Kediri Raya', jenis_pengajuan: 'klaim' },
    // Pending Verification (sudah upload, menunggu verifikasi)
    { id: 'pay-003', user_id: 'u3', pesantren_claim_id: 'claim-3', base_amount: 500000, unique_code: 789, total_amount: 500789, status: 'pending_verification', created_at: '2026-01-03T09:00:00Z', proof_file_url: 'https://placehold.co/400x600/png?text=Bukti+Transfer', rejection_reason: null, pesantren_name: 'PP Riyadlul Ulum', nama_pengelola: 'KH. Zainal Abidin', region_name: 'Jombang', jenis_pengajuan: 'pesantren_baru' },
    { id: 'pay-004', user_id: 'u4', pesantren_claim_id: 'claim-4', base_amount: 450000, unique_code: 321, total_amount: 450321, status: 'pending_verification', created_at: '2026-01-02T14:00:00Z', proof_file_url: 'https://placehold.co/400x600/png?text=Bukti+Transfer+2', rejection_reason: null, pesantren_name: 'PP Salafiyah Syafiiyah', nama_pengelola: 'Nyai Hj. Aisyah', region_name: 'Probolinggo', jenis_pengajuan: 'klaim' },
    { id: 'pay-005', user_id: 'u5', pesantren_claim_id: 'claim-5', base_amount: 500000, unique_code: 654, total_amount: 500654, status: 'pending_verification', created_at: '2026-01-01T11:00:00Z', proof_file_url: 'https://placehold.co/400x600/png?text=Bukti+Transfer+3', rejection_reason: null, pesantren_name: 'PP Miftahul Huda', nama_pengelola: 'KH. Abdul Rahman', region_name: 'Malang Raya', jenis_pengajuan: 'pesantren_baru' },
    // Verified (sudah terverifikasi & NIP diterbitkan)
    { id: 'pay-006', user_id: 'u6', pesantren_claim_id: 'claim-6', base_amount: 500000, unique_code: 987, total_amount: 500987, status: 'verified', created_at: '2025-12-20T08:00:00Z', proof_file_url: 'https://placehold.co/400x600/png?text=Verified', rejection_reason: null, pesantren_name: 'PP Darussalam', nama_pengelola: 'KH. Muhammad Ridwan', region_name: 'Kediri Raya', jenis_pengajuan: 'pesantren_baru', verified_at: '2025-12-21T10:00:00Z', nip_issued: '2602003' },
    { id: 'pay-007', user_id: 'u7', pesantren_claim_id: 'claim-7', base_amount: 450000, unique_code: 159, total_amount: 450159, status: 'verified', created_at: '2025-12-15T09:00:00Z', proof_file_url: 'https://placehold.co/400x600/png?text=Verified+2', rejection_reason: null, pesantren_name: 'PP Roudlotul Jannah', nama_pengelola: 'Nyai Hj. Fatimah', region_name: 'Jombang', jenis_pengajuan: 'klaim', verified_at: '2025-12-16T14:00:00Z', nip_issued: '2607004' },
    // Rejected (ditolak dengan alasan)
    { id: 'pay-008', user_id: 'u8', pesantren_claim_id: 'claim-8', base_amount: 500000, unique_code: 753, total_amount: 500753, status: 'rejected', created_at: '2025-12-10T10:00:00Z', proof_file_url: 'https://placehold.co/400x600/png?text=Rejected', rejection_reason: 'Nominal transfer tidak sesuai dengan total tagihan', pesantren_name: 'PP An-Nur', nama_pengelola: 'Ahmad Fauzi', region_name: 'Probolinggo', jenis_pengajuan: 'pesantren_baru' },
    { id: 'pay-009', user_id: 'u9', pesantren_claim_id: 'claim-9', base_amount: 450000, unique_code: 852, total_amount: 450852, status: 'rejected', created_at: '2025-12-05T11:00:00Z', proof_file_url: 'https://placehold.co/400x600/png?text=Rejected+2', rejection_reason: 'Bukti transfer blur/tidak jelas', pesantren_name: 'PP Al-Amin', nama_pengelola: 'Budi Hartono', region_name: 'Malang Raya', jenis_pengajuan: 'klaim' },
  ],
  // Claims approved by regional (waiting for payment)
  claimsRegionalApproved: [
    { id: 'claim-10', user_id: 'u10', pesantren_name: 'PP Bustanul Ulum', nama_pengelola: 'KH. Hasyim Asyari', jenis_pengajuan: 'pesantren_baru', status: 'regional_approved', region_name: 'Malang Raya', created_at: '2026-01-04T08:00:00Z' },
    { id: 'claim-11', user_id: 'u11', pesantren_name: 'PP Al-Hidayah', nama_pengelola: 'Nyai Aminah', jenis_pengajuan: 'klaim', status: 'regional_approved', region_name: 'Kediri Raya', created_at: '2026-01-03T10:00:00Z' },
    { id: 'claim-12', user_id: 'u12', pesantren_name: 'PP Mambaul Hikam', nama_pengelola: 'KH. Abdurrahman Wahid', jenis_pengajuan: 'pesantren_baru', status: 'regional_approved', region_name: 'Jombang', created_at: '2026-01-02T12:00:00Z' },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Pusat Dashboard - COMMAND CENTER */}
          <Card className="hover:shadow-lg transition-shadow border-red-200 ring-2 ring-red-100 md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">Admin Pusat Dashboard</CardTitle>
                    <Badge className="bg-red-100 text-red-700 border-red-200">Command Center</Badge>
                  </div>
                  <CardDescription>Pusat Kendali Tertinggi MPJ Apps</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Role: admin_pusat</Badge>
                <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                <Badge className="bg-amber-100 text-amber-700">Full Access</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
                <div className="space-y-1">
                  <p className="font-medium text-slate-800">Menu Utama:</p>
                  <p>• Beranda (Statistik Global)</p>
                  <p>• Administrasi (Approval Hub)</p>
                  <p>• Master Data (Full CRUD)</p>
                  <p>• Master Regional (Mapping)</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-800">Fitur Testing:</p>
                  <p>• 10 Pesantren dari 4 Regional</p>
                  <p>• 10 Kru dengan XP bervariasi</p>
                  <p>• 9 Payment (Pending/Verified/Rejected)</p>
                  <p>• Filter Regional & Search</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                ✓ Verifikasi Pembayaran, ✓ Terbitkan NIP/NIAM, ✓ Edit/Hapus Data, ✓ Kode Jabatan, ✓ Setting Harga
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white py-6"
                onClick={() => navigateWithState('/admin-pusat', { 
                  debugProfile: MOCK_DATA.adminPusat,
                  debugData: {
                    pesantren: MOCK_DATA.pesantrenMultiRegion,
                    crews: MOCK_DATA.crewMultiPesantren,
                    regions: MOCK_DATA.regionsForFilter,
                    payments: MOCK_DATA.paymentsForVerification,
                    claims: MOCK_DATA.claimsRegionalApproved,
                  }
                })}
              >
                <Crown className="h-5 w-5 mr-2" />
                Buka Command Center
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

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
                Menu: Beranda → Verifikasi → Data Regional → Event (Soon) → Regional Hub (Soon) → Militansi (Soon) → Pengaturan
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ✓ Mobile Cards, Read-Only Data, Filter Akun Baru/Lama
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
