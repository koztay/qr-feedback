import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from './api';

interface User {
  id: string;
  email: string;
  role: string;
  municipalityId?: string;
  name: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const token = Cookies.get('accessToken');
    if (token) {
      checkSession();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSession = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error('Session check failed:', err);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;
      
      // Set cookies with proper attributes
      Cookies.set('accessToken', accessToken, { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: 1 // 1 day
      });
      Cookies.set('refreshToken', refreshToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: 7 // 7 days
      });
      
      setUser(user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Invalid credentials';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
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