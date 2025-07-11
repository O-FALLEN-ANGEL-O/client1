
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import type { User as SupabaseUser, SupabaseClient } from '@supabase/supabase-js';
import { type User } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  role: 'Admin' | 'Staff' | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState<SupabaseClient>(createClient());
  const router = useRouter();

  useEffect(() => {
    const getActiveSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const userProfile: User = {
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email!,
          email: session.user.email!,
          role: profile?.role || 'Staff'
        };
        setUser(userProfile);
      }
      setLoading(false);
    };

    getActiveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const supaUser = session?.user;
        if (supaUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', supaUser.id)
            .single();

          const userProfile: User = {
              id: supaUser.id,
              name: supaUser.user_metadata.name || supaUser.email!,
              email: supaUser.email!,
              role: profile?.role || 'Staff'
          };
          setUser(userProfile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);


  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
        console.error('Login failed:', error.message);
        return false;
    }
    // onAuthStateChange will handle setting the user
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    role: user?.role || null,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
