
-- Add section, stand_number, gps coords to households
ALTER TABLE public.households ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public.households ADD COLUMN IF NOT EXISTS stand_number text;
ALTER TABLE public.households ADD COLUMN IF NOT EXISTS gps_lat double precision;
ALTER TABLE public.households ADD COLUMN IF NOT EXISTS gps_lng double precision;

-- Add contact fields and profile picture to members
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS phone_1 text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS phone_2 text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS profile_picture_url text;

-- Add receipt image and notes to payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_image_url text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS notes text;

-- Create requests table for proof of address, stand approvals, issues
CREATE TABLE public.requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  request_type text NOT NULL DEFAULT 'general',
  subject text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  resolved_by text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requests viewable by authenticated" ON public.requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert requests" ON public.requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin/Secretary can update requests" ON public.requests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretary'));

-- Create special_contributions table
CREATE TABLE public.special_contributions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  amount_per_household numeric NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.special_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Special contributions viewable by authenticated" ON public.special_contributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage special contributions" ON public.special_contributions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update special contributions" ON public.special_contributions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Create special_contribution_payments table
CREATE TABLE public.special_contribution_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contribution_id uuid NOT NULL REFERENCES public.special_contributions(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  payment_date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'paid',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.special_contribution_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SC payments viewable by authenticated" ON public.special_contribution_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/Treasurer can insert SC payments" ON public.special_contribution_payments FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'treasurer'));

-- Create storage bucket for receipts and profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- Storage policies for receipts
CREATE POLICY "Authenticated users can upload receipts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'receipts');
CREATE POLICY "Anyone can view receipts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'receipts');

-- Storage policies for profile pictures
CREATE POLICY "Authenticated users can upload profile pictures" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-pictures');
CREATE POLICY "Anyone can view profile pictures" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'profile-pictures');
CREATE POLICY "Authenticated users can update profile pictures" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-pictures');

-- Updated_at triggers for new tables
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_special_contributions_updated_at BEFORE UPDATE ON public.special_contributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
