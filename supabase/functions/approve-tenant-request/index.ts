import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing auth" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: claims } = await admin.auth.getClaims(token);
    const callerId = claims?.claims?.sub as string | undefined;
    if (!callerId) return json({ error: "Invalid token" }, 401);

    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", callerId)
      .eq("role", "platform_super_admin").maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const { request_id } = await req.json();
    if (!request_id) return json({ error: "request_id required" }, 400);

    const { data: reqRow, error: reqErr } = await admin
      .from("tenant_registration_requests").select("*").eq("id", request_id).single();
    if (reqErr || !reqRow) return json({ error: "Request not found" }, 404);
    if (reqRow.status !== "pending") return json({ error: "Request is not pending" }, 400);

    // Create tenant via SECURITY DEFINER RPC (running as caller so platform-admin guard passes)
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: tenantId, error: rpcErr } = await userClient
      .rpc("approve_tenant_request", { _request_id: request_id });
    if (rpcErr || !tenantId) return json({ error: rpcErr?.message || "Approval failed" }, 500);

    // Resolve the admin user: prefer stored admin_user_id, else look up by email
    let userId: string | null = reqRow.admin_user_id ?? null;
    if (!userId) {
      const { data: allUsers } = await admin.auth.admin.listUsers();
      const match = allUsers?.users?.find(
        (u) => (u.email || "").toLowerCase() === String(reqRow.admin_email).toLowerCase()
      );
      userId = match?.id ?? null;
    }
    if (!userId) {
      // Rollback tenant creation to allow retry
      await admin.from("tenants").delete().eq("id", tenantId);
      await admin.from("tenant_registration_requests")
        .update({ status: "pending", reviewed_by: null, reviewed_at: null, created_tenant_id: null })
        .eq("id", request_id);
      return json({ error: "Admin user account not found. Ask the applicant to re-register." }, 500);
    }

    // Wire the admin: assign tenant + activate + grant tenant_admin role scoped to the tenant
    await admin.from("profiles")
      .update({ tenant_id: tenantId, status: "active" })
      .eq("id", userId);

    await admin.from("user_roles")
      .upsert({ user_id: userId, role: "tenant_admin", tenant_id: tenantId }, { onConflict: "user_id,role" });

    // Best-effort approval email
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (resendKey && lovableKey) {
        await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": resendKey,
          },
          body: JSON.stringify({
            from: "MR Connect <onboarding@resend.dev>",
            to: [reqRow.admin_email],
            subject: "Your organization has been approved",
            html: `<p>Hello ${reqRow.admin_full_name},</p>
              <p>Your organization <strong>${reqRow.organization_name}</strong> is now active on MR Connect.</p>
              <p>Sign in with the email and password you chose during registration.</p>`,
          }),
        });
      }
    } catch (e) { console.warn("email failed", e); }

    return json({ success: true, tenant_id: tenantId, user_id: userId });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
