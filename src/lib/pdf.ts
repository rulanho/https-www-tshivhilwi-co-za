import type { Tables } from '@/integrations/supabase/types';
import { formatCurrency } from './data';

type Payment = Tables<'payments'>;
type Payout = Tables<'payouts'>;
type Household = Tables<'households'>;

function createPDFWindow(title: string): { doc: Document; win: Window } {
  const win = window.open('', '_blank')!;
  const doc = win.document;
  doc.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: 'DM Sans', Arial, sans-serif; margin: 40px; color: #1a2e1a; }
      h1 { font-family: Georgia, serif; color: #2d6a4f; margin-bottom: 4px; }
      h2 { font-family: Georgia, serif; color: #2d6a4f; font-size: 18px; margin-top: 24px; }
      .subtitle { color: #666; font-size: 14px; margin-bottom: 24px; }
      .header-line { border-bottom: 3px solid #2d6a4f; margin-bottom: 20px; padding-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
      th { background: #f0f5f0; text-align: left; padding: 10px; border-bottom: 2px solid #2d6a4f; }
      td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
      .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
      .stat-label { color: #666; }
      .stat-value { font-weight: 700; font-size: 16px; }
      .receipt-box { border: 2px solid #2d6a4f; border-radius: 8px; padding: 24px; max-width: 500px; margin: 0 auto; }
      .receipt-row { display: flex; justify-content: space-between; padding: 6px 0; }
      .receipt-label { color: #666; font-size: 13px; }
      .receipt-value { font-weight: 600; }
      .amount-large { font-size: 28px; color: #2d6a4f; font-weight: 700; text-align: center; margin: 16px 0; }
      .footer { text-align: center; color: #999; font-size: 11px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 12px; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
      .badge-paid { background: #d4edda; color: #155724; }
      .badge-missed { background: #f8d7da; color: #721c24; }
      @media print { body { margin: 20px; } }
    </style></head><body>`);
  return { doc, win };
}

export function generatePaymentReceiptPDF(payment: Payment, householdName: string) {
  const { doc, win } = createPDFWindow('Payment Receipt');
  
  doc.write(`
    <div class="receipt-box">
      <div style="text-align:center; margin-bottom: 20px;">
        <h1 style="margin:0; font-size: 22px;">Burial Society</h1>
        <p class="subtitle" style="margin:4px 0;">Payment Receipt</p>
      </div>
      <hr style="border: 1px solid #2d6a4f; margin-bottom: 16px;">
      <div class="receipt-row"><span class="receipt-label">Receipt No:</span><span class="receipt-value">${payment.id.slice(0, 8).toUpperCase()}</span></div>
      <div class="receipt-row"><span class="receipt-label">Household:</span><span class="receipt-value">${householdName}</span></div>
      <div class="receipt-row"><span class="receipt-label">Payment Month:</span><span class="receipt-value">${payment.payment_month}</span></div>
      <div class="receipt-row"><span class="receipt-label">Payment Date:</span><span class="receipt-value">${payment.payment_date || '—'}</span></div>
      <div class="receipt-row"><span class="receipt-label">Payment Method:</span><span class="receipt-value">${(payment.payment_method || '').toUpperCase()}</span></div>
      <div class="receipt-row"><span class="receipt-label">Recorded By:</span><span class="receipt-value">${payment.recorded_by || '—'}</span></div>
      <div class="amount-large">${formatCurrency(Number(payment.amount))}</div>
      <div style="text-align:center;">
        <span class="badge badge-paid">PAID</span>
      </div>
      <div class="footer">
        This receipt was generated on ${new Date().toLocaleDateString('en-ZA')}<br>
        Burial Society Management System
      </div>
    </div>
  `);
  doc.write('</body></html>');
  doc.close();
  setTimeout(() => win.print(), 500);
}

interface FinancialSummaryData {
  totalContributions: number;
  totalPayouts: number;
  fundsAvailable: number;
  activeHouseholds: number;
  activeMembers: number;
  defaulterCount: number;
  payments: Payment[];
  payouts: Payout[];
  households: Household[];
}

export function generateFinancialSummaryPDF(data: FinancialSummaryData) {
  const { doc, win } = createPDFWindow('Financial Summary Report');

  doc.write(`
    <div class="header-line">
      <h1>Burial Society — Financial Summary</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-ZA')}</p>
    </div>

    <h2>Overview</h2>
    <div class="stat-row"><span class="stat-label">Total Contributions</span><span class="stat-value">${formatCurrency(data.totalContributions)}</span></div>
    <div class="stat-row"><span class="stat-label">Total Payouts</span><span class="stat-value">${formatCurrency(data.totalPayouts)}</span></div>
    <div class="stat-row"><span class="stat-label">Funds Available</span><span class="stat-value" style="color:#2d6a4f">${formatCurrency(data.fundsAvailable)}</span></div>
    <div class="stat-row"><span class="stat-label">Active Households</span><span class="stat-value">${data.activeHouseholds}</span></div>
    <div class="stat-row"><span class="stat-label">Active Members</span><span class="stat-value">${data.activeMembers}</span></div>
    <div class="stat-row"><span class="stat-label">Defaulters</span><span class="stat-value" style="color:#dc3545">${data.defaulterCount}</span></div>

    <h2>Recent Payments</h2>
    <table>
      <thead><tr><th>Household</th><th>Month</th><th>Amount</th><th>Status</th></tr></thead>
      <tbody>
        ${data.payments.slice(0, 20).map(p => {
          const hh = data.households.find(h => h.id === p.household_id);
          return `<tr>
            <td>${hh?.name || p.household_id}</td>
            <td>${p.payment_month}</td>
            <td>${p.status === 'missed' ? '—' : formatCurrency(Number(p.amount))}</td>
            <td><span class="badge ${p.status === 'paid' ? 'badge-paid' : 'badge-missed'}">${p.status}</span></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    ${data.payouts.length > 0 ? `
      <h2>Payouts</h2>
      <table>
        <thead><tr><th>Case</th><th>Amount</th><th>Date</th><th>Method</th></tr></thead>
        <tbody>
          ${data.payouts.map(p => `<tr>
            <td>${p.case_id.slice(0, 8)}...</td>
            <td>${formatCurrency(Number(p.approved_amount))}</td>
            <td>${p.payment_date}</td>
            <td>${(p.payment_method || '').toUpperCase()}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    ` : ''}

    <div class="footer">Burial Society Management System — Confidential Financial Report</div>
  `);
  doc.write('</body></html>');
  doc.close();
  setTimeout(() => win.print(), 500);
}
