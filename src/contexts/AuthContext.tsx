// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/lib/api/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isDevMode: boolean; // Expose dev mode status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// DEVELOPMENT MODE - TEMPORARY MOCK USER
// Set VITE_AUTH_DISABLED=true in .env to bypass authentication
// WARNING: This is for development/testing only!
// ============================================================
const IS_AUTH_DISABLED = import.meta.env.MODE === 'development' || import.meta.env.VITE_AUTH_DISABLED === 'true';

const MOCK_ADMIN_USER: User = {
  id: 'dev-mock-user-001',
  name: 'Dev Admin',
  email: 'dev@example.com',
  phone: '+254700000000',
  role: 'admin',
  status: 'active',
  localMrId: 'dev-local-mr',
  createdAt: new Date(),
  lastActivityDate: new Date(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app load (or inject mock user in dev mode)
  useEffect(() => {
    const loadSession = async () => {
      // DEV MODE: Skip authentication entirely and use mock user
      if (IS_AUTH_DISABLED) {
        console.warn('⚠️ AUTH DISABLED: Running in development mode with mock admin user');
        setUser(MOCK_ADMIN_USER);
        setIsLoading(false);
        return;
      }

      try {
        const token = authService.getToken();
        if (token) {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token invalid, clear it
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
    // DEV MODE: Instant login with mock user
    if (IS_AUTH_DISABLED) {
      console.warn('⚠️ AUTH DISABLED: Mock login successful');
      setUser(MOCK_ADMIN_USER);
      return;
    }

    setIsLoading(true);

    try {
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
    // DEV MODE: Just clear mock user
    if (IS_AUTH_DISABLED) {
      console.warn('⚠️ AUTH DISABLED: Mock logout');
      setUser(null);
      return;
    }

    try {
      await authService.logout();
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
        isDevMode: IS_AUTH_DISABLED,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context) return context;

  // ============================================================
  // DEVELOPMENT MODE SAFETY NET
  // If auth is intentionally disabled, we allow the app to keep
  // running even if a component is rendered outside the provider.
  // This MUST NOT be relied on in production.
  // ============================================================
  if (IS_AUTH_DISABLED) {
    console.warn(
      '⚠️ DEV MODE: useAuth called without AuthProvider; returning mock auth context'
    );

    return {
      user: MOCK_ADMIN_USER,
      isLoading: false,
      isAuthenticated: true,
      login: async () => {},
      logout: () => {},
      isDevMode: true,
    };
  }

  throw new Error('useAuth must be used within an AuthProvider');
}
