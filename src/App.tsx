import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { VillageProvider, useVillage } from "@/contexts/VillageContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Households from "@/pages/Households";
import Payments from "@/pages/Payments";
import BurialCases from "@/pages/BurialCases";
import Payouts from "@/pages/Payouts";
import SettingsPage from "@/pages/Settings";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import Requests from "@/pages/Requests";
import SpecialContributions from "@/pages/SpecialContributions";
import SectionLeaders from "@/pages/SectionLeaders";
import ActivityLog from "@/pages/ActivityLog";
import HouseholdPortal from "@/pages/HouseholdPortal";
import Villages from "@/pages/Villages";
import CreateVillage from "@/pages/CreateVillage";
import JoinRequests from "@/pages/JoinRequests";
import Auth from "@/pages/Auth";
import About from "@/pages/About";
import NotFound from "./pages/NotFound.tsx";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Globe, Plus, Search, UserPlus, Landmark, LogOut, Info } from "lucide-react";
import { toast } from "sonner";

const queryClient = new QueryClient();

function NoVillageGate() {
  const { user, signOut } = useAuth();
  const { refresh } = useVillage();
  const [browseOpen, setBrowseOpen] = useState(false);
  const [allVillages, setAllVillages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [joinTarget, setJoinTarget] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [joining, setJoining] = useState(false);

  const handleBrowse = async () => {
    const { data } = await supabase.from('villages').select('*').eq('status', 'active').order('name');
    if (data) setAllVillages(data);
    setBrowseOpen(true);
  };

  const filtered = allVillages.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.district?.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoin = async () => {
    if (!joinTarget || !user) return;
    setJoining(true);
    const { error } = await supabase.from('village_join_requests').insert({
      user_id: user.id, village_id: joinTarget.id, message: msg || null,
    });
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'Already requested' : error.message);
    } else {
      toast.success('Request sent! The admin will review it.');
    }
    setJoining(false);
    setJoinTarget(null);
    setMsg('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Landmark className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-display mb-2">Welcome to VillageConnect</h1>
        <p className="text-sm text-muted-foreground mb-8">Choose how to get started</p>
        <div className="space-y-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/create-village'}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Register a New Village</p>
                <p className="text-xs text-muted-foreground">Digitise your community as the admin</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleBrowse}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Join an Existing Village</p>
                <p className="text-xs text-muted-foreground">Browse and request to join a community</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Button variant="ghost" size="sm" className="mt-6" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />Sign Out
        </Button>
        <div className="mt-2">
          <a href="/about" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <Info className="h-3 w-3" />What is VillageConnect?
          </a>
        </div>

        <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
          <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Browse Villages</DialogTitle></DialogHeader>
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="mb-3" />
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No villages found</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sm">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.municipality}, {v.district}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setBrowseOpen(false); setJoinTarget(v); }}>
                      <UserPlus className="h-3.5 w-3.5 mr-1" />Request
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!joinTarget} onOpenChange={() => setJoinTarget(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Request to Join {joinTarget?.name}</DialogTitle></DialogHeader>
            <Textarea placeholder="Optional message to the admin..." value={msg} onChange={e => setMsg(e.target.value)} rows={3} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setJoinTarget(null)}>Cancel</Button>
              <Button onClick={handleJoin} disabled={joining}>{joining ? 'Sending...' : 'Send Request'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function VillageGate() {
  const { villages, loading: villageLoading, currentVillage } = useVillage();
  const { hasRole } = useAuth();

  if (villageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading villages...</p>
        </div>
      </div>
    );
  }

  // If user has no village, show village creation
  if (villages.length === 0 && !hasRole('household_head')) {
    return (
      <Routes>
        <Route path="/create-village" element={<CreateVillage />} />
        <Route path="*" element={<NoVillageGate />} />
      </Routes>
    );
  }

  return (
    <DataProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/villages" element={<Villages />} />
          <Route path="/create-village" element={<CreateVillage />} />
          <Route path="/households" element={<Households />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/burial-cases" element={<BurialCases />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/special-contributions" element={<SpecialContributions />} />
          <Route path="/section-leaders" element={<SectionLeaders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/activity-log" element={<ActivityLog />} />
          <Route path="/join-requests" element={<JoinRequests />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </DataProvider>
  );
}

function ProtectedRoutes() {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  // Household heads get their own portal
  const isHouseholdOnly = hasRole('household_head') && !hasRole('admin') && !hasRole('treasurer') && !hasRole('secretary');

  if (isHouseholdOnly) {
    return <HouseholdPortal />;
  }

  return (
    <VillageProvider>
      <VillageGate />
    </VillageProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ProtectedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
