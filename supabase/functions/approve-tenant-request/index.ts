import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: claims } = await admin.auth.getClaims(token);
    const callerId = claims?.claims?.sub as string | undefined;
    if (!callerId) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", callerId)
      .eq("role", "platform_super_admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { request_id, password } = await req.json();
    if (!request_id || !password || password.length < 8) {
      return new Response(JSON.stringify({ error: "request_id and password (min 8 chars) required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: reqRow, error: reqErr } = await admin
      .from("tenant_registration_requests").select("*").eq("id", request_id).single();
    if (reqErr || !reqRow) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (reqRow.status !== "pending") {
      return new Response(JSON.stringify({ error: "Request is not pending" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create tenant via SECURITY DEFINER RPC running as the caller (use a user-bound client)
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: tenantId, error: rpcErr } = await userClient
      .rpc("approve_tenant_request", { _request_id: request_id });
    if (rpcErr || !tenantId) {
      return new Response(JSON.stringify({ error: rpcErr?.message || "Approval failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create tenant admin auth user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: reqRow.admin_email,
      password,
      email_confirm: true,
      user_metadata: {
        name: reqRow.admin_full_name,
        phone: reqRow.phone,
        tenant_id: tenantId,
      },
    });

    if (createErr || !created.user) {
      // Rollback tenant
      await admin.from("tenants").delete().eq("id", tenantId);
      await admin.from("tenant_registration_requests")
        .update({ status: "pending", reviewed_by: null, reviewed_at: null, created_tenant_id: null })
        .eq("id", request_id);
      return new Response(JSON.stringify({ error: createErr?.message || "User creation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = created.user.id;
    await admin.from("profiles").update({ tenant_id: tenantId }).eq("id", userId);
    await admin.from("user_roles").insert({ user_id: userId, role: "tenant_admin" });

    // Send approval email (best effort)
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
            from: "Machinery Ring Platform <onboarding@resend.dev>",
            to: [reqRow.admin_email],
            subject: "Your organization has been approved",
            html: `<p>Hello ${reqRow.admin_full_name},</p>
              <p>Your organization <strong>${reqRow.organization_name}</strong> has been approved on the Machinery Ring platform.</p>
              <p>You can now sign in with your admin email and the password set by the platform administrator.</p>`,
          }),
        });
      }
    } catch (e) { console.warn("email failed", e); }

    return new Response(JSON.stringify({ success: true, tenant_id: tenantId, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
