
-- Household access codes for phone+code login
CREATE TABLE public.household_access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  phone text NOT NULL,
  access_code text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  UNIQUE(phone)
);

ALTER TABLE public.household_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage access codes" ON public.household_access_codes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Codes viewable by admin/secretary" ON public.household_access_codes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'secretary'::app_role));
