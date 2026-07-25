
-- 1) Tenant-scoped role helper
CREATE OR REPLACE FUNCTION public.has_role_in_tenant(_user_id uuid, _role app_role, _tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND tenant_id = _tenant_id
  )
$$;

-- 2) Rewrite policies with tenant scoping

-- audit_logs
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT
  USING (has_role_in_tenant(auth.uid(), 'admin'::app_role, tenant_id));
DROP POLICY IF EXISTS "Managers can view audit logs" ON public.audit_logs;
CREATE POLICY "Managers can view audit logs" ON public.audit_logs FOR SELECT
  USING (has_role_in_tenant(auth.uid(), 'manager'::app_role, tenant_id));
DROP POLICY IF EXISTS "Coordinators can view audit logs for their local_mr" ON public.audit_logs;
CREATE POLICY "Coordinators can view audit logs for their local_mr" ON public.audit_logs FOR SELECT
  USING (has_role_in_tenant(auth.uid(), 'local_mr_coordinator'::app_role, tenant_id)
    AND entity = ANY (ARRAY['visit','sale','training','farmer','mechanisation_job']));

-- commission_payouts
DROP POLICY IF EXISTS "Admins and managers can view all payouts" ON public.commission_payouts;
CREATE POLICY "Admins and managers can view all payouts" ON public.commission_payouts FOR SELECT
  USING (has_role_in_tenant(auth.uid(), 'admin'::app_role, tenant_id)
      OR has_role_in_tenant(auth.uid(), 'manager'::app_role, tenant_id));
DROP POLICY IF EXISTS "Admins can manage payouts" ON public.commission_payouts;
CREATE POLICY "Admins can manage payouts" ON public.commission_payouts FOR ALL
  USING (has_role_in_tenant(auth.uid(), 'admin'::app_role, tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(), 'admin'::app_role, tenant_id));

-- farmer_private_data
DROP POLICY IF EXISTS "Admins and managers can manage farmer private data" ON public.farmer_private_data;
CREATE POLICY "Admins and managers can manage farmer private data" ON public.farmer_private_data FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins and managers can view farmer private data" ON public.farmer_private_data;
CREATE POLICY "Admins and managers can view farmer private data" ON public.farmer_private_data FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));

-- farmers
DROP POLICY IF EXISTS "Admins and managers can view all farmers" ON public.farmers;
CREATE POLICY "Admins and managers can view all farmers" ON public.farmers FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage farmers" ON public.farmers;
CREATE POLICY "Admins can manage farmers" ON public.farmers FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));
DROP POLICY IF EXISTS "Office employees can view farmers" ON public.farmers;
CREATE POLICY "Office employees can view farmers" ON public.farmers FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'office_employee',tenant_id));

-- local_mrs
DROP POLICY IF EXISTS "Admins and managers can view all local_mrs" ON public.local_mrs;
CREATE POLICY "Admins and managers can view all local_mrs" ON public.local_mrs FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage local_mrs" ON public.local_mrs;
CREATE POLICY "Admins can manage local_mrs" ON public.local_mrs FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));
DROP POLICY IF EXISTS "Office employees can view local_mrs" ON public.local_mrs;
CREATE POLICY "Office employees can view local_mrs" ON public.local_mrs FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'office_employee',tenant_id));

-- machinery
DROP POLICY IF EXISTS "Admins and managers can view all machinery" ON public.machinery;
CREATE POLICY "Admins and managers can view all machinery" ON public.machinery FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage machinery" ON public.machinery;
CREATE POLICY "Admins can manage machinery" ON public.machinery FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));
DROP POLICY IF EXISTS "Office employees can view machinery" ON public.machinery;
CREATE POLICY "Office employees can view machinery" ON public.machinery FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'office_employee',tenant_id));

-- machinery_bookings
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.machinery_bookings;
CREATE POLICY "Admins can manage bookings" ON public.machinery_bookings FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));
DROP POLICY IF EXISTS "Managers can view all bookings" ON public.machinery_bookings;
CREATE POLICY "Managers can view all bookings" ON public.machinery_bookings FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Office employees can view machinery_bookings" ON public.machinery_bookings;
CREATE POLICY "Office employees can view machinery_bookings" ON public.machinery_bookings FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'office_employee',tenant_id));

-- machinery_service_history
DROP POLICY IF EXISTS "Admins and managers can view all service history" ON public.machinery_service_history;
CREATE POLICY "Admins and managers can view all service history" ON public.machinery_service_history FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage service history" ON public.machinery_service_history;
CREATE POLICY "Admins can manage service history" ON public.machinery_service_history FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));

-- mechanisation_jobs
DROP POLICY IF EXISTS "Admins and managers can view all jobs" ON public.mechanisation_jobs;
CREATE POLICY "Admins and managers can view all jobs" ON public.mechanisation_jobs FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.mechanisation_jobs;
CREATE POLICY "Admins can manage jobs" ON public.mechanisation_jobs FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));

-- notification_settings
DROP POLICY IF EXISTS "Admins can manage all notification settings" ON public.notification_settings;
CREATE POLICY "Admins can manage all notification settings" ON public.notification_settings FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));

-- notifications
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));

-- products
DROP POLICY IF EXISTS "Admins and managers can view all product details" ON public.products;
CREATE POLICY "Admins and managers can view all product details" ON public.products FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));
DROP POLICY IF EXISTS "Coordinators can view product basics" ON public.products;
CREATE POLICY "Coordinators can view product basics" ON public.products FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'local_mr_coordinator',tenant_id));
DROP POLICY IF EXISTS "Office employees can view products" ON public.products;
CREATE POLICY "Office employees can view products" ON public.products FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'office_employee',tenant_id));
DROP POLICY IF EXISTS "TOTs can view product basics" ON public.products;
CREATE POLICY "TOTs can view product basics" ON public.products FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'tot',tenant_id));

