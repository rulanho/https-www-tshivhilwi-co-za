import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useVillage } from '@/contexts/VillageContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BookOpen, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Entry {
  id: string;
  entry_date: string;
  entry_type: string;
  amount: number | null;
  description: string | null;
  household_id: string | null;
  member_id: string | null;
  recorded_by_name: string | null;
  created_at: string;
}

const ENTRY_TYPES = [
  { value: 'contribution', label: 'Contribution' },
  { value: 'letter', label: 'Letter Issued' },
  { value: 'note', label: 'Note' },
];

export default function Ledger() {
  const { currentVillage } = useVillage();
  const { households, members } = useData();
  const { hasRole, profile } = useAuth();
  const canAdd = hasRole('admin') || hasRole('secretary') || hasRole('treasurer');

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [form, setForm] = useState({
    entry_date: new Date().toISOString().slice(0, 10),
    entry_type: 'contribution',
    household_id: '',
    member_id: '',
    amount: '',
    description: '',
  });

  const fetchEntries = async () => {
    if (!currentVillage) return;
    setLoading(true);
    const { data } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('village_id', currentVillage.id)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false });
    setEntries((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, [currentVillage?.id]);

  const handleSave = async () => {
    if (!currentVillage) return;
    if (!form.entry_type || !form.entry_date) { toast.error('Date and type required'); return; }
    const { error } = await supabase.from('ledger_entries').insert({
      village_id: currentVillage.id,
      entry_date: form.entry_date,
      entry_type: form.entry_type,
      household_id: form.household_id || null,
      member_id: form.member_id || null,
      amount: form.amount ? Number(form.amount) : null,
      description: form.description || null,
      recorded_by_name: profile?.full_name || null,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success('Entry recorded');
    setOpen(false);
    setForm({ entry_date: new Date().toISOString().slice(0, 10), entry_type: 'contribution', household_id: '', member_id: '', amount: '', description: '' });
    fetchEntries();
  };

  const householdName = (id: string | null) => households.find(h => h.id === id)?.name || '—';
  const memberName = (id: string | null) => members.find(m => m.id === id)?.full_name || '—';

  const filtered = entries.filter(e => {
    if (typeFilter !== 'all' && e.entry_type !== typeFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (e.description || '').toLowerCase().includes(s) ||
      householdName(e.household_id).toLowerCase().includes(s) ||
      memberName(e.member_id).toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Community Ledger</h1>
          <p className="page-subtitle">Digital record book — contributions, letters issued, and notes</p>
        </div>
        {canAdd && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Entry</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display">Add Ledger Entry</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={form.entry_type} onValueChange={v => setForm({ ...form, entry_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ENTRY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Resident / Household (optional)</Label>
                  <Select value={form.household_id} onValueChange={v => setForm({ ...form, household_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select household" /></SelectTrigger>
                    <SelectContent>
                      {households.map(h => <SelectItem key={h.id} value={h.id}>{h.name} {h.stand_number ? `(${h.stand_number})` : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {form.entry_type === 'contribution' && (
                  <div>
                    <Label>Amount (R)</Label>
                    <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                  </div>
                )}
                <div>
                  <Label>Description / Notes</Label>
                  <Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is this entry about?" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {ENTRY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No ledger entries yet</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(e => (
            <Card key={e.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="capitalize">{e.entry_type}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(e.entry_date).toLocaleDateString('en-ZA')}</span>
                      {e.amount != null && <span className="text-sm font-semibold text-primary">R {Number(e.amount).toFixed(2)}</span>}
                    </div>
                    {e.household_id && <p className="text-sm font-medium truncate">{householdName(e.household_id)}</p>}
                    {e.description && <p className="text-sm text-muted-foreground mt-1">{e.description}</p>}
                    {e.recorded_by_name && <p className="text-[11px] text-muted-foreground mt-2">Recorded by {e.recorded_by_name}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}