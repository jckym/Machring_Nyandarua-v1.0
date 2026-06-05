// FIA Insights — Farm Health Score + Production/Financial/Inventory/Workforce cards
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function clamp(n: number, min = 0, max = 100) { return Math.max(min, Math.min(max, n)); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
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

    const generated_at = new Date().toISOString();
    const today = generated_at.slice(0, 10);
    const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
    const sincePrev30 = new Date(Date.now() - 60 * 86400_000).toISOString();

    const [farmers, products, sales30, salesPrev30, mech30, visits30, trainings30, tots] = await Promise.all([
      supabase.from("farmers").select("id,status,last_activity_date", { count: "exact" }),
      supabase.from("products").select("name,stock_quantity,min_stock_level,unit,buying_price,selling_price"),
      supabase.from("sales").select("total_amount,profit_amount,quantity,product_id,sale_date,payment_status").gte("sale_date", since30),
      supabase.from("sales").select("total_amount,profit_amount").gte("sale_date", sincePrev30).lt("sale_date", since30),
      supabase.from("mechanisation_jobs").select("status,scheduled_date,total_cost,area_acres").gte("scheduled_date", since30.slice(0, 10)),
      supabase.from("visits").select("follow_up_required,follow_up_completed,follow_up_date,visit_date").gte("visit_date", since30),
      supabase.from("trainings").select("status,scheduled_date").gte("scheduled_date", since30.slice(0, 10)),
      supabase.from("user_roles").select("user_id", { count: "exact" }).in("role", ["tot", "local_mr_coordinator"]),
    ]);

    const totalFarmers = farmers.count ?? 0;
    const activeFarmers = (farmers.data ?? []).filter((f) => f.status === "active").length;
    const activeRatio = totalFarmers > 0 ? activeFarmers / totalFarmers : 0;

    const rev30 = (sales30.data ?? []).reduce((s, r) => s + Number(r.total_amount || 0), 0);
    const profit30 = (sales30.data ?? []).reduce((s, r) => s + Number(r.profit_amount || 0), 0);
    const revPrev = (salesPrev30.data ?? []).reduce((s, r) => s + Number(r.total_amount || 0), 0);
    const revChangePct = revPrev > 0 ? ((rev30 - revPrev) / revPrev) * 100 : null;
    const profitMargin = rev30 > 0 ? (profit30 / rev30) * 100 : 0;
    const paidPct = (sales30.data ?? []).length > 0
      ? ((sales30.data ?? []).filter((s) => s.payment_status === "paid").length / sales30.data!.length) * 100
      : 0;

    const lowStock = (products.data ?? []).filter((p) => (p.stock_quantity ?? 0) <= (p.min_stock_level ?? 0));
    const stockHealth = (products.data ?? []).length > 0
      ? (1 - lowStock.length / products.data!.length) * 100
      : 100;
    const inventoryValue = (products.data ?? []).reduce((s, p) => s + Number(p.stock_quantity || 0) * Number(p.buying_price || 0), 0);

    const completedMech = (mech30.data ?? []).filter((m) => m.status === "completed").length;
    const totalMech = (mech30.data ?? []).length;
    const mechCompletion = totalMech > 0 ? (completedMech / totalMech) * 100 : 0;
    const acresServiced = (mech30.data ?? []).reduce((s, m) => s + Number(m.area_acres || 0), 0);

    const overdue = (visits30.data ?? []).filter((v) => v.follow_up_required && !v.follow_up_completed && v.follow_up_date && v.follow_up_date < today).length;
    const completedTrainings = (trainings30.data ?? []).filter((t) => t.status === "completed").length;
    const workforce = tots.count ?? 0;

    // Sub-scores 0-100
    const productionScore = clamp((mechCompletion * 0.6) + (Math.min(acresServiced, 200) / 200 * 100 * 0.4));
    const financialScore = clamp(
      (Math.min(Math.max(revChangePct ?? 0, -50), 50) + 50) * 0.4 +  // -50..50 -> 0..40
      clamp(profitMargin * 2) * 0.3 +
      paidPct * 0.3
    );
    const inventoryScore = clamp(stockHealth);
    const workforceScore = clamp(
      activeRatio * 100 * 0.5 +
      clamp(100 - overdue * 5) * 0.3 +
      (workforce > 0 ? 100 : 0) * 0.2
    );
    const farmHealthScore = Math.round((productionScore + financialScore + inventoryScore + workforceScore) / 4);

    const ratingFor = (s: number) => s >= 80 ? "excellent" : s >= 60 ? "good" : s >= 40 ? "fair" : "poor";

    return new Response(JSON.stringify({
      generated_at,
      role,
      farm_health_score: farmHealthScore,
      farm_health_rating: ratingFor(farmHealthScore),
      cards: {
        production: {
          score: Math.round(productionScore),
          rating: ratingFor(productionScore),
          metrics: {
            mechanisation_jobs_30d: totalMech,
            completed_jobs: completedMech,
            completion_rate_pct: Math.round(mechCompletion),
            acres_serviced: acresServiced,
            trainings_completed_30d: completedTrainings,
          },
          datasets_used: ["mechanisation_jobs", "trainings"],
        },
        financial: {
          score: Math.round(financialScore),
          rating: ratingFor(financialScore),
          metrics: {
            revenue_30d_kes: rev30,
            profit_30d_kes: profit30,
            profit_margin_pct: Number(profitMargin.toFixed(1)),
            revenue_change_pct: revChangePct === null ? null : Number(revChangePct.toFixed(1)),
            paid_sales_pct: Math.round(paidPct),
          },
          datasets_used: ["sales (last 30d)", "sales (prior 30d)"],
        },
        inventory: {
          score: Math.round(inventoryScore),
          rating: ratingFor(inventoryScore),
          metrics: {
            total_products: (products.data ?? []).length,
            low_stock_count: lowStock.length,
            stock_health_pct: Math.round(stockHealth),
            inventory_value_kes: Math.round(inventoryValue),
          },
          low_stock_items: lowStock.slice(0, 10).map((p) => ({ name: p.name, stock: p.stock_quantity, min: p.min_stock_level, unit: p.unit })),
          datasets_used: ["products"],
        },
        workforce: {
          score: Math.round(workforceScore),
          rating: ratingFor(workforceScore),
          metrics: {
            total_farmers: totalFarmers,
            active_farmers: activeFarmers,
            active_ratio_pct: Math.round(activeRatio * 100),
            overdue_followups: overdue,
            field_staff: workforce,
          },
          datasets_used: ["farmers", "visits", "user_roles"],
        },
      },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
