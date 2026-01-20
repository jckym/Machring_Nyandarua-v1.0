import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    // Find follow-ups due tomorrow that haven't been completed
    const { data: upcomingFollowUps, error: upcomingError } = await supabase
      .from('visits')
      .select(`
        id,
        tot_id,
        farmer_id,
        follow_up_date,
        purpose,
        farmers!visits_farmer_id_fkey(name)
      `)
      .eq('follow_up_required', true)
      .eq('follow_up_completed', false)
      .eq('follow_up_date', tomorrowStr);

    if (upcomingError) {
      console.error('Error fetching upcoming follow-ups:', upcomingError);
      throw upcomingError;
    }

    // Find overdue follow-ups (became overdue today)
    const { data: overdueFollowUps, error: overdueError } = await supabase
      .from('visits')
      .select(`
        id,
        tot_id,
        farmer_id,
        follow_up_date,
        purpose,
        farmers!visits_farmer_id_fkey(name)
      `)
      .eq('follow_up_required', true)
      .eq('follow_up_completed', false)
      .eq('follow_up_date', todayStr);

    if (overdueError) {
      console.error('Error fetching overdue follow-ups:', overdueError);
      throw overdueError;
    }

    let notificationsCreated = 0;

    // Send reminder notifications for tomorrow's follow-ups
    for (const visit of (upcomingFollowUps || [])) {
      const farmerName = (visit.farmers as any)?.name || 'a farmer';
      
      // Check if notification already sent today for this visit
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', visit.tot_id)
        .eq('link', `/visits/${visit.id}`)
        .eq('type', 'visit')
        .gte('created_at', todayStr)
        .single();

      if (!existingNotification) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: visit.tot_id,
            title: 'Follow-up Reminder',
            message: `Follow-up visit for ${farmerName} is scheduled for tomorrow.`,
            type: 'visit',
            link: `/visits/${visit.id}`,
          });

        if (!insertError) {
          notificationsCreated++;
          console.log(`Created reminder notification for visit ${visit.id}`);
        } else {
          console.error(`Failed to create notification for visit ${visit.id}:`, insertError);
        }
      }
    }

    // Send overdue notifications for today's missed follow-ups
    for (const visit of (overdueFollowUps || [])) {
      const farmerName = (visit.farmers as any)?.name || 'a farmer';
      
      // Check if overdue notification already sent today
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', visit.tot_id)
        .eq('link', `/visits/${visit.id}`)
        .ilike('title', '%Overdue%')
        .gte('created_at', todayStr)
        .single();

      if (!existingNotification) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: visit.tot_id,
            title: 'Overdue Follow-up',
            message: `Follow-up visit for ${farmerName} is now overdue. Please complete it as soon as possible.`,
            type: 'visit',
            link: `/visits/${visit.id}`,
          });

        if (!insertError) {
          notificationsCreated++;
          console.log(`Created overdue notification for visit ${visit.id}`);
        } else {
          console.error(`Failed to create overdue notification for visit ${visit.id}:`, insertError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        upcomingCount: upcomingFollowUps?.length || 0,
        overdueCount: overdueFollowUps?.length || 0,
        notificationsCreated,
        message: `Processed ${upcomingFollowUps?.length || 0} upcoming and ${overdueFollowUps?.length || 0} overdue follow-ups. Created ${notificationsCreated} notifications.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in followup-reminders function:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
