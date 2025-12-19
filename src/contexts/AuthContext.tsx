import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Predefined mock users with exact credentials (change password in real app!)
// IDs now match mockData.ts for consistency
const mockUsers: Record<string, User> = {
  'tot@machineryring.ke': {
    id: 'tot-1',
    name: 'Samuel Mwangi',
    email: 'tot@machineryring.ke',
    role: 'tot' as UserRole,
    phone: '+254712345001',
    localMrId: 'mr-1',
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
  'manager@machineryring.ke': {
    id: 'mgr-1',
    name: 'John Kamau',
    email: 'manager@machineryring.ke',
    role: 'manager' as UserRole,
    phone: '+254723456789',
    localMrId: 'mr-1',
    status: 'active',
    createdAt: new Date('2023-06-20'),
  },
  'admin@machineryring.ke': {
    id: 'admin-001',
    name: 'David Ochieng',
    email: 'admin@machineryring.ke',
    role: 'admin' as UserRole,
    phone: '+254734567890',
    status: 'active',
    createdAt: new Date('2023-01-01'),
  },
};

const PASSWORD = 'password123'; // Same for all in demo - change per user in real app

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth_session');
    if (stored) {
      try {
        const { email } = JSON.parse(stored);
        if (mockUsers[email]) {
          setUser(mockUsers[email]);
        }
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API

    const normalizedEmail = email.toLowerCase().trim();
    const user = mockUsers[normalizedEmail];

    if (user && password === PASSWORD) {
      setUser(user);
      localStorage.setItem('auth_session', JSON.stringify({ email: normalizedEmail }));
    } else {
      throw new Error('Invalid email or password');
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_session');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
