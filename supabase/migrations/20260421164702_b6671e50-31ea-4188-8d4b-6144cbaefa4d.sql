
-- 1. Create districts table
CREATE TABLE public.districts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  province TEXT NOT NULL DEFAULT 'Limpopo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Districts readable by everyone" ON public.districts FOR SELECT TO authenticated USING (true);

-- 2. Create municipalities table
CREATE TABLE public.municipalities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, district_id)
);
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Municipalities readable by everyone" ON public.municipalities FOR SELECT TO authenticated USING (true);

-- 3. Create villages table
CREATE TABLE public.villages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  municipality TEXT NOT NULL,
  traditional_authority TEXT,
  sections TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Villages readable by authenticated" ON public.villages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert villages" ON public.villages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin or super admin can update villages" ON public.villages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_villages_updated_at BEFORE UPDATE ON public.villages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Add village_id to existing tables
ALTER TABLE public.households ADD COLUMN village_id UUID REFERENCES public.villages(id);
ALTER TABLE public.payments ADD COLUMN village_id UUID REFERENCES public.villages(id);
ALTER TABLE public.burial_cases ADD COLUMN village_id UUID REFERENCES public.villages(id);
ALTER TABLE public.requests ADD COLUMN village_id UUID REFERENCES public.villages(id);
ALTER TABLE public.special_contributions ADD COLUMN village_id UUID REFERENCES public.villages(id);
ALTER TABLE public.special_contribution_payments ADD COLUMN village_id UUID REFERENCES public.villages(id);
ALTER TABLE public.section_leaders ADD COLUMN village_id UUID REFERENCES public.villages(id);
ALTER TABLE public.audit_logs ADD COLUMN village_id UUID REFERENCES public.villages(id);
ALTER TABLE public.payouts ADD COLUMN village_id UUID REFERENCES public.villages(id);
ALTER TABLE public.rules_config ADD COLUMN village_id UUID REFERENCES public.villages(id);

-- 5. Indexes
CREATE INDEX idx_households_village ON public.households(village_id);
CREATE INDEX idx_payments_village ON public.payments(village_id);
CREATE INDEX idx_burial_cases_village ON public.burial_cases(village_id);
CREATE INDEX idx_requests_village ON public.requests(village_id);
CREATE INDEX idx_section_leaders_village ON public.section_leaders(village_id);
CREATE INDEX idx_audit_logs_village ON public.audit_logs(village_id);

-- 6. User village assignments
CREATE TABLE public.user_village_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, village_id)
);
ALTER TABLE public.user_village_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assignments" ON public.user_village_assignments FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admin can manage assignments" ON public.user_village_assignments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Super admin can delete assignments" ON public.user_village_assignments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- 7. Helper functions
CREATE OR REPLACE FUNCTION public.get_user_village_ids(_user_id UUID)
RETURNS UUID[]
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(array_agg(village_id), '{}')
  FROM public.user_village_assignments WHERE user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_village(_user_id UUID, _village_id UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_village_assignments
    WHERE user_id = _user_id AND village_id = _village_id
  ) OR public.has_role(_user_id, 'super_admin')
$$;

-- 8. Auto-create rules_config and assignment when village created
CREATE OR REPLACE FUNCTION public.handle_new_village()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.rules_config (village_id) VALUES (NEW.id);
  INSERT INTO public.user_village_assignments (user_id, village_id) VALUES (NEW.created_by, NEW.id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_village_created AFTER INSERT ON public.villages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_village();

-- 9. Allow rules_config insertion
CREATE POLICY "System can insert rules_config" ON public.rules_config FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 10. Preload districts
INSERT INTO public.districts (name) VALUES
  ('Capricorn'), ('Mopani'), ('Sekhukhune'), ('Vhembe'), ('Waterberg');

-- 11. Preload municipalities
INSERT INTO public.municipalities (name, district_id) VALUES
  ('Blouberg', (SELECT id FROM public.districts WHERE name = 'Capricorn')),
  ('Lepelle-Nkumpi', (SELECT id FROM public.districts WHERE name = 'Capricorn')),
  ('Molemole', (SELECT id FROM public.districts WHERE name = 'Capricorn')),
  ('Polokwane', (SELECT id FROM public.districts WHERE name = 'Capricorn')),
  ('Ba-Phalaborwa', (SELECT id FROM public.districts WHERE name = 'Mopani')),
  ('Greater Giyani', (SELECT id FROM public.districts WHERE name = 'Mopani')),
  ('Greater Letaba', (SELECT id FROM public.districts WHERE name = 'Mopani')),
  ('Greater Tzaneen', (SELECT id FROM public.districts WHERE name = 'Mopani')),
  ('Maruleng', (SELECT id FROM public.districts WHERE name = 'Mopani')),
  ('Elias Motsoaledi', (SELECT id FROM public.districts WHERE name = 'Sekhukhune')),
  ('Ephraim Mogale', (SELECT id FROM public.districts WHERE name = 'Sekhukhune')),
  ('Fetakgomo Tubatse', (SELECT id FROM public.districts WHERE name = 'Sekhukhune')),
  ('Makhuduthamaga', (SELECT id FROM public.districts WHERE name = 'Sekhukhune')),
  ('Collins Chabane', (SELECT id FROM public.districts WHERE name = 'Vhembe')),
  ('Makhado', (SELECT id FROM public.districts WHERE name = 'Vhembe')),
  ('Musina', (SELECT id FROM public.districts WHERE name = 'Vhembe')),
  ('Thulamela', (SELECT id FROM public.districts WHERE name = 'Vhembe')),
  ('Bela-Bela', (SELECT id FROM public.districts WHERE name = 'Waterberg')),
  ('Lephalale', (SELECT id FROM public.districts WHERE name = 'Waterberg')),
  ('Mogalakwena', (SELECT id FROM public.districts WHERE name = 'Waterberg')),
  ('Modimolle-Mookgophong', (SELECT id FROM public.districts WHERE name = 'Waterberg')),
  ('Thabazimbi', (SELECT id FROM public.districts WHERE name = 'Waterberg'));
