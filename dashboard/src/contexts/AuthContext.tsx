'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MUNICIPALITY_ADMIN' | 'USER';
  municipalityId?: string;
  municipality?: {
    name: string;
    city: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkSession = async () => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      setUser(response.data);
      setError(null);
    } catch (err) {
      setUser(null);
      Cookies.remove('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      const { accessToken } = response.data;
      
      // Set cookie with token
      Cookies.set('accessToken', accessToken, {
        expires: 1, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });
      
      await checkSession();
      router.push('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('accessToken');
    setUser(null);
    router.push('/login');
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Protect routes
  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === '/login';
      
      if (!user && !isLoginPage) {
        router.push('/login');
      } else if (user && isLoginPage) {
        router.push('/');
      } else if (user?.role === 'MUNICIPALITY_ADMIN') {
        // Restrict municipality admin access
        const allowedPaths = ['/', '/feedback', '/users', `/users/${user.municipalityId}`];
        if (!allowedPaths.includes(pathname)) {
          router.push('/');
        }
      }
    }
  }, [user, loading, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 