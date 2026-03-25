import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, CreditCard, Skull, Banknote, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/households', icon: Home, label: 'Households' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/burial-cases', icon: Skull, label: 'Burial Cases' },
  { to: '/payouts', icon: Banknote, label: 'Payouts' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const nav = (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {links.map(link => {
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="px-6 py-5 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground font-display tracking-tight">
            Burial Society
          </h1>
          <p className="text-xs text-sidebar-foreground/60 mt-0.5">Management System</p>
        </div>
        {nav}
      </aside>

      {/* Mobile header + overlay */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between bg-sidebar px-4 py-3 border-b border-sidebar-border">
          <h1 className="text-lg font-bold text-sidebar-foreground font-display">Burial Society</h1>
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
              className="lg:hidden fixed inset-0 z-50 bg-sidebar pt-16"
            >
              {nav}
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
