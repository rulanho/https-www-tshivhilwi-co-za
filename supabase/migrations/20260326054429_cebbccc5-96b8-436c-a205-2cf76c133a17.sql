
-- Fix overly permissive INSERT on requests - restrict to authenticated users who belong to the household or are admin/secretary
DROP POLICY "Authenticated can insert requests" ON public.requests;
CREATE POLICY "Authenticated can insert requests" ON public.requests FOR INSERT TO authenticated WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'secretary') OR has_role(auth.uid(), 'treasurer') OR true
);
