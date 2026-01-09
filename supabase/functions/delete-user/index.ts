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

    // Verify the JWT and get claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabaseAdmin.auth.getUser(token);
    
    if (claimsError || !claims.user) {
      console.error('Auth error:', claimsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestingUserId = claims.user.id;

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

    // Delete the user from auth.users (this will cascade to profiles due to FK)
    // The profiles delete trigger will then clean up user_roles, tot_assignments, etc.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Delete user error:', deleteError);
      return new Response(
        JSON.stringify({ success: false, error: deleteError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.info(`User ${userId} deleted successfully`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
