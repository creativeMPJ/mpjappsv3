import type { AksesItem, AuthProfile, AuthUser } from '@/contexts/AuthContext';

export const IS_DEV_BYPASS_AUTH = true;
export const DEV_ROLE: 'admin_pusat' | 'admin_regional' = 'admin_pusat';

export const IS_DEV_AUTH_BYPASS_ENABLED = import.meta.env.DEV && IS_DEV_BYPASS_AUTH;

const DEV_AKSES_KEYS = [
  'administrasi',
  'master-data',
  'master-regional',
  'admin-pusat-manajemen-event',
  'militansi',
  'mpj-hub',
  'data-master',
  'validasi-pendaftar',
  'admin-regional-manajemen-event',
  'laporan',
  'late-payment',
  'download-center',
  'pengaturan',
];

const fullAccess: AksesItem = {
  view: true,
  create: true,
  update: true,
  delete: true,
};

const devAkses = DEV_AKSES_KEYS.reduce<Record<string, AksesItem>>((akses, key) => {
  akses[key] = fullAccess;
  return akses;
}, {});

export const mockUser: AuthUser = {
  id: 'dev-user',
  email: 'dev-mode@example.local',
  role: DEV_ROLE,
  name: 'Dev Mode',
};

export const mockProfile: AuthProfile = {
  id: mockUser.id,
  role: DEV_ROLE,
  akses: devAkses,
  is_super_admin: false,
  status_account: 'active',
  region_id: DEV_ROLE === 'admin_regional' ? 'dev-region' : null,
  profile_level: 'platinum',
  status_payment: 'paid',
  nip: 'DEV-USER',
  nama_pesantren: mockUser.name,
  logo_url: null,
};
