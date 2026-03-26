// Utility functions for the burial society system

export const SECTIONS = [
  'Tshilongwe',
  'Tshifungwi',
  'Vhusenga',
  'Thondoni',
  'Mbelengwa',
  'Germany',
  'Tshidangalani',
] as const;

export type Section = typeof SECTIONS[number];

export const REQUEST_TYPES = [
  { value: 'proof_of_address', label: 'Proof of Address' },
  { value: 'stand_approval', label: 'Stand Approval (Personal/Business)' },
  { value: 'sunday_trading', label: 'Sunday Trading Approval' },
  { value: 'issue', label: 'Report an Issue' },
  { value: 'general', label: 'General Enquiry' },
] as const;

export function getAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getMonthsSinceJoin(joinDate: string): number {
  const now = new Date();
  const join = new Date(joinDate);
  return (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
}

export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString('en-ZA')}`;
}
