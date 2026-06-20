import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PlatformSettings() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('subscription_plans').select('*').then(({ data }) => setPlans(data ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Subscription plans and platform configuration.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Subscription plans</CardTitle>
          <CardDescription>Limits enforced when adding users and machines.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Display name</TableHead>
                <TableHead>Max users</TableHead>
                <TableHead>Max machines</TableHead>
                <TableHead>Monthly (KES)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="capitalize">{p.plan_type}</TableCell>
                  <TableCell>{p.display_name}</TableCell>
                  <TableCell>{p.max_users === -1 ? 'Unlimited' : p.max_users}</TableCell>
                  <TableCell>{p.max_machines === -1 ? 'Unlimited' : p.max_machines}</TableCell>
                  <TableCell>{p.monthly_price_kes ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
