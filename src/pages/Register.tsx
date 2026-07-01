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
import { Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type PlanType = Database['public']['Enums']['subscription_plan_type'];

const schema = z.object({
  organization_name: z.string().trim().min(2, 'Organization name is required').max(150),
  branch_name: z.string().trim().max(150).optional().or(z.literal('')),
  tagline: z.string().trim().max(160).optional().or(z.literal('')),
  logo_url: z.string().trim().url('Logo URL must be a valid URL').max(500).optional().or(z.literal('')),
  theme_color: z.string().trim().regex(/^#([0-9a-fA-F]{6})$/, 'Use a hex color like #2E7D32').optional().or(z.literal('')),
  registration_number: z.string().trim().max(80).optional().or(z.literal('')),
  contact_person: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(255),
  county: z.string().trim().min(2).max(100),
  address: z.string().trim().min(2).max(300),
  admin_full_name: z.string().trim().min(2).max(120),
  admin_email: z.string().trim().email().max(255),
  requested_plan: z.enum(['starter', 'professional', 'enterprise']),
  terms_accepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
});

export default function Register() {
  const [form, setForm] = useState({
    organization_name: '', branch_name: '', tagline: '', logo_url: '', theme_color: '#2E7D32',
    registration_number: '', contact_person: '', phone: '', email: '', county: '', address: '',
    admin_full_name: '', admin_email: '',
    requested_plan: 'starter' as PlanType, terms_accepted: false,
  });
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
    const { error } = await supabase.from('tenant_registration_requests').insert({
      organization_name: form.organization_name.trim(),
      branch_name: form.branch_name.trim() || null,
      tagline: form.tagline.trim() || null,
      logo_url: form.logo_url.trim() || null,
      theme_color: form.theme_color.trim() || null,
      registration_number: form.registration_number.trim() || null,
      contact_person: form.contact_person.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      county: form.county.trim(),
      address: form.address.trim(),
      admin_full_name: form.admin_full_name.trim(),
      admin_email: form.admin_email.trim().toLowerCase(),
      requested_plan: form.requested_plan,
      terms_accepted: form.terms_accepted,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
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
              Your organization registration has been submitted and is awaiting Platform Administrator review.
              You'll receive an email at <strong>{form.admin_email}</strong> with your login password once approved.
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
          <p className="text-muted-foreground">Submit your Machinery Ring / cooperative for platform review.</p>
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
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Branding</CardTitle>
              <CardDescription>How your organization appears inside MR Connect after approval.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => update('tagline')(e.target.value)} placeholder="e.g. Empowering smallholder farmers" maxLength={160} /></div>
              <div><Label>Logo URL</Label><Input value={form.logo_url} onChange={(e) => update('logo_url')(e.target.value)} placeholder="https://…/logo.png" /></div>
              <div>
                <Label>Brand color</Label>
                <div className="flex items-center gap-2">
                  <Input type="color" value={form.theme_color} onChange={(e) => update('theme_color')(e.target.value)} className="w-14 h-10 p-1" />
                  <Input value={form.theme_color} onChange={(e) => update('theme_color')(e.target.value)} placeholder="#2E7D32" />
                </div>
              </div>
              {form.logo_url && (
                <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <img src={form.logo_url} alt="Preview" className="h-12 w-12 object-contain rounded" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                  <div className="text-sm">
                    <div className="font-semibold">{form.organization_name || 'Your Organization'}</div>
                    {form.tagline && <div className="text-xs text-muted-foreground">{form.tagline}</div>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Administrator account</CardTitle><CardDescription>This person will be the tenant admin after approval. The platform administrator will issue a password by email.</CardDescription></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full name *</Label><Input value={form.admin_full_name} onChange={(e) => update('admin_full_name')(e.target.value)} /></div>
              <div><Label>Admin email *</Label><Input type="email" value={form.admin_email} onChange={(e) => update('admin_email')(e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Subscription plan</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup value={form.requested_plan} onValueChange={(v) => update('requested_plan')(v)}>
                <div className="grid sm:grid-cols-3 gap-3">
                  {plans.length === 0 && ['starter', 'professional', 'enterprise'].map((p) => (
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
