export function generateProofOfAddress(data: {
  householdName: string;
  contactPerson: string;
  standNumber: string;
  section: string;
  address: string;
  gpsLat?: number;
  gpsLng?: number;
  approvedAt: string;
  expiresAt: string;
  requestId: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Georgia', serif; margin: 0; padding: 40px; color: #1a1a1a; }
        .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 22px; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
        .header p { font-size: 13px; color: #555; margin: 4px 0; }
        .title { text-align: center; font-size: 18px; font-weight: bold; margin: 30px 0 20px; text-decoration: underline; }
        .content { font-size: 14px; line-height: 1.8; }
        .details { margin: 20px 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 8px 12px; border: 1px solid #ccc; font-size: 13px; }
        .details td:first-child { font-weight: bold; width: 180px; background: #f5f5f5; }
        .footer { margin-top: 60px; }
        .signature-line { border-top: 1px solid #333; width: 250px; margin-top: 60px; padding-top: 5px; font-size: 12px; }
        .stamp { text-align: center; margin-top: 30px; padding: 15px; border: 2px solid #333; display: inline-block; font-weight: bold; font-size: 12px; }
        .expiry { color: #c00; font-weight: bold; font-size: 13px; margin-top: 20px; }
        .ref { font-size: 11px; color: #777; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Tshivhilwi Village Traditional Authority</h1>
        <p>Proof of Residential Address</p>
        <p>Limpopo Province, South Africa</p>
      </div>

      <div class="title">CONFIRMATION OF RESIDENTIAL ADDRESS</div>

      <div class="content">
        <p>This is to confirm that the below-mentioned person resides at the following address within the jurisdiction of Tshivhilwi Village:</p>

        <div class="details">
          <table>
            <tr><td>Household Name</td><td>${data.householdName}</td></tr>
            <tr><td>Head of Household</td><td>${data.contactPerson}</td></tr>
            <tr><td>Stand Number</td><td>${data.standNumber || 'N/A'}</td></tr>
            <tr><td>Section</td><td>${data.section || 'N/A'}</td></tr>
            <tr><td>Physical Address</td><td>${data.address || 'Tshivhilwi Village, Limpopo'}</td></tr>
            ${data.gpsLat ? `<tr><td>GPS Coordinates</td><td>${data.gpsLat.toFixed(6)}, ${data.gpsLng?.toFixed(6)}</td></tr>` : ''}
            <tr><td>Date Issued</td><td>${new Date(data.approvedAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
            <tr><td>Valid Until</td><td>${new Date(data.expiresAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
          </table>
        </div>

        <p>This letter is issued upon request and serves as proof that the above-mentioned person is a bona fide resident of Tshivhilwi Village.</p>

        <p class="expiry">⚠ This document expires on ${new Date(data.expiresAt).toLocaleDateString('en-ZA')} and must be renewed thereafter.</p>

        <div class="footer">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <div class="signature-line">Community Leader / Chief</div>
            </div>
            <div>
              <div class="signature-line">Date</div>
            </div>
          </div>

          <div class="stamp">
            TSHIVHILWI VILLAGE<br/>TRADITIONAL AUTHORITY<br/>OFFICIAL STAMP
          </div>
        </div>

        <p class="ref">Reference: ${data.requestId.substring(0, 8).toUpperCase()}</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  }
}

export function isProofExpired(approvedAt: string): boolean {
  const approved = new Date(approvedAt);
  const expiry = new Date(approved);
  expiry.setMonth(expiry.getMonth() + 3);
  return new Date() > expiry;
}

export function getExpiryDate(approvedAt: string): string {
  const approved = new Date(approvedAt);
  const expiry = new Date(approved);
  expiry.setMonth(expiry.getMonth() + 3);
  return expiry.toISOString();
}
