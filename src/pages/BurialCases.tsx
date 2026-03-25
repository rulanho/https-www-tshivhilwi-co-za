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
  const [form, setForm] = useState({ memberId: '', householdId: '', dateOfDeath: '', dateReported: '' });

  const handleAdd = () => {
    if (!form.memberId || !form.householdId || !form.dateOfDeath) return;
    addBurialCase({
      memberId: form.memberId,
      householdId: form.householdId,
      dateOfDeath: form.dateOfDeath,
      dateReported: form.dateReported || new Date().toISOString().split('T')[0],
      status: 'pending',
    });
    setForm({ memberId: '', householdId: '', dateOfDeath: '', dateReported: '' });
    setOpen(false);
  };

  const selectedHhMembers = form.householdId ? members.filter(m => m.householdId === form.householdId) : [];

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
                <Select onValueChange={v => setForm(f => ({ ...f, householdId: v, memberId: '' }))}>
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
                <Select onValueChange={v => setForm(f => ({ ...f, memberId: v }))} disabled={!form.householdId}>
                  <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent>
                    {selectedHhMembers.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date of Death</Label><Input type="date" value={form.dateOfDeath} onChange={e => setForm(f => ({ ...f, dateOfDeath: e.target.value }))} /></div>
              <div><Label>Date Reported</Label><Input type="date" value={form.dateReported} onChange={e => setForm(f => ({ ...f, dateReported: e.target.value }))} /></div>
              <p className="text-xs text-muted-foreground">Eligibility will be automatically checked upon submission.</p>
              <Button onClick={handleAdd} className="w-full">Submit Case</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {burialCases.length === 0 && <p className="text-muted-foreground">No burial cases registered.</p>}
        {burialCases.map(c => {
          const member = members.find(m => m.id === c.memberId);
          const hh = households.find(h => h.id === c.householdId);
          return (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold">{member?.fullName || c.memberId}</p>
                    <p className="text-xs text-muted-foreground">{hh?.name} · Died: {c.dateOfDeath} · Reported: {c.dateReported}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={c.status === 'approved' ? 'default' : c.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {c.status}
                    </Badge>
                    <Badge variant={c.eligibilityStatus === 'eligible' ? 'default' : 'destructive'}>
                      {c.eligibilityStatus === 'eligible' ? '✅ Eligible' : '❌ Not Eligible'}
                    </Badge>
                  </div>
                </div>
                {c.eligibilityReason && (
                  <p className="text-xs mt-2 text-muted-foreground italic">Reason: {c.eligibilityReason}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
