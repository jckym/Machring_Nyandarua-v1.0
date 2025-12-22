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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secure admin bootstrap credentials
const ADMIN_EMAIL = 'admin.machineryring@gmail.com';
const ADMIN_PASSWORD = 'adminmachineryring2025';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Restore session on app load
  useEffect(() => {
    const loadSession = () => {
      try {
        const stored = localStorage.getItem('auth_session');
        if (stored) {
          const session = JSON.parse(stored);
          if (session.user && session.user.role) {
            setUser(session.user);
            setIsFirstLogin(!!session.isFirstLogin);
          }
        }
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        localStorage.removeItem('auth_session');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));

      const normalizedEmail = email.toLowerCase().trim();

      // Admin bootstrap login
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

        const isFirstTime = !localStorage.getItem('admin_first_login_done');

        if (isFirstTime) {
          localStorage.setItem('admin_first_login_done', 'true');
          setIsFirstLogin(true);
        }

        setUser(adminUser);

        localStorage.setItem(
          'auth_session',
          JSON.stringify({
            user: adminUser,
            isFirstLogin: isFirstTime,
          })
        );

        return;
      }

      // All other logins require backend validation
      throw new Error(
        'Invalid credentials. Only the system administrator can log in directly. TOTs and Managers must be created by the admin.'
      );
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsFirstLogin(false);
    localStorage.removeItem('auth_session');
    localStorage.removeItem('admin_first_login_done');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isFirstLogin,
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
