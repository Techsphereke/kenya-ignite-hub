
-- Allow admins to view all user roles (needed for user management)
DROP POLICY "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles or admins can view all" ON public.user_roles FOR SELECT USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);
