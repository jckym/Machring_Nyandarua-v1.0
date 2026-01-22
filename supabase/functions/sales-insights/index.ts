import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get auth header to verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch recent sales data for analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentSales, error: salesError } = await supabase
      .from("sales")
      .select(`
        id,
        quantity,
        total_amount,
        commission_amount,
        sale_date,
        payment_status,
        products!inner(name, category)
      `)
      .gte("sale_date", thirtyDaysAgo.toISOString())
      .order("sale_date", { ascending: false })
      .limit(100);

    if (salesError) {
      console.error("Sales fetch error:", salesError);
      throw new Error("Failed to fetch sales data");
    }

    // Fetch previous period for comparison
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: previousSales } = await supabase
      .from("sales")
      .select("total_amount, quantity")
      .gte("sale_date", sixtyDaysAgo.toISOString())
      .lt("sale_date", thirtyDaysAgo.toISOString());

    // Fetch product stock levels
    const { data: products } = await supabase
      .from("products")
      .select("name, stock_quantity, min_stock_level, category")
      .eq("status", "active");

    // Aggregate sales data
    const currentPeriodTotal = recentSales?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
    const previousPeriodTotal = previousSales?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
    const currentQuantity = recentSales?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;
    const previousQuantity = previousSales?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;

    // Calculate product category breakdown
    const categoryBreakdown: Record<string, { count: number; revenue: number }> = {};
    recentSales?.forEach((sale: any) => {
      const product = Array.isArray(sale.products) ? sale.products[0] : sale.products;
      const category = product?.category || "Other";
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { count: 0, revenue: 0 };
      }
      categoryBreakdown[category].count += 1;
      categoryBreakdown[category].revenue += sale.total_amount || 0;
    });

    // Find low stock products
    const lowStockProducts = products?.filter(
      (p) => p.stock_quantity <= p.min_stock_level
    ) || [];

    // Prepare context for AI
    const salesContext = {
      period: "Last 30 days",
      totalSales: recentSales?.length || 0,
      totalRevenue: currentPeriodTotal,
      previousPeriodRevenue: previousPeriodTotal,
      revenueChange: previousPeriodTotal > 0 
        ? ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal * 100).toFixed(1)
        : "N/A",
      totalQuantitySold: currentQuantity,
      previousQuantity: previousQuantity,
      categoryBreakdown,
      lowStockProducts: lowStockProducts.map(p => p.name),
      topProducts: Object.entries(categoryBreakdown)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(([cat, data]) => ({ category: cat, revenue: data.revenue })),
    };

    // Call Lovable AI for insights
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a sales analytics expert for an agricultural machinery and products company in Kenya. 
Analyze the provided sales data and give actionable insights. Be concise and practical.
Format your response as JSON with the following structure:
{
  "summary": "Brief 1-2 sentence overview of current performance",
  "trend": "up" | "down" | "stable",
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "alerts": ["alert1 if any critical issues"]
}
Keep insights and recommendations to 3 items each, each under 100 characters.
Focus on: revenue trends, product performance, stock issues, and growth opportunities.`,
          },
          {
            role: "user",
            content: `Analyze this sales data and provide insights:\n${JSON.stringify(salesContext, null, 2)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          fallback: true,
          data: generateFallbackInsights(salesContext)
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI credits exhausted. Using basic analysis.",
          fallback: true,
          data: generateFallbackInsights(salesContext)
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    // Parse AI response
    let insights;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      insights = generateFallbackInsights(salesContext);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: insights,
      context: {
        totalSales: salesContext.totalSales,
        totalRevenue: salesContext.totalRevenue,
        revenueChange: salesContext.revenueChange,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Sales insights error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      fallback: true,
      data: {
        summary: "Unable to generate AI insights at this time.",
        trend: "stable",
        insights: ["Check back later for AI-powered analysis"],
        recommendations: ["Continue monitoring your sales trends"],
        alerts: []
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateFallbackInsights(context: any) {
  const revenueChange = parseFloat(context.revenueChange) || 0;
  const trend = revenueChange > 5 ? "up" : revenueChange < -5 ? "down" : "stable";
  
  return {
    summary: `${context.totalSales} sales totaling KES ${(context.totalRevenue / 1000).toFixed(0)}K in the last 30 days.`,
    trend,
    insights: [
      `Revenue ${revenueChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(revenueChange).toFixed(1)}% vs previous period`,
      context.lowStockProducts.length > 0 
        ? `${context.lowStockProducts.length} products are running low on stock`
        : "All products have adequate stock levels",
      `Top category: ${Object.keys(context.categoryBreakdown)[0] || 'N/A'}`
    ],
    recommendations: [
      "Review top-selling products for restocking",
      "Focus on high-margin product categories",
      "Follow up with inactive farmers"
    ],
    alerts: context.lowStockProducts.length > 3 
      ? [`Critical: ${context.lowStockProducts.length} products need restocking`] 
      : []
  };
}
