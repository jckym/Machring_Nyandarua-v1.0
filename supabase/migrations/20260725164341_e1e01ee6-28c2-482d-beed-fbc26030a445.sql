
-- Helpers only used inside RLS policies (run as function owner) — safely revoke from authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role_in_tenant(uuid, app_role, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_coordinator_of(uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_local_mr_id(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.log_audit(text, text, uuid, jsonb, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.can_add_machine_to_tenant(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.can_add_user_to_tenant(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.check_and_notify_overdue_followups() FROM authenticated;
