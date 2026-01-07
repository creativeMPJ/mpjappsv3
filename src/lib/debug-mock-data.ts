/**
 * Centralized Mock Data Store for Debug Mode
 * 
 * This is the SINGLE SOURCE OF TRUTH for all debug/audit data across:
 * - Admin Pusat Dashboard
 * - Admin Regional Dashboard
 * - Media Dashboard
 * 
 * All dashboards share this same data to simulate real-world data flow.
 */

import { Database } from "@/integrations/supabase/types";

type ClaimStatus = Database['public']['Enums']['claim_status'];
type PaymentStatus = Database['public']['Enums']['payment_verification_status'];
type ProfileLevel = Database['public']['Enums']['profile_level'];
type AccountStatus = Database['public']['Enums']['account_status'];
type AppRole = Database['public']['Enums']['app_role'];

// Region definitions
export interface MockRegion {
  id: string;
  name: string;
  code: string;
}

// Pesantren profile
export interface MockPesantren {
  id: string;
  nama_pesantren: string;
  nip: string | null;
  region_id: string;
  region_name: string;
  city_name: string;
  status_account: AccountStatus;
  status_payment: 'paid' | 'unpaid';
  profile_level: ProfileLevel;
  nama_pengasuh: string | null;
  nama_media: string | null;
  alamat_singkat?: string | null;
  jumlah_santri?: number | null;
  sejarah?: string | null;
  visi_misi?: string | null;
  logo_url?: string | null;
  foto_pengasuh_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

// Crew member
export interface MockCrew {
  id: string;
  nama: string;
  niam: string | null;
  jabatan: string;
  profile_id: string;
  pesantren_name: string;
  region_id: string;
  region_name: string;
  xp_level: number;
  skill?: string[];
  jabatan_code_id?: string | null;
}

// Pesantren claim
export interface MockClaim {
  id: string;
  user_id: string;
  pesantren_name: string;
  status: ClaimStatus;
  region_id: string;
  region_name: string;
  kecamatan: string | null;
  nama_pengelola: string | null;
  email_pengelola: string | null;
  dokumen_bukti_url: string | null;
  notes: string | null;
  claimed_at: string;
  created_at: string;
  jenis_pengajuan: 'klaim' | 'pesantren_baru';
  nama_pengasuh?: string | null;
  alamat_singkat?: string | null;
  no_wa_pendaftar?: string | null;
}

// Payment record
export interface MockPayment {
  id: string;
  user_id: string;
  pesantren_claim_id: string;
  base_amount: number;
  unique_code: number;
  total_amount: number;
  status: PaymentStatus;
  created_at: string;
  proof_file_url: string | null;
  rejection_reason: string | null;
  pesantren_name: string;
  nama_pengelola: string;
  region_name: string;
  jenis_pengajuan: 'klaim' | 'pesantren_baru';
  verified_at?: string | null;
  nip_issued?: string | null;
}

// Admin profile
export interface MockAdminProfile {
  id: string;
  nama_pesantren: string;
  region_id: string | null;
  region_name: string | null;
  city_name?: string | null;
  region_code?: string | null;
  role: AppRole;
  status_account: AccountStatus;
  status_payment: 'paid' | 'unpaid';
  profile_level: ProfileLevel;
  nip?: string | null;
  nama_pengasuh?: string | null;
  nama_media?: string | null;
}

// ============= REGIONS =============
export const MOCK_REGIONS: MockRegion[] = [
  { id: 'malang-id', name: 'Malang Raya', code: '01' },
  { id: 'kediri-id', name: 'Kediri Raya', code: '02' },
  { id: 'jombang-id', name: 'Jombang', code: '07' },
  { id: 'probolinggo-id', name: 'Probolinggo', code: '10' },
];

// ============= PESANTREN (10 entries from 4 regions) =============
export const MOCK_PESANTREN: MockPesantren[] = [
  // Malang (01) - 3 entries
  { id: 'p1', nama_pesantren: 'PP Al-Hikmah Singosari', nip: '2601001', region_id: 'malang-id', region_name: 'Malang Raya', city_name: 'Kota Malang', status_account: 'active', status_payment: 'paid', profile_level: 'platinum', nama_pengasuh: 'KH. Ahmad Fauzi', nama_media: 'Media Al-Hikmah TV', alamat_singkat: 'Jl. Raya Singosari No. 123', jumlah_santri: 250, sejarah: 'Didirikan tahun 1980', visi_misi: 'Mencetak generasi Qurani', logo_url: '/placeholder.svg', foto_pengasuh_url: '/placeholder.svg', latitude: -7.9666, longitude: 112.6326 },
  { id: 'p2', nama_pesantren: 'PP Nurul Huda Kepanjen', nip: '2601002', region_id: 'malang-id', region_name: 'Malang Raya', city_name: 'Kab. Malang', status_account: 'active', status_payment: 'paid', profile_level: 'gold', nama_pengasuh: 'KH. Zainuddin', nama_media: 'Media Nurul Huda' },
  { id: 'p3', nama_pesantren: 'PP Darul Ulum Pakis', nip: null, region_id: 'malang-id', region_name: 'Malang Raya', city_name: 'Kab. Malang', status_account: 'pending', status_payment: 'unpaid', profile_level: 'silver', nama_pengasuh: 'Nyai Hj. Fatimah', nama_media: 'Media Darul Ulum' },
  // Kediri (02) - 2 entries
  { id: 'p4', nama_pesantren: 'PP Lirboyo', nip: '2602001', region_id: 'kediri-id', region_name: 'Kediri Raya', city_name: 'Kota Kediri', status_account: 'active', status_payment: 'paid', profile_level: 'platinum', nama_pengasuh: 'KH. Anwar Mansur', nama_media: 'Media Lirboyo' },
  { id: 'p5', nama_pesantren: 'PP Al-Falah Ploso', nip: '2602002', region_id: 'kediri-id', region_name: 'Kediri Raya', city_name: 'Kab. Kediri', status_account: 'active', status_payment: 'paid', profile_level: 'gold', nama_pengasuh: 'KH. Misbahul Munir', nama_media: 'Media Al-Falah' },
  // Jombang (07) - 3 entries
  { id: 'p6', nama_pesantren: 'PP Tebuireng', nip: '2607001', region_id: 'jombang-id', region_name: 'Jombang', city_name: 'Jombang', status_account: 'active', status_payment: 'paid', profile_level: 'platinum', nama_pengasuh: 'KH. Abdul Hakim', nama_media: 'Media Tebuireng' },
  { id: 'p7', nama_pesantren: 'PP Darul Ulum Rejoso', nip: '2607002', region_id: 'jombang-id', region_name: 'Jombang', city_name: 'Jombang', status_account: 'active', status_payment: 'paid', profile_level: 'gold', nama_pengasuh: 'KH. Tamim Romli', nama_media: 'Media Darul Ulum Rejoso' },
  { id: 'p8', nama_pesantren: 'PP Bahrul Ulum Tambakberas', nip: '2607003', region_id: 'jombang-id', region_name: 'Jombang', city_name: 'Jombang', status_account: 'active', status_payment: 'paid', profile_level: 'silver', nama_pengasuh: 'KH. Syaiful Bahri', nama_media: 'Media Bahrul Ulum' },
  // Probolinggo (10) - 2 entries
  { id: 'p9', nama_pesantren: 'PP Nurul Jadid Paiton', nip: '2610001', region_id: 'probolinggo-id', region_name: 'Probolinggo', city_name: 'Probolinggo', status_account: 'active', status_payment: 'paid', profile_level: 'platinum', nama_pengasuh: 'KH. Zaini', nama_media: 'Media Nurul Jadid' },
  { id: 'p10', nama_pesantren: 'PP Zainul Hasan Genggong', nip: '2610002', region_id: 'probolinggo-id', region_name: 'Probolinggo', city_name: 'Probolinggo', status_account: 'active', status_payment: 'paid', profile_level: 'gold', nama_pengasuh: 'KH. Hasan', nama_media: 'Media Zainul Hasan' },
];

// ============= CREWS (10 entries from multiple pesantren) =============
export const MOCK_CREWS: MockCrew[] = [
  // Malang
  { id: 'c1', nama: 'Ahmad Rizky', niam: 'AN260100101', jabatan: 'Videografer', profile_id: 'p1', pesantren_name: 'PP Al-Hikmah Singosari', region_id: 'malang-id', region_name: 'Malang Raya', xp_level: 1500, skill: ['Videografi'] },
  { id: 'c2', nama: 'Budi Santoso', niam: 'AN260100102', jabatan: 'Editor', profile_id: 'p1', pesantren_name: 'PP Al-Hikmah Singosari', region_id: 'malang-id', region_name: 'Malang Raya', xp_level: 2500, skill: ['Editing'] },
  { id: 'c3', nama: 'Siti Aminah', niam: 'AN260100201', jabatan: 'Admin', profile_id: 'p2', pesantren_name: 'PP Nurul Huda Kepanjen', region_id: 'malang-id', region_name: 'Malang Raya', xp_level: 800, skill: ['Administrasi'] },
  // Kediri
  { id: 'c4', nama: 'Dewi Kartika', niam: 'AN260200101', jabatan: 'Admin Media', profile_id: 'p4', pesantren_name: 'PP Lirboyo', region_id: 'kediri-id', region_name: 'Kediri Raya', xp_level: 3500, skill: ['Social Media'] },
  { id: 'c5', nama: 'Rudi Hartono', niam: 'AN260200102', jabatan: 'Fotografer', profile_id: 'p4', pesantren_name: 'PP Lirboyo', region_id: 'kediri-id', region_name: 'Kediri Raya', xp_level: 1200, skill: ['Fotografi'] },
  // Jombang
  { id: 'c6', nama: 'Eko Prasetyo', niam: 'AN260700101', jabatan: 'Videografer', profile_id: 'p6', pesantren_name: 'PP Tebuireng', region_id: 'jombang-id', region_name: 'Jombang', xp_level: 4800, skill: ['Videografi'] },
  { id: 'c7', nama: 'Nur Hidayah', niam: 'AN260700102', jabatan: 'Desainer', profile_id: 'p6', pesantren_name: 'PP Tebuireng', region_id: 'jombang-id', region_name: 'Jombang', xp_level: 950, skill: ['Desain Grafis'] },
  { id: 'c8', nama: 'Hadi Wijaya', niam: 'AN260700201', jabatan: 'Editor', profile_id: 'p7', pesantren_name: 'PP Darul Ulum Rejoso', region_id: 'jombang-id', region_name: 'Jombang', xp_level: 2100, skill: ['Editing'] },
  // Probolinggo
  { id: 'c9', nama: 'Fatimah Zahra', niam: 'AN261000101', jabatan: 'Penulis', profile_id: 'p9', pesantren_name: 'PP Nurul Jadid Paiton', region_id: 'probolinggo-id', region_name: 'Probolinggo', xp_level: 6200, skill: ['Penulisan'] },
  { id: 'c10', nama: 'Ali Mahmud', niam: 'AN261000102', jabatan: 'Videografer', profile_id: 'p9', pesantren_name: 'PP Nurul Jadid Paiton', region_id: 'probolinggo-id', region_name: 'Probolinggo', xp_level: 1800, skill: ['Videografi'] },
];

// ============= CLAIMS (Pending & Regional Approved) =============
export const MOCK_CLAIMS: MockClaim[] = [
  // Pending claims (for Regional validation)
  { id: 'claim-1', user_id: 'u1', pesantren_name: 'PP Baru Malang', status: 'pending', region_id: 'malang-id', region_name: 'Malang Raya', kecamatan: 'Singosari', nama_pengelola: 'Ahmad Supriyadi', email_pengelola: 'ahmad@email.com', dokumen_bukti_url: 'https://placehold.co/400x600/png?text=SK+Pesantren', notes: null, claimed_at: '2026-01-05T08:00:00Z', created_at: '2026-01-05T08:00:00Z', jenis_pengajuan: 'pesantren_baru', nama_pengasuh: 'KH. Ahmad Supriyadi', alamat_singkat: 'Jl. Raya Singosari', no_wa_pendaftar: '081234567890' },
  { id: 'claim-2', user_id: 'u2', pesantren_name: 'PP Al-Muttaqin', status: 'pending', region_id: 'kediri-id', region_name: 'Kediri Raya', kecamatan: 'Pare', nama_pengelola: 'Hj. Siti Khadijah', email_pengelola: 'siti@email.com', dokumen_bukti_url: 'https://placehold.co/400x600/png?text=Surat+Tugas', notes: null, claimed_at: '2026-01-04T10:00:00Z', created_at: '2026-01-04T10:00:00Z', jenis_pengajuan: 'klaim', nama_pengasuh: 'KH. Abdullah', no_wa_pendaftar: '081234567891' },
  { id: 'claim-3', user_id: 'u3', pesantren_name: 'PP Riyadlul Ulum', status: 'pending', region_id: 'jombang-id', region_name: 'Jombang', kecamatan: 'Peterongan', nama_pengelola: 'KH. Zainal Abidin', email_pengelola: 'zainal@email.com', dokumen_bukti_url: 'https://placehold.co/400x600/png?text=Dokumen', notes: null, claimed_at: '2026-01-03T09:00:00Z', created_at: '2026-01-03T09:00:00Z', jenis_pengajuan: 'pesantren_baru' },
  { id: 'claim-4', user_id: 'u4', pesantren_name: 'PP Salafiyah Syafiiyah', status: 'pending', region_id: 'probolinggo-id', region_name: 'Probolinggo', kecamatan: 'Kraksaan', nama_pengelola: 'Nyai Hj. Aisyah', email_pengelola: 'aisyah@email.com', dokumen_bukti_url: 'https://placehold.co/400x600/png?text=Surat+Keterangan', notes: null, claimed_at: '2026-01-02T14:00:00Z', created_at: '2026-01-02T14:00:00Z', jenis_pengajuan: 'klaim' },
  // Regional approved (waiting for payment)
  { id: 'claim-10', user_id: 'u10', pesantren_name: 'PP Bustanul Ulum', status: 'regional_approved', region_id: 'malang-id', region_name: 'Malang Raya', kecamatan: 'Lawang', nama_pengelola: 'KH. Hasyim Asyari', email_pengelola: 'hasyim@email.com', dokumen_bukti_url: 'https://placehold.co/400x600/png?text=Approved', notes: null, claimed_at: '2026-01-04T08:00:00Z', created_at: '2026-01-04T08:00:00Z', jenis_pengajuan: 'pesantren_baru' },
  { id: 'claim-11', user_id: 'u11', pesantren_name: 'PP Al-Hidayah', status: 'regional_approved', region_id: 'kediri-id', region_name: 'Kediri Raya', kecamatan: 'Ngadiluwih', nama_pengelola: 'Nyai Aminah', email_pengelola: 'aminah@email.com', dokumen_bukti_url: 'https://placehold.co/400x600/png?text=Approved', notes: null, claimed_at: '2026-01-03T10:00:00Z', created_at: '2026-01-03T10:00:00Z', jenis_pengajuan: 'klaim' },
  { id: 'claim-12', user_id: 'u12', pesantren_name: 'PP Mambaul Hikam', status: 'regional_approved', region_id: 'jombang-id', region_name: 'Jombang', kecamatan: 'Mojowarno', nama_pengelola: 'KH. Abdurrahman Wahid', email_pengelola: 'gus@email.com', dokumen_bukti_url: 'https://placehold.co/400x600/png?text=Approved', notes: null, claimed_at: '2026-01-02T12:00:00Z', created_at: '2026-01-02T12:00:00Z', jenis_pengajuan: 'pesantren_baru' },
  // Rejected
  { id: 'claim-20', user_id: 'u20', pesantren_name: 'PP An-Nur', status: 'rejected', region_id: 'malang-id', region_name: 'Malang Raya', kecamatan: 'Blimbing', nama_pengelola: 'Budi Santoso', email_pengelola: 'budi@email.com', dokumen_bukti_url: null, notes: 'Dokumen tidak valid', claimed_at: '2026-01-01T10:00:00Z', created_at: '2026-01-01T10:00:00Z', jenis_pengajuan: 'klaim' },
];

// ============= PAYMENTS (Various statuses) =============
export const MOCK_PAYMENTS: MockPayment[] = [
  // Pending Payment (belum upload bukti)
  { id: 'pay-001', user_id: 'u10', pesantren_claim_id: 'claim-10', base_amount: 500000, unique_code: 123, total_amount: 500123, status: 'pending_payment', created_at: '2026-01-05T08:00:00Z', proof_file_url: null, rejection_reason: null, pesantren_name: 'PP Bustanul Ulum', nama_pengelola: 'KH. Hasyim Asyari', region_name: 'Malang Raya', jenis_pengajuan: 'pesantren_baru' },
  { id: 'pay-002', user_id: 'u11', pesantren_claim_id: 'claim-11', base_amount: 450000, unique_code: 456, total_amount: 450456, status: 'pending_payment', created_at: '2026-01-04T10:00:00Z', proof_file_url: null, rejection_reason: null, pesantren_name: 'PP Al-Hidayah', nama_pengelola: 'Nyai Aminah', region_name: 'Kediri Raya', jenis_pengajuan: 'klaim' },
  // Pending Verification (sudah upload, menunggu verifikasi Pusat)
  { id: 'pay-003', user_id: 'u3', pesantren_claim_id: 'claim-3', base_amount: 500000, unique_code: 789, total_amount: 500789, status: 'pending_verification', created_at: '2026-01-03T09:00:00Z', proof_file_url: 'https://placehold.co/400x600/22c55e/fff?text=Bukti+Transfer+1', rejection_reason: null, pesantren_name: 'PP Riyadlul Ulum', nama_pengelola: 'KH. Zainal Abidin', region_name: 'Jombang', jenis_pengajuan: 'pesantren_baru' },
  { id: 'pay-004', user_id: 'u4', pesantren_claim_id: 'claim-4', base_amount: 450000, unique_code: 321, total_amount: 450321, status: 'pending_verification', created_at: '2026-01-02T14:00:00Z', proof_file_url: 'https://placehold.co/400x600/3b82f6/fff?text=Bukti+Transfer+2', rejection_reason: null, pesantren_name: 'PP Salafiyah Syafiiyah', nama_pengelola: 'Nyai Hj. Aisyah', region_name: 'Probolinggo', jenis_pengajuan: 'klaim' },
  { id: 'pay-005', user_id: 'u5', pesantren_claim_id: 'claim-5', base_amount: 500000, unique_code: 654, total_amount: 500654, status: 'pending_verification', created_at: '2026-01-01T11:00:00Z', proof_file_url: 'https://placehold.co/400x600/8b5cf6/fff?text=Bukti+Transfer+3', rejection_reason: null, pesantren_name: 'PP Miftahul Huda', nama_pengelola: 'KH. Abdul Rahman', region_name: 'Malang Raya', jenis_pengajuan: 'pesantren_baru' },
  // Verified (sudah terverifikasi & NIP diterbitkan)
  { id: 'pay-006', user_id: 'u6', pesantren_claim_id: 'claim-6', base_amount: 500000, unique_code: 987, total_amount: 500987, status: 'verified', created_at: '2025-12-20T08:00:00Z', proof_file_url: 'https://placehold.co/400x600/10b981/fff?text=VERIFIED', rejection_reason: null, pesantren_name: 'PP Darussalam', nama_pengelola: 'KH. Muhammad Ridwan', region_name: 'Kediri Raya', jenis_pengajuan: 'pesantren_baru', verified_at: '2025-12-21T10:00:00Z', nip_issued: '2602003' },
  { id: 'pay-007', user_id: 'u7', pesantren_claim_id: 'claim-7', base_amount: 450000, unique_code: 159, total_amount: 450159, status: 'verified', created_at: '2025-12-15T09:00:00Z', proof_file_url: 'https://placehold.co/400x600/10b981/fff?text=VERIFIED+2', rejection_reason: null, pesantren_name: 'PP Roudlotul Jannah', nama_pengelola: 'Nyai Hj. Fatimah', region_name: 'Jombang', jenis_pengajuan: 'klaim', verified_at: '2025-12-16T14:00:00Z', nip_issued: '2607004' },
  // Rejected (ditolak dengan alasan)
  { id: 'pay-008', user_id: 'u8', pesantren_claim_id: 'claim-8', base_amount: 500000, unique_code: 753, total_amount: 500753, status: 'rejected', created_at: '2025-12-10T10:00:00Z', proof_file_url: 'https://placehold.co/400x600/ef4444/fff?text=REJECTED', rejection_reason: 'Nominal transfer tidak sesuai dengan total tagihan', pesantren_name: 'PP An-Nur', nama_pengelola: 'Ahmad Fauzi', region_name: 'Probolinggo', jenis_pengajuan: 'pesantren_baru' },
  { id: 'pay-009', user_id: 'u9', pesantren_claim_id: 'claim-9', base_amount: 450000, unique_code: 852, total_amount: 450852, status: 'rejected', created_at: '2025-12-05T11:00:00Z', proof_file_url: 'https://placehold.co/400x600/ef4444/fff?text=REJECTED+2', rejection_reason: 'Bukti transfer blur/tidak jelas', pesantren_name: 'PP Al-Amin', nama_pengelola: 'Budi Hartono', region_name: 'Malang Raya', jenis_pengajuan: 'klaim' },
];

// ============= ADMIN PROFILES =============
export const MOCK_ADMIN_PUSAT: MockAdminProfile = {
  id: 'mock-admin-pusat',
  nama_pesantren: 'Admin Pusat MPJ',
  region_id: null,
  region_name: null,
  role: 'admin_pusat',
  status_account: 'active',
  status_payment: 'paid',
  profile_level: 'platinum',
};

export const MOCK_ADMIN_REGIONAL_MALANG: MockAdminProfile = {
  id: 'mock-regional-malang',
  nama_pesantren: 'Admin Regional Malang',
  region_id: 'malang-id',
  region_name: 'Malang Raya',
  city_name: 'Kota Malang',
  region_code: '01',
  role: 'admin_regional',
  status_account: 'active',
  status_payment: 'paid',
  profile_level: 'gold',
};

// Media user (Platinum)
export const MOCK_MEDIA_PLATINUM: MockAdminProfile = {
  id: 'p1', // Same as pesantren ID
  nama_pesantren: 'PP Al-Hikmah Singosari',
  nip: '2601001',
  region_id: 'malang-id',
  region_name: 'Malang Raya',
  city_name: 'Kota Malang',
  role: 'user',
  status_account: 'active',
  status_payment: 'paid',
  profile_level: 'platinum',
  nama_pengasuh: 'KH. Ahmad Fauzi',
  nama_media: 'Media Al-Hikmah TV',
};

// Crew member for crew dashboard
export const MOCK_CREW_MILITAN = {
  id: 'c2',
  nama: 'Budi Santoso',
  niam: 'AN260100102',
  jabatan: 'Editor',
  jabatan_code: 'AN',
  xp_level: 2500,
  skill: ['Editing', 'Videografi', 'Desain Grafis'],
  profile_id: 'p1',
  institution_name: 'PP Al-Hikmah Singosari',
  institution_nip: '2601001',
  pesantren_asal: 'PP Al-Hikmah Singosari',
  alamat_asal: 'Jl. Raya Singosari No. 123, Malang',
  nama_panggilan: 'Budi',
  whatsapp: '081234567890',
  prinsip_hidup: 'Salam Khidmah, Salam Militan',
};

// ============= HELPER FUNCTIONS =============

/**
 * Get claims filtered by region for Regional Admin
 */
export const getClaimsByRegion = (regionId: string): MockClaim[] => {
  return MOCK_CLAIMS.filter(c => c.region_id === regionId);
};

/**
 * Get pending claims for a specific region
 */
export const getPendingClaimsByRegion = (regionId: string): MockClaim[] => {
  return MOCK_CLAIMS.filter(c => c.region_id === regionId && c.status === 'pending');
};

/**
 * Get pesantren filtered by region
 */
export const getPesantrenByRegion = (regionId: string): MockPesantren[] => {
  return MOCK_PESANTREN.filter(p => p.region_id === regionId);
};

/**
 * Get crews filtered by region
 */
export const getCrewsByRegion = (regionId: string): MockCrew[] => {
  return MOCK_CREWS.filter(c => c.region_id === regionId);
};

/**
 * Get payments pending verification (for Admin Pusat)
 */
export const getPaymentsPendingVerification = (): MockPayment[] => {
  return MOCK_PAYMENTS.filter(p => p.status === 'pending_verification');
};

/**
 * Get all regional-approved claims (for Admin Pusat monitoring)
 */
export const getRegionalApprovedClaims = (): MockClaim[] => {
  return MOCK_CLAIMS.filter(c => c.status === 'regional_approved');
};

// ============= COMPLETE DEBUG DATA PACKAGE =============
export const getDebugDataPackage = () => ({
  pesantren: MOCK_PESANTREN,
  crews: MOCK_CREWS,
  claims: MOCK_CLAIMS,
  payments: MOCK_PAYMENTS,
  regions: MOCK_REGIONS,
});

export const getAdminPusatDebugData = () => ({
  profile: MOCK_ADMIN_PUSAT,
  data: getDebugDataPackage(),
});

export const getAdminRegionalDebugData = (regionId: string = 'malang-id') => ({
  profile: MOCK_ADMIN_REGIONAL_MALANG,
  data: {
    pesantren: getPesantrenByRegion(regionId),
    crews: getCrewsByRegion(regionId),
    claims: getClaimsByRegion(regionId),
    pendingClaims: getPendingClaimsByRegion(regionId),
    regions: MOCK_REGIONS,
  },
});

export const getMediaDebugData = () => ({
  profile: MOCK_MEDIA_PLATINUM,
  crews: MOCK_CREWS.filter(c => c.profile_id === 'p1'),
  payments: MOCK_PAYMENTS.filter(p => p.pesantren_name === 'PP Al-Hikmah Singosari'),
});

// ============= UNIFIED MOCK_DATA OBJECT (for DebugView) =============

export const MOCK_DATA = {
  // Profiles
  adminPusat: MOCK_ADMIN_PUSAT,
  regionalAdmin: MOCK_ADMIN_REGIONAL_MALANG,
  mediaPlatinum: MOCK_MEDIA_PLATINUM,
  crewMilitan: MOCK_CREW_MILITAN,
  
  // Data collections
  pesantrenMultiRegion: MOCK_PESANTREN,
  crewMultiPesantren: MOCK_CREWS,
  regionsForFilter: MOCK_REGIONS,
  paymentsForVerification: MOCK_PAYMENTS,
  claimsRegionalApproved: getRegionalApprovedClaims(),
};
