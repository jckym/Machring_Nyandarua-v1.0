// FIA - Farm Intelligence Agent chat (streaming)
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const DASHBOARD_PROMPT = `You are FIA (Farm Intelligence Agent), the AI executive assistant for "Machinery Ring Nyandarua", an agricultural management platform in Nyandarua, Kenya.

You serve as: Executive Assistant, Farm Operations Manager, Agronomist, Financial Analyst, Supply Chain Coordinator, and Risk Advisor.

You will receive a JSON snapshot of REAL farm data (farmers, products/inventory, sales, mechanisation jobs, trainings, visits) in the user message. Ground every answer in that data — cite specific numbers. If the data needed is not in the snapshot (e.g. livestock, weather, employees/HR, market prices), say so honestly and recommend what to track.

Style:
- Concise. Use markdown. Lead with the answer, then 2-5 bullet insights, then 1-3 recommended actions.
- All money in KES.
- Tone: confident, advisory, executive-grade.

MANDATORY FOOTER — every answer must end with a small markdown block:
> **Sources:** <comma-separated dataset names you used, e.g. sales (30d), products, visits>
> **Snapshot:** <ISO timestamp from snapshot.generated_at>

If a question can't be answered from the snapshot, still include the footer and list which datasets are missing.`;

const GENERAL_PROMPT = `You are FIA (Farm Intelligence Agent) in **General Knowledge** mode, the AI advisor for Machinery Ring Nyandarua leadership (Admin/Manager).

In this mode you do NOT have access to the platform's live data. Instead, act as a broad expert advisor on:
- Agronomy & crop science (potato, barley, dairy, horticulture — especially Kenya/Nyandarua context)
- Agribusiness strategy, market trends, pricing, exports
- Farm mechanisation, equipment, maintenance
- Weather & climate adaptation
- Finance, accounting, taxation, KRA & SACCO matters
- HR, leadership, management best practices
- Technology, AI, digital tools for agriculture
- Any general knowledge question the user asks (geography, history, science, etc.)

Style:
- Concise, markdown formatted. Lead with the answer, then bullet insights, then recommended actions when relevant.
- Use KES for money unless another currency is implied.
- Be confident, advisory, executive-grade.
- If the user asks something dashboard-specific (their farmers, their sales, low stock), remind them to switch to **Dashboard mode** for live data.`;

async function getFarmContext(supabase: ReturnType<typeof createClient>) {
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const [farmers, products, sales, mech, trainings, visits, localMrs] = await Promise.all([
    supabase.from("farmers").select("id,name,sub_county,ward,crops,status", { count: "exact", head: false }).limit(500),
    supabase.from("products").select("name,category,unit,buying_price,selling_price,stock_quantity,min_stock_level,status"),
    supabase.from("sales").select("total_amount,profit_amount,quantity,sale_date,payment_status,product_id").gte("sale_date", since).limit(1000),
    supabase.from("mechanisation_jobs").select("service_type,status,total_cost,area_acres,scheduled_date").gte("scheduled_date", since.slice(0,10)).limit(500),
    supabase.from("trainings").select("title,training_type,status,scheduled_date").gte("scheduled_date", since.slice(0,10)).limit(200),
    supabase.from("visits").select("purpose,visit_date,follow_up_required,follow_up_completed,follow_up_date").gte("visit_date", since).limit(500),
    supabase.from("local_mrs").select("name,region,county,sub_county,ward,status"),
  ]);

  const salesData = sales.data ?? [];
  const totalRevenue30d = salesData.reduce((s, r) => s + Number(r.total_amount || 0), 0);
  const totalProfit30d = salesData.reduce((s, r) => s + Number(r.profit_amount || 0), 0);
  const lowStock = (products.data ?? []).filter((p) => (p.stock_quantity ?? 0) <= (p.min_stock_level ?? 0));
  const overdueFollowUps = (visits.data ?? []).filter((v) => v.follow_up_required && !v.follow_up_completed && v.follow_up_date && v.follow_up_date < new Date().toISOString().slice(0,10));

  return {
    generated_at: new Date().toISOString(),
    summary: {
      total_farmers: farmers.count ?? farmers.data?.length ?? 0,
      total_products: products.data?.length ?? 0,
      low_stock_count: lowStock.length,
      sales_last_30d_count: salesData.length,
      revenue_last_30d_kes: totalRevenue30d,
      profit_last_30d_kes: totalProfit30d,
      mechanisation_jobs_30d: mech.data?.length ?? 0,
      trainings_30d: trainings.data?.length ?? 0,
      overdue_followups: overdueFollowUps.length,
      active_local_mrs: (localMrs.data ?? []).filter((l) => l.status === "active").length,
    },
    low_stock_items: lowStock.map((p) => ({ name: p.name, stock: p.stock_quantity, min: p.min_stock_level, unit: p.unit })),
    products_top: (products.data ?? []).slice(0, 30),
    sales_recent_sample: salesData.slice(0, 50),
    mechanisation_recent: mech.data ?? [],
    trainings_recent: trainings.data ?? [],
    overdue_followups_sample: overdueFollowUps.slice(0, 20),
    local_mrs: localMrs.data ?? [],
    farmers_by_subcounty: Object.entries(
      (farmers.data ?? []).reduce<Record<string, number>>((acc, f) => {
        const k = (f.sub_county as string) || "Unknown";
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {})
    ).map(([sub_county, count]) => ({ sub_county, count })),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Verify user & role (admin/manager only)
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
      return new Response(JSON.stringify({ error: "FIA is available to Admin and Manager roles only." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const mode: "dashboard" | "general" = body?.mode === "general" ? "general" : "dashboard";

    const systemMessages: { role: string; content: string }[] = [
      { role: "system", content: mode === "general" ? GENERAL_PROMPT : DASHBOARD_PROMPT },
    ];

    if (mode === "dashboard") {
      const ctx = await getFarmContext(supabase);
      systemMessages.push({
        role: "system",
        content: `Current farm data snapshot (JSON):\n\n${JSON.stringify(ctx)}\n\nUse this data to answer the next user question.`,
      });
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [...systemMessages, ...messages],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      if (upstream.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (upstream.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace billing." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: `AI gateway error: ${text}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
