// FIA daily executive briefing (one-shot JSON)
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
    const role = roleRow?.role;
    if (role !== "admin" && role !== "manager") {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build snapshot
    const today = new Date().toISOString().slice(0, 10);
    const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
    const sincePrev30 = new Date(Date.now() - 60 * 86400_000).toISOString();

    const [farmers, products, sales30, salesPrev30, mech, visits] = await Promise.all([
      supabase.from("farmers").select("id", { count: "exact", head: true }),
      supabase.from("products").select("name,stock_quantity,min_stock_level,unit"),
      supabase.from("sales").select("total_amount,profit_amount").gte("sale_date", since30),
      supabase.from("sales").select("total_amount").gte("sale_date", sincePrev30).lt("sale_date", since30),
      supabase.from("mechanisation_jobs").select("status,scheduled_date").gte("scheduled_date", today),
      supabase.from("visits").select("follow_up_required,follow_up_completed,follow_up_date"),
    ]);

    const rev30 = (sales30.data ?? []).reduce((s, r) => s + Number(r.total_amount || 0), 0);
    const profit30 = (sales30.data ?? []).reduce((s, r) => s + Number(r.profit_amount || 0), 0);
    const revPrev = (salesPrev30.data ?? []).reduce((s, r) => s + Number(r.total_amount || 0), 0);
    const revChangePct = revPrev > 0 ? ((rev30 - revPrev) / revPrev) * 100 : null;
    const lowStock = (products.data ?? []).filter((p) => (p.stock_quantity ?? 0) <= (p.min_stock_level ?? 0));
    const overdue = (visits.data ?? []).filter((v) => v.follow_up_required && !v.follow_up_completed && v.follow_up_date && v.follow_up_date < today);
    const upcomingMech = (mech.data ?? []).filter((m) => m.status === "pending" || m.status === "scheduled");

    const snapshot = {
      date: today,
      farmers_total: farmers.count ?? 0,
      revenue_30d: rev30,
      revenue_change_pct_vs_prior_30d: revChangePct,
      profit_30d: profit30,
      sales_count_30d: sales30.data?.length ?? 0,
      low_stock: lowStock.map((p) => ({ name: p.name, stock: p.stock_quantity, min: p.min_stock_level, unit: p.unit })),
      overdue_followups: overdue.length,
      upcoming_mechanisation_jobs: upcomingMech.length,
    };

    const prompt = `You are FIA, executive farm assistant for MR Nyandarua. Produce a SHORT executive briefing in JSON with this exact shape:
{
  "greeting": "Good morning, Manager." | "Good afternoon, Manager." etc,
  "summary_bullets": ["max 5 short bullets, each <100 chars, citing real numbers"],
  "recommended_actions": [{ "title": "...", "priority": "high|medium|low", "rationale": "<80 chars" }]
}
Use ONLY the snapshot below. Currency KES. Return ONLY valid JSON, no prose, no markdown fences.

Snapshot:
${JSON.stringify(snapshot)}`;

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 500;
      return new Response(JSON.stringify({ error: `AI gateway: ${text}`, snapshot }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await upstream.json();
    let parsed: unknown = null;
    try { parsed = JSON.parse(data?.choices?.[0]?.message?.content ?? "{}"); } catch { parsed = {}; }

    return new Response(JSON.stringify({ briefing: parsed, snapshot }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
