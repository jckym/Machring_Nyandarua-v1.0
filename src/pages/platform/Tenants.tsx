import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Tenants() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tenants')
      .select('id, tenant_code, organization_name, branch_name, status, subscription_plan, max_users, max_machines, created_at')
      .order('created_at', { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: 'active' | 'suspended') => {
    setBusyId(id);
    const { error } = await supabase.from('tenants').update({ status }).eq('id', id);
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`Tenant ${status}`);
    load();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <Badge className={map[s] || ''} variant="secondary">{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tenants</h1>
        <p className="text-muted-foreground">Manage onboarded organizations.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All tenants</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Tenant Code</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No tenants yet</TableCell></TableRow>
                )}
                {rows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.organization_name}</TableCell>
                    <TableCell>{t.branch_name || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{t.tenant_code}</TableCell>
                    <TableCell className="capitalize">{t.subscription_plan}</TableCell>
                    <TableCell className="text-xs">
                      {t.max_users === -1 ? '∞' : t.max_users} users · {t.max_machines === -1 ? '∞' : t.max_machines} machines
                    </TableCell>
                    <TableCell>{statusBadge(t.status)}</TableCell>
                    <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {t.status === 'active' ? (
                        <Button size="sm" variant="outline" disabled={busyId === t.id} onClick={() => setStatus(t.id, 'suspended')}>Suspend</Button>
                      ) : (
                        <Button size="sm" disabled={busyId === t.id} onClick={() => setStatus(t.id, 'active')}>Activate</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
