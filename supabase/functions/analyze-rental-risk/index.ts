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
    const { renterAddress, nftValue, duration, rentalHistory } = await req.json();
    
    console.log('Analyzing rental risk for:', { renterAddress, nftValue, duration });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const context = `
Renter Address: ${renterAddress}
NFT Value: ${nftValue} STT
Rental Duration: ${duration} seconds
Previous Rentals: ${rentalHistory?.totalRentals || 0}
Average Rating: ${rentalHistory?.avgRating || 'N/A'}
Late Returns: ${rentalHistory?.lateReturns || 0}
Disputes: ${rentalHistory?.disputes || 0}

Analyze the risk of renting to this user on Somnia blockchain and provide:
1. Risk level (low/medium/high/critical)
2. Recommended collateral percentage
3. Key risk factors
4. Mitigation strategies
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
            content: "You are an expert risk assessment analyst for NFT rentals on the Somnia blockchain. Provide thorough risk analysis based on on-chain data and user history." 
          },
          { role: "user", content: context }
        ],
        tools: [
          {
            type: "function",
            name: "assess_rental_risk",
            description: "Provide comprehensive rental risk assessment",
            parameters: {
              type: "object",
              properties: {
                riskLevel: { 
                  type: "string",
                  enum: ["low", "medium", "high", "critical"],
                  description: "Overall risk level"
                },
                collateralPercentage: { 
                  type: "number",
                  description: "Recommended collateral as percentage of NFT value (100-200)"
                },
                riskScore: { 
                  type: "number",
                  description: "Risk score from 0-100"
                },
                riskFactors: { 
                  type: "array",
                  items: { type: "string" },
                  description: "Key risk factors identified"
                },
                mitigationStrategies: { 
                  type: "array",
                  items: { type: "string" },
                  description: "Recommended strategies to mitigate risk"
                },
                explanation: { 
                  type: "string",
                  description: "Detailed explanation of the risk assessment"
                }
              },
              required: ["riskLevel", "collateralPercentage", "riskScore", "riskFactors", "mitigationStrategies", "explanation"]
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "assess_rental_risk" } }
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

    const assessment = JSON.parse(toolCall.function.arguments);

    // Store in database
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from('rental_risk_assessments').insert({
        renter_address: renterAddress,
        nft_value,
        duration,
        risk_level: assessment.riskLevel,
        collateral_percentage: assessment.collateralPercentage,
        risk_score: assessment.riskScore,
        risk_factors: assessment.riskFactors,
        mitigation_strategies: assessment.mitigationStrategies,
        explanation: assessment.explanation,
        rental_history: rentalHistory
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        assessment,
        renterAddress,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in analyze-rental-risk:", error);
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
