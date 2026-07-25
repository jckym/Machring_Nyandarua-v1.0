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
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const email = (body?.email as string) || Deno.env.get("BOOTSTRAP_ADMIN_EMAIL") || "";
    const password = (body?.password as string) || Deno.env.get("BOOTSTRAP_ADMIN_PASSWORD") || "";
    const name = (body?.name as string) || Deno.env.get("BOOTSTRAP_ADMIN_NAME") || "Platform Admin";
    const phone = (body?.phone as string) || Deno.env.get("BOOTSTRAP_ADMIN_PHONE") || "";

    if (!email || !password) {
      return json({ success: false, error: "email and password are required (body or env)" }, 400);
    }

    // Find existing user
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());

    let userId: string;
    if (found) {
      userId = found.id;
      // Reset password and confirm email
      await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { ...(found.user_metadata || {}), name, phone },
      });
    } else {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { name, phone },
      });
      if (createErr || !created?.user) return json({ success: false, error: createErr?.message || "createUser failed" }, 500);
      userId = created.user.id;
    }

    // Ensure profile
    await supabase.from("profiles").upsert({
      id: userId, name, email, phone, status: "active",
    }, { onConflict: "id" });

    // Ensure platform_super_admin role
    const { data: existingRole } = await supabase
      .from("user_roles").select("id").eq("user_id", userId).eq("role", "platform_super_admin").maybeSingle();
    if (!existingRole) {
      await supabase.from("user_roles").insert({ user_id: userId, role: "platform_super_admin" });
    }

    return json({ success: true, userId, email });
  } catch (e) {
    console.error("bootstrap-admin error:", e);
    return json({ success: false, error: (e as Error).message }, 500);
  }
});
