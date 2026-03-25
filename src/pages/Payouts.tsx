import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/data';

export default function Payouts() {
  const { payouts, burialCases, members, households, addPayout, updateCaseStatus, rules } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ case_id: '', payment_method: 'eft', notes: '' });

  const eligibleCases = burialCases.filter(c => c.eligibility_status === 'eligible' && c.status === 'pending');

  const handleApprove = () => {
    if (!form.case_id) return;
    addPayout({
      case_id: form.case_id,
      approved_amount: rules?.payout_amount || 15000,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: form.payment_method,
      approved_by: 'Admin',
      notes: form.notes,
    });
    updateCaseStatus(form.case_id, 'approved');
    setForm({ case_id: '', payment_method: 'eft', notes: '' });
    setOpen(false);
  };

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Payouts</h1>
          <p className="page-subtitle">Approve and record burial payouts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={eligibleCases.length === 0}><Plus className="h-4 w-4 mr-1" />Approve Payout</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Approve Payout</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Eligible Case</Label>
                <Select onValueChange={v => setForm(f => ({ ...f, case_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                  <SelectContent>
                    {eligibleCases.map(c => {
                      const member = members.find(m => m.id === c.member_id);
                      return <SelectItem key={c.id} value={c.id}>{member?.full_name} ({c.id.slice(0, 8)})</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm">
                Payout Amount: <span className="font-semibold">{formatCurrency(rules?.payout_amount || 15000)}</span>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eft">EFT</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." /></div>
              <Button onClick={handleApprove} className="w-full">Approve & Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {payouts.length === 0 && eligibleCases.length === 0 && (
        <p className="text-muted-foreground">No payouts or eligible cases at this time.</p>
      )}

      {eligibleCases.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 font-display">Pending Approval ({eligibleCases.length})</h3>
          <div className="grid gap-3">
            {eligibleCases.map(c => {
              const member = members.find(m => m.id === c.member_id);
              const hh = households.find(h => h.id === c.household_id);
              return (
                <Card key={c.id} className="border-warning/30 bg-warning/5">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{member?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{hh?.name} · Died: {c.date_of_death}</p>
                    </div>
                    <Badge className="bg-warning text-warning-foreground">Awaiting Approval</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {payouts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 font-display">Completed Payouts</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Case</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Approved By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map(p => (
                      <tr key={p.id} className="border-b border-border last:border-0">
                        <td className="p-4 font-medium">{p.case_id.slice(0, 8)}...</td>
                        <td className="p-4">{formatCurrency(Number(p.approved_amount))}</td>
                        <td className="p-4">{p.payment_date}</td>
                        <td className="p-4 uppercase">{p.payment_method}</td>
                        <td className="p-4">{p.approved_by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
