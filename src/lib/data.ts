import { create } from 'zustand';

// We'll use zustand-like pattern with React state for now
// This file contains types and mock data

export interface Household {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface Member {
  id: string;
  householdId: string;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  relationship: string;
  status: 'active' | 'inactive';
}

export interface Payment {
  id: string;
  householdId: string;
  amount: number;
  paymentDate: string;
  paymentMonth: string;
  paymentMethod: 'cash' | 'eft';
  recordedBy: string;
  status: 'paid' | 'missed' | 'late';
}

export interface BurialCase {
  id: string;
  memberId: string;
  householdId: string;
  dateOfDeath: string;
  dateReported: string;
  status: 'pending' | 'approved' | 'rejected';
  eligibilityStatus: 'eligible' | 'not_eligible' | 'pending';
  eligibilityReason?: string;
}

export interface Payout {
  id: string;
  caseId: string;
  approvedAmount: number;
  paymentDate: string;
  paymentMethod: string;
  approvedBy: string;
  notes: string;
}

export interface RulesConfig {
  minimumAge: number;
  minimumMembershipMonths: number;
  monthlyContribution: number;
  payoutAmount: number;
}

// Mock data
export const mockHouseholds: Household[] = [
  { id: 'H001', name: 'Mokoena Family', contactPerson: 'Thabo Mokoena', phone: '071 234 5678', address: '12 Mandela St, Soweto', joinDate: '2024-06-15', status: 'active' },
  { id: 'H002', name: 'Nkosi Family', contactPerson: 'Grace Nkosi', phone: '082 345 6789', address: '45 Freedom Ave, Alexandra', joinDate: '2024-08-01', status: 'active' },
  { id: 'H003', name: 'Dlamini Family', contactPerson: 'Sipho Dlamini', phone: '063 456 7890', address: '78 Ubuntu Rd, Tembisa', joinDate: '2025-01-10', status: 'active' },
  { id: 'H004', name: 'Mthembu Family', contactPerson: 'Nomsa Mthembu', phone: '074 567 8901', address: '23 Biko Lane, Katlehong', joinDate: '2024-03-20', status: 'inactive' },
  { id: 'H005', name: 'Zulu Family', contactPerson: 'David Zulu', phone: '081 678 9012', address: '56 Heritage Cres, Diepkloof', joinDate: '2025-02-01', status: 'active' },
];

export const mockMembers: Member[] = [
  { id: 'M001', householdId: 'H001', fullName: 'Thabo Mokoena', idNumber: '7805125432081', dateOfBirth: '1978-05-12', relationship: 'Head', status: 'active' },
  { id: 'M002', householdId: 'H001', fullName: 'Lindiwe Mokoena', idNumber: '8201034567082', dateOfBirth: '1982-01-03', relationship: 'Spouse', status: 'active' },
  { id: 'M003', householdId: 'H001', fullName: 'Kagiso Mokoena', idNumber: '0503125678083', dateOfBirth: '2005-03-12', relationship: 'Child', status: 'active' },
  { id: 'M004', householdId: 'H002', fullName: 'Grace Nkosi', idNumber: '7509234567081', dateOfBirth: '1975-09-23', relationship: 'Head', status: 'active' },
  { id: 'M005', householdId: 'H002', fullName: 'James Nkosi', idNumber: '7312105432082', dateOfBirth: '1973-12-10', relationship: 'Spouse', status: 'active' },
  { id: 'M006', householdId: 'H003', fullName: 'Sipho Dlamini', idNumber: '8007154567083', dateOfBirth: '1980-07-15', relationship: 'Head', status: 'active' },
  { id: 'M007', householdId: 'H004', fullName: 'Nomsa Mthembu', idNumber: '6811205432084', dateOfBirth: '1968-11-20', relationship: 'Head', status: 'active' },
  { id: 'M008', householdId: 'H005', fullName: 'David Zulu', idNumber: '8503075678085', dateOfBirth: '1985-03-07', relationship: 'Head', status: 'active' },
];

export const mockPayments: Payment[] = [
  { id: 'P001', householdId: 'H001', amount: 200, paymentDate: '2026-01-05', paymentMonth: 'Jan 2026', paymentMethod: 'cash', recordedBy: 'Treasurer', status: 'paid' },
  { id: 'P002', householdId: 'H001', amount: 200, paymentDate: '2026-02-03', paymentMonth: 'Feb 2026', paymentMethod: 'eft', recordedBy: 'Treasurer', status: 'paid' },
  { id: 'P003', householdId: 'H001', amount: 200, paymentDate: '2026-03-04', paymentMonth: 'Mar 2026', paymentMethod: 'cash', recordedBy: 'Treasurer', status: 'paid' },
  { id: 'P004', householdId: 'H002', amount: 200, paymentDate: '2026-01-08', paymentMonth: 'Jan 2026', paymentMethod: 'eft', recordedBy: 'Treasurer', status: 'paid' },
  { id: 'P005', householdId: 'H002', amount: 200, paymentDate: '2026-02-10', paymentMonth: 'Feb 2026', paymentMethod: 'cash', recordedBy: 'Treasurer', status: 'paid' },
  { id: 'P006', householdId: 'H002', amount: 0, paymentDate: '', paymentMonth: 'Mar 2026', paymentMethod: 'cash', recordedBy: '', status: 'missed' },
  { id: 'P007', householdId: 'H003', amount: 200, paymentDate: '2026-01-12', paymentMonth: 'Jan 2026', paymentMethod: 'cash', recordedBy: 'Treasurer', status: 'paid' },
  { id: 'P008', householdId: 'H003', amount: 200, paymentDate: '2026-02-15', paymentMonth: 'Feb 2026', paymentMethod: 'eft', recordedBy: 'Treasurer', status: 'late' },
  { id: 'P009', householdId: 'H003', amount: 200, paymentDate: '2026-03-10', paymentMonth: 'Mar 2026', paymentMethod: 'cash', recordedBy: 'Treasurer', status: 'paid' },
  { id: 'P010', householdId: 'H005', amount: 200, paymentDate: '2026-02-05', paymentMonth: 'Feb 2026', paymentMethod: 'eft', recordedBy: 'Treasurer', status: 'paid' },
  { id: 'P011', householdId: 'H005', amount: 200, paymentDate: '2026-03-06', paymentMonth: 'Mar 2026', paymentMethod: 'cash', recordedBy: 'Treasurer', status: 'paid' },
];

export const mockBurialCases: BurialCase[] = [
  { id: 'BC001', memberId: 'M007', householdId: 'H004', dateOfDeath: '2026-03-01', dateReported: '2026-03-02', status: 'pending', eligibilityStatus: 'not_eligible', eligibilityReason: 'Household is inactive' },
];

export const mockPayouts: Payout[] = [];

export const defaultRules: RulesConfig = {
  minimumAge: 35,
  minimumMembershipMonths: 3,
  monthlyContribution: 200,
  payoutAmount: 15000,
};

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

export function generateId(prefix: string): string {
  return `${prefix}${String(Math.floor(Math.random() * 9000) + 1000)}`;
}
