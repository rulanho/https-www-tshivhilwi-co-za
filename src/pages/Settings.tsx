import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/data';

export default function SettingsPage() {
  const { rules, updateRules } = useData();
  const [form, setForm] = useState({
    minimum_age: rules?.minimum_age || 35,
    minimum_membership_months: rules?.minimum_membership_months || 3,
    monthly_contribution: rules?.monthly_contribution || 200,
    payout_amount: rules?.payout_amount || 15000,
  });
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
            <Input type="number" value={form.minimum_age} onChange={e => setForm(f => ({ ...f, minimum_age: Number(e.target.value) }))} />
            <p className="text-xs text-muted-foreground mt-1">Members below this age will not be eligible for claims</p>
          </div>
          <div>
            <Label>Minimum Membership Period (months)</Label>
            <Input type="number" value={form.minimum_membership_months} onChange={e => setForm(f => ({ ...f, minimum_membership_months: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Monthly Contribution Amount</Label>
            <Input type="number" value={form.monthly_contribution} onChange={e => setForm(f => ({ ...f, monthly_contribution: Number(e.target.value) }))} />
            <p className="text-xs text-muted-foreground mt-1">Currently: {formatCurrency(form.monthly_contribution)}</p>
          </div>
          <div>
            <Label>Payout Amount per Claim</Label>
            <Input type="number" value={form.payout_amount} onChange={e => setForm(f => ({ ...f, payout_amount: Number(e.target.value) }))} />
            <p className="text-xs text-muted-foreground mt-1">Currently: {formatCurrency(form.payout_amount)}</p>
          </div>
          <Button onClick={handleSave} className="w-full">
            {saved ? '✓ Saved!' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
