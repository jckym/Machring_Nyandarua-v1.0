import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurgeRequest {
  email: string;
  preview?: boolean; // If true, only return impact data without deleting
}

interface ImpactData {
  userId: string | null;
  email: string;
  hasProfile: boolean;
  profileName?: string;
  counts: {
    sales: number;
    visits: number;
    trainings: number;
    mechanisationJobs: number;
    machineryBookings: number;
    farmersRegistered: number;
    coordinatedLocalMrs: number;
  };
}

const normalizeEmail = (value: string) => value.toLowerCase().trim();

async function findAuthUserByEmail(supabaseAdmin: any, email: string) {
  const target = normalizeEmail(email);
  let page = 1;
  const perPage = 1000;

  for (let i = 0; i < 10; i++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data?.users?.find((u: any) => normalizeEmail(u.email ?? "") === target);
    if (match) return match;

    if (!data?.users || data.users.length < perPage) return null;
    page += 1;
  }

  return null;
}

async function getImpactData(supabaseAdmin: any, userId: string, email: string): Promise<ImpactData> {
  // Check for profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, name")
    .eq("id", userId)
    .maybeSingle();

  // Get counts of related data
  const [
    salesResult,
    visitsResult,
    trainingsResult,
    mechJobsResult,
    bookingsResult,
    farmersResult,
    localMrsResult,
  ] = await Promise.all([
    supabaseAdmin.from("sales").select("id", { count: "exact", head: true }).eq("tot_id", userId),
    supabaseAdmin.from("visits").select("id", { count: "exact", head: true }).eq("tot_id", userId),
    supabaseAdmin.from("trainings").select("id", { count: "exact", head: true }).eq("trainer_id", userId),
    supabaseAdmin.from("mechanisation_jobs").select("id", { count: "exact", head: true }).eq("tot_id", userId),
    supabaseAdmin.from("machinery_bookings").select("id", { count: "exact", head: true }).eq("booked_by", userId),
    supabaseAdmin.from("farmers").select("id", { count: "exact", head: true }).eq("registered_by", userId),
    supabaseAdmin.from("local_mrs").select("id", { count: "exact", head: true }).eq("coordinator_id", userId),
  ]);

  return {
    userId,
    email,
    hasProfile: !!profile,
    profileName: profile?.name,
    counts: {
      sales: salesResult.count ?? 0,
      visits: visitsResult.count ?? 0,
      trainings: trainingsResult.count ?? 0,
      mechanisationJobs: mechJobsResult.count ?? 0,
      machineryBookings: bookingsResult.count ?? 0,
      farmersRegistered: farmersResult.count ?? 0,
      coordinatedLocalMrs: localMrsResult.count ?? 0,
    },
  };
}

async function purgeUserCompletely(supabaseAdmin: any, userId: string) {
  console.info(`Purging all data for user: ${userId}`);

  // Nullify references where we want to preserve the record but remove the user link
  await supabaseAdmin.from("local_mrs").update({ coordinator_id: null }).eq("coordinator_id", userId);
  await supabaseAdmin.from("farmers").update({ registered_by: null }).eq("registered_by", userId);

  // Delete records owned by / linked to this user
  await supabaseAdmin.from("sales").delete().eq("tot_id", userId);
  
  // Delete visits where user is the TOT
  await supabaseAdmin.from("visits").delete().eq("tot_id", userId);
  // Also delete visits where user is referenced via profile_id (due to visits_participant_check constraint)
  await supabaseAdmin.from("visits").delete().eq("profile_id", userId);
  
  // Delete training attendees where user is the profile
  await supabaseAdmin.from("training_attendees").delete().eq("profile_id", userId);
  
  await supabaseAdmin.from("trainings").delete().eq("trainer_id", userId);
  await supabaseAdmin.from("mechanisation_jobs").delete().eq("tot_id", userId);
  await supabaseAdmin.from("machinery_bookings").delete().eq("booked_by", userId);

  // Core user-related tables
  await supabaseAdmin.from("tot_assignments").delete().eq("tot_id", userId);
  await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
  await supabaseAdmin.from("notification_settings").delete().eq("user_id", userId);
  await supabaseAdmin.from("notifications").delete().eq("user_id", userId);
  await supabaseAdmin.from("profiles").delete().eq("id", userId);

  // Finally delete auth user
  const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (deleteAuthError) throw deleteAuthError;

  console.info(`User ${userId} purged successfully`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
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
        JSON.stringify({ success: false, error: "Only admins can purge users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: PurgeRequest = await req.json();
    const { email, preview = true } = body;

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    console.info(`Looking up user by email: ${normalizedEmail}`);

    // Find the auth user
    const authUser = await findAuthUserByEmail(supabaseAdmin, normalizedEmail);

    if (!authUser) {
      return new Response(
        JSON.stringify({
          success: true,
          found: false,
          message: "No user found with this email",
          impact: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent self-purge
    if (authUser.id === requestingUserId) {
      return new Response(
        JSON.stringify({ success: false, error: "You cannot purge your own account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get impact data
    const impact = await getImpactData(supabaseAdmin, authUser.id, normalizedEmail);

    if (preview) {
      // Return preview only
      return new Response(
        JSON.stringify({
          success: true,
          found: true,
          preview: true,
          impact,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Execute purge
    await purgeUserCompletely(supabaseAdmin, authUser.id);

    return new Response(
      JSON.stringify({
        success: true,
        found: true,
        purged: true,
        message: `User ${normalizedEmail} has been completely purged from the system`,
        impact,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in purge-user-by-email:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
