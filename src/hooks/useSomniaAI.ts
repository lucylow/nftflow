import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MarketData {
  floorPrice?: number;
  volume24h?: number;
  trending?: boolean;
  avgRentalDuration?: number;
}

interface RentalHistory {
  totalRentals?: number;
  avgRating?: number;
  lateReturns?: number;
  disputes?: number;
}

interface MarketMetrics {
  totalVolume?: number;
  activeRentals?: number;
  floorPrice?: number;
  avgDuration?: number;
  uniqueRenters?: number;
  growthRate?: number;
}

interface PricingAnalysis {
  optimalPrice: number;
  confidence: number;
  marketTrend: 'bullish' | 'bearish' | 'stable';
  reasoning: string;
  strategy: string;
  fullText?: string;
}

interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  collateralPercentage: number;
  riskScore: number;
  riskFactors: string[];
  mitigationStrategies: string[];
  explanation: string;
}

interface MarketInsights {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  trends: Array<{
    trend: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
  }>;
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    rationale: string;
  }>;
  prediction: string;
  opportunities: string[];
  risks: string[];
  summary: string;
}

export const useSomniaAI = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePricingStream = async (
    nftAddress: string,
    tokenId: string,
    marketData?: MarketData,
    onStream?: (text: string) => void
  ): Promise<PricingAnalysis | null> => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(
        `https://pbpmhxewduhmyyloujvv.supabase.co/functions/v1/analyze-nft-pricing-stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nftAddress, tokenId, marketData })
        }
      );

      if (!response.ok) throw new Error('Stream failed');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      let finalAnalysis: PricingAnalysis | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          const data = line.slice(6).trim();
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.delta) {
              fullText += parsed.delta;
              onStream?.(fullText);
            }
            
            if (parsed.done && parsed.analysis) {
              finalAnalysis = parsed.analysis;
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }

      toast({
        title: "Pricing Analysis Complete",
        description: finalAnalysis ? `Confidence: ${finalAnalysis.confidence}%` : "Analysis finished",
      });

      return finalAnalysis;
    } catch (error) {
      console.error('Streaming analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze pricing",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzePricing = async (
    nftAddress: string,
    tokenId: string,
    marketData?: MarketData
  ): Promise<PricingAnalysis | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-nft-pricing', {
        body: { nftAddress, tokenId, marketData }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      toast({
        title: "Pricing Analysis Complete",
        description: `Confidence: ${data.analysis.confidence}% - ${data.analysis.marketTrend} market`,
      });

      return data.analysis;
    } catch (error) {
      console.error('Pricing analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze pricing",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const assessRisk = async (
    renterAddress: string,
    nftValue: number,
    duration: number,
    rentalHistory?: RentalHistory
  ): Promise<RiskAssessment | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-rental-risk', {
        body: { renterAddress, nftValue, duration, rentalHistory }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Assessment failed');
      }

      toast({
        title: "Risk Assessment Complete",
        description: `Risk Level: ${data.assessment.riskLevel.toUpperCase()} - Score: ${data.assessment.riskScore}`,
      });

      return data.assessment;
    } catch (error) {
      console.error('Risk assessment error:', error);
      toast({
        title: "Assessment Failed",
        description: error instanceof Error ? error.message : "Failed to assess risk",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMarketInsights = async (
    collectionAddress: string,
    timeframe?: string,
    metrics?: MarketMetrics
  ): Promise<MarketInsights | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-insights', {
        body: { collectionAddress, timeframe, metrics }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Insights generation failed');
      }

      toast({
        title: "Market Insights Generated",
        description: `Sentiment: ${data.insights.sentiment.toUpperCase()} (${data.insights.sentimentScore > 0 ? '+' : ''}${data.insights.sentimentScore})`,
      });

      return data.insights;
    } catch (error) {
      console.error('Market insights error:', error);
      toast({
        title: "Insights Failed",
        description: error instanceof Error ? error.message : "Failed to generate insights",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzePricing,
    analyzePricingStream,
    assessRisk,
    getMarketInsights,
    isAnalyzing,
  };
};
