// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

// Fixed demo user — always "logged in" as admin (no auth required)
const MOCK_USER: User = {
  id: 'mock-admin-001',
  name: 'Demo Admin',
  email: 'admin@demo.com',
  phone: '0700000001',
  role: 'admin',
  status: 'active',
  createdAt: new Date(),
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // login and logout are removed — no auth flow
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User>(MOCK_USER); // Always this user
  const [isLoading, setIsLoading] = useState(false); // No loading needed

  // Simulate initial load (instant)
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: true, // Always authenticated
        // No login/logout functions
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
