import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Landmark, Home, Wallet, HeartHandshake, FileText, MapPin,
  ShieldCheck, Users, Crown, Building2, ArrowLeft, Globe, MessageSquare, BarChart3,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const features = [
  { icon: Home, k: 'a1' }, { icon: Wallet, k: 'f3' }, { icon: HeartHandshake, k: 'f4' },
  { icon: FileText, k: 'a2' }, { icon: Crown, k: 'f6' }, { icon: BarChart3, k: 'f7' },
  { icon: MessageSquare, k: 'a3' }, { icon: ShieldCheck, k: 'f8' },
];

const audience = [
  { icon: Landmark, k: 'aud1' }, { icon: Wallet, k: 'aud2' },
  { icon: Users, k: 'aud3' }, { icon: Home, k: 'aud4' },
];

const steps = ['s1', 's2', 's3', 'how.run', 's5'];

export default function About() {
  const { t } = useLanguage();

  const stepItems = [
    { t: t('s1.t'), d: t('s1.d') },
    { t: t('s2.t'), d: t('s2.d') },
    { t: t('s3.t'), d: t('s3.d') },
    { t: t('how.run'), d: t('how.runD') },
    { t: t('s5.t'), d: t('s5.d') },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />{t('nav.back')}
            </Link>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t('about.eyebrow')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3">
            VillageConnect <span className="text-primary">Limpopo</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">{t('about.lead')}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/">{t('nav.getStarted')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="#features">{t('nav.learnMore')}</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Building2, t: t('about.mission'), d: t('about.missionD') },
            { icon: MapPin, t: t('about.built'), d: t('about.builtD') },
            { icon: ShieldCheck, t: t('about.secure'), d: t('about.secureD') },
          ].map(c => (
            <Card key={c.t}>
              <CardContent className="pt-6">
                <c.icon className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold mb-1">{c.t}</h3>
                <p className="text-sm text-muted-foreground">{c.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">{t('about.whatTitle')}</h2>
          <p className="text-muted-foreground mb-8">{t('about.whatSub')}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <Card key={f.k}>
                <CardContent className="pt-6">
                  <f.icon className="h-6 w-6 text-primary mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{t(`${f.k}.t`)}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(`${f.k}.d`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold font-display mb-2">{t('about.whoTitle')}</h2>
        <p className="text-muted-foreground mb-8">{t('about.whoSub')}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {audience.map(a => (
            <Card key={a.k}>
              <CardContent className="pt-6">
                <a.icon className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm mb-1">{t(`${a.k}.t`)}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(`${a.k}.d`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-display mb-8">{t('how.title')}</h2>
          <ol className="space-y-4">
            {stepItems.map((s, i) => (
              <li key={steps[i]} className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">{i + 1}</div>
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
        <h2 className="text-2xl sm:text-3xl font-bold font-display mb-3">{t('cta.title')}</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{t('about.ctaSub')}</p>
        <Button size="lg" asChild>
          <Link to="/">{t('nav.getStarted')}</Link>
        </Button>
      </section>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VillageConnect Limpopo · {t('footer.tag')}
      </footer>
    </div>
  );
}
