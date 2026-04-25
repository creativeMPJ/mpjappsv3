/**
 * EVENT MANAGEMENT - Mock Data Store
 * Covers full lifecycle: DRAFT → APPROVED → FINISHED
 * Includes: events, custom fields, participants, payments, tickets, check-ins
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type EventStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'FINISHED';
export type ParticipantType = 'NIAM' | 'UMUM';
export type TicketStatus = 'PENDING_PAYMENT' | 'PENDING_APPROVAL' | 'PAID' | 'REJECTED' | 'ATTENDED';
export type CustomFieldType = 'TEXT' | 'TEXTAREA' | 'RADIO' | 'DROPDOWN' | 'CHECKBOX';

export interface CustomFieldOption {
  label: string;
  value: string;
}

export interface CustomField {
  id: string;
  event_id: string;
  label: string;
  type: CustomFieldType;
  is_required: boolean;
  options?: CustomFieldOption[];
  order: number;
}

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  date_start: string;
  date_end: string;
  location: string;
  location_maps_url?: string;
  status: EventStatus;
  price_niam: number;      // harga untuk anggota (0 = gratis)
  price_umum: number;      // harga untuk umum
  quota: number;
  registered_count: number;
  attended_count: number;
  speakers: { name: string; title: string; photo_url?: string }[];
  custom_fields: CustomField[];
  created_at: string;
  created_by: string;
  category: string;
}

export interface MockParticipant {
  id: string;
  event_id: string;
  type: ParticipantType;
  // NIAM path
  niam?: string;
  // UMUM path
  full_name: string;
  whatsapp: string;
  institution?: string;
  ktp_url?: string;
  // Payment
  ticket_status: TicketStatus;
  invoice_amount: number;
  unique_code: number;
  total_amount: number;
  payment_proof_url?: string;
  rejection_reason?: string;
  paid_at?: string;
  // Ticket
  ticket_code: string;  // unique code for QR
  attended_at?: string;
  // Metadata
  registered_at: string;
  custom_answers?: Record<string, string | string[]>;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: 'evt-001',
    title: 'Workshop Videografi & Dokumentasi Pesantren 2026',
    description: 'Workshop intensif selama 2 hari untuk para kru media pesantren. Peserta akan belajar teknik videografi profesional, editing video, dan storytelling untuk konten pesantren yang menarik.\n\nMateri meliputi:\n- Teknik pengambilan gambar (angle, komposisi, pencahayaan)\n- Editing menggunakan DaVinci Resolve & CapCut\n- Storytelling & narasi konten Islami\n- Distribusi konten di media sosial',
    poster_url: 'https://placehold.co/800x450/166534/ffffff?text=Workshop+Videografi+2026',
    date_start: '2026-05-15T08:00:00Z',
    date_end: '2026-05-16T17:00:00Z',
    location: 'Gedung Serba Guna PP Tebuireng, Jombang',
    location_maps_url: 'https://maps.google.com',
    status: 'APPROVED',
    price_niam: 0,
    price_umum: 150000,
    quota: 50,
    registered_count: 32,
    attended_count: 0,
    speakers: [
      { name: 'Ust. Ahmad Khalid', title: 'Videografer Profesional & Konten Kreator', photo_url: 'https://placehold.co/100x100/166534/fff?text=AK' },
      { name: 'Kak Dewi Kartika', title: 'Editor & Social Media Strategist MPJ', photo_url: 'https://placehold.co/100x100/166534/fff?text=DK' },
    ],
    custom_fields: [
      { id: 'cf-001-1', event_id: 'evt-001', label: 'Ukuran Baju (untuk merchandise)', type: 'RADIO', is_required: true, options: [{ label: 'S', value: 's' }, { label: 'M', value: 'm' }, { label: 'L', value: 'l' }, { label: 'XL', value: 'xl' }, { label: 'XXL', value: 'xxl' }], order: 1 },
      { id: 'cf-001-2', event_id: 'evt-001', label: 'Sudah pernah mengikuti workshop MPJ sebelumnya?', type: 'RADIO', is_required: true, options: [{ label: 'Sudah', value: 'ya' }, { label: 'Belum (baru pertama kali)', value: 'tidak' }], order: 2 },
      { id: 'cf-001-3', event_id: 'evt-001', label: 'Software editing yang sudah dikuasai', type: 'CHECKBOX', is_required: false, options: [{ label: 'CapCut', value: 'capcut' }, { label: 'Adobe Premiere', value: 'premiere' }, { label: 'DaVinci Resolve', value: 'davinci' }, { label: 'Lainnya', value: 'other' }], order: 3 },
      { id: 'cf-001-4', event_id: 'evt-001', label: 'Harapan dari workshop ini', type: 'TEXTAREA', is_required: false, order: 4 },
    ],
    created_at: '2026-04-01T08:00:00Z',
    created_by: 'Admin Pusat',
    category: 'Workshop',
  },
  {
    id: 'evt-002',
    title: 'Rapat Koordinasi Media Pesantren Jatim Q2 2026',
    description: 'Rapat koordinasi triwulanan seluruh koordinator media pesantren se-Jawa Timur. Agenda meliputi evaluasi program Q1, rencana Q2, dan peluncuran program Santri Content Creator.',
    poster_url: 'https://placehold.co/800x450/1e40af/ffffff?text=Rakor+Media+Q2+2026',
    date_start: '2026-06-01T09:00:00Z',
    date_end: '2026-06-01T17:00:00Z',
    location: 'Hotel Santika Malang',
    status: 'APPROVED',
    price_niam: 0,
    price_umum: 75000,
    quota: 100,
    registered_count: 67,
    attended_count: 0,
    speakers: [
      { name: 'KH. Zaini Murtadho', title: 'Ketua Majelis Pimpinan Pusat MPJ', photo_url: 'https://placehold.co/100x100/1e40af/fff?text=ZM' },
    ],
    custom_fields: [
      { id: 'cf-002-1', event_id: 'evt-002', label: 'Sesi yang ingin diikuti', type: 'DROPDOWN', is_required: true, options: [{ label: 'Sesi Pagi (09.00 - 12.00)', value: 'pagi' }, { label: 'Sesi Siang (13.00 - 17.00)', value: 'siang' }, { label: 'Full Day', value: 'full' }], order: 1 },
    ],
    created_at: '2026-04-10T08:00:00Z',
    created_by: 'Admin Pusat',
    category: 'Rapat Koordinasi',
  },
  {
    id: 'evt-003',
    title: 'Pelatihan Desain Grafis Santri Kreatif',
    description: 'Pelatihan desain grafis untuk para santri yang berminat di bidang desain. Menggunakan Canva dan Adobe Illustrator.',
    poster_url: 'https://placehold.co/800x450/7c3aed/ffffff?text=Desain+Grafis+2026',
    date_start: '2026-07-10T08:00:00Z',
    date_end: '2026-07-12T17:00:00Z',
    location: 'Online (Zoom Meeting)',
    status: 'DRAFT',
    price_niam: 0,
    price_umum: 100000,
    quota: 30,
    registered_count: 0,
    attended_count: 0,
    speakers: [],
    custom_fields: [],
    created_at: '2026-04-20T08:00:00Z',
    created_by: 'Admin Pusat',
    category: 'Pelatihan',
  },
  {
    id: 'evt-004',
    title: 'Festival Media Pesantren Nasional 2025',
    description: 'Event tahunan festival media pesantren yang telah selesai dilaksanakan dengan sukses.',
    poster_url: 'https://placehold.co/800x450/374151/ffffff?text=Festival+Media+2025',
    date_start: '2025-11-20T08:00:00Z',
    date_end: '2025-11-21T17:00:00Z',
    location: 'Jakarta Convention Center',
    status: 'FINISHED',
    price_niam: 0,
    price_umum: 200000,
    quota: 200,
    registered_count: 187,
    attended_count: 164,
    speakers: [
      { name: 'Ust. Bachtiar Nasir', title: 'Dai & Content Creator Nasional', photo_url: 'https://placehold.co/100x100/374151/fff?text=BN' },
    ],
    custom_fields: [],
    created_at: '2025-09-01T08:00:00Z',
    created_by: 'Admin Pusat',
    category: 'Festival',
  },
  {
    id: 'evt-005',
    title: 'Pelatihan Jurnalistik Digital 2026',
    description: 'Pelatihan menulis berita dan artikel opini untuk media online.',
    poster_url: 'https://placehold.co/800x450/c2410c/ffffff?text=Jurnalistik+Digital',
    date_start: '2026-08-15T08:00:00Z',
    date_end: '2026-08-16T15:00:00Z',
    location: 'Zoom Meeting',
    status: 'PENDING',
    price_niam: 0,
    price_umum: 50000,
    quota: 150,
    registered_count: 85,
    attended_count: 0,
    speakers: [],
    custom_fields: [],
    created_at: '2026-04-22T08:00:00Z',
    created_by: 'Admin Pusat',
    category: 'Pelatihan',
  },
  {
    id: 'evt-006',
    title: 'Seminar Nasional Santri Milenial',
    description: 'Seminar inspiratif untuk membangkitkan semangat santri milenial dalam berkarya dan berprestasi.',
    poster_url: 'https://placehold.co/800x450/1d4ed8/ffffff?text=Seminar+Santri',
    date_start: '2026-09-10T09:00:00Z',
    date_end: '2026-09-10T13:00:00Z',
    location: 'Gedung Kesenian Cak Durasim, Surabaya',
    status: 'DRAFT',
    price_niam: 20000,
    price_umum: 100000,
    quota: 300,
    registered_count: 210,
    attended_count: 0,
    speakers: [
      { name: 'Dr. Fachrudin', title: 'Pakar Pendidikan', photo_url: 'https://placehold.co/100x100/1d4ed8/fff?text=DF' }
    ],
    custom_fields: [],
    created_at: '2026-04-24T08:00:00Z',
    created_by: 'Admin Daerah',
    category: 'Seminar',
  },
];

// ─── PARTICIPANTS ─────────────────────────────────────────────────────────────

export const MOCK_PARTICIPANTS: MockParticipant[] = [
  // evt-001 – NIAM participants (paid / free)
  {
    id: 'ptc-001',
    event_id: 'evt-001',
    type: 'NIAM',
    niam: 'AN260100101',
    full_name: 'Ahmad Rizky',
    whatsapp: '081234567890',
    institution: 'PP Al-Hikmah Singosari',
    ticket_status: 'PAID',
    invoice_amount: 0,
    unique_code: 0,
    total_amount: 0,
    ticket_code: 'TKT-EVT001-ARXK',
    registered_at: '2026-04-05T08:00:00Z',
    paid_at: '2026-04-05T08:01:00Z',
    custom_answers: { 'cf-001-1': 'm', 'cf-001-2': 'ya', 'cf-001-3': ['capcut', 'premiere'] },
  },
  {
    id: 'ptc-002',
    event_id: 'evt-001',
    type: 'NIAM',
    niam: 'AN260100102',
    full_name: 'Budi Santoso',
    whatsapp: '081234567891',
    institution: 'PP Al-Hikmah Singosari',
    ticket_status: 'PAID',
    invoice_amount: 0,
    unique_code: 0,
    total_amount: 0,
    ticket_code: 'TKT-EVT001-BDSN',
    registered_at: '2026-04-06T09:00:00Z',
    paid_at: '2026-04-06T09:01:00Z',
    custom_answers: { 'cf-001-1': 'l', 'cf-001-2': 'tidak' },
  },
  {
    id: 'ptc-003',
    event_id: 'evt-001',
    type: 'UMUM',
    full_name: 'Rizal Fadhilah',
    whatsapp: '082334567892',
    institution: 'Universitas Islam Malang',
    ktp_url: 'https://placehold.co/400x250/166534/fff?text=KTP+Rizal',
    ticket_status: 'PENDING_APPROVAL',
    invoice_amount: 150000,
    unique_code: 12,
    total_amount: 150012,
    payment_proof_url: 'https://placehold.co/400x600/22c55e/fff?text=Bukti+Transfer',
    ticket_code: 'TKT-EVT001-RZFL',
    registered_at: '2026-04-07T10:00:00Z',
    custom_answers: { 'cf-001-1': 's', 'cf-001-2': 'tidak', 'cf-001-4': 'Ingin belajar teknik storytelling untuk konten pesantren' },
  },
  {
    id: 'ptc-004',
    event_id: 'evt-001',
    type: 'UMUM',
    full_name: 'Siti Nurhaliza',
    whatsapp: '085234567893',
    institution: 'Pondok Pesantren Al-Barokah',
    ktp_url: 'https://placehold.co/400x250/166534/fff?text=KTP+Siti',
    ticket_status: 'PENDING_PAYMENT',
    invoice_amount: 150000,
    unique_code: 37,
    total_amount: 150037,
    ticket_code: 'TKT-EVT001-STNR',
    registered_at: '2026-04-08T11:00:00Z',
    custom_answers: { 'cf-001-1': 'm', 'cf-001-2': 'tidak' },
  },
  {
    id: 'ptc-005',
    event_id: 'evt-001',
    type: 'NIAM',
    niam: 'AN260300101',
    full_name: 'Eko Prasetyo',
    whatsapp: '081234567894',
    institution: 'PP Tebuireng',
    ticket_status: 'PAID',
    invoice_amount: 0,
    unique_code: 0,
    total_amount: 0,
    ticket_code: 'TKT-EVT001-EKOP',
    registered_at: '2026-04-09T08:00:00Z',
    paid_at: '2026-04-09T08:01:00Z',
    custom_answers: { 'cf-001-1': 'xl', 'cf-001-2': 'ya', 'cf-001-3': ['premiere', 'davinci'] },
  },
  {
    id: 'ptc-006',
    event_id: 'evt-001',
    type: 'UMUM',
    full_name: 'Hendra Kusuma',
    whatsapp: '088234567895',
    institution: 'SMK Islam Malang',
    ktp_url: 'https://placehold.co/400x250/166534/fff?text=KTP+Hendra',
    ticket_status: 'REJECTED',
    invoice_amount: 150000,
    unique_code: 58,
    total_amount: 150058,
    payment_proof_url: 'https://placehold.co/400x600/ef4444/fff?text=Bukti+Salah',
    rejection_reason: 'Nominal transfer tidak sesuai. Harap transfer ulang sesuai nominal invoice.',
    ticket_code: 'TKT-EVT001-HNDK',
    registered_at: '2026-04-10T14:00:00Z',
    custom_answers: { 'cf-001-1': 'l', 'cf-001-2': 'tidak' },
  },
  // evt-002 participants
  {
    id: 'ptc-007',
    event_id: 'evt-002',
    type: 'NIAM',
    niam: 'KD260100100',
    full_name: 'Muhammad Fadli',
    whatsapp: '081234567896',
    institution: 'PP Al-Hikmah Singosari',
    ticket_status: 'PAID',
    invoice_amount: 0,
    unique_code: 0,
    total_amount: 0,
    ticket_code: 'TKT-EVT002-MHFD',
    registered_at: '2026-04-11T08:00:00Z',
    paid_at: '2026-04-11T08:01:00Z',
    custom_answers: { 'cf-002-1': 'full' },
  },
  // evt-004 (FINISHED) - attended
  {
    id: 'ptc-008',
    event_id: 'evt-004',
    type: 'NIAM',
    niam: 'AN261000101',
    full_name: 'Fatimah Zahra',
    whatsapp: '081234567897',
    institution: 'PP Nurul Jadid Paiton',
    ticket_status: 'ATTENDED',
    invoice_amount: 0,
    unique_code: 0,
    total_amount: 0,
    ticket_code: 'TKT-EVT004-FTMZ',
    registered_at: '2025-10-15T08:00:00Z',
    paid_at: '2025-10-15T08:01:00Z',
    attended_at: '2025-11-20T08:45:00Z',
  },
  {
    id: 'ptc-009',
    event_id: 'evt-001',
    type: 'UMUM',
    full_name: 'Doni Setiawan',
    whatsapp: '081334567898',
    institution: 'Universitas Brawijaya',
    ticket_status: 'PENDING_PAYMENT',
    invoice_amount: 150000,
    unique_code: 88,
    total_amount: 150088,
    ticket_code: 'TKT-EVT001-DNSW',
    registered_at: '2026-04-12T08:00:00Z',
  },
  {
    id: 'ptc-010',
    event_id: 'evt-002',
    type: 'NIAM',
    niam: 'AN260200101',
    full_name: 'Dewi Kartika',
    whatsapp: '081234567899',
    institution: 'PP Lirboyo',
    ticket_status: 'PAID',
    invoice_amount: 0,
    unique_code: 0,
    total_amount: 0,
    ticket_code: 'TKT-EVT002-DWKT',
    registered_at: '2026-04-13T08:00:00Z',
    paid_at: '2026-04-13T08:01:00Z',
  },
  {
    id: 'ptc-011',
    event_id: 'evt-005',
    type: 'UMUM',
    full_name: 'Lukman Hakim',
    whatsapp: '081234567800',
    institution: 'Freelance Writer',
    ticket_status: 'PAID',
    invoice_amount: 50000,
    unique_code: 11,
    total_amount: 50011,
    payment_proof_url: 'https://placehold.co/400x600/22c55e/fff?text=Bukti+Transfer',
    ticket_code: 'TKT-EVT005-LKMH',
    registered_at: '2026-04-23T08:00:00Z',
    paid_at: '2026-04-23T09:00:00Z',
  },
];

// ─── NIAM LOOKUP (untuk validasi saat registrasi) ─────────────────────────────

export interface NIAMProfile {
  niam: string;
  full_name: string;
  institution: string;
  jabatan: string;
  photo_url?: string;
  region_name: string;
}

export const MOCK_NIAM_DATABASE: NIAMProfile[] = [
  { niam: 'AN260100101', full_name: 'Ahmad Rizky', institution: 'PP Al-Hikmah Singosari', jabatan: 'Videografer', photo_url: 'https://placehold.co/100x100/166534/fff?text=AR', region_name: 'Malang Raya' },
  { niam: 'AN260100102', full_name: 'Budi Santoso', institution: 'PP Al-Hikmah Singosari', jabatan: 'Editor', photo_url: 'https://placehold.co/100x100/166534/fff?text=BS', region_name: 'Malang Raya' },
  { niam: 'AN260100201', full_name: 'Siti Aminah', institution: 'PP Nurul Huda Kepanjen', jabatan: 'Admin', photo_url: 'https://placehold.co/100x100/166534/fff?text=SA', region_name: 'Malang Raya' },
  { niam: 'AN260200101', full_name: 'Dewi Kartika', institution: 'PP Lirboyo', jabatan: 'Admin Media', photo_url: 'https://placehold.co/100x100/166534/fff?text=DK', region_name: 'Kediri Raya' },
  { niam: 'AN260200102', full_name: 'Rudi Hartono', institution: 'PP Lirboyo', jabatan: 'Fotografer', photo_url: 'https://placehold.co/100x100/166534/fff?text=RH', region_name: 'Kediri Raya' },
  { niam: 'AN260300101', full_name: 'Eko Prasetyo', institution: 'PP Tebuireng', jabatan: 'Videografer', photo_url: 'https://placehold.co/100x100/166534/fff?text=EP', region_name: 'Jombang & Sekitarnya' },
  { niam: 'AN260300102', full_name: 'Nur Hidayah', institution: 'PP Tebuireng', jabatan: 'Desainer', photo_url: 'https://placehold.co/100x100/166534/fff?text=NH', region_name: 'Jombang & Sekitarnya' },
  { niam: 'AN261000101', full_name: 'Fatimah Zahra', institution: 'PP Nurul Jadid Paiton', jabatan: 'Penulis', photo_url: 'https://placehold.co/100x100/166534/fff?text=FZ', region_name: 'Probolinggo' },
  { niam: 'AN261000102', full_name: 'Ali Mahmud', institution: 'PP Nurul Jadid Paiton', jabatan: 'Videografer', photo_url: 'https://placehold.co/100x100/166534/fff?text=AM', region_name: 'Probolinggo' },
  { niam: 'KD260100100', full_name: 'Muhammad Fadli', institution: 'PP Al-Hikmah Singosari', jabatan: 'Koordinator', photo_url: 'https://placehold.co/100x100/166534/fff?text=MF', region_name: 'Malang Raya' },
];

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

export const getPublicEvents = (): MockEvent[] =>
  MOCK_EVENTS.filter(e => e.status === 'APPROVED' || e.status === 'FINISHED');

export const getApprovedEvents = (): MockEvent[] =>
  MOCK_EVENTS.filter(e => e.status === 'APPROVED');

export const getEventById = (id: string): MockEvent | undefined =>
  MOCK_EVENTS.find(e => e.id === id);

export const getParticipantsByEvent = (eventId: string): MockParticipant[] =>
  MOCK_PARTICIPANTS.filter(p => p.event_id === eventId);

export const getParticipantByTicketCode = (code: string): MockParticipant | undefined =>
  MOCK_PARTICIPANTS.find(p => p.ticket_code === code);

export const lookupNIAM = (niam: string): NIAMProfile | undefined =>
  MOCK_NIAM_DATABASE.find(n => n.niam.toUpperCase() === niam.toUpperCase());

export const getPendingApprovalParticipants = (): (MockParticipant & { event_title: string })[] =>
  MOCK_PARTICIPANTS
    .filter(p => p.ticket_status === 'PENDING_APPROVAL')
    .map(p => ({
      ...p,
      event_title: MOCK_EVENTS.find(e => e.id === p.event_id)?.title ?? '',
    }));

export const generateUniqueCode = (): number =>
  Math.floor(Math.random() * 900) + 100;

export const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export const getEventStats = (eventId: string) => {
  const participants = getParticipantsByEvent(eventId);
  return {
    total: participants.length,
    paid: participants.filter(p => ['PAID', 'ATTENDED'].includes(p.ticket_status)).length,
    pending_payment: participants.filter(p => p.ticket_status === 'PENDING_PAYMENT').length,
    pending_approval: participants.filter(p => p.ticket_status === 'PENDING_APPROVAL').length,
    attended: participants.filter(p => p.ticket_status === 'ATTENDED').length,
    rejected: participants.filter(p => p.ticket_status === 'REJECTED').length,
  };
};

// ─── SPEAKERS ─────────────────────────────────────────────────────────────────

export type SpeakerCategory = "Tech" | "Bisnis" | "Desain" | "Jurnalistik" | "Keagamaan" | "Lainnya";

export interface Speaker {
  id: string;
  nama_lengkap: string;
  bio: string;
  alamat: string;
  no_telp: string;
  foto_url: string;
  kategori: SpeakerCategory;
  keahlian: string[];
  portfolio_url?: string;
  whatsapp_notif_sent: boolean;
}

export const MOCK_SPEAKERS: Speaker[] = [
  {
    id: "sp-001",
    nama_lengkap: "Ust. Ahmad Khalid",
    bio: "Videografer profesional dengan pengalaman 10 tahun di bidang dokumentasi pesantren dan konten Islami.",
    alamat: "Malang, Jawa Timur",
    no_telp: "08123456789",
    foto_url: "https://placehold.co/200x200/166534/fff?text=AK",
    kategori: "Tech",
    keahlian: ["Videografi", "DaVinci Resolve", "Storytelling"],
    portfolio_url: "https://youtube.com",
    whatsapp_notif_sent: true,
  },
  {
    id: "sp-002",
    nama_lengkap: "Kak Dewi Kartika",
    bio: "Editor video & Social Media Strategist MPJ. Spesialis konten viral pesantren.",
    alamat: "Surabaya, Jawa Timur",
    no_telp: "08234567890",
    foto_url: "https://placehold.co/200x200/166534/fff?text=DK",
    kategori: "Desain",
    keahlian: ["CapCut", "Adobe Premiere", "Social Media"],
    portfolio_url: "https://instagram.com",
    whatsapp_notif_sent: false,
  },
  {
    id: "sp-003",
    nama_lengkap: "KH. Zaini Murtadho",
    bio: "Ketua Majelis Pimpinan Pusat MPJ. Pakar komunikasi Islami dan strategi media pesantren nasional.",
    alamat: "Jombang, Jawa Timur",
    no_telp: "08345678901",
    foto_url: "https://placehold.co/200x200/1e40af/fff?text=ZM",
    kategori: "Keagamaan",
    keahlian: ["Public Speaking", "Dakwah Digital", "Kepemimpinan"],
    whatsapp_notif_sent: false,
  },
  {
    id: "sp-004",
    nama_lengkap: "Ust. Bachtiar Nasir",
    bio: "Dai & Content Creator Nasional. Dikenal dengan gaya konten Islami modern.",
    alamat: "Jakarta",
    no_telp: "08456789012",
    foto_url: "https://placehold.co/200x200/374151/fff?text=BN",
    kategori: "Keagamaan",
    keahlian: ["Dakwah Digital", "YouTube", "Podcast"],
    portfolio_url: "https://youtube.com",
    whatsapp_notif_sent: true,
  },
  {
    id: "sp-005",
    nama_lengkap: "Gus Kautsar",
    bio: "Pengasuh pondok pesantren dan dai muda yang inspiratif.",
    alamat: "Kediri, Jawa Timur",
    no_telp: "08567890123",
    foto_url: "https://placehold.co/200x200/4f46e5/fff?text=GK",
    kategori: "Keagamaan",
    keahlian: ["Dakwah", "Fiqih"],
    whatsapp_notif_sent: false,
  },
  {
    id: "sp-006",
    nama_lengkap: "Andi Saputra",
    bio: "Praktisi bisnis digital dan e-commerce specialist.",
    alamat: "Surabaya, Jawa Timur",
    no_telp: "08678901234",
    foto_url: "https://placehold.co/200x200/ea580c/fff?text=AS",
    kategori: "Bisnis",
    keahlian: ["Digital Marketing", "E-commerce", "SEO"],
    portfolio_url: "https://linkedin.com",
    whatsapp_notif_sent: true,
  },
];
