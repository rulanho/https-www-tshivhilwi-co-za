ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'household_head';

ALTER TABLE public.households ADD COLUMN IF NOT EXISTS head_user_id uuid;