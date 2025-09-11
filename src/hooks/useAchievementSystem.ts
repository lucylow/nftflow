import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  imageUri: string;
  category: 'rental' | 'social' | 'trading' | 'special';
  requirement: number;
  reward: string;
  xpReward: number;
  isActive: boolean;
  isRare: boolean;
  maxHolders?: number;
  currentHolders: number;
}

interface UserAchievement {
  achievementName: string;
  unlockedAt: number;
  xpEarned: number;
  isActive: boolean;
}

interface UserProfile {
  level: number;
  xp: number;
  xpToNext: number;
  totalAchievements: number;
  rentalCount: number;
  socialShares: number;
  tradingVolume: string;
  lastActivity: number;
  unlockedAchievements: string[];
}

interface LeaderboardEntry {
  user: string;
  level: number;
  xp: number;
  totalAchievements: number;
}

export const useAchievementSystem = () => {
  const { account, isConnected, achievementSystemContract } = useWeb3();
  const { toast } = useToast();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register user
  const registerUser = useCallback(async () => {
    if (!isConnected || !account || !achievementSystemContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await achievementSystemContract.registerUser(account);
      await tx.wait();

      toast({
        title: "User Registered",
        description: "Successfully registered for achievement tracking",
      });

      // Refresh user profile
      await loadUserProfile();

      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register user';
      setError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, achievementSystemContract, toast]);

  // Record rental activity
  const recordRentalActivity = useCallback(async (
    duration: number,
    pricePaid: string
  ) => {
    if (!isConnected || !account || !achievementSystemContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    try {
      const tx = await achievementSystemContract.recordRentalActivity(
        account,
        duration,
        pricePaid
      );
      await tx.wait();

      // Refresh user profile
      await loadUserProfile();

      return tx;
    } catch (err: any) {
      console.error('Failed to record rental activity:', err);
      throw err;
    }
  }, [isConnected, account, achievementSystemContract]);

  // Record social share
  const recordSocialShare = useCallback(async (
    platform: string,
    rentalId: string
  ) => {
    if (!isConnected || !account || !achievementSystemContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    try {
      const tx = await achievementSystemContract.recordSocialShare(
        account,
        platform,
        rentalId
      );
      await tx.wait();

      toast({
        title: "Social Share Recorded",
        description: `Successfully recorded share on ${platform}`,
      });

      // Refresh user profile
      await loadUserProfile();

      return tx;
    } catch (err: any) {
      console.error('Failed to record social share:', err);
      throw err;
    }
  }, [isConnected, account, achievementSystemContract, toast]);

  // Unlock achievement
  const unlockAchievement = useCallback(async (achievementName: string) => {
    if (!isConnected || !account || !achievementSystemContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await achievementSystemContract.unlockAchievement(
        account,
        achievementName
      );
      await tx.wait();

      toast({
        title: "Achievement Unlocked!",
        description: `Congratulations! You've unlocked ${achievementName}`,
      });

      // Refresh user profile and achievements
      await loadUserProfile();
      await loadUserAchievements();

      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to unlock achievement';
      setError(errorMessage);
      toast({
        title: "Unlock Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, achievementSystemContract, toast]);

  // Create achievement (admin only)
  const createAchievement = useCallback(async (
    name: string,
    description: string,
    imageUri: string,
    requirement: number,
    reward: string,
    xpReward: number,
    category: number,
    isRare: boolean,
    maxHolders?: number
  ) => {
    if (!isConnected || !account || !achievementSystemContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await achievementSystemContract.createAchievement(
        name,
        description,
        imageUri,
        requirement,
        reward,
        xpReward,
        category,
        isRare,
        maxHolders || 0
      );
      await tx.wait();

      toast({
        title: "Achievement Created",
        description: `Successfully created ${name} achievement`,
      });

      // Refresh achievements
      await loadAchievements();

      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create achievement';
      setError(errorMessage);
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, achievementSystemContract, toast]);

  // Load achievements
  const loadAchievements = useCallback(async () => {
    if (!achievementSystemContract) return;

    try {
      const achievementNames = await achievementSystemContract.getAllAchievementNames();
      const achievementPromises = achievementNames.map(async (name: string) => {
        const achievement = await achievementSystemContract.getAchievement(name);
        return {
          id: name,
          name: achievement.name,
          description: achievement.description,
          imageUri: achievement.imageUri,
          category: ['rental', 'social', 'trading', 'special'][achievement.category] as 'rental' | 'social' | 'trading' | 'special',
          requirement: Number(achievement.requirement),
          reward: achievement.reward.toString(),
          xpReward: Number(achievement.xpReward),
          isActive: achievement.isActive,
          isRare: achievement.isRare,
          maxHolders: achievement.maxHolders > 0 ? Number(achievement.maxHolders) : undefined,
          currentHolders: Number(achievement.currentHolders)
        };
      });

      const achievementsList = await Promise.all(achievementPromises);
      setAchievements(achievementsList);
    } catch (err: any) {
      console.error('Failed to load achievements:', err);
      setError(err.message);
    }
  }, [achievementSystemContract]);

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    if (!isConnected || !account || !achievementSystemContract) return;

    try {
      const [profile, level, xp, xpToNext] = await Promise.all([
        achievementSystemContract.getUserAchievements(account),
        achievementSystemContract.getUserLevel(account)
      ]);

      setUserProfile({
        level: Number(level),
        xp: Number(xp),
        xpToNext: Number(xpToNext),
        totalAchievements: profile.unlockedAchievements.length,
        rentalCount: Number(profile.rentalCount),
        socialShares: Number(profile.socialShares),
        tradingVolume: profile.tradingVolume.toString(),
        lastActivity: Number(profile.lastActivity),
        unlockedAchievements: profile.unlockedAchievements
      });
    } catch (err: any) {
      console.error('Failed to load user profile:', err);
      setError(err.message);
    }
  }, [isConnected, account, achievementSystemContract]);

  // Load user achievements
  const loadUserAchievements = useCallback(async () => {
    if (!isConnected || !account || !achievementSystemContract) return;

    try {
      const userAchievementsData = await achievementSystemContract.getUserAchievements(account);
      setUserAchievements(userAchievementsData.unlockedAchievements.map((name: string) => {
        const achievementData = userAchievementsData.achievementData[name];
        return {
          achievementName: name,
          unlockedAt: Number(achievementData.unlockedAt),
          xpEarned: Number(achievementData.xpEarned),
          isActive: achievementData.isActive
        };
      }));
    } catch (err: any) {
      console.error('Failed to load user achievements:', err);
      setError(err.message);
    }
  }, [isConnected, account, achievementSystemContract]);

  // Load leaderboard
  const loadLeaderboard = useCallback(async (limit: number = 100) => {
    if (!achievementSystemContract) return;

    try {
      const leaderboardData = await achievementSystemContract.getLeaderboard(limit);
      setLeaderboard(leaderboardData.users.map((user: string, index: number) => ({
        user,
        level: Number(leaderboardData.levels[index]),
        xp: Number(leaderboardData.xpArray[index]),
        totalAchievements: 0 // This would need to be calculated separately
      })));
    } catch (err: any) {
      console.error('Failed to load leaderboard:', err);
      setError(err.message);
    }
  }, [achievementSystemContract]);

  // Check if user has specific achievement
  const hasAchievement = useCallback((achievementName: string): boolean => {
    if (!userProfile) return false;
    return userProfile.unlockedAchievements.includes(achievementName);
  }, [userProfile]);

  // Get achievement progress
  const getAchievementProgress = useCallback((achievement: Achievement): {
    current: number;
    required: number;
    percentage: number;
    canUnlock: boolean;
  } => {
    if (!userProfile) {
      return { current: 0, required: achievement.requirement, percentage: 0, canUnlock: false };
    }

    let current = 0;
    
    switch (achievement.category) {
      case 'rental':
        current = userProfile.rentalCount;
        break;
      case 'social':
        current = userProfile.socialShares;
        break;
      case 'trading':
        current = parseFloat(userProfile.tradingVolume);
        break;
      case 'special':
        // Special achievements have custom logic
        current = 0;
        break;
    }

    const percentage = Math.min(100, (current / achievement.requirement) * 100);
    const canUnlock = current >= achievement.requirement && !hasAchievement(achievement.name);

    return { current, required: achievement.requirement, percentage, canUnlock };
  }, [userProfile, hasAchievement]);

  // Get user rank
  const getUserRank = useCallback((): number => {
    if (!userProfile || !leaderboard.length) return 0;
    
    const userEntry = leaderboard.find(entry => entry.user.toLowerCase() === account?.toLowerCase());
    return userEntry ? leaderboard.indexOf(userEntry) + 1 : 0;
  }, [userProfile, leaderboard, account]);

  // Get next level requirements
  const getNextLevelRequirements = useCallback((): {
    level: number;
    xpRequired: number;
    xpRemaining: number;
    progressPercentage: number;
  } | null => {
    if (!userProfile) return null;

    const nextLevel = userProfile.level + 1;
    const xpRequired = nextLevel * 1000; // Assuming 1000 XP per level
    const xpRemaining = xpRequired - userProfile.xp;
    const progressPercentage = (userProfile.xp / xpRequired) * 100;

    return {
      level: nextLevel,
      xpRequired,
      xpRemaining,
      progressPercentage
    };
  }, [userProfile]);

  // Load data on mount
  useEffect(() => {
    if (achievementSystemContract) {
      loadAchievements();
      loadLeaderboard();
    }
  }, [achievementSystemContract, loadAchievements, loadLeaderboard]);

  useEffect(() => {
    if (isConnected && account && achievementSystemContract) {
      loadUserProfile();
      loadUserAchievements();
    }
  }, [isConnected, account, achievementSystemContract, loadUserProfile, loadUserAchievements]);

  return {
    // State
    achievements,
    userProfile,
    userAchievements,
    leaderboard,
    isLoading,
    error,
    
    // Actions
    registerUser,
    recordRentalActivity,
    recordSocialShare,
    unlockAchievement,
    createAchievement,
    
    // Data loading
    loadAchievements,
    loadUserProfile,
    loadUserAchievements,
    loadLeaderboard,
    
    // Utilities
    hasAchievement,
    getAchievementProgress,
    getUserRank,
    getNextLevelRequirements
  };
};
