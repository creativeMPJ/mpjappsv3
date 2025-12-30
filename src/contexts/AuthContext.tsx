import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AccountStatus = Database['public']['Enums']['account_status'];
type AppRole = Database['public']['Enums']['app_role'];
type ProfileLevel = Database['public']['Enums']['profile_level'];
type PaymentStatus = 'paid' | 'unpaid';

/**
 * Minimal profile object for access control and UI state.
 * Contains fields needed for:
 * - Global access gate (role, status_account)
 * - Dashboard UI state (profile_level, status_payment)
 * Business fields (names, media, assets) are NOT included here.
 */
interface AuthProfile {
  id: string;
  role: AppRole;
  status_account: AccountStatus;
  region_id: string | null;
  profile_level: ProfileLevel;
  status_payment: PaymentStatus;
  nip: string | null; // NIP Lembaga for display
  nama_pesantren: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch ONLY access control fields from profiles.
   * This is the SINGLE SOURCE OF TRUTH for role and status.
   */
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, status_account, region_id, profile_level, status_payment, nip, nama_pesantren')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          role: data.role,
          status_account: data.status_account,
          region_id: data.region_id,
          profile_level: data.profile_level,
          status_payment: data.status_payment as PaymentStatus,
          nip: data.nip,
          nama_pesantren: data.nama_pesantren
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Defer Supabase calls with setTimeout to prevent deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            fetchProfile(currentSession.user.id).finally(() => {
              setIsLoading(false);
            });
          }, 0);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        fetchProfile(existingSession.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
