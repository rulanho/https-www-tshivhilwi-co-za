import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Users, CreditCard, AlertTriangle, Skull, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { households, members, payments, burialCases, payouts } = useData();

  const activeHouseholds = households.filter(h => h.status === 'active').length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const totalContributions = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPayouts = payouts.reduce((s, p) => s + p.approvedAmount, 0);
  const fundsAvailable = totalContributions - totalPayouts;
  const defaulters = new Set(payments.filter(p => p.status === 'missed').map(p => p.householdId)).size;
  const pendingCases = burialCases.filter(c => c.status === 'pending').length;

  const stats = [
    { label: 'Funds Available', value: formatCurrency(fundsAvailable), icon: Banknote, accent: true },
    { label: 'Total Contributions', value: formatCurrency(totalContributions), icon: CreditCard },
    { label: 'Total Payouts', value: formatCurrency(totalPayouts), icon: Banknote },
    { label: 'Active Households', value: activeHouseholds, icon: Home },
    { label: 'Active Members', value: activeMembers, icon: Users },
    { label: 'Defaulters', value: defaulters, icon: AlertTriangle, warn: defaulters > 0 },
  ];

  const recentPayments = [...payments].filter(p => p.status === 'paid').sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your burial society</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.accent ? 'border-primary/30 bg-primary/5' : ''} ${s.warn ? 'border-destructive/30 bg-destructive/5' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1 font-display">{s.value}</p>
              </div>
              <s.icon className={`h-8 w-8 ${s.accent ? 'text-primary' : s.warn ? 'text-destructive' : 'text-muted-foreground/50'}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map(p => {
                  const hh = households.find(h => h.id === p.householdId);
                  return (
                    <div key={p.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{hh?.name || p.householdId}</p>
                        <p className="text-xs text-muted-foreground">{p.paymentMonth} · {p.paymentMethod.toUpperCase()}</p>
                      </div>
                      <span className="font-semibold text-sm">{formatCurrency(p.amount)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Pending Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingCases === 0 ? (
              <p className="text-muted-foreground text-sm">No pending burial cases.</p>
            ) : (
              <div className="space-y-3">
                {burialCases.filter(c => c.status === 'pending').map(c => {
                  const member = members.find(m => m.id === c.memberId);
                  return (
                    <div key={c.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{member?.fullName || c.memberId}</p>
                        <p className="text-xs text-muted-foreground">Reported: {c.dateReported}</p>
                      </div>
                      <Badge variant={c.eligibilityStatus === 'eligible' ? 'default' : 'destructive'}>
                        {c.eligibilityStatus === 'eligible' ? 'Eligible' : 'Not Eligible'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
