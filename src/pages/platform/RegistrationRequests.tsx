import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type Req = any;

export default function RegistrationRequests() {
  const [rows, setRows] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Req | null>(null);
  const [action, setAction] = useState<'view' | 'approve' | 'reject' | null>(null);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tenant_registration_requests').select('*').order('created_at', { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleApprove = async () => {
    if (!selected || password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('approve-tenant-request', {
      body: { request_id: selected.id, password },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || 'Approval failed');
      return;
    }
    toast.success('Tenant approved and admin account created');
    setSelected(null); setAction(null); setPassword('');
    load();
  };

  const handleReject = async () => {
    if (!selected || reason.trim().length < 3) { toast.error('Provide a rejection reason'); return; }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('reject-tenant-request', {
      body: { request_id: selected.id, reason },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || 'Rejection failed');
      return;
    }
    toast.success('Request rejected');
    setSelected(null); setAction(null); setReason('');
    load();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <Badge className={map[s] || ''} variant="secondary">{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registration Requests</h1>
        <p className="text-muted-foreground">Review and approve organization onboarding requests.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All requests</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>County</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No requests yet</TableCell></TableRow>
                )}
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.organization_name}</TableCell>
                    <TableCell>{r.branch_name || '—'}</TableCell>
                    <TableCell>{r.contact_person}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.county}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelected(r); setAction('view'); }}>View</Button>
                      {r.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => { setSelected(r); setAction('approve'); }}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => { setSelected(r); setAction('reject'); }}>Reject</Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected && action === 'view'} onOpenChange={(o) => !o && (setSelected(null), setAction(null))}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Request details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div><strong>Organization:</strong> {selected.organization_name}</div>
              <div><strong>Branch:</strong> {selected.branch_name || '—'}</div>
              <div><strong>Registration #:</strong> {selected.registration_number || '—'}</div>
              <div><strong>Contact:</strong> {selected.contact_person} · {selected.phone}</div>
              <div><strong>Email:</strong> {selected.email}</div>
              <div><strong>County:</strong> {selected.county}</div>
              <div><strong>Address:</strong> {selected.address}</div>
              <hr />
              <div><strong>Admin:</strong> {selected.admin_full_name} ({selected.admin_email})</div>
              <div><strong>Requested plan:</strong> {selected.requested_plan}</div>
              <div><strong>Status:</strong> {selected.status}</div>
              {selected.rejection_reason && <div><strong>Rejection reason:</strong> {selected.rejection_reason}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected && action === 'approve'} onOpenChange={(o) => !o && (setSelected(null), setAction(null), setPassword(''))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {selected?.organization_name}</DialogTitle>
            <DialogDescription>Set an initial password for the tenant admin ({selected?.admin_email}). Share it securely.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Initial admin password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelected(null); setAction(null); setPassword(''); }}>Cancel</Button>
            <Button onClick={handleApprove} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Approve & create tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected && action === 'reject'} onOpenChange={(o) => !o && (setSelected(null), setAction(null), setReason(''))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {selected?.organization_name}</DialogTitle>
            <DialogDescription>Provide a reason — it will be emailed to the applicant.</DialogDescription>
          </DialogHeader>
          <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection" />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelected(null); setAction(null); setReason(''); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
