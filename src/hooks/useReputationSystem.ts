import { useState, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

// Types
export interface UserReputation {
  totalRentals: number;
  successfulRentals: number;
  reputationScore: number;
  lastUpdated: number;
  blacklisted: boolean;
}

export interface Achievement {
  name: string;
  description: string;
  requirement: number;
  rewardPoints: number;
  active: boolean;
}

export const useReputationSystem = () => {
  const { reputationSystemContract, account } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Update user reputation (only authorized contracts can call this)
  const updateReputation = useCallback(async (
    userAddress: string,
    success: boolean
  ) => {
    if (!reputationSystemContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const tx = await reputationSystemContract.updateReputation(
        userAddress,
        success
      );

      await tx.wait();
      
      toast({
        title: "Reputation Updated",
        description: `Reputation updated for ${success ? 'successful' : 'failed'} rental`,
      });

      return tx;
    } catch (error: any) {
      console.error('Failed to update reputation:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update reputation",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [reputationSystemContract, account, toast]);

  // Get user reputation
  const getUserReputation = useCallback(async (userAddress?: string): Promise<UserReputation | null> => {
    if (!reputationSystemContract) {
      return null;
    }

    const address = userAddress || account;
    if (!address) {
      return null;
    }

    try {
      const reputation = await reputationSystemContract.getUserReputation(address);
      return {
        totalRentals: Number(reputation.totalRentals),
        successfulRentals: Number(reputation.successfulRentals),
        reputationScore: Number(reputation.reputationScore),
        lastUpdated: Number(reputation.lastUpdated),
        blacklisted: reputation.blacklisted,
      };
    } catch (error) {
      console.error('Failed to get user reputation:', error);
      return null;
    }
  }, [reputationSystemContract, account]);

  // Get collateral multiplier based on reputation
  const getCollateralMultiplier = useCallback(async (userAddress?: string): Promise<number> => {
    if (!reputationSystemContract) {
      return 100; // Default 100% collateral
    }

    const address = userAddress || account;
    if (!address) {
      return 100;
    }

    try {
      const multiplier = await reputationSystemContract.getCollateralMultiplier(address);
      return Number(multiplier) / 100; // Convert from basis points to percentage
    } catch (error) {
      console.error('Failed to get collateral multiplier:', error);
      return 100;
    }
  }, [reputationSystemContract, account]);

  // Get user success rate
  const getSuccessRate = useCallback(async (userAddress?: string): Promise<number> => {
    if (!reputationSystemContract) {
      return 0;
    }

    const address = userAddress || account;
    if (!address) {
      return 0;
    }

    try {
      const successRate = await reputationSystemContract.getSuccessRate(address);
      return Number(successRate);
    } catch (error) {
      console.error('Failed to get success rate:', error);
      return 0;
    }
  }, [reputationSystemContract, account]);

  // Check if user has achievement
  const hasAchievement = useCallback(async (
    achievementId: number,
    userAddress?: string
  ): Promise<boolean> => {
    if (!reputationSystemContract) {
      return false;
    }

    const address = userAddress || account;
    if (!address) {
      return false;
    }

    try {
      return await reputationSystemContract.hasAchievement(address, achievementId);
    } catch (error) {
      console.error('Failed to check achievement:', error);
      return false;
    }
  }, [reputationSystemContract, account]);

  // Get achievement details
  const getAchievement = useCallback(async (achievementId: number): Promise<Achievement | null> => {
    if (!reputationSystemContract) {
      return null;
    }

    try {
      const achievement = await reputationSystemContract.getAchievement(achievementId);
      return {
        name: achievement.name,
        description: achievement.description,
        requirement: Number(achievement.requirement),
        rewardPoints: Number(achievement.rewardPoints),
        active: achievement.active,
      };
    } catch (error) {
      console.error('Failed to get achievement:', error);
      return null;
    }
  }, [reputationSystemContract]);

  // Get user achievements
  const getUserAchievements = useCallback(async (userAddress?: string): Promise<number[]> => {
    if (!reputationSystemContract) {
      return [];
    }

    const address = userAddress || account;
    if (!address) {
      return [];
    }

    try {
      const achievements = await reputationSystemContract.getUserAchievements(address);
      return achievements.map((id: any) => Number(id));
    } catch (error) {
      console.error('Failed to get user achievements:', error);
      return [];
    }
  }, [reputationSystemContract, account]);

  // Get total number of achievements
  const getTotalAchievements = useCallback(async (): Promise<number> => {
    if (!reputationSystemContract) {
      return 0;
    }

    try {
      const total = await reputationSystemContract.getTotalAchievements();
      return Number(total);
    } catch (error) {
      console.error('Failed to get total achievements:', error);
      return 0;
    }
  }, [reputationSystemContract]);

  // Get reputation tier based on score
  const getReputationTier = useCallback((score: number): string => {
    if (score >= 800) return 'Legendary';
    if (score >= 500) return 'Expert';
    if (score >= 100) return 'Novice';
    return 'Newcomer';
  }, []);

  // Get reputation color based on tier
  const getReputationColor = useCallback((tier: string): string => {
    switch (tier) {
      case 'Legendary': return 'text-purple-500';
      case 'Expert': return 'text-blue-500';
      case 'Novice': return 'text-green-500';
      default: return 'text-gray-500';
    }
  }, []);

  return {
    isLoading,
    updateReputation,
    getUserReputation,
    getCollateralMultiplier,
    getSuccessRate,
    hasAchievement,
    getAchievement,
    getUserAchievements,
    getTotalAchievements,
    getReputationTier,
    getReputationColor,
  };
};
