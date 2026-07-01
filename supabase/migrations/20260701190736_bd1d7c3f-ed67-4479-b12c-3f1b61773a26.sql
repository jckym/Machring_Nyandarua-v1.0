
-- Branding fields
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS tagline TEXT;

ALTER TABLE public.tenant_registration_requests
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS theme_color TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Refresh approve function to carry branding
CREATE OR REPLACE FUNCTION public.approve_tenant_request(_request_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _req RECORD;
  _plan RECORD;
  _tenant_id uuid;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only platform super admins can approve requests';
  END IF;

  SELECT * INTO _req FROM public.tenant_registration_requests
    WHERE id = _request_id FOR UPDATE;
  IF _req IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF _req.status <> 'pending' THEN RAISE EXCEPTION 'Request is not pending'; END IF;

  SELECT * INTO _plan FROM public.subscription_plans
    WHERE plan_type = _req.requested_plan LIMIT 1;

  INSERT INTO public.tenants (
    organization_name, branch_name, registration_number, contact_person,
    email, phone, county, address, status, subscription_plan,
    max_users, max_machines, logo_url, theme_color, tagline
  ) VALUES (
    _req.organization_name, _req.branch_name, _req.registration_number, _req.contact_person,
    _req.admin_email, _req.phone, _req.county, _req.address, 'active', _req.requested_plan,
    COALESCE(_plan.max_users, 10), COALESCE(_plan.max_machines, 20),
    _req.logo_url, _req.theme_color, _req.tagline
  )
  RETURNING id INTO _tenant_id;

  UPDATE public.tenant_registration_requests
    SET status = 'approved',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        created_tenant_id = _tenant_id,
        updated_at = now()
    WHERE id = _request_id;

  RETURN _tenant_id;
END;
$function$;
