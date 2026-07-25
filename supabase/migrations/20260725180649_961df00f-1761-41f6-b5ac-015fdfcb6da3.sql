ALTER TABLE public.tenant_registration_requests
  ADD COLUMN IF NOT EXISTS admin_user_id uuid;