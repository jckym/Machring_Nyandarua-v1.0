// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/lib/api/services/authService';

// Demo users for testing different dashboards
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

  // Restore session on app load
  useEffect(() => {
    const loadSession = async () => {
      try {
        // Check for demo user first
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
          setUser(JSON.parse(demoUser));
          setIsLoading(false);
          return;
        }

        const token = authService.getToken();
        if (token) {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
          }
        }
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Check for demo login
      const demoUser = DEMO_USERS[email.toLowerCase()];
      if (demoUser && password === DEMO_PASSWORD) {
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        setUser(demoUser);
        return;
      }

      // Regular API login
      const response = await authService.login({ email, password });
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear demo user if exists
      if (localStorage.getItem('demo_user')) {
        localStorage.removeItem('demo_user');
      } else {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
