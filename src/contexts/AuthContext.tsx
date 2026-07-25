import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
type Tenant = Database['public']['Tables']['tenants']['Row'];

interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: AppRole;
  tenantId?: string;
  localMrId?: string;
  localMrName?: string;
  status: string;
}

interface AuthContextType {
  user: AuthUser | null;
  tenant: Tenant | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPlatformAdmin: boolean;
  isTenantAdmin: boolean;
  tenantId: string | null;
  canEdit: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string): Promise<{ user: AuthUser | null; tenant: Tenant | null }> => {
    try {
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', userId).single();
      if (!profile) return { user: null, tenant: null };

      const { data: userRole } = await supabase
        .from('user_roles').select('role').eq('user_id', userId).maybeSingle();
      const role: AppRole = userRole?.role || 'tot';

      let tenantRow: Tenant | null = null;
      if (profile.tenant_id) {
        const { data } = await supabase
          .from('tenants').select('*').eq('id', profile.tenant_id).maybeSingle();
        tenantRow = data ?? null;
      }

      let localMrId: string | undefined;
      let localMrName: string | undefined;
      if (role === 'tot' || role === 'local_mr_coordinator') {
        const { data: assignment } = await supabase
          .from('tot_assignments').select('local_mr_id, local_mrs(name)')
          .eq('tot_id', userId).eq('status', 'active').maybeSingle();
        if (assignment) {
          localMrId = assignment.local_mr_id;
          localMrName = (assignment.local_mrs as any)?.name;
        }
        if (role === 'local_mr_coordinator') {
          const { data: coordMr } = await supabase
            .from('local_mrs').select('id, name').eq('coordinator_id', userId).maybeSingle();
          if (coordMr) { localMrId = coordMr.id; localMrName = coordMr.name; }
        }
      }

      return {
        user: {
          id: userId,
          email: profile.email,
          name: profile.name,
          phone: profile.phone || undefined,
          role,
          tenantId: profile.tenant_id ?? undefined,
          localMrId, localMrName,
          status: profile.status,
        },
        tenant: tenantRow,
      };
    } catch (e) {
      console.error('fetchUserData failed', e);
      return { user: null, tenant: null };
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setTimeout(async () => {
          const { user, tenant } = await fetchUserData(session.user.id);
          setUser(user); setTenant(tenant); setIsLoading(false);
        }, 0);
      } else {
        setUser(null); setTenant(null); setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user.id).then(({ user, tenant }) => {
          setUser(user); setTenant(tenant); setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles').select('status, tenant_id').eq('id', data.user.id).maybeSingle();
        if (profile?.status === 'inactive') {
          await supabase.auth.signOut();
          return { error: new Error('Your account has been deactivated.') };
        }
        if (profile?.status === 'pending') {
          await supabase.auth.signOut();
          return { error: new Error('Your organization registration is awaiting platform approval. You will be notified by email once approved.') };
        }

        const { user, tenant } = await fetchUserData(data.user.id);
        if (!user) {
          await supabase.auth.signOut();
          setUser(null); setSession(null);
          return { error: new Error('Unable to load your user profile.') };
        }

        // Platform admins bypass tenant status checks
        if (user.role !== 'platform_super_admin' && tenant && tenant.status !== 'active') {
          await supabase.auth.signOut();
          setUser(null); setSession(null); setTenant(null);
          const msg = tenant.status === 'suspended'
            ? 'Your organization has been suspended. Please contact the platform administrator.'
            : `Your organization is ${tenant.status}. Please contact the platform administrator.`;
          return { error: new Error(msg) };
        }

        setSession(data.session); setUser(user); setTenant(tenant); setIsLoading(false);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: redirectUrl, data: { name, phone } },
      });
      return { error };
    } catch (error) { return { error: error as Error }; }
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null); setTenant(null); setSession(null); setIsLoading(false);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'tenant_admin';
  const isPlatformAdmin = user?.role === 'platform_super_admin';
  const isTenantAdmin = user?.role === 'tenant_admin' || user?.role === 'admin';
  const canEdit = isAdmin || isPlatformAdmin;

  return (
    <AuthContext.Provider value={{
      user, tenant, session, isLoading,
      isAuthenticated: !!session && !!user,
      isAdmin, isPlatformAdmin, isTenantAdmin,
      tenantId: user?.tenantId ?? null,
      canEdit, signIn, signUp, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
