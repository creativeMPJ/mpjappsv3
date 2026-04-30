import React, { createContext, useContext, useEffect, useState } from 'react';
import { IS_DEV_AUTH_BYPASS_ENABLED, mockProfile, mockUser } from '@/config/devAuth';

export type AppRole = 'user' | 'admin_regional' | 'admin_pusat' | 'admin_finance';
export type AccountStatus = 'pending' | 'active' | 'rejected';
export type ProfileLevel = 'basic' | 'silver' | 'gold' | 'platinum';
export type PaymentStatus = 'paid' | 'unpaid';

export interface AksesItem {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role?: AppRole;
  name?: string;
}

export interface AuthProfile {
  id: string;
  role: string;
  akses: Record<string, AksesItem>;
  is_super_admin: boolean;
  status_account: AccountStatus;
  region_id: string | null;
  profile_level: ProfileLevel;
  status_payment: PaymentStatus;
  nip: string | null;
  nama_pesantren: string | null;
  logo_url: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: { access_token: string } | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  setAuthToken: (token: string) => void;
  refreshAuth: () => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001';
const TOKEN_KEY = 'mpj_auth_token';

const ROLE_MAP: Record<string, AppRole> = {
  user: 'user',
  admin_regional: 'admin_regional',
  admin_pusat: 'admin_pusat',
  admin_finance: 'admin_finance',
  'pengguna pesantren': 'user',
  'admin wilayah': 'admin_regional',
  'admin pusat': 'admin_pusat',
  'admin keuangan': 'admin_finance',
};

const AKSES_KEY_MAP: Record<string, string> = {
  'user-identitas': 'identitas',
  'user-administrasi': 'pembayaran',
  'user-tim': 'tim',
  'user-eid': 'eid',
  'user-hub': 'hub',
  'user-pengaturan': 'pengaturan',
  'admin-pusat-administrasi': 'administrasi',
  'admin-pusat-master-data': 'master-data',
  'admin-pusat-master-regional': 'master-regional',
  'admin-pusat-manajemen-event': 'admin-pusat-manajemen-event',
  'admin-pusat-manajemen-militansi': 'militansi',
  'admin-pusat-mpj-hub': 'mpj-hub',
  'admin-pusat-pengaturan': 'pengaturan',
  'admin-regional-data-master': 'data-master',
  'admin-regional-validasi-pendaftar': 'validasi-pendaftar',
  'admin-regional-manajemen-event': 'admin-regional-manajemen-event',
  'admin-regional-laporan-dokumentasi': 'laporan',
  'admin-regional-late-payment': 'late-payment',
  'admin-regional-download-center': 'download-center',
  'admin-regional-pengaturan': 'pengaturan',
  'admin-finance-verifikasi': 'verifikasi',
  'admin-finance-laporan': 'laporan-keuangan',
  'admin-finance-harga': 'harga',
  'admin-finance-clearing': 'clearing',
  'admin-finance-regional-monitoring': 'regional-monitoring',
  'admin-finance-pengaturan': 'pengaturan',
  'super-admin-user-management': 'user-management',
  'super-admin-hierarchy': 'hierarchy',
  'super-admin-hak-akses': 'hak-akses',
  'super-admin-settings': 'pengaturan',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

async function fetchMe(token: string): Promise<{ user: any } | null> {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

function normalizeRole(rawRole: unknown): AppRole {
  if (typeof rawRole !== 'string') {
    return 'user';
  }

  return ROLE_MAP[rawRole.trim().toLowerCase()] ?? 'user';
}

function normalizeAkses(rawAkses: unknown): Record<string, AksesItem> {
  if (!rawAkses || typeof rawAkses !== 'object' || Array.isArray(rawAkses)) {
    return {};
  }

  const normalized: Record<string, AksesItem> = {};

  for (const [rawKey, rawValue] of Object.entries(rawAkses)) {
    if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
      continue;
    }

    const aksesItem: AksesItem = {
      view: Boolean((rawValue as Partial<AksesItem>).view),
      create: Boolean((rawValue as Partial<AksesItem>).create),
      update: Boolean((rawValue as Partial<AksesItem>).update),
      delete: Boolean((rawValue as Partial<AksesItem>).delete),
    };

    normalized[rawKey] = aksesItem;

    const mappedKey = AKSES_KEY_MAP[rawKey];
    if (mappedKey) {
      normalized[mappedKey] = aksesItem;
    }
  }

  return normalized;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(IS_DEV_AUTH_BYPASS_ENABLED ? mockUser : null);
  const [session, setSession] = useState<{ access_token: string } | null>(
    IS_DEV_AUTH_BYPASS_ENABLED ? { access_token: 'dev-bypass-token' } : null
  );
  const [profile, setProfile] = useState<AuthProfile | null>(IS_DEV_AUTH_BYPASS_ENABLED ? mockProfile : null);
  const [isLoading, setIsLoading] = useState(!IS_DEV_AUTH_BYPASS_ENABLED);

  const signOut = async () => {
    if (IS_DEV_AUTH_BYPASS_ENABLED) {
      setUser(mockUser);
      setSession({ access_token: 'dev-bypass-token' });
      setProfile(mockProfile);
      return;
    }

    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshAuth = async () => {
    if (IS_DEV_AUTH_BYPASS_ENABLED) {
      setUser(mockUser);
      setSession({ access_token: 'dev-bypass-token' });
      setProfile(mockProfile);
      return;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setUser(null);
        setSession(null);
        setProfile(null);
        return;
      }

      const me = await fetchMe(token);
      if (!me?.user) {
        await signOut();
        return;
      }

      setSession({ access_token: token });
      setUser({ id: me.user.id, email: me.user.email });
      setProfile({
        id: me.user.id,
        role: normalizeRole(me.user.role),
        akses: normalizeAkses(me.user.akses),
        is_super_admin: me.user.isSuperAdmin ?? false,
        status_account: me.user.statusAccount ?? 'active',
        region_id: me.user.regionId ?? null,
        profile_level: me.user.profileLevel ?? 'basic',
        status_payment: me.user.statusPayment ?? 'unpaid',
        nip: me.user.nip ?? null,
        nama_pesantren: me.user.namaPesantren ?? null,
        logo_url: me.user.logoUrl ?? null,
      });
    } catch {
      await signOut();
    }
  };

  const setAuthToken = (token: string) => {
    if (IS_DEV_AUTH_BYPASS_ENABLED) {
      setUser(mockUser);
      setSession({ access_token: 'dev-bypass-token' });
      setProfile(mockProfile);
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
  };

  useEffect(() => {
    if (IS_DEV_AUTH_BYPASS_ENABLED) {
      setUser(mockUser);
      setSession({ access_token: 'dev-bypass-token' });
      setProfile(mockProfile);
      setIsLoading(false);
      return;
    }

    refreshAuth().finally(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, signOut, setAuthToken, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
