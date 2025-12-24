// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

// Offline demo users - no backend connection
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

  // Restore session from localStorage
  useEffect(() => {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const demoUser = DEMO_USERS[email.toLowerCase()];
      if (demoUser && password === DEMO_PASSWORD) {
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        setUser(demoUser);
        return;
      }

      throw new Error('Invalid credentials. Use demo accounts: admin@demo.com, manager@demo.com, or tot@demo.com with password: demo123');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('demo_user');
    setUser(null);
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
