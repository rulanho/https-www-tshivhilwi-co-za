import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Household = Tables<'households'>;
type Member = Tables<'members'>;
type Payment = Tables<'payments'>;
type BurialCase = Tables<'burial_cases'>;
type Payout = Tables<'payouts'>;
type RulesConfig = Tables<'rules_config'>;

interface DataContextType {
  households: Household[];
  members: Member[];
  payments: Payment[];
  burialCases: BurialCase[];
  payouts: Payout[];
  rules: RulesConfig | null;
  requests: any[];
  specialContributions: any[];
  loading: boolean;
  addHousehold: (h: TablesInsert<'households'>) => Promise<void>;
  addMember: (m: TablesInsert<'members'>) => Promise<void>;
  addPayment: (p: TablesInsert<'payments'>) => Promise<void>;
  addBurialCase: (c: TablesInsert<'burial_cases'>) => Promise<void>;
  addPayout: (p: TablesInsert<'payouts'>) => Promise<void>;
  addRequest: (r: any) => Promise<void>;
  addSpecialContribution: (s: any) => Promise<void>;
  updateCaseStatus: (id: string, status: string) => Promise<void>;
  updateRequestStatus: (id: string, status: string, notes?: string) => Promise<void>;
  updateRules: (r: Partial<RulesConfig>) => Promise<void>;
  checkEligibility: (memberId: string, householdId: string) => { eligible: boolean; reason: string };
  refresh: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [burialCases, setBurialCases] = useState<BurialCase[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [rules, setRules] = useState<RulesConfig | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [specialContributions, setSpecialContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [hRes, mRes, pRes, bcRes, poRes, rRes, reqRes, scRes] = await Promise.all([
      supabase.from('households').select('*').order('created_at', { ascending: false }),
      supabase.from('members').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('burial_cases').select('*').order('created_at', { ascending: false }),
      supabase.from('payouts').select('*').order('created_at', { ascending: false }),
      supabase.from('rules_config').select('*').limit(1).single(),
      supabase.from('requests').select('*').order('created_at', { ascending: false }),
      supabase.from('special_contributions').select('*').order('created_at', { ascending: false }),
    ]);
    if (hRes.data) setHouseholds(hRes.data);
    if (mRes.data) setMembers(mRes.data);
    if (pRes.data) setPayments(pRes.data);
    if (bcRes.data) setBurialCases(bcRes.data);
    if (poRes.data) setPayouts(poRes.data);
    if (rRes.data) setRules(rRes.data);
    if (reqRes.data) setRequests(reqRes.data);
    if (scRes.data) setSpecialContributions(scRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addHousehold = async (h: TablesInsert<'households'>) => {
    const { error } = await supabase.from('households').insert(h as any);
    if (error) { toast.error(error.message); return; }
    toast.success('Household added');
    fetchAll();
  };

  const addMember = async (m: TablesInsert<'members'>) => {
    const { error } = await supabase.from('members').insert(m as any);
    if (error) { toast.error(error.message); return; }
    toast.success('Member added');
    fetchAll();
  };

  const addPayment = async (p: TablesInsert<'payments'>) => {
    const { error } = await supabase.from('payments').insert(p as any);
    if (error) { toast.error(error.message); return; }
    toast.success('Payment recorded');
    fetchAll();
  };

  const checkEligibility = (memberId: string, householdId: string) => {
    const member = members.find(m => m.id === memberId);
    const household = households.find(h => h.id === householdId);
    if (!member) return { eligible: false, reason: 'Member not found' };
    if (!household) return { eligible: false, reason: 'Household not found' };
    if (household.status !== 'active') return { eligible: false, reason: 'Household is inactive' };

    if (member.date_of_birth && rules) {
      const age = getAge(member.date_of_birth);
      if (age < rules.minimum_age) return { eligible: false, reason: `Member age (${age}) is below minimum (${rules.minimum_age})` };
    }

    if (rules) {
      const months = getMonthsSinceJoin(household.join_date);
      if (months < rules.minimum_membership_months) return { eligible: false, reason: `Membership duration (${months} months) is below minimum (${rules.minimum_membership_months} months)` };
    }

    const missed = payments.filter(p => p.household_id === householdId && p.status === 'missed');
    if (missed.length > 0) return { eligible: false, reason: 'Household has missed contributions' };

    return { eligible: true, reason: 'All eligibility criteria met' };
  };

  const addBurialCase = async (c: TablesInsert<'burial_cases'>) => {
    const { eligible, reason } = checkEligibility(c.member_id, c.household_id);
    const caseData = {
      ...c,
      eligibility_status: eligible ? 'eligible' : 'not_eligible',
      eligibility_reason: reason,
    };
    const { error } = await supabase.from('burial_cases').insert(caseData);
    if (error) { toast.error(error.message); return; }
    toast.success('Burial case registered');
    fetchAll();
  };

  const addPayout = async (p: TablesInsert<'payouts'>) => {
    const { error } = await supabase.from('payouts').insert(p);
    if (error) { toast.error(error.message); return; }
    toast.success('Payout recorded');
    fetchAll();
  };

  const addRequest = async (r: any) => {
    const { error } = await supabase.from('requests').insert(r);
    if (error) { toast.error(error.message); return; }
    toast.success('Request submitted');
    fetchAll();
  };

  const addSpecialContribution = async (s: any) => {
    const { error } = await supabase.from('special_contributions').insert(s);
    if (error) { toast.error(error.message); return; }
    toast.success('Special contribution created');
    fetchAll();
  };

  const updateCaseStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('burial_cases').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    fetchAll();
  };

  const updateRequestStatus = async (id: string, status: string, notes?: string) => {
    const { error } = await supabase.from('requests').update({
      status,
      admin_notes: notes || null,
      resolved_at: new Date().toISOString(),
    } as any).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Request ${status}`);
    fetchAll();
  };

  const updateRules = async (r: Partial<RulesConfig>) => {
    if (!rules) return;
    const { error } = await supabase.from('rules_config').update(r).eq('id', rules.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Settings saved');
    fetchAll();
  };

  return (
    <DataContext.Provider value={{
      households, members, payments, burialCases, payouts, rules, requests, specialContributions, loading,
      addHousehold, addMember, addPayment, addBurialCase, addPayout, addRequest, addSpecialContribution,
      updateCaseStatus, updateRequestStatus, updateRules, checkEligibility, refresh: fetchAll,
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

function getAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getMonthsSinceJoin(joinDate: string): number {
  const now = new Date();
  const join = new Date(joinDate);
  return (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
}
