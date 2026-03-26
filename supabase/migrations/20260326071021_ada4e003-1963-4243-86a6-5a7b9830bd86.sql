
-- Section leaders table
CREATE TABLE public.section_leaders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section text NOT NULL,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, section)
);

ALTER TABLE public.section_leaders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view leaders" ON public.section_leaders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage leaders" ON public.section_leaders
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete leaders" ON public.section_leaders
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Add approved_at to requests for proof of address expiry tracking
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Function to check if user is a section leader for a specific section
CREATE OR REPLACE FUNCTION public.is_section_leader(_user_id uuid, _section text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.section_leaders
    WHERE user_id = _user_id AND section = _section
  )
$$;

-- Update household update policy to include section leaders
DROP POLICY IF EXISTS "Admin/Secretary can update households" ON public.households;
CREATE POLICY "Admin/Secretary/Leader can update households" ON public.households
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'secretary'::app_role)
    OR is_section_leader(auth.uid(), section)
  );
