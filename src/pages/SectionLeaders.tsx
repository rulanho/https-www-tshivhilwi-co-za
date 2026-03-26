import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Shield, Trash2, Key } from 'lucide-react';
import { SECTIONS } from '@/lib/data';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';

interface SectionLeader {
  id: string;
  user_id: string;
  section: string;
  full_name: string;
  phone: string | null;
  created_at: string;
}

interface AccessCode {
  id: string;
  household_id: string;
  phone: string;
  access_code: string;
  is_active: boolean;
  created_at: string;
}

export default function SectionLeaders() {
  const { hasRole } = useAuth();
  const { households } = useData();
  const [leaders, setLeaders] = useState<SectionLeader[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [open, setOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ section: '', full_name: '', phone: '', user_id: '' });
  const [codeForm, setCodeForm] = useState({ household_id: '', phone: '' });

  const isAdmin = hasRole('admin');

  const fetchData = async () => {
    setLoading(true);
    const [leadersRes, codesRes] = await Promise.all([
      supabase.from('section_leaders').select('*').order('section'),
      isAdmin
        ? supabase.from('household_access_codes').select('*').order('created_at', { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);
    if (leadersRes.data) setLeaders(leadersRes.data as SectionLeader[]);
    if ((codesRes as any).data) setAccessCodes((codesRes as any).data as AccessCode[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddLeader = async () => {
    if (!form.section || !form.full_name) return;

    // First, find or create a user for this leader
    // For now, the leader must already have a staff account
    // Search profiles by name
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .ilike('full_name', `%${form.full_name}%`);

    if (!profiles || profiles.length === 0) {
      toast.error('No registered user found with that name. The leader must have a staff account first.');
      return;
    }

    const { error } = await supabase.from('section_leaders').insert({
      user_id: profiles[0].user_id,
      section: form.section,
      full_name: profiles[0].full_name || form.full_name,
      phone: form.phone || null,
    } as any);

    if (error) {
      if (error.message.includes('duplicate')) toast.error('This user is already a leader for this section');
      else toast.error(error.message);
      return;
    }
    toast.success(`${form.full_name} registered as ${form.section} section leader`);
    setForm({ section: '', full_name: '', phone: '', user_id: '' });
    setOpen(false);
    fetchData();
  };

  const handleDeleteLeader = async (id: string) => {
    const { error } = await supabase.from('section_leaders').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Leader removed'); fetchData(); }
  };

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateCode = async () => {
    if (!codeForm.household_id || !codeForm.phone) return;
    const code = generateCode();
    const { error } = await supabase.from('household_access_codes').upsert({
      household_id: codeForm.household_id,
      phone: codeForm.phone,
      access_code: code,
      is_active: true,
    } as any, { onConflict: 'phone' });

    if (error) { toast.error(error.message); return; }
    toast.success(`Access code generated: ${code}`);
    setCodeForm({ household_id: '', phone: '' });
    setCodeOpen(false);
    fetchData();
  };

  if (!isAdmin) {
    return (
      <div>
        <h1 className="page-title">Section Leaders</h1>
        <p className="text-muted-foreground">Only admins can manage section leaders.</p>
      </div>
    );
  }

  const sectionLeaderMap = new Map<string, SectionLeader[]>();
  leaders.forEach(l => {
    const list = sectionLeaderMap.get(l.section) || [];
    list.push(l);
    sectionLeaderMap.set(l.section, list);
  });

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Section Leaders & Access</h1>
          <p className="page-subtitle">Manage community leaders and household login codes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={codeOpen} onOpenChange={setCodeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Key className="h-4 w-4 mr-1" />Generate Code</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Generate Household Access Code</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Create a phone number + code pair so a household head can log in to view their household information.
                </p>
                <div>
                  <Label>Household</Label>
                  <Select onValueChange={v => setCodeForm(f => ({ ...f, household_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select household" /></SelectTrigger>
                    <SelectContent>
                      {households.filter(h => h.status === 'active').map(h => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={codeForm.phone} onChange={e => setCodeForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 071 234 5678" />
                </div>
                <Button onClick={handleCreateCode} className="w-full">Generate Code</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Leader</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Register Section Leader</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  The person must already have a staff account (sign up via email first).
                </p>
                <div>
                  <Label>Section</Label>
                  <Select onValueChange={v => setForm(f => ({ ...f, section: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Leader Name (search registered users)</Label>
                  <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Search by name..." />
                </div>
                <div>
                  <Label>Phone (optional)</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <Button onClick={handleAddLeader} className="w-full">Register Leader</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {SECTIONS.map(section => {
          const sectionLeaders = sectionLeaderMap.get(section) || [];
          return (
            <Card key={section}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {section}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sectionLeaders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No leader assigned</p>
                ) : sectionLeaders.map(l => (
                  <div key={l.id} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium">{l.full_name}</p>
                      {l.phone && <p className="text-xs text-muted-foreground">{l.phone}</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteLeader(l.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Household Access Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {accessCodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No access codes generated yet.</p>
          ) : (
            <div className="space-y-2">
              {accessCodes.map(ac => {
                const hh = households.find(h => h.id === ac.household_id);
                return (
                  <div key={ac.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{hh?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        Phone: {ac.phone} · Code: <span className="font-mono font-bold">{ac.access_code}</span>
                      </p>
                    </div>
                    <Badge variant={ac.is_active ? 'default' : 'secondary'}>
                      {ac.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
