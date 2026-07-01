import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tractor, Users, BarChart3, ShieldCheck, Bot, Building2,
  ArrowRight, CheckCircle2, Sparkles,
} from 'lucide-react';

const features = [
  { icon: Building2, title: 'Multi-tenant by design', desc: 'Every Machinery Ring branch runs in its own isolated workspace with dedicated data, users and branding.' },
  { icon: Users, title: 'Farmers & TOTs', desc: 'Onboard farmers, assign Trainers of Trainers, and track visits, trainings, and follow-ups.' },
  { icon: Tractor, title: 'Machinery & Sales', desc: 'Book equipment, record sales with profit-based commissions, and manage inventory.' },
  { icon: BarChart3, title: 'Reports & Insights', desc: 'Live dashboards, monthly trends, and exportable reports for every level of management.' },
  { icon: Bot, title: 'FIA — AI Assistant', desc: 'Ask questions in plain English and get answers grounded in your own operational data.' },
  { icon: ShieldCheck, title: 'Secure & audited', desc: 'Row-level security, role-based access, and a full audit trail on every change.' },
];

const plans = [
  { name: 'Starter', price: 'KES 5,000', period: '/month', users: 'Up to 10 users', machines: '20 machines', highlight: false },
  { name: 'Professional', price: 'KES 15,000', period: '/month', users: 'Up to 50 users', machines: '100 machines', highlight: true },
  { name: 'Enterprise', price: 'Custom', period: '', users: 'Unlimited users', machines: 'Unlimited machines', highlight: false },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Nav */}
      <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/mrlogo.png" alt="MR Connect" className="h-9 w-9" />
            <div className="leading-tight">
              <div className="font-bold text-lg">MR Connect</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Machinery Ring SaaS Platform</div>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/register"><Button size="sm">Register organization</Button></Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Multi-tenant SaaS for Machinery Rings, Cooperatives & Agri-Associations
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
          One platform for every <span className="text-primary">Machinery Ring</span> branch
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          Onboard your organization, invite your team, and run farmers, machinery, sales, and training operations —
          with complete data isolation and AI-powered insights.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/register">
            <Button size="lg" className="gap-2">Get started free <ArrowRight className="h-4 w-4" /></Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline">Sign in to your workspace</Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Approval-based onboarding · Isolated tenant data · Built for Kenya</p>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { n: '1', t: 'Register', d: 'Submit your organization details and choose a subscription plan.' },
            { n: '2', t: 'Get approved', d: 'Our platform admin reviews and activates your tenant workspace.' },
            { n: '3', t: 'Operate', d: 'Invite your team and start managing farmers, sales, and machinery.' },
          ].map((s) => (
            <Card key={s.n} className="border-primary/10">
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mb-3">{s.n}</div>
                <div className="font-semibold">{s.t}</div>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Everything a Machinery Ring needs</h2>
          <p className="text-muted-foreground mt-2">Purpose-built for agricultural cooperatives and mechanisation services.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="font-semibold">{f.title}</div>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
          <p className="text-muted-foreground mt-2">Pick the plan that fits your organization. Upgrade any time.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {plans.map((p) => (
            <Card key={p.name} className={p.highlight ? 'border-primary shadow-lg relative' : ''}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <CardContent className="pt-6">
                <div className="font-semibold text-lg">{p.name}</div>
                <div className="mt-2"><span className="text-3xl font-bold">{p.price}</span><span className="text-muted-foreground text-sm">{p.period}</span></div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{p.users}</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{p.machines}</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />Full feature access</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />Email support</li>
                </ul>
                <Link to="/register" className="block mt-5">
                  <Button className="w-full" variant={p.highlight ? 'default' : 'outline'}>Choose {p.name}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Card className="bg-primary text-primary-foreground border-primary">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold">Ready to modernize your Machinery Ring?</h2>
            <p className="mt-2 opacity-90">Submit your organization for onboarding — it takes less than 5 minutes.</p>
            <Link to="/register" className="inline-block mt-6">
              <Button size="lg" variant="secondary" className="gap-2">Register your organization <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t bg-card/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MR Connect. Built by{' '}
        <a href="https://qeemlabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary font-medium">Qeem Labs Ltd.</a>
      </footer>
    </div>
  );
}
