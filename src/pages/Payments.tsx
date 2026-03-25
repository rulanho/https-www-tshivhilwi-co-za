import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/data';

export default function Payments() {
  const { payments, households, addPayment, rules } = useData();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [form, setForm] = useState({
    householdId: '', paymentMonth: '', paymentMethod: 'cash' as 'cash' | 'eft',
  });

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const sorted = [...filtered].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  const handleAdd = () => {
    if (!form.householdId || !form.paymentMonth) return;
    addPayment({
      householdId: form.householdId,
      amount: rules.monthlyContribution,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMonth: form.paymentMonth,
      paymentMethod: form.paymentMethod,
      recordedBy: 'Treasurer',
      status: 'paid',
    });
    setForm({ householdId: '', paymentMonth: '', paymentMethod: 'cash' });
    setOpen(false);
  };

  const statusColor = (s: string) => {
    if (s === 'paid') return 'default';
    if (s === 'missed') return 'destructive';
    return 'secondary';
  };

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Record and track monthly contributions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Record Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Record Payment</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Household</Label>
                <Select onValueChange={v => setForm(f => ({ ...f, householdId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select household" /></SelectTrigger>
                  <SelectContent>
                    {households.filter(h => h.status === 'active').map(h => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Month</Label>
                <Input placeholder="e.g. Mar 2026" value={form.paymentMonth} onChange={e => setForm(f => ({ ...f, paymentMonth: e.target.value }))} />
              </div>
              <div>
                <Label>Method</Label>
                <Select value={form.paymentMethod} onValueChange={v => setForm(f => ({ ...f, paymentMethod: v as 'cash' | 'eft' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="eft">EFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm">
                Amount: <span className="font-semibold">{formatCurrency(rules.monthlyContribution)}</span>
              </div>
              <Button onClick={handleAdd} className="w-full">Record Payment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'paid', 'missed', 'late'].map(s => (
          <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className="capitalize">
            {s}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Household</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Month</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(p => {
                  const hh = households.find(h => h.id === p.householdId);
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="p-4 font-medium">{hh?.name || p.householdId}</td>
                      <td className="p-4">{p.paymentMonth}</td>
                      <td className="p-4">{p.status === 'missed' ? '—' : formatCurrency(p.amount)}</td>
                      <td className="p-4 uppercase">{p.paymentMethod}</td>
                      <td className="p-4">{p.paymentDate || '—'}</td>
                      <td className="p-4"><Badge variant={statusColor(p.status)}>{p.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
