
-- =========================================================
-- PHASE 1A (main): tenant_id columns FIRST, then helpers
-- =========================================================

-- 1. Enums
DO $$ BEGIN CREATE TYPE public.tenant_status AS ENUM ('active','suspended','expired','pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE public.subscription_plan_type AS ENUM ('starter','standard','enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE public.registration_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type public.subscription_plan_type NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  max_users INTEGER NOT NULL,
  max_machines INTEGER NOT NULL,
  monthly_price_kes NUMERIC(12,2) NOT NULL DEFAULT 0,
  annual_price_kes NUMERIC(12,2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO authenticated, anon;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Plans readable by everyone" ON public.subscription_plans;
CREATE POLICY "Plans readable by everyone" ON public.subscription_plans FOR SELECT USING (true);
INSERT INTO public.subscription_plans (plan_type, display_name, max_users, max_machines, monthly_price_kes, annual_price_kes, features) VALUES
  ('starter','Starter',5,20,2500,25000,'["Core machinery management","Up to 5 users","Up to 20 machines","Email support"]'::jsonb),
  ('standard','Standard',20,100,7500,75000,'["Everything in Starter","Up to 20 users","Up to 100 machines","Maintenance scheduling","Priority support"]'::jsonb),
  ('enterprise','Enterprise',-1,-1,20000,200000,'["Everything in Standard","Unlimited users","Unlimited machines","Advanced analytics","Dedicated support"]'::jsonb)
ON CONFLICT (plan_type) DO NOTHING;

-- 3. tenants
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_code TEXT NOT NULL UNIQUE,
  organization_name TEXT NOT NULL,
  branch_name TEXT,
  registration_number TEXT,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  county TEXT,
  address TEXT,
  logo_url TEXT,
  theme_color TEXT DEFAULT '#2D5016',
  currency TEXT NOT NULL DEFAULT 'KES',
  timezone TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  language TEXT NOT NULL DEFAULT 'en',
  status public.tenant_status NOT NULL DEFAULT 'active',
  subscription_plan public.subscription_plan_type NOT NULL DEFAULT 'starter',
  trial_ends_at TIMESTAMPTZ,
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  max_users INTEGER NOT NULL DEFAULT 5,
  max_machines INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_tenants_updated_at ON public.tenants;
CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. tenant_registration_requests
CREATE TABLE IF NOT EXISTS public.tenant_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  branch_name TEXT,
  registration_number TEXT,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  county TEXT,
  address TEXT,
  admin_full_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  requested_plan public.subscription_plan_type NOT NULL DEFAULT 'starter',
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  status public.registration_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_registration_requests TO authenticated;
GRANT INSERT ON public.tenant_registration_requests TO anon;
GRANT ALL ON public.tenant_registration_requests TO service_role;
ALTER TABLE public.tenant_registration_requests ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_tenant_reg_requests_updated_at ON public.tenant_registration_requests;
CREATE TRIGGER trg_tenant_reg_requests_updated_at BEFORE UPDATE ON public.tenant_registration_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Add tenant_id columns to every business table FIRST
ALTER TABLE public.profiles                  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;
ALTER TABLE public.user_roles                ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.farmers                   ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.farmer_private_data       ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.local_mrs                 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.machinery                 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.machinery_bookings        ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.machinery_service_history ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.mechanisation_jobs        ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.sales                     ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.products                  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.trainings                 ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.training_attendees        ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.visits                    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.tot_assignments           ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.commission_payouts        ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.notifications             ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.notification_settings     ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.audit_logs                ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;

-- 6. Helper functions (now that profiles.tenant_id exists)
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'platform_super_admin'::app_role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.is_platform_admin(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_tenant_id(UUID) FROM anon;

-- 7. Tenant policies
DROP POLICY IF EXISTS "Platform admin manages tenants" ON public.tenants;
CREATE POLICY "Platform admin manages tenants" ON public.tenants FOR ALL
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Tenant members view own tenant" ON public.tenants;
CREATE POLICY "Tenant members view own tenant" ON public.tenants FOR SELECT
  USING (id = public.get_user_tenant_id(auth.uid()));

DROP POLICY IF EXISTS "Tenant admins update own tenant" ON public.tenants;
CREATE POLICY "Tenant admins update own tenant" ON public.tenants FOR UPDATE
  USING (id = public.get_user_tenant_id(auth.uid())
         AND (public.has_role(auth.uid(),'tenant_admin'::app_role) OR public.has_role(auth.uid(),'admin'::app_role)))
  WITH CHECK (id = public.get_user_tenant_id(auth.uid()));

DROP POLICY IF EXISTS "Anyone can submit a registration request" ON public.tenant_registration_requests;
CREATE POLICY "Anyone can submit a registration request" ON public.tenant_registration_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Platform admin views all requests" ON public.tenant_registration_requests;
CREATE POLICY "Platform admin views all requests" ON public.tenant_registration_requests FOR SELECT USING (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Platform admin updates requests" ON public.tenant_registration_requests;
CREATE POLICY "Platform admin updates requests" ON public.tenant_registration_requests FOR UPDATE
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Platform admin deletes requests" ON public.tenant_registration_requests;
CREATE POLICY "Platform admin deletes requests" ON public.tenant_registration_requests FOR DELETE USING (public.is_platform_admin(auth.uid()));

-- 8. Seed default tenant + backfill + promote admin
DO $$
DECLARE _default_tenant_id UUID;
BEGIN
  INSERT INTO public.tenants (tenant_code, organization_name, branch_name, email, county, status, subscription_plan, max_users, max_machines)
  VALUES ('MR-0001','Machinery Ring Nyandarua','Nyandarua','admin@mrnyandarua.local','Nyandarua','active','enterprise',-1,-1)
  ON CONFLICT (tenant_code) DO UPDATE SET organization_name = EXCLUDED.organization_name
  RETURNING id INTO _default_tenant_id;

  UPDATE public.profiles                  SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.user_roles                SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.farmers                   SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.farmer_private_data       SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.local_mrs                 SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.machinery                 SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.machinery_bookings        SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.machinery_service_history SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.mechanisation_jobs        SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.sales                     SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.products                  SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.trainings                 SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.training_attendees        SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.visits                    SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.tot_assignments           SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.commission_payouts        SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.notifications             SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.notification_settings     SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.audit_logs                SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;

  INSERT INTO public.user_roles (user_id, role, tenant_id)
  SELECT user_id, 'platform_super_admin'::app_role, _default_tenant_id
  FROM public.user_roles WHERE role = 'admin'::app_role
  ORDER BY created_at ASC LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- 9. NOT NULL after backfill
ALTER TABLE public.profiles                  ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.user_roles                ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.farmers                   ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.farmer_private_data       ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.local_mrs                 ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.machinery                 ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.machinery_bookings        ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.machinery_service_history ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.mechanisation_jobs        ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.sales                     ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.products                  ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.trainings                 ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.training_attendees        ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.visits                    ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.tot_assignments           ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.commission_payouts        ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.notifications             ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.notification_settings     ALTER COLUMN tenant_id SET NOT NULL;

-- 10. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id                  ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id                ON public.user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_farmers_tenant_id                   ON public.farmers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_local_mrs_tenant_id                 ON public.local_mrs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_machinery_tenant_id                 ON public.machinery(tenant_id);
CREATE INDEX IF NOT EXISTS idx_machinery_bookings_tenant_id        ON public.machinery_bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_machinery_service_history_tenant_id ON public.machinery_service_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mechanisation_jobs_tenant_id        ON public.mechanisation_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_tenant_id                     ON public.sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_id                  ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trainings_tenant_id                 ON public.trainings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_training_attendees_tenant_id        ON public.training_attendees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visits_tenant_id                    ON public.visits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tot_assignments_tenant_id           ON public.tot_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_commission_payouts_tenant_id        ON public.commission_payouts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id             ON public.notifications(tenant_id);

-- 11. Plan-limit helpers
CREATE OR REPLACE FUNCTION public.can_add_user_to_tenant(_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _max INT; _count INT;
BEGIN
  SELECT max_users INTO _max FROM public.tenants WHERE id = _tenant_id;
  IF _max IS NULL THEN RETURN false; END IF;
  IF _max = -1 THEN RETURN true; END IF;
  SELECT COUNT(*) INTO _count FROM public.profiles WHERE tenant_id = _tenant_id;
  RETURN _count < _max;
END $$;

CREATE OR REPLACE FUNCTION public.can_add_machine_to_tenant(_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _max INT; _count INT;
BEGIN
  SELECT max_machines INTO _max FROM public.tenants WHERE id = _tenant_id;
  IF _max IS NULL THEN RETURN false; END IF;
  IF _max = -1 THEN RETURN true; END IF;
  SELECT COUNT(*) INTO _count FROM public.machinery WHERE tenant_id = _tenant_id;
  RETURN _count < _max;
END $$;

REVOKE EXECUTE ON FUNCTION public.can_add_user_to_tenant(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_add_machine_to_tenant(UUID) FROM anon;

-- 12. handle_new_user trigger updated with tenant_id default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tenant_id UUID;
BEGIN
    _tenant_id := COALESCE(
      (NEW.raw_user_meta_data->>'tenant_id')::uuid,
      (SELECT id FROM public.tenants WHERE tenant_code = 'MR-0001')
    );
    INSERT INTO public.profiles (id, name, email, phone, tenant_id)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email, NEW.raw_user_meta_data->>'phone', _tenant_id);
    RETURN NEW;
END;
$$;
