// FIA daily executive briefing — role-aware, with dataset citations & adjustable thresholds
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Thresholds = {
  low_stock_buffer?: number;          // items at/under (min+buffer) flagged
  revenue_drop_pct?: number;          // negative pct that triggers alert
  overdue_followup_alert?: number;    // count threshold
  min_active_farmer_ratio?: number;   // active/total <= ratio triggers alert
};

const DEFAULT_THRESHOLDS: Required<Thresholds> = {
  low_stock_buffer: 0,
  revenue_drop_pct: -10,
  overdue_followup_alert: 5,
  min_active_farmer_ratio: 0.6,
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

    const body = await req.json().catch(() => ({}));
    const thresholds: Required<Thresholds> = { ...DEFAULT_THRESHOLDS, ...(body?.thresholds ?? {}) };

    const generatedAt = new Date().toISOString();
    const today = generatedAt.slice(0, 10);
    const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
    const sincePrev30 = new Date(Date.now() - 60 * 86400_000).toISOString();

    const [farmers, products, sales30, salesPrev30, mech, visits, trainings, totsCount] = await Promise.all([
      supabase.from("farmers").select("status", { count: "exact" }),
      supabase.from("products").select("name,stock_quantity,min_stock_level,unit"),
      supabase.from("sales").select("total_amount,profit_amount").gte("sale_date", since30),
      supabase.from("sales").select("total_amount").gte("sale_date", sincePrev30).lt("sale_date", since30),
      supabase.from("mechanisation_jobs").select("status,scheduled_date,total_cost").gte("scheduled_date", today),
      supabase.from("visits").select("follow_up_required,follow_up_completed,follow_up_date"),
      supabase.from("trainings").select("status,scheduled_date").gte("scheduled_date", since30.slice(0, 10)),
      supabase.from("user_roles").select("role", { count: "exact", head: true }).eq("role", "tot"),
    ]);

    const rev30 = (sales30.data ?? []).reduce((s, r) => s + Number(r.total_amount || 0), 0);
    const profit30 = (sales30.data ?? []).reduce((s, r) => s + Number(r.profit_amount || 0), 0);
    const revPrev = (salesPrev30.data ?? []).reduce((s, r) => s + Number(r.total_amount || 0), 0);
    const revChangePct = revPrev > 0 ? ((rev30 - revPrev) / revPrev) * 100 : null;
    const lowStock = (products.data ?? []).filter((p) => (p.stock_quantity ?? 0) <= ((p.min_stock_level ?? 0) + thresholds.low_stock_buffer));
    const overdue = (visits.data ?? []).filter((v) => v.follow_up_required && !v.follow_up_completed && v.follow_up_date && v.follow_up_date < today);
    const upcomingMech = (mech.data ?? []).filter((m) => m.status === "pending" || m.status === "scheduled");
    const activeFarmers = (farmers.data ?? []).filter((f) => f.status === "active").length;
    const totalFarmers = farmers.count ?? farmers.data?.length ?? 0;
    const activeRatio = totalFarmers > 0 ? activeFarmers / totalFarmers : 0;

    const datasets_used = [
      `farmers (${totalFarmers} rows)`,
      `products (${products.data?.length ?? 0})`,
      `sales last 30d (${sales30.data?.length ?? 0})`,
      `sales prior 30d (${salesPrev30.data?.length ?? 0})`,
      `mechanisation upcoming (${mech.data?.length ?? 0})`,
      `visits (${visits.data?.length ?? 0})`,
      `trainings 30d (${trainings.data?.length ?? 0})`,
      `tots (${totsCount.count ?? 0})`,
    ];

    const snapshot = {
      date: today,
      generated_at: generatedAt,
      role,
      thresholds,
      datasets_used,
      farmers_total: totalFarmers,
      farmers_active: activeFarmers,
      farmers_active_ratio: Number(activeRatio.toFixed(3)),
      revenue_30d: rev30,
      revenue_change_pct_vs_prior_30d: revChangePct,
      profit_30d: profit30,
      sales_count_30d: sales30.data?.length ?? 0,
      low_stock: lowStock.map((p) => ({ name: p.name, stock: p.stock_quantity, min: p.min_stock_level, unit: p.unit })),
      overdue_followups: overdue.length,
      upcoming_mechanisation_jobs: upcomingMech.length,
      trainings_30d: trainings.data?.length ?? 0,
      tots_total: totsCount.count ?? 0,
      alerts_triggered: {
        revenue_drop: revChangePct !== null && revChangePct <= thresholds.revenue_drop_pct,
        many_overdue: overdue.length >= thresholds.overdue_followup_alert,
        low_active_ratio: activeRatio <= thresholds.min_active_farmer_ratio,
        low_stock_any: lowStock.length > 0,
      },
    };

    const roleFocus = role === "admin"
      ? "Focus on org-wide health, compliance, user activity, and strategic risks. Surface admin actions (e.g., reassign TOTs, deactivate stale users, audit anomalies)."
      : "Focus on operational performance: revenue trend, MR effectiveness, follow-ups, mechanisation throughput. Surface manager actions (e.g., coach lagging MR, push promo, restock).";

    const prompt = `You are FIA, executive farm assistant for MR Nyandarua. Audience role: ${role}.
${roleFocus}

Produce a SHORT executive briefing in JSON with this exact shape:
{
  "greeting": "Good morning, ${role === 'admin' ? 'Admin' : 'Manager'}.",
  "summary_bullets": ["max 5 short bullets, each <120 chars, cite real numbers from snapshot"],
  "recommended_actions": [{ "title": "...", "priority": "high|medium|low", "rationale": "<100 chars", "dataset": "which snapshot field this came from" }],
  "datasets_cited": ["names of snapshot fields/datasets you used"]
}
Use ONLY the snapshot. Currency KES. Honor the thresholds for what counts as an alert. Return ONLY valid JSON, no prose, no markdown fences.

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

    return new Response(JSON.stringify({ briefing: parsed, snapshot, generated_at: generatedAt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
