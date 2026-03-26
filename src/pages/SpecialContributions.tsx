import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, HandCoins } from 'lucide-react';
import { formatCurrency } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';

export default function SpecialContributions() {
  const { specialContributions, addSpecialContribution, households } = useData();
  const { roles } = useAuth();
  const isAdmin = roles.includes('admin');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', amount_per_household: '', due_date: '' });

  const handleAdd = () => {
    if (!form.title || !form.amount_per_household) return;
    addSpecialContribution({
      title: form.title,
      description: form.description || undefined,
      amount_per_household: Number(form.amount_per_household),
      due_date: form.due_date || undefined,
      status: 'active',
    });
    setForm({ title: '', description: '', amount_per_household: '', due_date: '' });
    setOpen(false);
  };

  const activeHouseholds = households.filter(h => h.status === 'active').length;

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Special Levies</h1>
          <p className="page-subtitle">Special community contributions (e.g. graveyard cleaning)</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Levy</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Create Special Levy</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Graveyard Cleaning Fund" /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
                <div><Label>Amount per Household</Label><Input type="number" value={form.amount_per_household} onChange={e => setForm(f => ({ ...f, amount_per_household: e.target.value }))} placeholder="e.g. 50" /></div>
                <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
                {form.amount_per_household && (
                  <div className="bg-muted rounded-lg p-3 text-sm">
                    Total expected: <span className="font-semibold">{formatCurrency(Number(form.amount_per_household) * activeHouseholds)}</span> ({activeHouseholds} households × {formatCurrency(Number(form.amount_per_household))})
                  </div>
                )}
                <Button onClick={handleAdd} className="w-full">Create Levy</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {specialContributions.map((sc: any) => (
          <Card key={sc.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <HandCoins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{sc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(Number(sc.amount_per_household))} per household
                    {sc.due_date ? ` · Due: ${sc.due_date}` : ''}
                  </p>
                  {sc.description && <p className="text-sm text-muted-foreground mt-1">{sc.description}</p>}
                </div>
              </div>
              <Badge variant={sc.status === 'active' ? 'default' : 'secondary'}>{sc.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {specialContributions.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No special levies created yet.</p>
        )}
      </div>
    </div>
  );
}
