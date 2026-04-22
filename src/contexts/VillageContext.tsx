import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Village {
  id: string;
  name: string;
  district: string;
  municipality: string;
  traditional_authority: string | null;
  sections: string[];
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  chief_name: string | null;
  chief_title: string | null;
  chief_phone: string | null;
  municipality_id: string | null;
}

interface VillageContextType {
  villages: Village[];
  currentVillage: Village | null;
  setCurrentVillageId: (id: string) => void;
  loading: boolean;
  refresh: () => void;
  isSuperAdmin: boolean;
}

const VillageContext = createContext<VillageContextType | undefined>(undefined);

export function VillageProvider({ children }: { children: ReactNode }) {
  const { user, hasRole } = useAuth();
  const [villages, setVillages] = useState<Village[]>([]);
  const [currentVillageId, setCurrentVillageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isSuperAdmin = hasRole('super_admin');

  const fetchVillages = useCallback(async () => {
    if (!user) { setVillages([]); setLoading(false); return; }
    setLoading(true);

    if (isSuperAdmin) {
      // Super admin sees all villages
      const { data } = await supabase.from('villages').select('*').order('name');
      if (data) setVillages(data as Village[]);
    } else {
      // Get user's assigned villages
      const { data: assignments } = await supabase
        .from('user_village_assignments')
        .select('village_id')
        .eq('user_id', user.id);

      if (assignments && assignments.length > 0) {
        const villageIds = assignments.map(a => a.village_id);
        const { data } = await supabase
          .from('villages')
          .select('*')
          .in('id', villageIds)
          .order('name');
        if (data) setVillages(data as Village[]);
      } else {
        setVillages([]);
      }
    }
    setLoading(false);
  }, [user, isSuperAdmin]);

  useEffect(() => { fetchVillages(); }, [fetchVillages]);

  useEffect(() => {
    if (villages.length > 0 && !currentVillageId) {
      const saved = localStorage.getItem('vc_current_village');
      if (saved && villages.find(v => v.id === saved)) {
        setCurrentVillageId(saved);
      } else {
        setCurrentVillageId(villages[0].id);
      }
    }
  }, [villages, currentVillageId]);

  const handleSetVillage = (id: string) => {
    setCurrentVillageId(id);
    localStorage.setItem('vc_current_village', id);
  };

  const currentVillage = villages.find(v => v.id === currentVillageId) || null;

  return (
    <VillageContext.Provider value={{
      villages, currentVillage, setCurrentVillageId: handleSetVillage,
      loading, refresh: fetchVillages, isSuperAdmin,
    }}>
      {children}
    </VillageContext.Provider>
  );
}

export function useVillage() {
  const ctx = useContext(VillageContext);
  if (!ctx) throw new Error('useVillage must be used within VillageProvider');
  return ctx;
}