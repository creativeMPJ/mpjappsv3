import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppRole = 'user' | 'admin_regional' | 'admin_pusat' | 'admin_finance';
export type AccountStatus = 'pending' | 'active' | 'rejected';
export type ProfileLevel = 'basic' | 'silver' | 'gold' | 'platinum';
export type PaymentStatus = 'paid' | 'unpaid';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthProfile {
  id: string;
  role: AppRole;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshAuth = async () => {
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
        role: me.user.role ?? 'user',
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
    localStorage.setItem(TOKEN_KEY, token);
  };

  useEffect(() => {
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
