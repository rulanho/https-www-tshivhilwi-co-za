import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Landmark, Home, Wallet, HeartHandshake, FileText, MapPin,
  ShieldCheck, Users, Crown, Building2, ArrowRight, Globe,
  BarChart3, BookOpen, CheckCircle2, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const features = [
  { icon: Home, k: 'f1' }, { icon: BookOpen, k: 'f2' }, { icon: Wallet, k: 'f3' },
  { icon: HeartHandshake, k: 'f4' }, { icon: FileText, k: 'f5' }, { icon: Crown, k: 'f6' },
  { icon: BarChart3, k: 'f7' }, { icon: ShieldCheck, k: 'f8' },
];

const steps = ['s1', 's2', 's3', 's4'];

const roles = [
  { icon: Landmark, k: 'r1' }, { icon: Wallet, k: 'r2' },
  { icon: FileText, k: 'r3' }, { icon: Home, k: 'r4' },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const stats = [
    { value: '5+', label: t('stats.districts') },
    { value: '24/7', label: t('stats.access') },
    { value: '100%', label: t('stats.ownership') },
  ];

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
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.features')}</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.how')}</a>
            <a href="#roles" className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.roles')}</a>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">{t('nav.signin')}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">{t('nav.getStarted')}</Link>
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <LanguageSwitcher />
            <button
              className="p-2 rounded-md hover:bg-muted"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>{t('nav.features')}</a>
            <a href="#how-it-works" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>{t('nav.how')}</a>
            <a href="#roles" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>{t('nav.roles')}</a>
            <div className="pt-3 border-t flex flex-col gap-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/auth">{t('nav.signin')}</Link>
              </Button>
              <Button size="sm" className="w-full" asChild>
                <Link to="/auth">{t('nav.getStarted')}</Link>
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
                {t('hero.badge')}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-[1.1]">
                {t('hero.title1')} <span className="text-primary">{t('hero.title2')}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                {t('hero.sub')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to="/auth">{t('hero.cta')}</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/about">{t('nav.learnMore')}</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />{t('hero.p1')}</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />{t('hero.p2')}</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />{t('hero.p3')}</span>
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
                      <p className="font-semibold">{t('hero.council')}</p>
                      <p className="text-xs text-muted-foreground">{t('hero.muni')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-2xl font-bold text-primary">1,248</p>
                      <p className="text-xs text-muted-foreground">{t('hero.households')}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-2xl font-bold text-primary">R84k</p>
                      <p className="text-xs text-muted-foreground">{t('hero.contrib')}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm py-2 border-b">
                      <span className="text-muted-foreground">{t('hero.poa')}</span>
                      <span className="font-medium">{t('hero.today')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-2 border-b">
                      <span className="text-muted-foreground">{t('hero.burialContrib')}</span>
                      <span className="font-medium">{t('hero.yesterday')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-2">
                      <span className="text-muted-foreground">{t('hero.newHousehold')}</span>
                      <span className="font-medium">{t('hero.twoDays')}</span>
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
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">{t('features.title')}</h2>
            <p className="text-muted-foreground">{t('features.sub')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <Card key={f.k} className="group hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{t(`${f.k}.t`)}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(`${f.k}.d`)}</p>
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
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">{t('how.title')}</h2>
              <p className="text-muted-foreground mb-8">{t('how.sub')}</p>
              <ol className="space-y-6">
                {steps.map((k, i) => (
                  <li key={k} className="flex gap-4">
                    <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{t(`${k}.t`)}</h3>
                      <p className="text-sm text-muted-foreground">{t(`${k}.d`)}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-8">
                <Button asChild>
                  <Link to="/auth" className="inline-flex items-center">
                    {t('how.cta')} <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-bl from-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
              <Card className="relative border shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      { icon: Crown, t: t('how.chief'), d: t('how.chiefD') },
                      { icon: Building2, t: t('how.muni'), d: t('how.muniD') },
                      { icon: Users, t: t('how.hh'), d: t('how.hhD') },
                    ].map((item) => (
                      <div key={item.t} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.t}</p>
                          <p className="text-xs text-muted-foreground">{item.d}</p>
                        </div>
                      </div>
                    ))}
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
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">{t('roles.title')}</h2>
            <p className="text-muted-foreground">{t('roles.sub')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map((r) => (
              <Card key={r.k} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <r.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{t(`${r.k}.t`)}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(`${r.k}.d`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">{t('cta.title')}</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">{t('cta.sub')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">{t('hero.cta')}</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <Link to="/auth">{t('cta.staff')}</Link>
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
              <Link to="/about" className="hover:text-foreground transition-colors">{t('nav.about')}</Link>
              <Link to="/auth" className="hover:text-foreground transition-colors">{t('nav.signin')}</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} VillageConnect Limpopo · {t('footer.tag')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
