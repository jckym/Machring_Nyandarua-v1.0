import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void; // For demo purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<UserRole, User> = {
  tot: {
    id: 'tot-001',
    name: 'John Kamau',
    email: 'john.kamau@machineryring.ke',
    role: 'tot',
    phone: '+254712345678',
    branchId: 'branch-001',
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
  manager: {
    id: 'manager-001',
    name: 'Sarah Wanjiku',
    email: 'sarah.wanjiku@machineryring.ke',
    role: 'manager',
    phone: '+254723456789',
    branchId: 'branch-001',
    status: 'active',
    createdAt: new Date('2023-06-20'),
  },
  admin: {
    id: 'admin-001',
    name: 'David Ochieng',
    email: 'david.ochieng@machineryring.ke',
    role: 'admin',
    phone: '+254734567890',
    status: 'active',
    createdAt: new Date('2023-01-01'),
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored session
    const storedAuth = localStorage.getItem('auth_session');
    if (storedAuth) {
      try {
        const session = JSON.parse(storedAuth);
        if (session.isAuthenticated && session.role && mockUsers[session.role as UserRole]) {
          setUser(mockUsers[session.role as UserRole]);
          setIsAuthenticated(true);
        }
      } catch (e) {
        localStorage.removeItem('auth_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo login - determine role from email or default to TOT
    let role: UserRole = 'tot';
    if (email.includes('admin') || email.includes('david')) {
      role = 'admin';
    } else if (email.includes('manager') || email.includes('sarah')) {
      role = 'manager';
    }
    
    setUser(mockUsers[role]);
    setIsAuthenticated(true);
    localStorage.setItem('auth_session', JSON.stringify({ isAuthenticated: true, role }));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_session');
  };

  const switchRole = (role: UserRole) => {
    setUser(mockUsers[role]);
    localStorage.setItem('auth_session', JSON.stringify({ isAuthenticated: true, role }));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, switchRole }}>
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
