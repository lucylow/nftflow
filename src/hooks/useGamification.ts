import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

// Achievement types matching the smart contract
export enum AchievementType {
  FIRST_RENTAL = 0,
  POWER_USER = 1,
  COLLECTOR = 2,
  SPEED_DEMON = 3,
  HIGH_ROLLER = 4,
  COMMUNITY_BUILDER = 5,
  UTILITY_EXPLORER = 6,
  STREAK_MASTER = 7,
  MICRO_RENTER = 8,
  NFT_WHISPERER = 9
}

export interface UserProfile {
  totalPoints: number;
  rentalCount: number;
  totalSpent: number;
  streakDays: number;
  rank: number;
}

export interface Achievement {
  achievementType: AchievementType;
  name: string;
  description: string;
  points: number;
  isActive: boolean;
}

export interface LeaderboardEntry {
  user: string;
  points: number;
  rank: number;
}

export const useGamification = () => {
  const { gamificationContract, account } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Get user profile information
  const getUserProfile = useCallback(async (userAddress?: string): Promise<UserProfile | null> => {
    if (!gamificationContract) {
      return null;
    }

    try {
      const address = userAddress || account;
      if (!address) return null;

      const profile = await gamificationContract.getUserProfile(address);
      
      return {
        totalPoints: Number(ethers.formatEther(profile.totalPoints)),
        rentalCount: Number(profile.rentalCount),
        totalSpent: Number(ethers.formatEther(profile.totalSpent)),
        streakDays: Number(profile.streakDays),
        rank: Number(profile.rank)
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }, [gamificationContract, account]);

  // Get user's achievements
  const getUserAchievements = useCallback(async (userAddress?: string): Promise<AchievementType[]> => {
    if (!gamificationContract) {
      return [];
    }

    try {
      const address = userAddress || account;
      if (!address) return [];

      const achievements = await gamificationContract.getUserAchievements(address);
      return achievements.map((achievement: any) => Number(achievement));
    } catch (error) {
      console.error('Failed to get user achievements:', error);
      return [];
    }
  }, [gamificationContract, account]);

  // Get achievement details
  const getAchievement = useCallback(async (achievementType: AchievementType): Promise<Achievement | null> => {
    if (!gamificationContract) {
      return null;
    }

    try {
      const achievement = await gamificationContract.getAchievement(achievementType);
      
      return {
        achievementType: Number(achievement.achievementType),
        name: achievement.name,
        description: achievement.description,
        points: Number(achievement.points),
        isActive: achievement.isActive
      };
    } catch (error) {
      console.error('Failed to get achievement:', error);
      return null;
    }
  }, [gamificationContract]);

  // Check if user has specific achievement
  const hasAchievement = useCallback(async (achievementType: AchievementType, userAddress?: string): Promise<boolean> => {
    if (!gamificationContract) {
      return false;
    }

    try {
      const address = userAddress || account;
      if (!address) return false;

      return await gamificationContract.hasAchievement(address, achievementType);
    } catch (error) {
      console.error('Failed to check achievement:', error);
      return false;
    }
  }, [gamificationContract, account]);

  // Get top leaderboard entries
  const getTopLeaderboard = useCallback(async (count: number = 10): Promise<LeaderboardEntry[]> => {
    if (!gamificationContract) {
      return [];
    }

    try {
      const entries = await gamificationContract.getTopLeaderboard(count);
      
      return entries.map((entry: any) => ({
        user: entry.user,
        points: Number(ethers.formatEther(entry.points)),
        rank: Number(entry.rank)
      }));
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }, [gamificationContract]);

  // Record a rental (only callable by owner/contract)
  const recordRental = useCallback(async (
    user: string,
    rentalValue: string,
    duration: number,
    nftContract: string,
    tokenId: string
  ) => {
    if (!gamificationContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const tx = await gamificationContract.recordRental(
        user,
        ethers.parseEther(rentalValue),
        duration,
        nftContract,
        tokenId
      );

      await tx.wait();
      
      toast({
        title: "Rental Recorded",
        description: "Your rental has been recorded for achievements",
      });

      return tx;
    } catch (error: any) {
      console.error('Failed to record rental:', error);
      toast({
        title: "Recording Failed",
        description: error.message || "Failed to record rental",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [gamificationContract, account, toast]);

  // Get comprehensive gamification data for a user
  const getGamificationData = useCallback(async (userAddress?: string) => {
    if (!gamificationContract) {
      return null;
    }

    try {
      const address = userAddress || account;
      if (!address) return null;

      const [profile, achievements, leaderboard] = await Promise.all([
        getUserProfile(address),
        getUserAchievements(address),
        getTopLeaderboard(20)
      ]);

      return {
        profile,
        achievements,
        leaderboard
      };
    } catch (error) {
      console.error('Failed to get gamification data:', error);
      return null;
    }
  }, [gamificationContract, account, getUserProfile, getUserAchievements, getTopLeaderboard]);

  return {
    isLoading,
    getUserProfile,
    getUserAchievements,
    getAchievement,
    hasAchievement,
    getTopLeaderboard,
    recordRental,
    getGamificationData,
  };
};
