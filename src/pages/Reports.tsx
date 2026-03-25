import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/data';
import { FileText, Download } from 'lucide-react';
import { generatePaymentReceiptPDF, generateFinancialSummaryPDF } from '@/lib/pdf';

export default function Reports() {
  const { households, members, payments, burialCases, payouts, rules } = useData();

  const totalContributions = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const totalPayouts = payouts.reduce((s, p) => s + Number(p.approved_amount), 0);
  const fundsAvailable = totalContributions - totalPayouts;
  const activeHouseholds = households.filter(h => h.status === 'active').length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const defaulterIds = new Set(payments.filter(p => p.status === 'missed').map(p => p.household_id));
  const defaulters = households.filter(h => defaulterIds.has(h.id));

  const handleDownloadFinancialSummary = () => {
    generateFinancialSummaryPDF({
      totalContributions,
      totalPayouts,
      fundsAvailable,
      activeHouseholds,
      activeMembers,
      defaulterCount: defaulters.length,
      payments,
      payouts,
      households,
    });
  };

  const handleDownloadPaymentReceipt = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    const household = households.find(h => h.id === payment.household_id);
    generatePaymentReceiptPDF(payment, household?.name || 'Unknown');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Financial summaries and downloadable reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card border-primary/30 bg-primary/5">
          <p className="text-sm text-muted-foreground">Funds Available</p>
          <p className="text-2xl font-bold mt-1 font-display">{formatCurrency(fundsAvailable)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Contributions</p>
          <p className="text-2xl font-bold mt-1 font-display">{formatCurrency(totalContributions)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Payouts</p>
          <p className="text-2xl font-bold mt-1 font-display">{formatCurrency(totalPayouts)}</p>
        </div>
      </div>

      <div className="mb-6">
        <Button onClick={handleDownloadFinancialSummary} variant="outline">
          <Download className="h-4 w-4 mr-2" />Download Financial Summary PDF
        </Button>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payment Report</TabsTrigger>
          <TabsTrigger value="payouts">Payout Report</TabsTrigger>
          <TabsTrigger value="members">Member Report</TabsTrigger>
          <TabsTrigger value="defaulters">Defaulters</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader><CardTitle className="text-lg font-display">Payment Report</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Household</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Month</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => {
                      const hh = households.find(h => h.id === p.household_id);
                      return (
                        <tr key={p.id} className="border-b border-border last:border-0">
                          <td className="p-4 font-medium">{hh?.name || p.household_id}</td>
                          <td className="p-4">{p.payment_month}</td>
                          <td className="p-4">{p.status === 'missed' ? '—' : formatCurrency(Number(p.amount))}</td>
                          <td className="p-4"><Badge variant={p.status === 'paid' ? 'default' : p.status === 'missed' ? 'destructive' : 'secondary'}>{p.status}</Badge></td>
                          <td className="p-4">
                            {p.status === 'paid' && (
                              <Button size="sm" variant="ghost" onClick={() => handleDownloadPaymentReceipt(p.id)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader><CardTitle className="text-lg font-display">Payout Report</CardTitle></CardHeader>
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
                    {payouts.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-muted-foreground">No payouts recorded yet.</td></tr>
                    ) : payouts.map(p => (
                      <tr key={p.id} className="border-b border-border last:border-0">
                        <td className="p-4 font-medium">{p.case_id.slice(0, 8)}...</td>
                        <td className="p-4">{formatCurrency(Number(p.approved_amount))}</td>
                        <td className="p-4">{p.payment_date}</td>
                        <td className="p-4 uppercase">{p.payment_method}</td>
                        <td className="p-4">{p.approved_by || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader><CardTitle className="text-lg font-display">Member Report</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Household</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Relationship</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => {
                      const hh = households.find(h => h.id === m.household_id);
                      return (
                        <tr key={m.id} className="border-b border-border last:border-0">
                          <td className="p-4 font-medium">{m.full_name}</td>
                          <td className="p-4">{hh?.name || m.household_id}</td>
                          <td className="p-4">{m.relationship || '—'}</td>
                          <td className="p-4"><Badge variant={m.status === 'active' ? 'default' : 'secondary'}>{m.status}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaulters">
          <Card>
            <CardHeader><CardTitle className="text-lg font-display">Defaulters ({defaulters.length})</CardTitle></CardHeader>
            <CardContent>
              {defaulters.length === 0 ? (
                <p className="text-muted-foreground text-sm">No defaulters. All households are up to date!</p>
              ) : (
                <div className="space-y-3">
                  {defaulters.map(h => {
                    const missedPayments = payments.filter(p => p.household_id === h.id && p.status === 'missed');
                    return (
                      <div key={h.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                        <div>
                          <p className="font-medium">{h.name}</p>
                          <p className="text-xs text-muted-foreground">{h.contact_person} · {h.phone}</p>
                        </div>
                        <Badge variant="destructive">{missedPayments.length} missed</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
