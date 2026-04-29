import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Landmark, Home, Wallet, HeartHandshake, FileText, MapPin,
  ShieldCheck, Users, Crown, Building2, ArrowLeft, Globe, MessageSquare, BarChart3,
} from 'lucide-react';

const features = [
  { icon: Home, title: 'Household & Member Register', desc: 'Digitise every household, stand, and family member by section — replacing paper books with a searchable register.' },
  { icon: Wallet, title: 'Burial Society Finances', desc: 'Track monthly contributions, special levies, payouts and receipts with a transparent audit trail.' },
  { icon: HeartHandshake, title: 'Burial Cases & Claims', desc: 'Capture bereavements, verify eligibility (age, membership period, payments) and process payouts.' },
  { icon: FileText, title: 'Community Requests', desc: 'Proof of address, stand approvals, Sunday trading permits, issue reports — all routed to the right office.' },
  { icon: Crown, title: 'Linked to Traditional Authority', desc: 'Each village is registered under its Chief (Thovhele/Khosi/Hosi) and local municipality.' },
  { icon: BarChart3, title: 'Reports & PDFs', desc: 'Generate official receipts, financial statements and Proof-of-Address letters at the click of a button.' },
  { icon: MessageSquare, title: 'Section Leaders', desc: 'Empower section/ward leaders to coordinate their area within the same platform.' },
  { icon: ShieldCheck, title: 'Secure & Isolated', desc: 'Each village’s data is private. Role-based access for Admin, Treasurer, Secretary and Household Heads.' },
];

const audience = [
  { icon: Landmark, title: 'Village Admins', desc: 'Register your village, configure rules, invite staff and oversee operations.' },
  { icon: Wallet, title: 'Treasurers & Secretaries', desc: 'Record payments, issue receipts and manage burial society books.' },
  { icon: Users, title: 'Section Leaders', desc: 'Coordinate households in your section and submit community requests.' },
  { icon: Home, title: 'Households', desc: 'Log in with your stand number to view your contributions, status and family register.' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">About the Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3">
            VillageConnect <span className="text-primary">Limpopo</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            A digital management platform that empowers villages across Limpopo Province to run
            their household register, burial society, finances and community requests — all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <Building2 className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Our Mission</h3>
              <p className="text-sm text-muted-foreground">
                Replace paper books and scattered records with one trusted, transparent digital system per village.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <MapPin className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Built for Limpopo</h3>
              <p className="text-sm text-muted-foreground">
                Designed around districts, municipalities, traditional authorities and village sections.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <ShieldCheck className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Multi-Village, Secure</h3>
              <p className="text-sm text-muted-foreground">
                Every village runs independently with its own staff, rules and data — fully isolated.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">What you can do</h2>
          <p className="text-muted-foreground mb-8">Everything a community needs to run its day-to-day affairs digitally.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <Card key={f.title}>
                <CardContent className="pt-6">
                  <f.icon className="h-6 w-6 text-primary mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">Who it's for</h2>
        <p className="text-muted-foreground mb-8">Roles for everyone in the community.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {audience.map(a => (
            <Card key={a.title}>
              <CardContent className="pt-6">
                <a.icon className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm mb-1">{a.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-display mb-8">How it works</h2>
          <ol className="space-y-4">
            {[
              { n: '1', t: 'Register your village', d: 'Select your district and municipality, add your Chief and define your village sections.' },
              { n: '2', t: 'Invite your team', d: 'Add your Treasurer, Secretary and Section Leaders so each role can do their part.' },
              { n: '3', t: 'Capture households', d: 'Build the household register stand by stand, with members and family details.' },
              { n: '4', t: 'Run operations', d: 'Record contributions, issue receipts, process burial cases, and respond to community requests.' },
              { n: '5', t: 'Stay transparent', d: 'Generate reports and let households log in to view their own status and contributions.' },
            ].map(s => (
              <li key={s.n} className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">{s.n}</div>
                <div>
                  <h3 className="font-semibold">{s.t}</h3>
                  <p className="text-sm text-muted-foreground">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold font-display mb-3">Ready to digitise your village?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Join other communities in Limpopo using VillageConnect to modernise governance and burial society management.
        </p>
        <Button size="lg" asChild>
          <Link to="/">Get Started</Link>
        </Button>
      </section>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VillageConnect Limpopo · A multi-community digital management platform
      </footer>
    </div>
  );
}
