// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Hardcoded admin credentials (secure in real app via backend)
const ADMIN_EMAIL = 'admin.machineryring@gmail.com';
const ADMIN_PASSWORD = 'adminmachineryring2025';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem('auth_session');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.user) {
          setUser(session.user);
          setIsFirstLogin(session.isFirstLogin || false);
        }
      } catch (error) {
        console.error('Failed to parse auth session', error);
        localStorage.removeItem('auth_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const normalizedEmail = email.toLowerCase().trim();

    // Admin login
    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        _id: 'admin-001',
        name: 'System Administrator',
        email: ADMIN_EMAIL,
        role: 'admin' as UserRole,
        phone: '+254700000001',
        status: 'active',
        createdAt: new Date('2023-01-01'),
      };

      const firstTime = !localStorage.getItem('admin_first_login_done');
      if (firstTime) {
        localStorage.setItem('admin_first_login_done', 'true');
        setIsFirstLogin(true);
      }

      setUser(adminUser);
      localStorage.setItem('auth_session', JSON.stringify({
        user: adminUser,
        isFirstLogin: firstTime,
      }));

      setIsLoading(false);
      return;
    }

    // For TOTs and Managers: In real app, this would validate against backend
    // For now, reject with clear message
    throw new Error('Invalid credentials. Only admin login is active. Managers/TOTs must be created by admin.');
  };

  const logout = () => {
    setUser(null);
    setIsFirstLogin(false);
    localStorage.removeItem('auth_session');
    localStorage.removeItem('admin_first_login_done');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      isFirstLogin,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
