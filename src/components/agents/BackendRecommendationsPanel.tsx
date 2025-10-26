/**
 * Backend Agent Recommendations Panel
 * Displays recommendations from the backend AI agent service
 */

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAgentAPI } from '@/hooks/useAgentAPI';
import { Sparkles, TrendingUp, Clock, Tag } from 'lucide-react';

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

export function BackendRecommendationsPanel() {
  const { address, isConnected } = useAccount();
  const { getRecommendations, loading, error } = useAgentAPI();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (isConnected && address) {
      loadRecommendations();
    }
  }, [isConnected, address]);

  const loadRecommendations = async () => {
    if (!address) return;

    try {
      const results = await getRecommendations({
        user: address,
        context: {
          budget: 0.001,
        },
      });
      setRecommendations(results);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 text-center text-gray-500">
        Connect your wallet to get AI-powered recommendations
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-500">🤖 AI is analyzing your preferences...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">
          ⚠️ {error}
        </p>
        <button
          onClick={loadRecommendations}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p>No recommendations available yet</p>
        <p className="text-sm mt-2">Start renting NFTs to get personalized suggestions!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="text-xl font-semibold">AI-Powered Recommendations</h3>
        </div>
        <button
          onClick={loadRecommendations}
          className="text-sm text-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {recommendations.map((rec, idx) => (
          <RecommendationCard key={idx} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const { score, reason, nftContract, tokenId, listing } = recommendation;
  
  const pricePerHour = listing ? parseFloat(listing.pricePerSecond) * 3600 : 0;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-400 transition-colors bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
            Score: {score}/10
          </div>
          {score >= 8 && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
              Highly Recommended
            </span>
          )}
        </div>
        <TrendingUp className="h-4 w-4 text-purple-500" />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Tag className="h-3 w-3 text-gray-500" />
          <span className="font-mono text-xs">{nftContract.slice(0, 6)}...{nftContract.slice(-4)}</span>
          <span className="text-gray-400">/</span>
          <span className="font-mono text-xs">{tokenId}</span>
        </div>

        <p className="text-sm text-gray-600">{reason}</p>
      </div>

      {listing && (
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Tag className="h-3 w-3" />
            <span>{pricePerHour.toFixed(6)} STT/hr</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="h-3 w-3" />
            <span>{Math.floor(listing.minDuration / 3600)}h - {Math.floor(listing.maxDuration / 3600)}h</span>
          </div>
        </div>
      )}
    </div>
  );
}

