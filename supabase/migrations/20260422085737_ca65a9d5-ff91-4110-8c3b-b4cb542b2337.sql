
-- Add chief/traditional leader details to villages
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS chief_name text;
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS chief_title text DEFAULT 'Thovhele';
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS chief_phone text;
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS municipality_id uuid REFERENCES public.municipalities(id);
