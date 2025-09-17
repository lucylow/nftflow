import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';
import { mockAchievements } from '../data/mockData';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  points: number;
}

interface AchievementContextType {
  achievements: Achievement[];
  rentalStreak: number;
  unlockAchievement: (achievementId: string) => Achievement | null;
  incrementRentalStreak: () => void;
  getTotalPoints: () => number;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

interface AchievementProviderProps {
  children: ReactNode;
}

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within a AchievementProvider');
  }
  return context;
};

export const AchievementProvider: React.FC<AchievementProviderProps> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [rentalStreak, setRentalStreak] = useState(0);
  const { account } = useWeb3();

  // Load achievements from localStorage
  useEffect(() => {
    if (account) {
      const stored = localStorage.getItem(`achievements_${account}`);
      if (stored) {
        setAchievements(JSON.parse(stored));
      }
      
      const streak = localStorage.getItem(`rental_streak_${account}`);
      if (streak) {
        setRentalStreak(parseInt(streak));
      }
    }
  }, [account]);

  const unlockAchievement = (achievementId: string): Achievement | null => {
    const achievement = mockAchievements[achievementId as keyof typeof mockAchievements];
    if (achievement && !achievements.find(a => a.id === achievementId)) {
      const newAchievement: Achievement = {
        id: achievementId,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        unlockedAt: new Date().toISOString(),
        points: achievement.points,
      };
      
      const updatedAchievements = [...achievements, newAchievement];
      setAchievements(updatedAchievements);
      
      if (account) {
        localStorage.setItem(`achievements_${account}`, JSON.stringify(updatedAchievements));
      }
      
      // Show notification
      if (achievement.notification) {
        console.log(`Achievement unlocked: ${achievement.name}`);
        // You could integrate with a toast notification system here
      }
      
      return newAchievement;
    }
    return null;
  };

  const incrementRentalStreak = () => {
    if (!account) return;
    
    const today = new Date().toDateString();
    const lastRentalDate = localStorage.getItem(`last_rental_date_${account}`);
    
    if (lastRentalDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastRentalDate === yesterday.toDateString()) {
        // Consecutive day
        const newStreak = rentalStreak + 1;
        setRentalStreak(newStreak);
        localStorage.setItem(`rental_streak_${account}`, newStreak.toString());
        
        // Check for streak achievements
        if (newStreak === 3) unlockAchievement('THREE_DAY_STREAK');
        if (newStreak === 7) unlockAchievement('WEEK_STREAK');
        if (newStreak === 30) unlockAchievement('MONTH_STREAK');
      } else {
        // Reset streak if not consecutive
        setRentalStreak(1);
        localStorage.setItem(`rental_streak_${account}`, '1');
      }
      
      localStorage.setItem(`last_rental_date_${account}`, today);
    }
  };

  const value: AchievementContextType = {
    achievements,
    rentalStreak,
    unlockAchievement,
    incrementRentalStreak,
    getTotalPoints: () => achievements.reduce((sum, a) => sum + a.points, 0),
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};
