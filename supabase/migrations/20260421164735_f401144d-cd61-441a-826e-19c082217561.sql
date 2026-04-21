
DROP POLICY "Authenticated can insert villages" ON public.villages;
CREATE POLICY "Admin or super admin can insert villages" ON public.villages FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin') OR NOT EXISTS (SELECT 1 FROM public.villages LIMIT 1));
