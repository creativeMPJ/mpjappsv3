import type { AksesItem, AppRole, AuthProfile, AuthUser } from '@/contexts/AuthContext';

export type DevPreviewRole = 'admin_pusat' | 'admin_regional' | 'admin_finance' | 'user' | 'crew';

export const IS_DEV_BYPASS_AUTH = true;
export const IS_DEV_AUTH_BYPASS_ENABLED = import.meta.env.DEV && IS_DEV_BYPASS_AUTH;
export const DEV_ROLE_PREVIEW_STORAGE_KEY = 'mpj_dev_role_preview';
export const DEV_ROLE_PREVIEW_EVENT = 'mpj-dev-role-preview-change';

export interface DevRolePreviewOption {
  role: DevPreviewRole;
  label: string;
  route: string;
  description: string;
}

export const DEV_ROLE_PREVIEW_OPTIONS: DevRolePreviewOption[] = [
  {
    role: 'admin_pusat',
    label: 'Admin Pusat',
    route: '/pusat/beranda',
    description: 'Menampilkan dashboard pusat V4 dan menu pusat.',
  },
  {
    role: 'admin_regional',
    label: 'Admin Regional',
    route: '/regional/beranda',
    description: 'Menampilkan dashboard regional V4 dan menu regional.',
  },
  {
    role: 'admin_finance',
    label: 'Finance',
    route: '/finance/beranda',
    description: 'Menampilkan dashboard finance V4 dan menu finance aktif.',
  },
  {
    role: 'user',
    label: 'Dev Koordinator',
    route: '/media/beranda',
    description: 'Menampilkan dashboard media pesantren V4.',
  },
  {
    role: 'crew',
    label: 'Kru',
    route: '/crew/beranda',
    description: 'Menampilkan dashboard kru V4 yang aman.',
  },
];

interface DevRoleState {
  user: AuthUser;
  profile: AuthProfile;
}

const FULL_ACCESS_KEYS = [
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
  'verifikasi',
  'laporan-keuangan',
  'harga',
  'clearing',
  'regional-monitoring',
  'pengaturan',
  'identitas',
  'pembayaran',
  'tim',
  'eid',
  'user-event',
  'hub',
];

const USER_ACCESS_KEYS = ['identitas', 'pembayaran', 'tim', 'eid', 'user-event', 'hub', 'pengaturan'];
const FINANCE_ACCESS_KEYS = ['verifikasi', 'laporan-keuangan', 'harga', 'clearing', 'regional-monitoring', 'pengaturan'];
const PUSAT_ACCESS_KEYS = ['administrasi', 'master-data', 'master-regional', 'admin-pusat-manajemen-event', 'militansi', 'mpj-hub', 'pengaturan'];
const REGIONAL_ACCESS_KEYS = ['data-master', 'validasi-pendaftar', 'admin-regional-manajemen-event', 'laporan', 'late-payment', 'download-center', 'pengaturan'];
const CREW_ACCESS_KEYS: string[] = [];

const fullAccess: AksesItem = {
  view: true,
  create: true,
  update: true,
  delete: true,
};

function buildAccess(keys: string[]) {
  return keys.reduce<Record<string, AksesItem>>((akses, key) => {
    akses[key] = fullAccess;
    return akses;
  }, {});
}

function buildProfile(params: {
  role: AppRole | DevPreviewRole;
  id?: string;
  name: string;
  email: string;
  statusAccount?: AuthProfile['status_account'];
  statusPayment?: AuthProfile['status_payment'];
  profileLevel?: AuthProfile['profile_level'];
  nip?: string | null;
  logoUrl?: string | null;
  regionId?: string | null;
  isSuperAdmin?: boolean;
  aksesKeys?: string[];
}): DevRoleState {
  const akses = buildAccess(params.aksesKeys ?? []);

  return {
    user: {
      id: params.id ?? `dev-${params.role}`,
      email: params.email,
      role: params.role,
      name: params.name,
    },
    profile: {
      id: params.id ?? `dev-${params.role}`,
      role: params.role,
      akses,
      is_super_admin: params.isSuperAdmin ?? false,
      status_account: params.statusAccount ?? 'active',
      region_id: params.regionId ?? null,
      profile_level: params.profileLevel ?? 'basic',
      status_payment: params.statusPayment ?? 'unpaid',
      nip: params.nip ?? null,
      nama_pesantren: params.name,
      logo_url: params.logoUrl ?? null,
    },
  };
}

