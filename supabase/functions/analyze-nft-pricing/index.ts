import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nftAddress, tokenId, marketData } = await req.json();
    
    console.log('Analyzing NFT pricing for:', { nftAddress, tokenId });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare context from Somnia data streams
    const context = `
NFT Contract: ${nftAddress}
Token ID: ${tokenId}
Current Floor Price: ${marketData?.floorPrice || 'N/A'} STT
24h Volume: ${marketData?.volume24h || 'N/A'}
Trending: ${marketData?.trending ? 'Yes' : 'No'}
Average Rental Duration: ${marketData?.avgRentalDuration || 'N/A'} seconds

Analyze this Somnia NFT and provide:
1. Optimal rental price per second (in STT)
2. Confidence level (0-100%)
3. Market trend analysis
4. Pricing strategy recommendation
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
            content: "You are an expert NFT pricing analyst specializing in the Somnia blockchain. Provide data-driven pricing recommendations based on market data." 
          },
          { role: "user", content: context }
        ],
        tools: [
          {
            type: "function",
            name: "provide_pricing_analysis",
            description: "Provide comprehensive NFT rental pricing analysis",
            parameters: {
              type: "object",
              properties: {
                optimalPrice: { 
                  type: "number",
                  description: "Optimal rental price per second in STT"
                },
                confidence: { 
                  type: "number",
                  description: "Confidence level from 0-100"
                },
                marketTrend: { 
                  type: "string",
                  enum: ["bullish", "bearish", "stable"],
                  description: "Current market trend"
                },
                reasoning: { 
                  type: "string",
                  description: "Detailed explanation of the pricing recommendation"
                },
                strategy: { 
                  type: "string",
                  description: "Recommended pricing strategy"
                }
              },
              required: ["optimalPrice", "confidence", "marketTrend", "reasoning", "strategy"]
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_pricing_analysis" } }
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

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        nftAddress,
        tokenId,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in analyze-nft-pricing:", error);
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
