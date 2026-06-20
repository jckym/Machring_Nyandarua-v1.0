# Phase 1 — Multi-Tenant SaaS Conversion

This is a large, multi-step refactor. I'll deliver it in 4 sequential migration+code waves so each wave is reviewable and never breaks the running app. Foundation already exists (tenants, tenant_registration_requests, subscription_plans, tenant_id on 19 tables, helper functions, platform_super_admin role).

## Wave A — Data model finalization (DB migration)
- Add missing columns to `tenant_registration_requests`: `branch_name`, `county`, `address`, `subscription_plan` (text), `terms_accepted` (bool).
- Add missing columns to `tenants`: ensure `branch_name`, `county`, `address`, `logo_url`, `contact_person` exist (add if missing).
- Add RLS policy: anyone (anon) can `INSERT` into `tenant_registration_requests`; only `platform_super_admin` can `SELECT/UPDATE`.
- Add `approve_tenant_request(request_id, plan_id)` SECURITY DEFINER function: creates tenant with auto code `MR-00001`, returns tenant_id. (User account creation happens via edge function after approval since it needs auth admin API.)
- Add `reject_tenant_request(request_id, reason)` function.
- Auto-generate `tenant_code` via sequence + trigger.
- Audit triggers on tenants & requests.

## Wave B — Public registration + Approval edge function
- `src/pages/Register.tsx` — public SaaS onboarding form (4 sections, zod validation, inserts into `tenant_registration_requests`, shows pending-review confirmation). No auth, no user/tenant creation.
- Edge function `approve-tenant-request`: validates caller is platform_super_admin, calls `approve_tenant_request` SQL fn, creates auth user with admin API, assigns `tenant_admin` role, links to tenant, sends email via Resend.
- Edge function `reject-tenant-request`: requires reason, updates request, sends rejection email.
- Add `/register` route in `App.tsx` (public).

## Wave C — Auth context + route guards
- Extend `AuthContext` to load `tenant` + expose `tenantId`, `isPlatformAdmin`, `isTenantAdmin`. Block login if tenant `status != 'active'` (except platform admins). Show suspension screen.
- New guards: `PlatformRoute` (platform_super_admin only), `TenantRoute` (active tenant required). Keep existing `ProtectedRoute` working.
- Update `DashboardLayout` redirect: platform admins → `/platform`.

## Wave D — Platform Super Admin UI
- Layout: `src/components/layout/PlatformLayout.tsx` + sidebar (Dashboard, Requests, Tenants, Audit Logs, Settings).
- Pages under `src/pages/platform/`:
  - `PlatformDashboard.tsx` — metric cards (requests, pending, active/suspended tenants, users, machinery, revenue) + simple charts using existing Recharts.
  - `RegistrationRequests.tsx` — table + view/approve/reject modals (calls edge functions).
  - `Tenants.tsx` — table with suspend/activate/edit actions (direct table updates restricted by RLS to platform admin).
  - `PlatformAuditLogs.tsx` — reuses existing `audit_logs` table filtered to tenant/platform actions.
  - `PlatformSettings.tsx` — manage subscription plans.
- Wire routes in `App.tsx` under `/platform/*` behind `PlatformRoute`.

## Wave E — RLS hardening (final wave)
- Rewrite policies on all 19 tenant-scoped tables to enforce `tenant_id = get_user_tenant_id(auth.uid()) OR is_platform_admin(auth.uid())` in addition to existing role checks. Existing in-tenant queries continue to work because `tenant_id` was backfilled and defaulted.
- Add platform-admin override policies to `tenants` and `tenant_registration_requests`.

## What stays untouched
- Existing dashboards, sidebar, business pages, hooks. The seed tenant ("Machinery Ring Nyandarua") carries all current data, so the existing UI keeps working identically for current users.

## Technical notes
- Tenant code generation: Postgres sequence `tenant_code_seq` + `LPAD(nextval()::text, 5, '0')` prefixed `MR-`.
- Approval flow: SQL fn creates tenant + updates request in a transaction; edge fn then provisions auth user — if user creation fails, edge fn rolls back by deleting tenant and reverting request.
- Plan limits already enforced via `can_add_user_to_tenant` / `can_add_machine_to_tenant`.
- Emails use existing Resend integration.

## Execution order
I'll start with **Wave A migration** (single SQL migration). After approval & types regen I'll proceed wave by wave, pausing only if you ask. Confirm to begin Wave A.
