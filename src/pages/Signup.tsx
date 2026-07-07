import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, ArrowRight, CheckCircle2, ShieldCheck, Users, Sparkles } from 'lucide-react';

const steps = [
  { n: '1', t: 'Tell us about your organization', d: 'Name, branding, contact details and preferred subscription plan.' },
  { n: '2', t: 'Create the admin account', d: 'Provide the initial organization administrator who will manage users.' },
  { n: '3', t: 'Get approved & go live', d: 'Our platform team reviews your submission and activates your workspace.' },
];

const perks = [
  { icon: ShieldCheck, t: 'Isolated tenant workspace', d: 'Your data is fully separated from every other organization.' },
  { icon: Users, t: 'Invite unlimited team members', d: 'Admin, managers, coordinators and TOTs — all under your tenant.' },
  { icon: Sparkles, t: 'AI-powered insights', d: 'FIA assistant answers questions grounded in your own data.' },
];

export default function Signup() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/mrlogo.png" alt="MR Connect" className="h-9 w-9" />
            <div className="leading-tight">
              <div className="font-bold text-lg">MR Connect</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Machinery Ring SaaS Platform</div>
            </div>
          </Link>
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground mb-5">
            <Building2 className="h-3.5 w-3.5 text-primary" /> Create your organization workspace
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Sign up your <span className="text-primary">Machinery Ring</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Onboard your firm in a few minutes. Complete the onboarding form and we'll set up an isolated
            workspace for your team.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="gap-2">Start onboarding <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">I already have an account</Button>
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mt-14">
          {steps.map((s) => (
            <Card key={s.n} className="border-primary/10">
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mb-3">
                  {s.n}
                </div>
                <div className="font-semibold">{s.t}</div>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mt-8">
          {perks.map((p) => (
            <Card key={p.t}>
              <CardContent className="pt-6">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <p.icon className="h-4 w-4" />
                </div>
                <div className="font-semibold">{p.t}</div>
                <p className="text-sm text-muted-foreground mt-1">{p.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-10 bg-primary text-primary-foreground border-primary">
          <CardContent className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-lg">Ready to get started?</div>
              <p className="text-sm opacity-90 flex items-center gap-2 mt-1">
                <CheckCircle2 className="h-4 w-4" /> No credit card required to submit onboarding
              </p>
            </div>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Continue to onboarding form <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
