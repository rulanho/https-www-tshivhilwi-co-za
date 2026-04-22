import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, CreditCard, Skull, Banknote, Settings, Menu, X, FileText, User, LogOut, MessageSquare, HandCoins, Shield, Activity, MapPin, ChevronDown, Globe, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useVillage } from '@/contexts/VillageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type NavRole = 'admin' | 'super_admin' | 'treasurer' | 'secretary' | 'section_leader';

interface NavItem {
  to: string;
  icon: any;
  label: string;
  roles?: NavRole[];
}

const links: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/villages', icon: Globe, label: 'Villages' },
  { to: '/households', icon: Home, label: 'Households', roles: ['admin', 'super_admin', 'secretary', 'section_leader'] },
  { to: '/payments', icon: CreditCard, label: 'Payments', roles: ['admin', 'super_admin', 'treasurer'] },
  { to: '/burial-cases', icon: Skull, label: 'Burial Cases', roles: ['admin', 'super_admin', 'secretary', 'treasurer'] },
  { to: '/payouts', icon: Banknote, label: 'Payouts', roles: ['admin', 'super_admin', 'treasurer'] },
  { to: '/requests', icon: MessageSquare, label: 'Community Services' },
  { to: '/special-contributions', icon: HandCoins, label: 'Special Levies', roles: ['admin', 'super_admin', 'treasurer'] },
  { to: '/section-leaders', icon: Shield, label: 'Leaders & Access', roles: ['admin', 'super_admin'] },
  { to: '/reports', icon: FileText, label: 'Reports', roles: ['admin', 'super_admin', 'treasurer', 'secretary'] },
  { to: '/activity-log', icon: Activity, label: 'Activity Log', roles: ['admin', 'super_admin'] },
  { to: '/join-requests', icon: UserPlus, label: 'Join Requests', roles: ['admin', 'super_admin'] },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'super_admin'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { signOut, profile, roles } = useAuth();
  const { villages, currentVillage, setCurrentVillageId, isSuperAdmin } = useVillage();

  const allLinks = links.filter(link => {
    if (!link.roles) return true;
    return link.roles.some(r => roles.includes(r as any));
  });

  const villageSwitcher = villages.length > 0 ? (
    <div className="px-4 py-3 border-b border-sidebar-border">
      <label className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 mb-1.5 block">Village</label>
      <Select value={currentVillage?.id || ''} onValueChange={setCurrentVillageId}>
        <SelectTrigger className="bg-sidebar-accent/30 border-sidebar-border text-sidebar-foreground text-sm h-9">
          <SelectValue placeholder="Select village" />
        </SelectTrigger>
        <SelectContent>
          {villages.map(v => (
            <SelectItem key={v.id} value={v.id}>
              <span className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />{v.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : null;

  const nav = (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {allLinks.map(link => {
        const active = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        );
      })}
    </nav>
  );

  const userSection = (
    <div className="px-3 py-4 border-t border-sidebar-border mt-auto">
      <div className="px-3 mb-2">
        <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.full_name || 'User'}</p>
        <p className="text-xs text-sidebar-foreground/60 capitalize">{roles.join(', ') || 'No role'}</p>
      </div>
      <button
        onClick={signOut}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full"
      >
        <LogOut className="h-5 w-5" />
        Sign Out
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden lg:flex lg:w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="px-6 py-5 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground font-display tracking-tight">
            VillageConnect
          </h1>
          <p className="text-xs text-sidebar-foreground/60 mt-0.5">Limpopo Community Platform</p>
        </div>
        {villageSwitcher}
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {userSection}
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between bg-sidebar px-4 py-3 border-b border-sidebar-border">
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground font-display">VillageConnect</h1>
            {currentVillage && <p className="text-[10px] text-sidebar-foreground/60">{currentVillage.name}</p>}
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-sidebar-foreground">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, x: -200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -200 }}
              className="lg:hidden fixed inset-0 z-50 bg-sidebar pt-16 flex flex-col"
            >
              {villageSwitcher}
              <div className="flex-1">{nav}</div>
              {userSection}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
