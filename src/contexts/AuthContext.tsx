import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
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

  useEffect(() => {
    // Check for stored session
    const storedRole = localStorage.getItem('demo_role') as UserRole | null;
    if (storedRole && mockUsers[storedRole]) {
      setUser(mockUsers[storedRole]);
    } else {
      // Default to TOT for demo
      setUser(mockUsers.tot);
      localStorage.setItem('demo_role', 'tot');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - in production, this would call the auth API
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(mockUsers.tot);
    localStorage.setItem('demo_role', 'tot');
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo_role');
  };

  const switchRole = (role: UserRole) => {
    setUser(mockUsers[role]);
    localStorage.setItem('demo_role', role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole }}>
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
