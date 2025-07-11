"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { users, type User } from '@/lib/mock-data';

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
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('smartfee-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('smartfee-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    // This is a mock login function. In a real app, you'd call an API.
    // The prompt specifies bcrypt, but that's a backend concern.
    const foundUser = users.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('smartfee-user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartfee-user');
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
