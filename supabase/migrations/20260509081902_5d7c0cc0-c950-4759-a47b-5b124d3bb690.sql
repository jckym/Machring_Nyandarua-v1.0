
-- 1) Add office_employee to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'office_employee';
