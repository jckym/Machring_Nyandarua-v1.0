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

    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Invalid JSON body" }, 400);

    const {
      organization_name, branch_name, registration_number,
      contact_person, phone, email, county, address,
      admin_full_name, admin_email, admin_password,
      requested_plan, terms_accepted,
    } = body;

    const errors: string[] = [];
    if (!organization_name || String(organization_name).trim().length < 2) errors.push("organization_name");
    if (!contact_person || String(contact_person).trim().length < 2) errors.push("contact_person");
    if (!phone || String(phone).trim().length < 7) errors.push("phone");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("email");
    if (!county) errors.push("county");
    if (!address) errors.push("address");
    if (!admin_full_name || String(admin_full_name).trim().length < 2) errors.push("admin_full_name");
    if (!admin_email || !/^\S+@\S+\.\S+$/.test(admin_email)) errors.push("admin_email");
    if (!admin_password || String(admin_password).length < 8) errors.push("admin_password (min 8 chars)");
    if (!["starter", "standard", "professional", "enterprise"].includes(requested_plan)) errors.push("requested_plan");
    if (terms_accepted !== true) errors.push("terms_accepted");
    if (errors.length) return json({ error: `Invalid: ${errors.join(", ")}` }, 400);

    const normEmail = String(admin_email).trim().toLowerCase();

    // Reject if this admin email already has a user
    const { data: existing } = await admin.auth.admin.listUsers();
    if (existing?.users?.some((u) => (u.email || "").toLowerCase() === normEmail)) {
      return json({ error: "An account with this admin email already exists. Please sign in instead." }, 409);
    }

    // Create the auth user up-front with the chosen password
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: normEmail,
      password: String(admin_password),
      email_confirm: true,
      user_metadata: {
        name: String(admin_full_name).trim(),
        phone: String(phone).trim(),
        tenant_id: null,
      },
    });
    if (createErr || !created?.user) {
      return json({ error: createErr?.message || "Could not create admin account" }, 500);
    }
    const userId = created.user.id;

    // Ensure profile row: tenant_id null, status 'pending' (blocks sign-in until approval)
    await admin.from("profiles").upsert({
      id: userId,
      name: String(admin_full_name).trim(),
      email: normEmail,
      phone: String(phone).trim(),
      status: "pending",
      tenant_id: null,
    }, { onConflict: "id" });

    // Map legacy/unknown plan names to enum
    const planMap: Record<string, string> = {
      starter: "starter",
      standard: "standard",
      professional: "standard",
      enterprise: "enterprise",
    };
    const plan = planMap[requested_plan] ?? "starter";

    const { data: reqRow, error: reqErr } = await admin
      .from("tenant_registration_requests")
      .insert({
        organization_name: String(organization_name).trim(),
        branch_name: branch_name ? String(branch_name).trim() : null,
        registration_number: registration_number ? String(registration_number).trim() : null,
        contact_person: String(contact_person).trim(),
        phone: String(phone).trim(),
        email: String(email).trim().toLowerCase(),
        county: String(county).trim(),
        address: String(address).trim(),
        admin_full_name: String(admin_full_name).trim(),
        admin_email: normEmail,
        admin_user_id: userId,
        requested_plan: plan,
        terms_accepted: true,
        status: "pending",
      })
      .select("id")
      .single();

    if (reqErr) {
      // rollback the created user
      await admin.auth.admin.deleteUser(userId);
      return json({ error: reqErr.message }, 500);
    }

    return json({ success: true, request_id: reqRow.id, user_id: userId });
  } catch (e) {
    console.error("register-tenant error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});
