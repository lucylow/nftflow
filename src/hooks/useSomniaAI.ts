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
    assessRisk,
    getMarketInsights,
    isAnalyzing,
  };
};
