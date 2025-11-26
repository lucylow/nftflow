import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { collectionAddress, timeframe, metrics } = await req.json();
    
    console.log('Generating market insights for:', { collectionAddress, timeframe });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const context = `
Collection Address: ${collectionAddress}
Timeframe: ${timeframe || '24h'}
Total Volume: ${metrics?.totalVolume || 'N/A'} STT
Active Rentals: ${metrics?.activeRentals || 'N/A'}
Floor Price: ${metrics?.floorPrice || 'N/A'} STT
Average Duration: ${metrics?.avgDuration || 'N/A'} seconds
Unique Renters: ${metrics?.uniqueRenters || 'N/A'}
Growth Rate: ${metrics?.growthRate || 'N/A'}%

Analyze this Somnia NFT collection's market performance and provide:
1. Market sentiment (bullish/bearish/neutral)
2. Key trends and patterns
3. Actionable recommendations for NFT owners
4. Predicted market direction
5. Opportunities and risks
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert market analyst for NFT rentals on the Somnia blockchain. Provide data-driven insights and actionable recommendations based on on-chain metrics and market trends." 
          },
          { role: "user", content: context }
        ],
        tools: [
          {
            type: "function",
            name: "generate_market_insights",
            description: "Provide comprehensive market insights and recommendations",
            parameters: {
              type: "object",
              properties: {
                sentiment: { 
                  type: "string",
                  enum: ["bullish", "bearish", "neutral"],
                  description: "Overall market sentiment"
                },
                sentimentScore: { 
                  type: "number",
                  description: "Sentiment score from -100 (bearish) to +100 (bullish)"
                },
                trends: { 
                  type: "array",
                  items: { 
                    type: "object",
                    properties: {
                      trend: { type: "string" },
                      impact: { type: "string", enum: ["high", "medium", "low"] },
                      description: { type: "string" }
                    }
                  },
                  description: "Key market trends identified"
                },
                recommendations: { 
                  type: "array",
                  items: { 
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      rationale: { type: "string" }
                    }
                  },
                  description: "Actionable recommendations"
                },
                prediction: { 
                  type: "string",
                  description: "Short-term market direction prediction"
                },
                opportunities: { 
                  type: "array",
                  items: { type: "string" },
                  description: "Market opportunities"
                },
                risks: { 
                  type: "array",
                  items: { type: "string" },
                  description: "Market risks to watch"
                },
                summary: { 
                  type: "string",
                  description: "Executive summary of market insights"
                }
              },
              required: ["sentiment", "sentimentScore", "trends", "recommendations", "prediction", "opportunities", "risks", "summary"]
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_market_insights" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const insights = JSON.parse(toolCall.function.arguments);

    // Store in database
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from('market_insights').insert({
        collection_address: collectionAddress,
        timeframe,
        sentiment: insights.sentiment,
        sentiment_score: insights.sentimentScore,
        trends: insights.trends,
        recommendations: insights.recommendations,
        prediction: insights.prediction,
        opportunities: insights.opportunities,
        risks: insights.risks,
        summary: insights.summary,
        metrics
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        collectionAddress,
        timeframe,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in market-insights:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