-- profiles
DROP POLICY IF EXISTS "Admins and managers can view all profiles" ON public.profiles;
CREATE POLICY "Admins and managers can view all profiles" ON public.profiles FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));
DROP POLICY IF EXISTS "Coordinators can view local_mr profiles" ON public.profiles;
CREATE POLICY "Coordinators can view local_mr profiles" ON public.profiles FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'local_mr_coordinator',tenant_id) AND EXISTS (
    SELECT 1 FROM tot_assignments ta JOIN local_mrs lm ON ta.local_mr_id = lm.id
    WHERE ta.tot_id = profiles.id AND lm.coordinator_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Office employees can view profiles" ON public.profiles;
CREATE POLICY "Office employees can view profiles" ON public.profiles FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'office_employee',tenant_id));

-- sales
DROP POLICY IF EXISTS "Admins and managers can view all sales" ON public.sales;
CREATE POLICY "Admins and managers can view all sales" ON public.sales FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage sales" ON public.sales;
CREATE POLICY "Admins can manage sales" ON public.sales FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));
DROP POLICY IF EXISTS "Office employees can record sales" ON public.sales;
CREATE POLICY "Office employees can record sales" ON public.sales FOR INSERT
  WITH CHECK (has_role_in_tenant(auth.uid(),'office_employee',tenant_id) AND tot_id = auth.uid());
DROP POLICY IF EXISTS "Office employees can view sales" ON public.sales;
CREATE POLICY "Office employees can view sales" ON public.sales FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'office_employee',tenant_id));

-- tot_assignments
DROP POLICY IF EXISTS "Admins and managers can view all" ON public.tot_assignments;
CREATE POLICY "Admins and managers can view all" ON public.tot_assignments FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage assignments" ON public.tot_assignments;
CREATE POLICY "Admins can manage assignments" ON public.tot_assignments FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));
DROP POLICY IF EXISTS "Office employees can view tot_assignments" ON public.tot_assignments;
CREATE POLICY "Office employees can view tot_assignments" ON public.tot_assignments FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'office_employee',tenant_id));

-- training_attendees
DROP POLICY IF EXISTS "Admins and managers can view all attendees" ON public.training_attendees;
CREATE POLICY "Admins and managers can view all attendees" ON public.training_attendees FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage attendees" ON public.training_attendees;
CREATE POLICY "Admins can manage attendees" ON public.training_attendees FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));

-- trainings
DROP POLICY IF EXISTS "Admins and managers can view all trainings" ON public.trainings;
CREATE POLICY "Admins and managers can view all trainings" ON public.trainings FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage trainings" ON public.trainings;
CREATE POLICY "Admins can manage trainings" ON public.trainings FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));
DROP POLICY IF EXISTS "Office employees can view trainings" ON public.trainings;
CREATE POLICY "Office employees can view trainings" ON public.trainings FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'office_employee',tenant_id));

-- user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));
DROP POLICY IF EXISTS "Managers can view all user roles" ON public.user_roles;
CREATE POLICY "Managers can view all user roles" ON public.user_roles FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'manager',tenant_id));

-- visits
DROP POLICY IF EXISTS "Admins and managers can view all visits" ON public.visits;
CREATE POLICY "Admins and managers can view all visits" ON public.visits FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id) OR has_role_in_tenant(auth.uid(),'manager',tenant_id));
DROP POLICY IF EXISTS "Admins can manage visits" ON public.visits;
CREATE POLICY "Admins can manage visits" ON public.visits FOR ALL
  USING (has_role_in_tenant(auth.uid(),'admin',tenant_id))
  WITH CHECK (has_role_in_tenant(auth.uid(),'admin',tenant_id));
DROP POLICY IF EXISTS "Office employees can view visits" ON public.visits;
CREATE POLICY "Office employees can view visits" ON public.visits FOR SELECT
  USING (has_role_in_tenant(auth.uid(),'office_employee',tenant_id));

-- 3) Tighten public registration policy (remove always-true WITH CHECK)
DROP POLICY IF EXISTS "Anyone can submit a registration request" ON public.tenant_registration_requests;
CREATE POLICY "Anyone can submit a registration request"
  ON public.tenant_registration_requests FOR INSERT
  WITH CHECK (
    status = 'pending'::registration_status
    AND terms_accepted = true
    AND admin_email IS NOT NULL AND length(admin_email) > 3
    AND organization_name IS NOT NULL AND length(organization_name) > 0
    AND reviewed_by IS NULL
    AND created_tenant_id IS NULL
  );

-- 4) Restrict EXECUTE on SECURITY DEFINER functions (revoke from anon/PUBLIC)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role_in_tenant(uuid, app_role, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_coordinator_of(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_local_mr_id(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.approve_tenant_request(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reject_tenant_request(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_monthly_trends() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_local_mr_performance(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_sales_summary(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_tot_performance(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_products_for_role() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_audit(text, text, uuid, jsonb, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_add_machine_to_tenant(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_add_user_to_tenant(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_and_notify_overdue_followups() FROM PUBLIC, anon;

-- Ensure trigger functions aren't publicly callable via RPC
REVOKE EXECUTE ON FUNCTION public.audit_table_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_mechanisation_commission() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_sale_commission() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_user_data() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_stock_on_sale() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_machinery_booked() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_sale_completed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_training_completed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_commission_recalculation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restore_stock_on_sale_delete() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_tenant_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_notification_email() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_farmer_training_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_farmer_trainings_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_farmer_visit_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_farmer_visits_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
