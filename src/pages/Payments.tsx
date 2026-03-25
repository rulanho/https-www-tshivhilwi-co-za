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
    household_id: '', payment_month: '', payment_method: 'cash' as 'cash' | 'eft',
  });

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const sorted = [...filtered].sort((a, b) => (b.payment_date || '').localeCompare(a.payment_date || ''));

  const handleAdd = () => {
    if (!form.household_id || !form.payment_month) return;
    addPayment({
      household_id: form.household_id,
      amount: rules?.monthly_contribution || 200,
      payment_date: new Date().toISOString().split('T')[0],
      payment_month: form.payment_month,
      payment_method: form.payment_method,
      recorded_by: 'Treasurer',
      status: 'paid',
    });
    setForm({ household_id: '', payment_month: '', payment_method: 'cash' });
    setOpen(false);
  };

  const statusColor = (s: string) => {
    if (s === 'paid') return 'default' as const;
    if (s === 'missed') return 'destructive' as const;
    return 'secondary' as const;
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
                <Select onValueChange={v => setForm(f => ({ ...f, household_id: v }))}>
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
                <Input placeholder="e.g. Mar 2026" value={form.payment_month} onChange={e => setForm(f => ({ ...f, payment_month: e.target.value }))} />
              </div>
              <div>
                <Label>Method</Label>
                <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v as 'cash' | 'eft' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="eft">EFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm">
                Amount: <span className="font-semibold">{formatCurrency(rules?.monthly_contribution || 200)}</span>
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
                  const hh = households.find(h => h.id === p.household_id);
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="p-4 font-medium">{hh?.name || p.household_id}</td>
                      <td className="p-4">{p.payment_month}</td>
                      <td className="p-4">{p.status === 'missed' ? '—' : formatCurrency(Number(p.amount))}</td>
                      <td className="p-4 uppercase">{p.payment_method}</td>
                      <td className="p-4">{p.payment_date || '—'}</td>
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
