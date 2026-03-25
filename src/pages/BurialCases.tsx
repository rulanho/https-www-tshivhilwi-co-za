import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

export default function BurialCases() {
  const { burialCases, members, households, addBurialCase } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ member_id: '', household_id: '', date_of_death: '', date_reported: '' });

  const handleAdd = () => {
    if (!form.member_id || !form.household_id || !form.date_of_death) return;
    addBurialCase({
      member_id: form.member_id,
      household_id: form.household_id,
      date_of_death: form.date_of_death,
      date_reported: form.date_reported || new Date().toISOString().split('T')[0],
      status: 'pending',
    });
    setForm({ member_id: '', household_id: '', date_of_death: '', date_reported: '' });
    setOpen(false);
  };

  const selectedHhMembers = form.household_id ? members.filter(m => m.household_id === form.household_id) : [];

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Burial Cases</h1>
          <p className="page-subtitle">Register and manage death cases</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Register Case</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Register Burial Case</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Household</Label>
                <Select onValueChange={v => setForm(f => ({ ...f, household_id: v, member_id: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Select household" /></SelectTrigger>
                  <SelectContent>
                    {households.map(h => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Deceased Member</Label>
                <Select onValueChange={v => setForm(f => ({ ...f, member_id: v }))} disabled={!form.household_id}>
                  <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent>
                    {selectedHhMembers.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date of Death</Label><Input type="date" value={form.date_of_death} onChange={e => setForm(f => ({ ...f, date_of_death: e.target.value }))} /></div>
              <div><Label>Date Reported</Label><Input type="date" value={form.date_reported} onChange={e => setForm(f => ({ ...f, date_reported: e.target.value }))} /></div>
              <p className="text-xs text-muted-foreground">Eligibility will be automatically checked upon submission.</p>
              <Button onClick={handleAdd} className="w-full">Submit Case</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {burialCases.length === 0 && <p className="text-muted-foreground">No burial cases registered.</p>}
        {burialCases.map(c => {
          const member = members.find(m => m.id === c.member_id);
          const hh = households.find(h => h.id === c.household_id);
          return (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold">{member?.full_name || c.member_id}</p>
                    <p className="text-xs text-muted-foreground">{hh?.name} · Died: {c.date_of_death} · Reported: {c.date_reported}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={c.status === 'approved' ? 'default' : c.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {c.status}
                    </Badge>
                    <Badge variant={c.eligibility_status === 'eligible' ? 'default' : 'destructive'}>
                      {c.eligibility_status === 'eligible' ? '✅ Eligible' : '❌ Not Eligible'}
                    </Badge>
                  </div>
                </div>
                {c.eligibility_reason && (
                  <p className="text-xs mt-2 text-muted-foreground italic">Reason: {c.eligibility_reason}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
