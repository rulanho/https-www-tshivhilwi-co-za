import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Landmark, Home, Wallet, HeartHandshake, FileText, MapPin,
  ShieldCheck, Users, Crown, Building2, ArrowRight, Globe, MessageSquare,
  BarChart3, BookOpen, CheckCircle2, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const features = [
  { icon: Home, title: 'Household & Stand Register', desc: 'Digitise every household, stand, and family member by section — replacing paper books with a searchable, permanent register.' },
  { icon: BookOpen, title: 'Community Ledger', desc: 'A digital record book for contributions, letters issued, and notes — transparent and always available.' },
  { icon: Wallet, title: 'Burial Society Finances', desc: 'Track monthly contributions, special levies, payouts and receipts with a clear audit trail.' },
  { icon: HeartHandshake, title: 'Burial Cases & Claims', desc: 'Capture bereavements, verify eligibility, and process payouts with dignity and speed.' },
  { icon: FileText, title: 'Community Documents', desc: 'Generate Proof-of-Address letters, stand approvals, and permits with QR codes and reference numbers.' },
  { icon: Crown, title: 'Linked to Traditional Authority', desc: 'Each village is registered under its Chief (Thovhele/Khosi/Hosi) and local municipality.' },
  { icon: BarChart3, title: 'Reports & PDFs', desc: 'Generate official receipts, financial statements and community reports at the click of a button.' },
  { icon: ShieldCheck, title: 'Secure & Private', desc: 'Each village\'s data is isolated. Role-based access for Admin, Treasurer, Secretary and Household Heads.' },
];

const steps = [
  { n: '1', t: 'Register your village', d: 'Select your district and municipality, add your Chief and define your village sections.' },
  { n: '2', t: 'Invite your team', d: 'Add your Treasurer, Secretary and Section Leaders so each role can do its part.' },
  { n: '3', t: 'Capture households', d: 'Build the household register stand by stand, with members and family details.' },
  { n: '4', t: 'Serve the community', d: 'Issue documents, record contributions, process burial cases, and respond to requests.' },
];

const stats = [
  { value: '5+', label: 'Districts in Limpopo' },
  { value: '24/7', label: 'Digital access' },
  { value: '100%', label: 'Data ownership per village' },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">VillageConnect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#roles" className="text-muted-foreground hover:text-foreground transition-colors">Who it's for</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-md hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#roles" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Who it's for</a>
            <div className="pt-3 border-t flex flex-col gap-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" className="w-full" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.07] via-background to-accent/[0.05]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <MapPin className="h-3.5 w-3.5" />
                Built for Limpopo communities
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-[1.1]">
                Digitise your village. <span className="text-primary">Serve your people.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                VillageConnect Limpopo replaces paper books and scattered records with one trusted,
                transparent digital system for households, burial societies, community documents and more.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to="/auth">Register Your Village</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />No credit card required</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />Community-owned data</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />Works on any phone</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-60" />
              <Card className="relative border shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Landmark className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">VhaVenda Traditional Council</p>
                      <p className="text-xs text-muted-foreground">Thulamela Municipality</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-2xl font-bold text-primary">1,248</p>
                      <p className="text-xs text-muted-foreground">Households registered</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-2xl font-bold text-primary">R84k</p>
                      <p className="text-xs text-muted-foreground">Contributions this year</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm py-2 border-b">
                      <span className="text-muted-foreground">Proof of Address issued</span>
                      <span className="font-medium">Today, 09:14</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-2 border-b">
                      <span className="text-muted-foreground">Burial contribution received</span>
                      <span className="font-medium">Yesterday</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-2">
                      <span className="text-muted-foreground">New household registered</span>
                      <span className="font-medium">2 days ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold font-display text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">Everything a community needs</h2>
            <p className="text-muted-foreground">
              From household registers to burial society finances and official documents — all in one place, scoped to your village.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <Card key={f.title} className="group hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-muted/30 border-y">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">How it works</h2>
              <p className="text-muted-foreground mb-8">
                Get your village online in minutes, not months. No technical team required — just your village leadership and a phone or computer.
              </p>
              <ol className="space-y-6">
                {steps.map((s) => (
                  <li key={s.n} className="flex gap-4">
                    <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                      {s.n}
                    </div>
                    <div>
                      <h3 className="font-semibold">{s.t}</h3>
                      <p className="text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-8">
                <Button asChild>
                  <Link to="/auth" className="inline-flex items-center">
                    Start your village <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-bl from-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
              <Card className="relative border shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Crown className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Chief / Traditional Authority</p>
                        <p className="text-xs text-muted-foreground">Village leadership is linked and verified</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Municipality</p>
                        <p className="text-xs text-muted-foreground">Mapped to district and local municipality</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Households & Sections</p>
                        <p className="text-xs text-muted-foreground">Organised by village sections and stands</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="roles" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">Built for every role in the community</h2>
            <p className="text-muted-foreground">
              Each person sees only what they need to see, with permissions matched to their responsibility.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Landmark, title: 'Village Admin', desc: 'Register the village, configure rules, invite staff and oversee operations.' },
              { icon: Wallet, title: 'Treasurer', desc: 'Record contributions, manage levies, issue receipts and view financial reports.' },
              { icon: FileText, title: 'Secretary', desc: 'Capture households, process documents and burial cases, maintain records.' },
              { icon: Home, title: 'Household Head', desc: 'View your stand, family register, contributions and request documents.' },
            ].map((r) => (
              <Card key={r.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <r.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{r.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">Ready to digitise your village?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join communities across Limpopo using VillageConnect to modernise governance, burial societies and community services.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">Register Your Village</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <Link to="/auth">Sign In as Staff</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Globe className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">VillageConnect Limpopo</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} VillageConnect Limpopo · A multi-community digital management platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
