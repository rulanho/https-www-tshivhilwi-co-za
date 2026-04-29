import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

export interface ProofOfAddressData {
  householdName: string;
  contactPerson: string;
  standNumber: string;
  standType?: string;
  section: string;
  address: string;
  gpsLat?: number;
  gpsLng?: number;
  approvedAt: string;
  expiresAt: string;
  requestId: string;
  leaderName?: string;
  leaderPhone?: string;
  leaderSignature?: string;
  // Community / chief metadata (multi-tenant)
  communityName: string;
  district?: string;
  municipality?: string;
  chiefName?: string;
  chiefTitle?: string;
  chiefPhone?: string;
  // Issuance tracking
  villageId: string;
  householdId?: string;
  memberId?: string;
}

function makeReference(communityName: string) {
  const prefix = (communityName || 'CDR').replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'CDR';
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}

export async function generateProofOfAddress(data: ProofOfAddressData) {
  const issueDate = new Date(data.approvedAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  const expiryDate = new Date(data.expiresAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  const expiryShort = new Date(data.expiresAt).toLocaleDateString('en-ZA');

  const chiefName = data.chiefName || 'Community Leader';
  const chiefTitle = data.chiefTitle || 'Chief';
  const chiefPhone = data.chiefPhone || '';
  const community = data.communityName;

  // Generate unique reference + QR code
  const reference = makeReference(community);
  const verifyPayload = JSON.stringify({
    ref: reference,
    name: data.householdName,
    stand: data.standNumber,
    village: community,
    issued: data.approvedAt,
    expires: data.expiresAt,
  });
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(verifyPayload, { margin: 1, width: 140 });
  } catch { /* ignore */ }

  // Log issuance (best-effort)
  try {
    await supabase.from('documents').insert({
      village_id: data.villageId,
      household_id: data.householdId || null,
      member_id: data.memberId || null,
      document_type: 'proof_of_address',
      reference_number: reference,
      issued_to_name: data.contactPerson,
      payload: { stand_number: data.standNumber, section: data.section, expires_at: data.expiresAt } as any,
    } as any);
  } catch { /* non-blocking */ }

  const signatureBlock = `<div style="margin-top:10px; font-family: 'Brush Script MT', cursive; font-size: 28px; color: #1a3a5c;">${chiefName}</div>`;

  const leaderContactBlock = data.leaderName
    ? `<div style="margin-top: 8px; font-size: 12px; color: #555;">
         <strong>Section Leader:</strong> ${data.leaderName}<br/>
         ${data.leaderPhone ? `<strong>Contact:</strong> ${data.leaderPhone}` : ''}
       </div>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: A4; margin: 0; }
        body { font-family: 'Georgia', serif; margin: 0; padding: 40px 50px; color: #1a1a1a; background: #fff; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(0,0,0,0.03); font-weight: bold; letter-spacing: 10px; z-index: 0; pointer-events: none; }
        .header { text-align: center; border-bottom: 3px double #1a3a5c; padding-bottom: 20px; margin-bottom: 25px; position: relative; }
        .header h1 { font-size: 22px; margin: 0; letter-spacing: 2px; text-transform: uppercase; color: #1a3a5c; }
        .header p { font-size: 13px; color: #555; margin: 4px 0; }
        .header .subtitle { font-size: 11px; color: #777; }
        .title { text-align: center; font-size: 17px; font-weight: bold; margin: 25px 0 20px; text-decoration: underline; color: #1a3a5c; letter-spacing: 1px; }
        .content { font-size: 14px; line-height: 1.8; }
        .details { margin: 20px 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 8px 12px; border: 1px solid #ccc; font-size: 13px; }
        .details td:first-child { font-weight: bold; width: 180px; background: #f0f4f8; color: #1a3a5c; }
        .footer { margin-top: 50px; }
        .sig-container { display: flex; justify-content: space-between; margin-top: 40px; }
        .sig-block { width: 45%; }
        .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; font-size: 12px; }
        .stamp { text-align: center; margin-top: 30px; padding: 12px 20px; border: 2px solid #1a3a5c; display: inline-block; font-weight: bold; font-size: 11px; color: #1a3a5c; letter-spacing: 1px; }
        .expiry { color: #c00; font-weight: bold; font-size: 13px; margin-top: 20px; border: 1px solid #fcc; background: #fff5f5; padding: 8px 12px; border-radius: 4px; }
        .ref { font-size: 11px; color: #777; margin-top: 15px; border-top: 1px solid #eee; padding-top: 8px; }
        .leader-contact { background: #f0f4f8; padding: 10px 14px; border-radius: 4px; margin-top: 20px; font-size: 12px; }
        .qr-block { position: absolute; top: 30px; right: 30px; text-align: center; }
        .qr-block img { width: 90px; height: 90px; }
        .qr-block .qr-label { font-size: 9px; color: #555; margin-top: 4px; }
      </style>
    </head>
    <body>
      <div class="watermark">${community.toUpperCase()}</div>
      
      ${qrDataUrl ? `<div class="qr-block"><img src="${qrDataUrl}" alt="QR" /><div class="qr-label">Scan to verify<br/>${reference}</div></div>` : ''}

      <div class="header">
        <h1>${community} Traditional Authority</h1>
        <p>Proof of Residential Address</p>
        <p class="subtitle">${data.municipality ? data.municipality + ', ' : ''}${data.district || 'Limpopo'} Province, South Africa</p>
      </div>

      <div class="title">CONFIRMATION OF RESIDENTIAL ADDRESS</div>

      <div class="content">
        <p>This is to confirm that the below-mentioned person resides at the following address within the jurisdiction of Tshivhilwi Village:</p>

        <div class="details">
          <table>
            <tr><td>Household Name</td><td>${data.householdName}</td></tr>
            <tr><td>Head of Household</td><td>${data.contactPerson}</td></tr>
            <tr><td>Stand Number</td><td>${data.standNumber || 'N/A'}</td></tr>
            ${data.standType ? `<tr><td>Stand Type</td><td>${data.standType.charAt(0).toUpperCase() + data.standType.slice(1)}</td></tr>` : ''}
            <tr><td>Section</td><td>${data.section || 'N/A'}</td></tr>
            <tr><td>Physical Address</td><td>${data.address || `${community}, ${data.district || 'Limpopo'}`}</td></tr>
            ${data.gpsLat ? `<tr><td>GPS Coordinates</td><td>${data.gpsLat.toFixed(6)}, ${data.gpsLng?.toFixed(6)}</td></tr>` : ''}
            ${data.gpsLat ? `<tr><td>Map Link</td><td><a href="https://www.google.com/maps?q=${data.gpsLat},${data.gpsLng}" style="color:#1a3a5c;">View on Google Maps</a></td></tr>` : ''}
            <tr><td>Date Issued</td><td>${issueDate}</td></tr>
            <tr><td>Valid Until</td><td>${expiryDate}</td></tr>
          </table>
        </div>

        <p>This letter is issued upon request and serves as proof that the above-mentioned person is a bona fide resident of ${community}.</p>

        <p class="expiry">⚠ This document expires on ${expiryShort} and must be renewed thereafter.</p>

        <div class="footer">
            <div class="sig-container">
            <div class="sig-block">
              ${signatureBlock}
              <div class="signature-line">
                ${chiefTitle}: ${chiefName}<br/>
                ${chiefPhone ? `Contact: ${chiefPhone}` : ''}
              </div>
              ${leaderContactBlock}
            </div>
            <div class="sig-block">
              <div class="signature-line">
                Date of Approval: ${issueDate}
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <div class="stamp">
              ${community.toUpperCase()}<br/>TRADITIONAL AUTHORITY<br/>OFFICIAL STAMP
            </div>
          </div>
        </div>

        <p class="ref">
          Reference: <strong>${reference}</strong><br/>
          Generated electronically by ${community} Community Digital Register
        </p>
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
  return reference;
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
