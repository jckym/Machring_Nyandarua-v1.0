import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

// Demo users for development
// Role naming:
// - admin: System Administrator (ONLY data entry role)
// - manager: Manager (read-only, organization-wide oversight)
// - local_mr_coordinator: Local MR Coordinator (read-only, scoped to their Local MR)
// - tot: TOT (read-only, can only view their own data)
const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: 'demo-admin-001',
    name: 'Demo Admin',
    email: 'admin@demo.com',
    phone: '0700000001',
    role: 'admin',
    status: 'active',
    createdAt: new Date(),
  },
  manager: {
    id: 'demo-manager-001',
    name: 'Demo Manager',
    email: 'manager@demo.com',
    phone: '0700000002',
    role: 'manager',
    status: 'active',
    createdAt: new Date(),
  },
  local_mr_coordinator: {
    id: 'demo-coordinator-001',
    name: 'Demo Coordinator',
    email: 'coordinator@demo.com',
    phone: '0700000003',
    role: 'local_mr_coordinator',
    localMrId: 'demo-localmr-001',
    localMrName: 'Demo Local MR',
    status: 'active',
    createdAt: new Date(),
  },
  tot: {
    id: 'demo-tot-001',
    name: 'Demo TOT',
    email: 'tot@demo.com',
    phone: '0700000004',
    role: 'tot',
    localMrId: 'demo-localmr-001',
    localMrName: 'Demo Local MR',
    status: 'active',
    createdAt: new Date(),
  },
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved demo role on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('demo_role') as UserRole | null;
    const role = savedRole && DEMO_USERS[savedRole] ? savedRole : 'admin';
    setUser(DEMO_USERS[role]);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Demo login - find user by email
    const demoUser = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (demoUser && password === 'demo123') {
      localStorage.setItem('demo_role', demoUser.role);
      setUser(demoUser);
    } else {
      throw new Error('Invalid credentials. Use demo123 as password.');
    }
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('demo_role');
    setUser(null);
  };

  const switchDemoRole = (role: UserRole) => {
    localStorage.setItem('demo_role', role);
    setUser(DEMO_USERS[role]);
  };

  // Admin is the ONLY role that can create/edit/delete data
  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        canEdit,
        login,
        logout,
        switchDemoRole,
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
