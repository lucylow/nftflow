import { useState, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { parseEther, formatEther } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

// Types
export interface UtilityUsage {
  nftContract: string;
  tokenId: string;
  user: string;
  startTime: string;
  endTime: string;
  utilityType: number;
  utilityValue: string;
  completed: boolean;
}

export interface UtilityAnalytics {
  totalUsageTime: string;
  totalRentals: string;
  averageRentalDuration: string;
  peakUsageHours: string;
  utilityScore: string;
  lastUsed: string;
}

export const useUtilityTracker = () => {
  const { utilityTrackerContract, account } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Record utility usage
  const recordUtilityUsage = useCallback(async (
    nftContract: string,
    tokenId: string,
    user: string,
    startTime: number,
    endTime: number,
    utilityType: number,
    utilityValue: string
  ) => {
    if (!utilityTrackerContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const tx = await utilityTrackerContract.recordUtilityUsage(
        nftContract,
        tokenId,
        user,
        startTime,
        endTime,
        utilityType,
        parseEther(utilityValue)
      );

      await tx.wait();
      
      toast({
        title: "Utility Usage Recorded",
        description: "Utility usage has been recorded successfully",
      });

      return tx;
    } catch (error: any) {
      console.error('Failed to record utility usage:', error);
      toast({
        title: "Recording Failed",
        description: error.message || "Failed to record utility usage",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [utilityTrackerContract, account, toast]);

  // Get NFT analytics
  const getNFTAnalytics = useCallback(async (
    nftContract: string,
    tokenId: string
  ): Promise<UtilityAnalytics | null> => {
    if (!utilityTrackerContract) {
      return null;
    }

    try {
      const analytics = await utilityTrackerContract.getNFTAnalytics(nftContract, tokenId);
      return {
        totalUsageTime: analytics.totalUsageTime.toString(),
        totalRentals: analytics.totalRentals.toString(),
        averageRentalDuration: analytics.averageRentalDuration.toString(),
        peakUsageHours: analytics.peakUsageHours.toString(),
        utilityScore: analytics.utilityScore.toString(),
        lastUsed: analytics.lastUsed.toString(),
      };
    } catch (error) {
      console.error('Failed to get NFT analytics:', error);
      return null;
    }
  }, [utilityTrackerContract]);

  // Get user utility score
  const getUserUtilityScore = useCallback(async (userAddress?: string): Promise<number> => {
    if (!utilityTrackerContract) {
      return 0;
    }

    const user = userAddress || account;
    if (!user) {
      return 0;
    }

    try {
      const score = await utilityTrackerContract.getUserUtilityScore(user);
      return Number(score);
    } catch (error) {
      console.error('Failed to get user utility score:', error);
      return 0;
    }
  }, [utilityTrackerContract, account]);

  // Get utility-based pricing recommendation
  const getUtilityBasedPrice = useCallback(async (
    nftContract: string,
    tokenId: string,
    basePrice: string
  ): Promise<string> => {
    if (!utilityTrackerContract) {
      return basePrice; // Fallback to base price
    }

    try {
      const price = await utilityTrackerContract.getUtilityBasedPrice(
        nftContract,
        tokenId,
        parseEther(basePrice)
      );
      return formatEther(price);
    } catch (error) {
      console.error('Failed to get utility-based price:', error);
      return basePrice; // Fallback to base price
    }
  }, [utilityTrackerContract]);

  // Get popular rental duration for an NFT
  const getPopularRentalDuration = useCallback(async (
    nftContract: string,
    tokenId: string
  ): Promise<number> => {
    if (!utilityTrackerContract) {
      return 0;
    }

    try {
      const duration = await utilityTrackerContract.getPopularRentalDuration(nftContract, tokenId);
      return Number(duration);
    } catch (error) {
      console.error('Failed to get popular rental duration:', error);
      return 0;
    }
  }, [utilityTrackerContract]);

  // Check if NFT has high utility demand
  const hasHighUtilityDemand = useCallback(async (
    nftContract: string,
    tokenId: string
  ): Promise<boolean> => {
    if (!utilityTrackerContract) {
      return false;
    }

    try {
      return await utilityTrackerContract.hasHighUtilityDemand(nftContract, tokenId);
    } catch (error) {
      console.error('Failed to check utility demand:', error);
      return false;
    }
  }, [utilityTrackerContract]);

  // Get user utility history
  const getUserUtilityHistory = useCallback(async (userAddress?: string): Promise<number[]> => {
    if (!utilityTrackerContract) {
      return [];
    }

    const user = userAddress || account;
    if (!user) {
      return [];
    }

    try {
      const history = await utilityTrackerContract.getUserUtilityHistory(user);
      return history.map((id: any) => Number(id));
    } catch (error) {
      console.error('Failed to get user utility history:', error);
      return [];
    }
  }, [utilityTrackerContract, account]);

  // Get utility usage details
  const getUtilityUsage = useCallback(async (usageId: number): Promise<UtilityUsage | null> => {
    if (!utilityTrackerContract) {
      return null;
    }

    try {
      const usage = await utilityTrackerContract.getUtilityUsage(usageId);
      return {
        nftContract: usage.nftContract,
        tokenId: usage.tokenId.toString(),
        user: usage.user,
        startTime: usage.startTime.toString(),
        endTime: usage.endTime.toString(),
        utilityType: Number(usage.utilityType),
        utilityValue: formatEther(usage.utilityValue),
        completed: usage.completed,
      };
    } catch (error) {
      console.error('Failed to get utility usage:', error);
      return null;
    }
  }, [utilityTrackerContract]);

  // Get utility type name
  const getUtilityTypeName = useCallback(async (utilityType: number): Promise<string> => {
    if (!utilityTrackerContract) {
      return 'Unknown';
    }

    try {
      return await utilityTrackerContract.getUtilityTypeName(utilityType);
    } catch (error) {
      console.error('Failed to get utility type name:', error);
      return 'Unknown';
    }
  }, [utilityTrackerContract]);

  // Utility type constants
  const UTILITY_TYPES = {
    GAMING: 0,
    ART: 1,
    METAVERSE: 2,
    REAL_WORLD: 3,
  };

  // Get utility type name from constant
  const getUtilityTypeNameFromConstant = useCallback((utilityType: number): string => {
    switch (utilityType) {
      case UTILITY_TYPES.GAMING:
        return 'Gaming';
      case UTILITY_TYPES.ART:
        return 'Art';
      case UTILITY_TYPES.METAVERSE:
        return 'Metaverse';
      case UTILITY_TYPES.REAL_WORLD:
        return 'Real World';
      default:
        return 'Unknown';
    }
  }, []);

  return {
    isLoading,
    recordUtilityUsage,
    getNFTAnalytics,
    getUserUtilityScore,
    getUtilityBasedPrice,
    getPopularRentalDuration,
    hasHighUtilityDemand,
    getUserUtilityHistory,
    getUtilityUsage,
    getUtilityTypeName,
    getUtilityTypeNameFromConstant,
    UTILITY_TYPES,
  };
};
