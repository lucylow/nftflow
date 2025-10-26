/**
 * React Hook for Backend AI Agent API
 */

import { useState, useCallback } from 'react';
import axios from 'axios';

interface RecommendationRequest {
  user: string;
  context?: {
    budget?: number;
    category?: string;
    minDuration?: number;
    maxDuration?: number;
  };
}

interface Recommendation {
  nftContract: string;
  tokenId: string;
  score: number;
  reason: string;
  listing?: {
    pricePerSecond: string;
    minDuration: number;
    maxDuration: number;
  };
}

interface PricingAnalysisRequest {
  nftContract: string;
  tokenId: string;
}

interface PricingAnalysis {
  nftContract: string;
  tokenId: string;
  optimalPrice: number;
  confidence: number;
  reasoning: string;
  utilizationProjection: number;
  revenueProjection: number;
  timestamp: number;
}

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:3002';

export function useAgentAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (request: RecommendationRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<Recommendation[]>(
        `${AGENT_API_URL}/api/agents/recommendations`,
        request
      );
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get recommendations';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzePricing = useCallback(async (request: PricingAnalysisRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<PricingAnalysis>(
        `${AGENT_API_URL}/api/agents/pricing`,
        request
      );
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze pricing';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getRecommendations,
    analyzePricing,
    loading,
    error,
  };
}

