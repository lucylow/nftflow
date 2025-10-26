import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

interface ReputationData {
  score: number;
  totalRentals: number;
  successfulRentals: number;
  successRate: number;
  tier: number;
  requiresCollateral: boolean;
  collateralMultiplier: number;
  isWhitelisted: boolean;
  isBlacklisted: boolean;
}

interface ReputationTier {
  name: string;
  color: string;
  benefits: string[];
  threshold: number;
}

const REPUTATION_TIERS: ReputationTier[] = [
  {
    name: "New/Risk",
    color: "red",
    benefits: ["Full collateral required"],
    threshold: 0
  },
  {
    name: "Standard",
    color: "yellow",
    benefits: ["Full collateral required"],
    threshold: 500
  },
  {
    name: "Trusted",
    color: "blue",
    benefits: ["Reduced collateral", "Priority support"],
    threshold: 750
  },
  {
    name: "Elite",
    color: "purple",
    benefits: ["No collateral required", "Premium features", "Early access"],
    threshold: 900
  },
  {
    name: "VIP",
    color: "gold",
    benefits: ["No collateral required", "All premium features", "Exclusive perks"],
    threshold: 1000
  }
];

export const useReputationSystem = () => {
  const { isConnected, account, reputationSystemContract } = useWeb3();
  const { toast } = useToast();
  const [reputationData, setReputationData] = useState<ReputationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load reputation data
  const loadReputationData = useCallback(async () => {
    if (!isConnected || !account || !reputationSystemContract) {
      setReputationData(null);
      return;
    }

    setIsLoading(true);
    try {
      // Get reputation data in a single call
      const reputationData = await reputationSystemContract.getReputationData(account);
      
      // Get additional data
      const [tier, requiresCollateral, collateralMultiplier] = await Promise.all([
        reputationSystemContract.getReputationTier(account),
        reputationSystemContract.requiresCollateral(account),
        reputationSystemContract.getCollateralMultiplier(account)
      ]);

      setReputationData({
        score: Number(reputationData.score),
        totalRentals: Number(reputationData.totalRentals),
        successfulRentals: Number(reputationData.successfulRentals),
        successRate: reputationData.totalRentals > 0 ? 
          Number((reputationData.successfulRentals * 100) / reputationData.totalRentals) : 0,
        tier: Number(tier),
        requiresCollateral,
        collateralMultiplier: Number(collateralMultiplier),
        isWhitelisted: reputationData.isWhitelisted,
        isBlacklisted: reputationData.isBlacklisted
      });
    } catch (error) {
      console.error('Failed to load reputation data:', error);
      toast({
        title: "Failed to Load Reputation",
        description: "Could not load reputation data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, reputationSystemContract, toast]);

  // Load reputation data on mount and when account changes
  useEffect(() => {
    loadReputationData();
  }, [loadReputationData]);

  // Get current reputation tier
  const getCurrentTier = useCallback((): ReputationTier => {
    if (!reputationData) {
      return REPUTATION_TIERS[0];
    }

    // Find the highest tier the user qualifies for
    for (let i = REPUTATION_TIERS.length - 1; i >= 0; i--) {
      if (reputationData.score >= REPUTATION_TIERS[i].threshold) {
        return REPUTATION_TIERS[i];
      }
    }

    return REPUTATION_TIERS[0];
  }, [reputationData]);

  // Get next tier information
  const getNextTier = useCallback((): ReputationTier | null => {
    if (!reputationData) return null;

    const currentTier = getCurrentTier();
    const currentIndex = REPUTATION_TIERS.findIndex(tier => tier.name === currentTier.name);
    
    if (currentIndex < REPUTATION_TIERS.length - 1) {
      return REPUTATION_TIERS[currentIndex + 1];
    }

    return null;
  }, [reputationData, getCurrentTier]);

  // Calculate progress to next tier
  const getProgressToNextTier = useCallback((): number => {
    const nextTier = getNextTier();
    if (!nextTier || !reputationData) return 0;

    const currentTier = getCurrentTier();
    const progress = (reputationData.score - currentTier.threshold) / 
                   (nextTier.threshold - currentTier.threshold);
    
    return Math.min(Math.max(progress * 100, 0), 100);
  }, [reputationData, getCurrentTier, getNextTier]);

  // Check if user can rent without collateral
  const canRentWithoutCollateral = useCallback((): boolean => {
    return reputationData ? !reputationData.requiresCollateral : false;
  }, [reputationData]);

  // Get collateral requirement percentage
  const getCollateralRequirement = useCallback((): number => {
    return reputationData ? reputationData.collateralMultiplier : 100;
  }, [reputationData]);

  // Get reputation badge color
  const getReputationBadgeColor = useCallback((): string => {
    const tier = getCurrentTier();
    return tier.color;
  }, [getCurrentTier]);

  // Get reputation benefits
  const getReputationBenefits = useCallback((): string[] => {
    const tier = getCurrentTier();
    return tier.benefits;
  }, [getCurrentTier]);

  // Simulate reputation gain (for testing)
  const simulateReputationGain = useCallback(async (success: boolean) => {
    if (!reputationSystemContract || !account) return;

    try {
      // This would be called by the rental contract in real implementation
      // For testing purposes, we'll simulate it
      await loadReputationData();
      
      toast({
        title: success ? "Reputation Increased" : "Reputation Decreased",
        description: success ? 
          "Your reputation score has increased due to successful rental" :
          "Your reputation score has decreased due to rental issue",
      });
    } catch (error) {
      console.error('Failed to update reputation:', error);
    }
  }, [reputationSystemContract, account, loadReputationData, toast]);

  // Get reputation history (placeholder for future implementation)
  const getReputationHistory = useCallback(async () => {
    // This would fetch historical reputation changes
    // For now, return empty array
    return [];
  }, []);

  // Get reputation leaderboard (placeholder for future implementation)
  const getReputationLeaderboard = useCallback(async (limit: number = 10) => {
    // This would fetch top users by reputation
    // For now, return empty array
    return [];
  }, []);

  // Get user reputation data (for compatibility with UserDashboard)
  const getUserReputation = useCallback(async () => {
    if (!reputationData) {
      await loadReputationData();
    }
    return reputationData ? {
      reputationScore: reputationData.score,
      totalRentals: reputationData.totalRentals,
      successfulRentals: reputationData.successfulRentals,
      successRate: reputationData.successRate,
      tier: reputationData.tier,
      requiresCollateral: reputationData.requiresCollateral,
      collateralMultiplier: reputationData.collateralMultiplier,
      isWhitelisted: reputationData.isWhitelisted,
      isBlacklisted: reputationData.isBlacklisted
    } : null;
  }, [reputationData, loadReputationData]);

  // Get success rate (for compatibility with UserDashboard)
  const getSuccessRate = useCallback(async () => {
    if (!reputationData) {
      await loadReputationData();
    }
    return reputationData ? reputationData.successRate : 0;
  }, [reputationData, loadReputationData]);

  // Get user achievements
  const getUserAchievements = useCallback(async () => {
    if (!reputationSystemContract || !account) return [];
    
    try {
      const achievements = await reputationSystemContract.getUserAchievements(account);
      return achievements.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Failed to load user achievements:', error);
      return [];
    }
  }, [reputationSystemContract, account]);

  // Get reputation tier name (for compatibility with UserDashboard)
  const getReputationTier = useCallback((score: number) => {
    for (let i = REPUTATION_TIERS.length - 1; i >= 0; i--) {
      if (score >= REPUTATION_TIERS[i].threshold) {
        return REPUTATION_TIERS[i].name;
      }
    }
    return REPUTATION_TIERS[0].name;
  }, []);

  // Get reputation color (for compatibility with UserDashboard)
  const getReputationColor = useCallback((tier: string) => {
    const tierData = REPUTATION_TIERS.find(t => t.name === tier);
    return tierData ? tierData.color : 'red';
  }, []);

  return {
    reputationData,
    isLoading,
    loadReputationData,
    getCurrentTier,
    getNextTier,
    getProgressToNextTier,
    canRentWithoutCollateral,
    getCollateralRequirement,
    getReputationBadgeColor,
    getReputationBenefits,
    simulateReputationGain,
    getReputationHistory,
    getReputationLeaderboard,
    getUserReputation,
    getSuccessRate,
    getUserAchievements,
    getReputationTier,
    getReputationColor,
    tiers: REPUTATION_TIERS
  };
};