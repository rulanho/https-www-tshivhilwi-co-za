
-- Create village join requests table
CREATE TABLE public.village_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  village_id uuid NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, village_id)
);

ALTER TABLE public.village_join_requests ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can create a request for themselves
CREATE POLICY "Users can create own join requests"
  ON public.village_join_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can see their own requests; admins see all
CREATE POLICY "Users can view own or admin can view all"
  ON public.village_join_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- Admins can update (approve/reject)
CREATE POLICY "Admins can update join requests"
  ON public.village_join_requests FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- Trigger: auto-assign user to village on approval
CREATE OR REPLACE FUNCTION public.handle_join_request_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    INSERT INTO public.user_village_assignments (user_id, village_id)
    VALUES (NEW.user_id, NEW.village_id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_join_request_approved
  BEFORE UPDATE ON public.village_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_join_request_approval();

-- Updated_at trigger
CREATE TRIGGER update_village_join_requests_updated_at
  BEFORE UPDATE ON public.village_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
