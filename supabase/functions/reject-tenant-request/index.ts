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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { request_id, reason } = await req.json();
    if (!request_id || !reason || String(reason).trim().length < 3) {
      return new Response(JSON.stringify({ error: "request_id and reason required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await userClient.rpc("reject_tenant_request", {
      _request_id: request_id, _reason: reason,
    });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Email best-effort
    try {
      const admin = createClient(supabaseUrl, serviceRoleKey);
      const { data: r } = await admin.from("tenant_registration_requests")
        .select("admin_email, admin_full_name, organization_name").eq("id", request_id).maybeSingle();
      const resendKey = Deno.env.get("RESEND_API_KEY");
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (r && resendKey && lovableKey) {
        await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": resendKey,
          },
          body: JSON.stringify({
            from: "Machinery Ring Platform <onboarding@resend.dev>",
            to: [r.admin_email],
            subject: "Update on your organization registration",
            html: `<p>Hello ${r.admin_full_name},</p>
              <p>Your registration request for <strong>${r.organization_name}</strong> was not approved at this time.</p>
              <p><strong>Reason:</strong> ${reason}</p>`,
          }),
        });
      }
    } catch (e) { console.warn("email failed", e); }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
