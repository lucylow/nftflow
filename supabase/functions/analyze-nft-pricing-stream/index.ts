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
    const { nftAddress, tokenId, marketData } = await req.json();
    
    console.log('Streaming NFT pricing analysis for:', { nftAddress, tokenId });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const context = `
NFT Contract: ${nftAddress}
Token ID: ${tokenId}
Current Floor Price: ${marketData?.floorPrice || 'N/A'} STT
24h Volume: ${marketData?.volume24h || 'N/A'}
Trending: ${marketData?.trending ? 'Yes' : 'No'}
Average Rental Duration: ${marketData?.avgRentalDuration || 'N/A'} seconds

Analyze this Somnia NFT and provide optimal rental pricing strategy.
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
            content: "You are an expert NFT pricing analyst for Somnia blockchain. Provide concise, data-driven recommendations." 
          },
          { role: "user", content: context }
        ],
        stream: true,
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
          JSON.stringify({ error: "Payment required. Please add credits." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim() || line.startsWith(':')) continue;
              if (!line.startsWith('data: ')) continue;

              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullText += content;
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify({ delta: content })}\n\n`)
                  );
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }

          // Parse the complete response to extract structured data
          const analysis = extractPricingData(fullText);
          
          // Store in database
          if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
            await supabase.from('nft_pricing_analyses').insert({
              nft_address: nftAddress,
              token_id: tokenId,
              optimal_price: analysis.optimalPrice,
              confidence: analysis.confidence,
              market_trend: analysis.marketTrend,
              reasoning: analysis.reasoning,
              strategy: analysis.strategy,
              market_data: marketData
            });
          }

          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ 
              done: true, 
              analysis: { fullText, ...analysis }
            })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Error in analyze-nft-pricing-stream:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

function extractPricingData(text: string) {
  // Simple extraction logic - in production, use structured output
  const priceMatch = text.match(/(\d+\.?\d*)\s*STT/i);
  const confidenceMatch = text.match(/(\d+)%/);
  
  let marketTrend: 'bullish' | 'bearish' | 'stable' = 'stable';
  if (text.toLowerCase().includes('bullish') || text.toLowerCase().includes('upward')) {
    marketTrend = 'bullish';
  } else if (text.toLowerCase().includes('bearish') || text.toLowerCase().includes('downward')) {
    marketTrend = 'bearish';
  }

  return {
    optimalPrice: priceMatch ? parseFloat(priceMatch[1]) : 0.001,
    confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 75,
    marketTrend,
    reasoning: text.slice(0, 500),
    strategy: text.slice(0, 300)
  };
}
