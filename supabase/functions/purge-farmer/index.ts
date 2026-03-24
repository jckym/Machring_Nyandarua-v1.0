import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurgeRequest {
  phone: string;
  preview?: boolean; // If true, only return impact data without deleting
}

interface FarmerImpactData {
  farmerId: string | null;
  phone: string;
  farmerName?: string;
  county?: string;
  village?: string;
  counts: {
    sales: number;
    visits: number;
    trainingAttendances: number;
    mechanisationJobs: number;
    machineryBookings: number;
  };
}

const normalizePhone = (value: string) => value.trim().replace(/\s+/g, "");

async function findFarmerByPhone(supabaseAdmin: any, phone: string) {
  const normalized = normalizePhone(phone);
  
  // Try exact match first
  let { data: farmer, error } = await supabaseAdmin
    .from("farmers")
    .select("id, name, phone, county, village")
    .eq("phone", normalized)
    .maybeSingle();

  if (!farmer) {
    // Try with common variations (with/without country code, spaces, etc.)
    const phoneVariations = [
      normalized,
      normalized.replace(/^0/, "+254"), // Kenya format
      normalized.replace(/^\+254/, "0"),
      normalized.replace(/^254/, "0"),
      normalized.replace(/^0/, "254"),
    ];

    for (const variation of phoneVariations) {
      const { data } = await supabaseAdmin
        .from("farmers")
        .select("id, name, phone, county, village")
        .eq("phone", variation)
        .maybeSingle();
      
      if (data) {
        farmer = data;
        break;
      }
    }
  }

  return farmer;
}

async function getImpactData(supabaseAdmin: any, farmerId: string, phone: string, farmerData: any): Promise<FarmerImpactData> {
  // Get counts of related data
  const [
    salesResult,
    visitsResult,
    trainingAttendeesResult,
    mechJobsResult,
    bookingsResult,
  ] = await Promise.all([
    supabaseAdmin.from("sales").select("id", { count: "exact", head: true }).eq("farmer_id", farmerId),
    supabaseAdmin.from("visits").select("id", { count: "exact", head: true }).eq("farmer_id", farmerId),
    supabaseAdmin.from("training_attendees").select("id", { count: "exact", head: true }).eq("farmer_id", farmerId),
    supabaseAdmin.from("mechanisation_jobs").select("id", { count: "exact", head: true }).eq("farmer_id", farmerId),
    supabaseAdmin.from("machinery_bookings").select("id", { count: "exact", head: true }).eq("farmer_id", farmerId),
  ]);

  return {
    farmerId,
    phone,
    farmerName: farmerData?.name,
    county: farmerData?.county,
    village: farmerData?.village,
    counts: {
      sales: salesResult.count ?? 0,
      visits: visitsResult.count ?? 0,
      trainingAttendances: trainingAttendeesResult.count ?? 0,
      mechanisationJobs: mechJobsResult.count ?? 0,
      machineryBookings: bookingsResult.count ?? 0,
    },
  };
}

async function purgeFarmerCompletely(supabaseAdmin: any, farmerId: string) {
  console.info(`Purging all data for farmer: ${farmerId}`);

  // Delete all related records in order (respecting foreign key dependencies)
  // 1. Delete training attendances (junction table)
  await supabaseAdmin.from("training_attendees").delete().eq("farmer_id", farmerId);
  
  // 2. Delete sales (this will trigger stock restore via database trigger)
  await supabaseAdmin.from("sales").delete().eq("farmer_id", farmerId);
  
  // 3. Delete visits
  await supabaseAdmin.from("visits").delete().eq("farmer_id", farmerId);
  
  // 4. Delete mechanisation jobs
  await supabaseAdmin.from("mechanisation_jobs").delete().eq("farmer_id", farmerId);
  
  // 5. Delete machinery bookings
  await supabaseAdmin.from("machinery_bookings").delete().eq("farmer_id", farmerId);
  
  // 6. Delete private data (PII)
  await supabaseAdmin.from("farmer_private_data").delete().eq("farmer_id", farmerId);
  
  // 7. Finally delete the farmer record
  const { error: deleteFarmerError } = await supabaseAdmin
    .from("farmers")
    .delete()
    .eq("id", farmerId);

  if (deleteFarmerError) throw deleteFarmerError;

  console.info(`Farmer ${farmerId} purged successfully`);
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
        JSON.stringify({ success: false, error: "Only admins can purge farmers" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: PurgeRequest = await req.json();
    const { phone, preview = true } = body;

    if (!phone || typeof phone !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    console.info(`Looking up farmer by phone: ${normalizedPhone}`);

    // Find the farmer
    const farmer = await findFarmerByPhone(supabaseAdmin, normalizedPhone);

    if (!farmer) {
      return new Response(
        JSON.stringify({
          success: true,
          found: false,
          message: "No farmer found with this phone number",
          impact: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get impact data
    const impact = await getImpactData(supabaseAdmin, farmer.id, normalizedPhone, farmer);

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
    await purgeFarmerCompletely(supabaseAdmin, farmer.id);

    return new Response(
      JSON.stringify({
        success: true,
        found: true,
        purged: true,
        message: `Farmer ${farmer.name} has been completely purged from the system`,
        impact,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in purge-farmer:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
