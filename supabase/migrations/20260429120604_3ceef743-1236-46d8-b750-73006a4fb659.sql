-- CDR extension: stand type, ledger, document registry

-- 1) Stand type on households (residential/business)
ALTER TABLE public.households ADD COLUMN IF NOT EXISTS stand_type text NOT NULL DEFAULT 'residential';

-- 2) Document registry (proof of address issuance log with reference)
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id uuid NOT NULL,
  household_id uuid,
  member_id uuid,
  document_type text NOT NULL DEFAULT 'proof_of_address',
  reference_number text NOT NULL UNIQUE,
  issued_by uuid,
  issued_to_name text,
  payload jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documents viewable by authenticated"
  ON public.documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can issue documents"
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'secretary'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- 3) Ledger entries — replaces the physical booklet
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id uuid NOT NULL,
  household_id uuid,
  member_id uuid,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  entry_type text NOT NULL DEFAULT 'note', -- contribution | letter | note
  amount numeric,
  description text,
  recorded_by uuid,
  recorded_by_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ledger viewable by authenticated"
  ON public.ledger_entries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can add ledger entries"
  ON public.ledger_entries FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'secretary'::app_role)
    OR has_role(auth.uid(), 'treasurer'::app_role)
  );

CREATE POLICY "Staff can update ledger entries"
  ON public.ledger_entries FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'secretary'::app_role)
  );

CREATE INDEX IF NOT EXISTS idx_ledger_village ON public.ledger_entries(village_id);
CREATE INDEX IF NOT EXISTS idx_ledger_household ON public.ledger_entries(household_id);
CREATE INDEX IF NOT EXISTS idx_documents_village ON public.documents(village_id);
CREATE INDEX IF NOT EXISTS idx_documents_household ON public.documents(household_id);
