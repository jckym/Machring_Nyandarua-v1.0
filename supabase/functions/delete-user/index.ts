import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header to verify the requesting user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the JWT token using getClaims (more robust than getUser in edge runtime)
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error('Token validation error:', claimsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestingUserId = claimsData.claims.sub as string;

    // Check if the requesting user is an admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUserId)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      console.error('Role check failed:', roleError);
      return new Response(
        JSON.stringify({ success: false, error: 'Only admins can delete users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user ID to delete from request body
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent self-deletion
    if (userId === requestingUserId) {
      return new Response(
        JSON.stringify({ success: false, error: 'You cannot delete your own account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.info(`Admin ${requestingUserId} deleting user: ${userId}`);

    // First, check if user exists in auth.users
    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    const userExistsInAuth = !getUserError && existingUser?.user;
    console.info(`User ${userId} exists in auth: ${userExistsInAuth}`);

    // 1) Clean up public tables FIRST to remove foreign key dependencies
    console.info(`Cleaning up related records for user: ${userId}`);
    
    // Nullify references in tables that should preserve data but remove user link
    await supabaseAdmin.from('local_mrs').update({ coordinator_id: null }).eq('coordinator_id', userId);
    await supabaseAdmin.from('farmers').update({ registered_by: null }).eq('registered_by', userId);
    
    // Delete or nullify records that reference this user as TOT/trainer/booker
    // For sales/visits/trainings/mechanisation - we delete the records as they belong to this user
    await supabaseAdmin.from('sales').delete().eq('tot_id', userId);
    await supabaseAdmin.from('visits').delete().eq('tot_id', userId);
    await supabaseAdmin.from('trainings').delete().eq('trainer_id', userId);
    await supabaseAdmin.from('mechanisation_jobs').delete().eq('tot_id', userId);
    await supabaseAdmin.from('machinery_bookings').delete().eq('booked_by', userId);
    
    // Delete from tables that directly reference auth.users
    await supabaseAdmin.from('tot_assignments').delete().eq('tot_id', userId);
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
    await supabaseAdmin.from('notification_settings').delete().eq('user_id', userId);
    await supabaseAdmin.from('notifications').delete().eq('user_id', userId);
    
    // Delete profile (which has FK to auth.users)
    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    if (profileError) {
      console.warn('Profile delete warning:', profileError);
    }

    // 2) Now delete auth user if it exists (email is freed for re-creation)
    if (userExistsInAuth) {
      console.info(`Deleting auth user: ${userId}`);
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        console.error('Delete auth user error:', deleteAuthError);
        return new Response(
          JSON.stringify({ success: false, error: deleteAuthError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.info(`User ${userId} deleted successfully from auth`);
    } else {
      console.info(`User ${userId} was already deleted from auth, cleaned up orphaned records`);
    }

    console.info(`User ${userId} deletion complete`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
