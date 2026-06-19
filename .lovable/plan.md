# Transform MR Nyandarua → Multi-Tenant SaaS Platform

This is a major architectural change. The current app is built as a single-organization system: every table, RLS policy, role hierarchy, dashboard, and edge function assumes one Machinery Ring. Converting it to a multi-tenant SaaS touches **every table, every page, every policy, and every edge function**. It cannot be done in one pass — I'm proposing a phased rollout.

Before I start, I need decisions on a few key questions (see "Open Questions" at the bottom).

---

## Scope Overview

**Add:** `tenants` table, `platform_super_admin` role, tenant onboarding flow, tenant-scoped RLS on every business table, platform admin dashboard, subscription management, tenant settings, branding per tenant.

**Refactor:** Every existing table gets `tenant_id`. Every RLS policy rewritten. Every query scoped. Existing data migrated into a "default" tenant.

**Defer (phase 2+):** GPS/fleet tracking, 2FA, SMS notifications, billing integration (Stripe), workspace subdomains, advanced fuel monitoring.

---

## Phased Plan

### Phase 1 — Foundation (this plan covers Phase 1 only)
Goal: working multi-tenant data model with isolation, onboarding, and platform admin.

1. **DB migration**
   - Create `tenants` (id, tenant_code, organization_name, branch_name, logo_url, email, phone, county, address, status [active/suspended/expired], subscription_plan [starter/standard/enterprise], trial_ends_at, created_at).
   - Create `subscription_plans` reference table with user/machine limits.
   - Add `platform_super_admin` to `app_role` enum.
   - Add nullable `tenant_id uuid` to every business table: `profiles`, `farmers`, `local_mrs`, `machinery`, `machinery_bookings`, `machinery_service_history`, `mechanisation_jobs`, `sales`, `products`, `trainings`, `training_attendees`, `visits`, `tot_assignments`, `commission_payouts`, `notifications`, `notification_settings`, `audit_logs`, `user_roles`.
   - Backfill all existing rows with a single "MR Nyandarua (default)" tenant.
   - Set `tenant_id` NOT NULL after backfill.
   - Add `get_user_tenant_id(_user_id)` security-definer function.
   - Add `is_platform_admin(_user_id)` security-definer function.
   - Rewrite every RLS policy to add `tenant_id = get_user_tenant_id(auth.uid())` (or platform admin bypass).
   - Add `GRANT` statements for the new tables.

2. **Edge functions**
   - New `create-tenant` function: creates tenant row, creates admin auth user, assigns `tenant_admin` role, seeds tenant defaults.
   - Update `create-user`, `delete-user`, `purge-farmer`, `bootstrap-admin`, `fia-*`, `followup-reminders`, `send-notification-email` to be tenant-aware.

3. **Auth & routing**
   - Extend `AuthContext` to load `tenantId`, `tenantName`, `tenantLogo`, `isPlatformAdmin`.
   - New public route `/register` — tenant onboarding form (organization info, admin info, plan selection, T&C).
   - Login stays single portal; redirect logic: platform_super_admin → `/platform`, tenant users → existing `/dashboard`.
   - `ProtectedRoute` enforces tenant scope and blocks suspended tenants.

4. **Platform Super Admin area** (`/platform/*`)
   - Dashboard: total tenants, active, machines, operators, farmers, monthly revenue, expiring subscriptions.
   - Tenants list: table with view/edit/suspend/activate/delete actions.
   - Tenant detail page.
   - System logs viewer (reuse audit_logs filtered platform-wide).

5. **Tenant Settings** (existing `/settings` extended)
   - Organization profile (name, logo upload, contacts, address).
   - Branding (theme color, dashboard logo) — applied via CSS variables.
   - Preferences (currency, timezone — feature-flagged for phase 1).
   - Subscription status card (read-only in phase 1).

6. **Tenant scoping in app code**
   - Audit every `useQuery`/Supabase call and rely on RLS for isolation (no client-side `.eq('tenant_id', …)` needed since RLS enforces it, but include it as defense-in-depth on writes).
   - Update insert paths to set `tenant_id` from auth context.

7. **Branding application**
   - Tenant logo replaces hardcoded `/mrlogo.png` in `Sidebar`, `Header`, `Auth`, `NotFound`.
   - Hardcoded "Machinery Ring Nyandarua" string replaced with `tenant.organization_name`.

### Phase 2 (separate plan, after Phase 1 ships)
- Subscription enforcement (block creates when over plan limits).
- Stripe billing integration.
- Email notifications for onboarding, subscription expiry.
- Per-tenant subdomain routing (`mr-0001.platform.com`).
- 2FA, rate limiting hardening.

### Phase 3
- Fleet/GPS tracking, fuel monitoring, geofencing, route history.
- SMS notifications channel.
- Advanced platform analytics (tenant growth charts, revenue trends).

---

## Technical Notes

- **Data isolation strategy:** shared schema + `tenant_id` column + RLS. Simplest path on Supabase; no per-tenant schema or DB.
- **No subdomains in phase 1** — all tenants share one URL; tenant resolved from JWT/profile. Subdomain routing added in phase 2 if desired.
- **Existing data:** wrapped into one seed tenant so nothing breaks for current users on day one.
- **Two new roles:** `platform_super_admin` (cross-tenant) and `tenant_admin` (replaces current `admin` semantics inside a tenant). Existing `admin`/`manager`/`local_mr_coordinator`/`tot` roles stay but become tenant-scoped.
- **Onboarding email confirmation:** project rule requires email verification — new tenant admins must verify before first login. Confirmed via existing auth config.
- **Rate limiting:** Lovable Cloud has no standard rate-limiting primitive. Flagged as Phase 2.

---

## Open Questions (need answers before I start)

1. **Existing data:** confirm I should migrate all current MR Nyandarua data into a single seed tenant named "Machinery Ring Nyandarua"?
2. **Platform Super Admin account:** who is the first platform admin? Use the existing bootstrap admin (`BOOTSTRAP_ADMIN_EMAIL`) and promote them, or create a new email?
3. **Self-serve registration:** should `/register` be open to anyone on the internet (with email verification gating activation), or admin-approval-required?
4. **Subscription plans in Phase 1:** store plan choice + show status only, or also enforce limits (e.g. block 21st user on Starter)?
5. **Custom branding scope:** tenant logo + org name in Phase 1 is straightforward. Should I also do per-tenant theme color now, or defer?

Once you answer those, I'll execute Phase 1 end-to-end (migration, edge functions, onboarding page, platform admin area, tenant settings, branding).
