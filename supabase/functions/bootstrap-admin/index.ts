import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const adminEmail = "jckym001@gmail.com";
    const adminPassword = "Admin.mr01";
    const adminName = "System Admin";
    const adminPhone = "0711417507";

    // Check if admin already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find(u => u.email === adminEmail);
    
    if (existingAdmin) {
      // Check if already has admin role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", existingAdmin.id)
        .eq("role", "admin")
        .single();
      
      if (existingRole) {
        return new Response(
          JSON.stringify({ success: true, message: "Admin already exists", userId: existingAdmin.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Assign admin role to existing user
      await supabase.from("user_roles").insert({ user_id: existingAdmin.id, role: "admin" });
      
      return new Response(
        JSON.stringify({ success: true, message: "Admin role assigned to existing user", userId: existingAdmin.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: adminName, phone: adminPhone }
    });

    if (authError) {
      throw authError;
    }

    const userId = authData.user.id;

    // Ensure profile exists (trigger should create it, but let's be safe)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ 
        id: userId, 
        name: adminName, 
        email: adminEmail, 
        phone: adminPhone,
        status: "active"
      }, { onConflict: "id" });

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    // Assign admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleError) {
      throw roleError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin created successfully",
        userId,
        email: adminEmail
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
