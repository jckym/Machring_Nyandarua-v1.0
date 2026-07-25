import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type PlanType = Database['public']['Enums']['subscription_plan_type'];

const schema = z.object({
  organization_name: z.string().trim().min(2, 'Organization name is required').max(150),
  branch_name: z.string().trim().max(150).optional().or(z.literal('')),
  registration_number: z.string().trim().max(80).optional().or(z.literal('')),
  contact_person: z.string().trim().min(2, 'Contact person is required').max(120),
  phone: z.string().trim().min(7, 'Phone is required').max(30),
  email: z.string().trim().email('Valid organization email required').max(255),
  county: z.string().trim().min(2, 'County is required').max(100),
  address: z.string().trim().min(2, 'Address is required').max(300),
  admin_full_name: z.string().trim().min(2, 'Admin full name is required').max(120),
  admin_email: z.string().trim().email('Valid admin email required').max(255),
  admin_password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  admin_password_confirm: z.string(),
  requested_plan: z.enum(['starter', 'standard', 'enterprise']),
  terms_accepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
}).refine((v) => v.admin_password === v.admin_password_confirm, {
  path: ['admin_password_confirm'], message: 'Passwords do not match',
});

export default function Register() {
  const [form, setForm] = useState({
    organization_name: '', branch_name: '',
    registration_number: '', contact_person: '', phone: '', email: '', county: '', address: '',
    admin_full_name: '', admin_email: '',
    admin_password: '', admin_password_confirm: '',
    requested_plan: 'starter' as PlanType, terms_accepted: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [plans, setPlans] = useState<Array<{ plan_type: PlanType; display_name: string; max_users: number; max_machines: number; monthly_price_kes: number | null }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.from('subscription_plans')
      .select('plan_type, display_name, max_users, max_machines, monthly_price_kes')
      .order('monthly_price_kes', { ascending: true })
      .then(({ data }) => { if (data) setPlans(data as any); });
  }, []);

  const update = (k: keyof typeof form) => (v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke('register-tenant', {
      body: {
        organization_name: form.organization_name.trim(),
        branch_name: form.branch_name.trim() || null,
        registration_number: form.registration_number.trim() || null,
        contact_person: form.contact_person.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        county: form.county.trim(),
        address: form.address.trim(),
        admin_full_name: form.admin_full_name.trim(),
        admin_email: form.admin_email.trim().toLowerCase(),
        admin_password: form.admin_password,
        requested_plan: form.requested_plan,
        terms_accepted: form.terms_accepted,
      },
    });
    setSubmitting(false);
    const err = (data as any)?.error || error?.message;
    if (err) { toast.error(err); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Registration submitted</CardTitle>
            <CardDescription>
              Your organization has been submitted for review. You'll be notified at <strong>{form.admin_email}</strong> once
              the platform administrator approves it. Then you can sign in with the password you chose.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth"><Button className="w-full">Back to sign in</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <img src="/mrlogo.png" alt="MR Connect" className="h-10 w-10" />
            <span className="font-bold text-lg">MR Connect</span>
          </Link>
          <h1 className="text-3xl font-bold">Onboard your organization</h1>
          <p className="text-muted-foreground">Register your Machinery Ring / cooperative for platform review.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Organization information</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Label>Organization name *</Label><Input value={form.organization_name} onChange={(e) => update('organization_name')(e.target.value)} /></div>
              <div><Label>Branch name</Label><Input value={form.branch_name} onChange={(e) => update('branch_name')(e.target.value)} placeholder="e.g. Nyandarua" /></div>
              <div><Label>Registration number</Label><Input value={form.registration_number} onChange={(e) => update('registration_number')(e.target.value)} /></div>
              <div><Label>Contact person *</Label><Input value={form.contact_person} onChange={(e) => update('contact_person')(e.target.value)} /></div>
              <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => update('phone')(e.target.value)} /></div>
              <div><Label>Organization email *</Label><Input type="email" value={form.email} onChange={(e) => update('email')(e.target.value)} /></div>
              <div><Label>County *</Label><Input value={form.county} onChange={(e) => update('county')(e.target.value)} /></div>
              <div className="sm:col-span-2"><Label>Physical address *</Label><Textarea rows={2} value={form.address} onChange={(e) => update('address')(e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Administrator account</CardTitle>
              <CardDescription>You'll use this email and password to sign in once the platform admin approves your organization.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full name *</Label><Input value={form.admin_full_name} onChange={(e) => update('admin_full_name')(e.target.value)} /></div>
              <div><Label>Admin email *</Label><Input type="email" value={form.admin_email} onChange={(e) => update('admin_email')(e.target.value)} /></div>
              <div>
                <Label>Password *</Label>
                <div className="relative">
                  <Input type={showPwd ? 'text' : 'password'} value={form.admin_password} onChange={(e) => update('admin_password')(e.target.value)} placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label>Confirm password *</Label>
                <Input type={showPwd ? 'text' : 'password'} value={form.admin_password_confirm} onChange={(e) => update('admin_password_confirm')(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Subscription plan</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup value={form.requested_plan} onValueChange={(v) => update('requested_plan')(v)}>
                <div className="grid sm:grid-cols-3 gap-3">
                  {plans.length === 0 && (['starter', 'standard', 'enterprise'] as PlanType[]).map((p) => (
                    <label key={p} className="border rounded-lg p-4 cursor-pointer hover:border-primary flex items-start gap-3">
                      <RadioGroupItem value={p} />
                      <div><div className="font-medium capitalize">{p}</div></div>
                    </label>
                  ))}
                  {plans.map((p) => (
                    <label key={p.plan_type} className="border rounded-lg p-4 cursor-pointer hover:border-primary flex items-start gap-3">
                      <RadioGroupItem value={p.plan_type} />
                      <div>
                        <div className="font-medium">{p.display_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.max_users === -1 ? 'Unlimited users' : `Up to ${p.max_users} users`} · {p.max_machines === -1 ? 'Unlimited machines' : `${p.max_machines} machines`}
                        </div>
                        {p.monthly_price_kes != null && (
                          <div className="text-sm font-semibold mt-1">KES {Number(p.monthly_price_kes).toLocaleString()}/mo</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox checked={form.terms_accepted} onCheckedChange={(v) => update('terms_accepted')(!!v)} />
                <span className="text-sm">I agree to the Terms and Conditions and confirm the information above is accurate.</span>
              </label>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary">Already have an account? Sign in</Link>
            <Button type="submit" disabled={submitting} size="lg">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit registration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
