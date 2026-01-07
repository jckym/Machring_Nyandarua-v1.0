import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "admin" | "manager" | "local_mr_coordinator" | "tot";
  localMrId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the JWT token using getClaims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Token validation error:", claimsError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestingUserId = claimsData.claims.sub as string;

    // Check if requesting user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUserId)
      .single();

    if (roleError || roleData?.role !== "admin") {
      return new Response(
        JSON.stringify({ success: false, error: "Only admins can create users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: CreateUserRequest = await req.json();
    const { name, email, phone, password, role, localMrId } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: name, email, password, role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role
    const validRoles = ["admin", "manager", "local_mr_coordinator", "tot"];
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate localMrId for TOT and coordinator roles
    if ((role === "tot" || role === "local_mr_coordinator") && !localMrId) {
      return new Response(
        JSON.stringify({ success: false, error: "Local MR assignment is required for TOT and Coordinator roles" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating user: ${email} with role: ${role}`);

    // Create the auth user with admin API
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { name, phone }
    });

    if (createAuthError) {
      console.error("Auth creation error:", createAuthError);
      return new Response(
        JSON.stringify({ success: false, error: createAuthError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;
    console.log(`User created with ID: ${userId}`);

    // Ensure profile exists (trigger should handle this, but let's be safe)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        name,
        email,
        phone: phone || null,
        status: "active"
      }, { onConflict: "id" });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't fail - the trigger should have created this
    }

    // Assign role
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        role
      });

    if (roleInsertError) {
      console.error("Role assignment error:", roleInsertError);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to assign role: ${roleInsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If TOT or coordinator, create local MR assignment
    if (localMrId && (role === "tot" || role === "local_mr_coordinator")) {
      const { error: assignmentError } = await supabaseAdmin
        .from("tot_assignments")
        .insert({
          tot_id: userId,
          local_mr_id: localMrId,
          status: "active"
        });

      if (assignmentError) {
        console.error("Assignment error:", assignmentError);
        return new Response(
          JSON.stringify({ success: false, error: `Failed to assign Local MR: ${assignmentError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Also update coordinator_id on local_mrs table if role is coordinator
    if (role === "local_mr_coordinator" && localMrId) {
      const { error: coordinatorError } = await supabaseAdmin
        .from("local_mrs")
        .update({ coordinator_id: userId })
        .eq("id", localMrId);

      if (coordinatorError) {
        console.error("Coordinator assignment error:", coordinatorError);
        // Non-fatal - continue
      }
    }

    console.log(`User ${email} created successfully with role ${role}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: userId,
          email,
          name,
          role
        },
        message: `User ${name} created successfully`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error creating user:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
