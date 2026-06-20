import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Inbox, CheckCircle2, PauseCircle, Users, Tractor, DollarSign } from 'lucide-react';

export default function PlatformDashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0, pendingRequests: 0,
    activeTenants: 0, suspendedTenants: 0,
    totalUsers: 0, totalMachinery: 0, totalRevenue: 0,
  });

  useEffect(() => {
    (async () => {
      const [reqAll, reqPending, tenActive, tenSuspended, users, machinery, sales] = await Promise.all([
        supabase.from('tenant_registration_requests').select('id', { count: 'exact', head: true }),
        supabase.from('tenant_registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('tenants').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('tenants').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('machinery').select('id', { count: 'exact', head: true }),
        supabase.from('sales').select('total_amount'),
      ]);
      const revenue = (sales.data ?? []).reduce((s: number, r: any) => s + Number(r.total_amount || 0), 0);
      setStats({
        totalRequests: reqAll.count ?? 0,
        pendingRequests: reqPending.count ?? 0,
        activeTenants: tenActive.count ?? 0,
        suspendedTenants: tenSuspended.count ?? 0,
        totalUsers: users.count ?? 0,
        totalMachinery: machinery.count ?? 0,
        totalRevenue: revenue,
      });
    })();
  }, []);

  const cards = [
    { label: 'Total Requests', value: stats.totalRequests, icon: Inbox },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: Inbox },
    { label: 'Active Tenants', value: stats.activeTenants, icon: CheckCircle2 },
    { label: 'Suspended Tenants', value: stats.suspendedTenants, icon: PauseCircle },
    { label: 'Total Users', value: stats.totalUsers, icon: Users },
    { label: 'Total Machinery', value: stats.totalMachinery, icon: Tractor },
    { label: 'Total Revenue (KES)', value: stats.totalRevenue.toLocaleString(), icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <p className="text-muted-foreground">Overview across all tenants.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader><CardTitle>Tenant overview</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the sidebar to review registration requests, manage tenants, and inspect platform audit logs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