const DEV_ROLE_STATES: Record<DevPreviewRole, DevRoleState> = {
  admin_pusat: buildProfile({
    role: 'admin_pusat',
    name: 'Dev Admin Pusat',
    email: 'dev.admin.pusat@example.local',
    statusAccount: 'active',
    statusPayment: 'paid',
    profileLevel: 'platinum',
    nip: 'DEV-PUSAT',
    aksesKeys: PUSAT_ACCESS_KEYS,
  }),
  admin_regional: buildProfile({
    role: 'admin_regional',
    name: 'Dev Admin Regional',
    email: 'dev.admin.regional@example.local',
    statusAccount: 'active',
    statusPayment: 'paid',
    profileLevel: 'platinum',
    regionId: 'dev-region',
    nip: 'DEV-REGIONAL',
    aksesKeys: REGIONAL_ACCESS_KEYS,
  }),
  admin_finance: buildProfile({
    role: 'admin_finance',
    name: 'Dev Finance',
    email: 'dev.finance@example.local',
    statusAccount: 'active',
    statusPayment: 'paid',
    profileLevel: 'silver',
    nip: 'DEV-FINANCE',
    aksesKeys: FINANCE_ACCESS_KEYS,
  }),
  user: buildProfile({
    role: 'user',
    id: 'dev-koordinator',
    name: 'Dev Koordinator',
    email: 'dev.koordinator@example.local',
    statusAccount: 'active',
    statusPayment: 'paid',
    profileLevel: 'platinum',
    nip: 'DEV-MEDIA',
    aksesKeys: USER_ACCESS_KEYS,
  }),
  crew: buildProfile({
    role: 'crew',
    name: 'Dev Kru',
    email: 'dev.kru@example.local',
    statusAccount: 'active',
    statusPayment: 'paid',
    profileLevel: 'silver',
    nip: null,
    aksesKeys: CREW_ACCESS_KEYS,
  }),
};

function isPreviewRole(value: string | null): value is DevPreviewRole {
  return value === 'admin_pusat' || value === 'admin_regional' || value === 'admin_finance' || value === 'user' || value === 'crew';
}

export function getDevPreviewRole(): DevPreviewRole {
  if (!IS_DEV_AUTH_BYPASS_ENABLED || typeof window === 'undefined') {
    return 'admin_pusat';
  }

  const stored = window.localStorage.getItem(DEV_ROLE_PREVIEW_STORAGE_KEY);
  return isPreviewRole(stored) ? stored : 'admin_pusat';
}

export function getDevPreviewRoleForPath(pathname?: string): DevPreviewRole {
  if (!pathname) {
    return getDevPreviewRole();
  }

  const normalizedPath = pathname.split("?")[0] || pathname;
  if (normalizedPath.startsWith("/media")) {
    return "user";
  }

  if (normalizedPath.startsWith("/crew")) {
    return "crew";
  }

  return getDevPreviewRole();
}

export function setDevPreviewRole(role: DevPreviewRole) {
  if (!IS_DEV_AUTH_BYPASS_ENABLED || typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DEV_ROLE_PREVIEW_STORAGE_KEY, role);
  window.dispatchEvent(new CustomEvent(DEV_ROLE_PREVIEW_EVENT, { detail: { role } }));
}

export function getDevAuthState(role: DevPreviewRole = getDevPreviewRole()): DevRoleState {
  return DEV_ROLE_STATES[role] || DEV_ROLE_STATES.admin_pusat;
}

export function getDevPreviewRoute(role: DevPreviewRole) {
  return DEV_ROLE_PREVIEW_OPTIONS.find((option) => option.role === role)?.route ?? '/pusat/beranda';
}

export function getDevPreviewLabel(role: DevPreviewRole) {
  return DEV_ROLE_PREVIEW_OPTIONS.find((option) => option.role === role)?.label ?? 'Dev Preview';
}
