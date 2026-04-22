
-- Allow any authenticated user to create a village
DROP POLICY IF EXISTS "Admin or super admin can insert villages" ON public.villages;
CREATE POLICY "Authenticated users can create villages"
ON public.villages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);
