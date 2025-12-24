// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/lib/api/services/authService';

const IS_DEV = import.meta.env.DEV;

// Demo users (DEV ONLY)
const DEMO_USERS: Record<string, User> = {
  'admin@demo.com': {
    id: 'demo-admin-001',
    name: 'Demo Admin',
    email: 'admin@demo.com',
    phone: '0700000001',
    role: 'admin',
    status: 'active',
    createdAt: new Date(),
  },
  'manager@demo.com': {
    id: 'demo-manager-001',
    name: 'Demo Manager',
    email: 'manager@demo.com',
    phone: '0700000002',
    role: 'manager',
    localMrId: 'demo-localmr-001',
    localMrName: 'Demo Local MR',
    status: 'active',
    createdAt: new Date(),
  },
  'tot@demo.com': {
    id: 'demo-tot-001',
    name: 'Demo TOT',
    email: 'tot@demo.com',
    phone: '0700000003',
    role: 'tot',
    localMrId: 'demo-localmr-001',
    localMrName: 'Demo Local MR',
    status: 'active',
    createdAt: new Date(),
  },
};

const DEMO_PASSWORD = 'demo123';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        // DEV demo session
        if (IS_DEV) {
          const demoUser = localStorage.getItem('demo_user');
          if (demoUser) {
            setUser(JSON.parse(demoUser));
            return;
          }
        }

        const token = authService.getToken();
        if (!token) return;

        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          authService.clearTokens?.();
        }
      } catch (err) {
        console.error('Auth restore failed:', err);
        authService.clearTokens?.();
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // DEV demo login
      if (IS_DEV) {
        const demoUser = DEMO_USERS[email.toLowerCase()];
        if (demoUser && password === DEMO_PASSWORD) {
          localStorage.setItem('demo_user', JSON.stringify(demoUser));
          setUser(demoUser);
          return;
        }
      }

      const response = await authService.login({ email, password });
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (IS_DEV) localStorage.removeItem('demo_user');
      await authService.logout?.();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
