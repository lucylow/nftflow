import { useState, useCallback, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { RentalIntelligenceAgent } from '@/agents/RentalIntelligenceAgent';
import { RecommendationAgent } from '@/agents/RecommendationAgent';
import { CollateralAgent } from '@/agents/CollateralAgent';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

interface AIGentServices {
  rentalIntelligence: RentalIntelligenceAgent | null;
  recommendation: RecommendationAgent | null;
  collateral: CollateralAgent | null;
}

export const useAIAgents = () => {
  const { account, nftFlowContract, reputationSystemContract } = useWeb3();
  const [agents, setAgents] = useState<AIGentServices>({
    rentalIntelligence: null,
    recommendation: null,
    collateral: null
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize AI agents - API key is now handled server-side through Supabase
  useEffect(() => {
    if (!account || !nftFlowContract) {
      setIsInitialized(false);
      return;
    }

    try {
      // Initialize agents with placeholder - actual API calls go through edge functions
      const rentalAgent = new RentalIntelligenceAgent(
        'server-side', // API key managed by Supabase
        null,
        CONTRACT_ADDRESSES.NFTFlow,
        []
      );

      const recommendationAgent = new RecommendationAgent('server-side', null);

      const collateralAgent = new CollateralAgent(
        'server-side',
        null,
        CONTRACT_ADDRESSES.ReputationSystem
      );

      setAgents({
        rentalIntelligence: rentalAgent,
        recommendation: recommendationAgent,
        collateral: collateralAgent
      });

      setIsInitialized(true);
      console.log('✅ AI Agents initialized - using secure backend');
    } catch (error) {
      console.error('Failed to initialize AI agents:', error);
      setIsInitialized(false);
    }
  }, [account, nftFlowContract, reputationSystemContract]);

  // Get rental pricing recommendation
  const getRentalPricingRecommendation = useCallback(async (
    nftContract: string,
    tokenId: string
  ) => {
    if (!agents.rentalIntelligence) {
      throw new Error('AI agents not initialized');
    }

    return await agents.rentalIntelligence.generateRentalStrategy(nftContract, tokenId);
  }, [agents]);

  // Get personalized recommendations
  const getPersonalizedRecommendations = useCallback(async (limit: number = 10) => {
    if (!agents.recommendation || !account) {
      throw new Error('AI agents not initialized or wallet not connected');
    }

    return await agents.recommendation.generateRecommendations(account, limit);
  }, [agents, account]);

  // Assess rental risk
  const assessRentalRisk = useCallback(async (
    renterAddress: string,
    nftValue: number,
    rentalDuration: number
  ) => {
    if (!agents.collateral) {
      throw new Error('AI agents not initialized');
    }

    return await agents.collateral.assessRisk(renterAddress, nftValue, rentalDuration);
  }, [agents]);

  // Get collateral requirement
  const getCollateralRequirement = useCallback(async (
    renterAddress: string,
    nftValue: number,
    rentalDuration: number
  ) => {
    if (!agents.collateral) {
      throw new Error('AI agents not initialized');
    }

    const riskAssessment = await agents.collateral.assessRisk(
      renterAddress,
      nftValue,
      rentalDuration
    );
    
    return {
      amount: riskAssessment.recommendedCollateral,
      reasoning: riskAssessment.explanation
    };
  }, [agents]);

  return {
    isInitialized,
    agents,
    getRentalPricingRecommendation,
    getPersonalizedRecommendations,
    assessRentalRisk,
    getCollateralRequirement
  };
};
