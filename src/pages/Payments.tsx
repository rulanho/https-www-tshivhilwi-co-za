import { useState, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, Image } from 'lucide-react';
import { formatCurrency } from '@/lib/data';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Payments() {
  const { payments, households, addPayment, rules } = useData();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    household_id: '', payment_month: '', payment_method: 'cash' as string,
    amount: '', notes: '',
  });

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const sorted = [...filtered].sort((a, b) => (b.payment_date || '').localeCompare(a.payment_date || ''));

  const handleAdd = async () => {
    if (!form.household_id || !form.payment_month) return;
    setUploading(true);

    let receipt_image_url: string | undefined;
    if (receiptFile) {
      const ext = receiptFile.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('receipts').upload(path, receiptFile);
      if (error) { toast.error('Failed to upload receipt'); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(path);
      receipt_image_url = urlData.publicUrl;
    }

    const paymentAmount = form.amount ? Number(form.amount) : (rules?.monthly_contribution || 200);

    await addPayment({
      household_id: form.household_id,
      amount: paymentAmount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_month: form.payment_month,
      payment_method: form.payment_method,
      recorded_by: 'Staff',
      status: 'paid',
      ...(receipt_image_url ? { receipt_image_url } : {}),
      ...(form.notes ? { notes: form.notes } : {}),
    } as any);

    setForm({ household_id: '', payment_month: '', payment_method: 'cash', amount: '', notes: '' });
    setReceiptFile(null);
    setUploading(false);
    setOpen(false);
  };

  const statusColor = (s: string) => {
    if (s === 'paid') return 'default' as const;
    if (s === 'missed') return 'destructive' as const;
    return 'secondary' as const;
  };

  const [viewReceipt, setViewReceipt] = useState<string | null>(null);

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
          <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                <Label>Amount (leave blank for default: {formatCurrency(rules?.monthly_contribution || 200)})</Label>
                <Input type="number" placeholder={String(rules?.monthly_contribution || 200)} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <Label>Method</Label>
                <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="eft">EFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes about this payment..." rows={2} />
              </div>
              <div>
                <Label>Receipt Image (optional)</Label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setReceiptFile(e.target.files?.[0] || null)} />
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-1" />
                  {receiptFile ? receiptFile.name : 'Upload Receipt Photo'}
                </Button>
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Record Payment'}
              </Button>
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
                  <th className="text-left p-4 font-medium text-muted-foreground">Receipt</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(p => {
                  const hh = households.find(h => h.id === p.household_id);
                  const pay = p as any;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="p-4 font-medium">{hh?.name || p.household_id}</td>
                      <td className="p-4">{p.payment_month}</td>
                      <td className="p-4">{p.status === 'missed' ? '—' : formatCurrency(Number(p.amount))}</td>
                      <td className="p-4 uppercase">{p.payment_method}</td>
                      <td className="p-4">{p.payment_date || '—'}</td>
                      <td className="p-4">
                        {pay.receipt_image_url ? (
                          <button onClick={() => setViewReceipt(pay.receipt_image_url)} className="text-primary hover:underline flex items-center gap-1">
                            <Image className="h-4 w-4" /> View
                          </button>
                        ) : '—'}
                      </td>
                      <td className="p-4"><Badge variant={statusColor(p.status)}>{p.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt viewer */}
      <Dialog open={!!viewReceipt} onOpenChange={() => setViewReceipt(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Payment Receipt</DialogTitle></DialogHeader>
          {viewReceipt && <img src={viewReceipt} alt="Receipt" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
