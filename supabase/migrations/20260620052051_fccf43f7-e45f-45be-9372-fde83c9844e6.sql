
-- Grants for Data API access
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;

GRANT INSERT ON public.tenant_registration_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_registration_requests TO authenticated;
GRANT ALL ON public.tenant_registration_requests TO service_role;

GRANT SELECT, UPDATE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;

-- Tenant code sequence + auto-fill trigger
CREATE SEQUENCE IF NOT EXISTS public.tenant_code_seq START 2;  -- 1 already used by seed MR-0001

CREATE OR REPLACE FUNCTION public.set_tenant_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tenant_code IS NULL OR NEW.tenant_code = '' THEN
    NEW.tenant_code := 'MR-' || LPAD(nextval('public.tenant_code_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_tenant_code ON public.tenants;
CREATE TRIGGER trg_set_tenant_code
  BEFORE INSERT ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_code();

-- Approve registration request: creates tenant and links request
CREATE OR REPLACE FUNCTION public.approve_tenant_request(_request_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    max_users, max_machines
  ) VALUES (
    _req.organization_name, _req.branch_name, _req.registration_number, _req.contact_person,
    _req.admin_email, _req.phone, _req.county, _req.address, 'active', _req.requested_plan,
    COALESCE(_plan.max_users, 10), COALESCE(_plan.max_machines, 20)
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
$$;

-- Reject registration request
CREATE OR REPLACE FUNCTION public.reject_tenant_request(_request_id uuid, _reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only platform super admins can reject requests';
  END IF;
  IF _reason IS NULL OR length(trim(_reason)) = 0 THEN
    RAISE EXCEPTION 'Rejection reason is required';
  END IF;

  UPDATE public.tenant_registration_requests
    SET status = 'rejected',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        rejection_reason = _reason,
        updated_at = now()
    WHERE id = _request_id AND status = 'pending';

  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found or not pending'; END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_tenant_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_tenant_request(uuid, text) TO authenticated;
