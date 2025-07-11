"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize supabase client on the client-side
    const supabaseClient = createClient();
    setSupabase(supabaseClient);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const supaUser = session?.user;
        if (supaUser) {
          // In a real app, you would fetch the user role from your own database
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', supaUser.id)
            .single();

          const userProfile: User = {
              id: supaUser.id,
              name: supaUser.user_metadata.name || supaUser.email!,
              email: supaUser.email!,
              role: profile?.role || 'Staff' // Default to staff if not found
          }
          setUser(userProfile);
        } else {
          setUser(null);
          if (pathname !== '/login') {
            router.push('/login');
          }
        }
        setLoading(false);
      }
    );

    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user && pathname !== '/login') {
        router.push('/login');
      }
      setLoading(false);
    }
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);


  const login = async (email: string, pass: string) => {
    if (!supabase) return false;
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
        console.error('Login failed:', error.message);
        return false;
    }
    // The onAuthStateChange listener will handle setting the user and redirecting
    return true;
  };

  const logout = async () => {
    if (!supabase) return;
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
