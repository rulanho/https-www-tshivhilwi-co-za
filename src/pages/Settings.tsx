import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/data';

export default function SettingsPage() {
  const { rules, updateRules } = useData();
  const [form, setForm] = useState(rules);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateRules(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure eligibility rules and contribution amounts</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="font-display">Eligibility Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Minimum Age (years)</Label>
            <Input type="number" value={form.minimumAge} onChange={e => setForm(f => ({ ...f, minimumAge: Number(e.target.value) }))} />
            <p className="text-xs text-muted-foreground mt-1">Members below this age will not be eligible for claims</p>
          </div>
          <div>
            <Label>Minimum Membership Period (months)</Label>
            <Input type="number" value={form.minimumMembershipMonths} onChange={e => setForm(f => ({ ...f, minimumMembershipMonths: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Monthly Contribution Amount</Label>
            <Input type="number" value={form.monthlyContribution} onChange={e => setForm(f => ({ ...f, monthlyContribution: Number(e.target.value) }))} />
            <p className="text-xs text-muted-foreground mt-1">Currently: {formatCurrency(form.monthlyContribution)}</p>
          </div>
          <div>
            <Label>Payout Amount per Claim</Label>
            <Input type="number" value={form.payoutAmount} onChange={e => setForm(f => ({ ...f, payoutAmount: Number(e.target.value) }))} />
            <p className="text-xs text-muted-foreground mt-1">Currently: {formatCurrency(form.payoutAmount)}</p>
          </div>
          <Button onClick={handleSave} className="w-full">
            {saved ? '✓ Saved!' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
