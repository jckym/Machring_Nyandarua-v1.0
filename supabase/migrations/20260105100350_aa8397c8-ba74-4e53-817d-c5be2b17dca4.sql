-- Allow managers to read user roles (required for TOT counts and role-based dashboards)
CREATE POLICY "Managers can view all user roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'manager'::app_role));
