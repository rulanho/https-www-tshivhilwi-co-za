import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Household, Member, Payment, BurialCase, Payout, RulesConfig,
  mockHouseholds, mockMembers, mockPayments, mockBurialCases, mockPayouts, defaultRules,
  getAge, getMonthsSinceJoin, generateId
} from '@/lib/data';

interface DataContextType {
  households: Household[];
  members: Member[];
  payments: Payment[];
  burialCases: BurialCase[];
  payouts: Payout[];
  rules: RulesConfig;
  addHousehold: (h: Omit<Household, 'id'>) => void;
  addMember: (m: Omit<Member, 'id'>) => void;
  addPayment: (p: Omit<Payment, 'id'>) => void;
  addBurialCase: (c: Omit<BurialCase, 'id' | 'eligibilityStatus' | 'eligibilityReason'>) => void;
  addPayout: (p: Omit<Payout, 'id'>) => void;
  updateCaseStatus: (id: string, status: BurialCase['status']) => void;
  updateRules: (r: RulesConfig) => void;
  checkEligibility: (memberId: string, householdId: string) => { eligible: boolean; reason: string };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [households, setHouseholds] = useState<Household[]>(mockHouseholds);
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [burialCases, setBurialCases] = useState<BurialCase[]>(mockBurialCases);
  const [payouts, setPayouts] = useState<Payout[]>(mockPayouts);
  const [rules, setRules] = useState<RulesConfig>(defaultRules);

  const addHousehold = (h: Omit<Household, 'id'>) => {
    setHouseholds(prev => [...prev, { ...h, id: generateId('H') }]);
  };

  const addMember = (m: Omit<Member, 'id'>) => {
    setMembers(prev => [...prev, { ...m, id: generateId('M') }]);
  };

  const addPayment = (p: Omit<Payment, 'id'>) => {
    setPayments(prev => [...prev, { ...p, id: generateId('P') }]);
  };

  const checkEligibility = (memberId: string, householdId: string) => {
    const member = members.find(m => m.id === memberId);
    const household = households.find(h => h.id === householdId);
    if (!member) return { eligible: false, reason: 'Member not found' };
    if (!household) return { eligible: false, reason: 'Household not found' };
    if (household.status !== 'active') return { eligible: false, reason: 'Household is inactive' };

    const age = getAge(member.dateOfBirth);
    if (age < rules.minimumAge) return { eligible: false, reason: `Member age (${age}) is below minimum (${rules.minimumAge})` };

    const months = getMonthsSinceJoin(household.joinDate);
    if (months < rules.minimumMembershipMonths) return { eligible: false, reason: `Membership duration (${months} months) is below minimum (${rules.minimumMembershipMonths} months)` };

    const householdPayments = payments.filter(p => p.householdId === householdId);
    const missed = householdPayments.filter(p => p.status === 'missed');
    if (missed.length > 0) return { eligible: false, reason: 'Household has missed contributions' };

    return { eligible: true, reason: 'All eligibility criteria met' };
  };

  const addBurialCase = (c: Omit<BurialCase, 'id' | 'eligibilityStatus' | 'eligibilityReason'>) => {
    const { eligible, reason } = checkEligibility(c.memberId, c.householdId);
    setBurialCases(prev => [...prev, {
      ...c,
      id: generateId('BC'),
      eligibilityStatus: eligible ? 'eligible' : 'not_eligible',
      eligibilityReason: reason,
    }]);
  };

  const addPayout = (p: Omit<Payout, 'id'>) => {
    setPayouts(prev => [...prev, { ...p, id: generateId('PO') }]);
  };

  const updateCaseStatus = (id: string, status: BurialCase['status']) => {
    setBurialCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const updateRules = (r: RulesConfig) => setRules(r);

  return (
    <DataContext.Provider value={{
      households, members, payments, burialCases, payouts, rules,
      addHousehold, addMember, addPayment, addBurialCase, addPayout,
      updateCaseStatus, updateRules, checkEligibility
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
