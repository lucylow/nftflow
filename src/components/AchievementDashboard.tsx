import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Zap, 
  Users, 
  TrendingUp,
  Award,
  Target,
  Clock,
  Gift,
  Crown,
  Medal,
  Shield,
  Flame,
  Sparkles,
  CheckCircle,
  Lock,
  Eye,
  Share2,
  Download
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

interface Achievement {
  id: string;
  name: string;
  description: string;
  imageUri: string;
  category: 'rental' | 'social' | 'trading' | 'special';
  requirement: number;
  currentProgress: number;
  reward: number;
  xpReward: number;
  isUnlocked: boolean;
  isRare: boolean;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  maxHolders?: number;
  currentHolders: number;
}

interface UserProfile {
  level: number;
  xp: number;
  xpToNext: number;
  totalAchievements: number;
  rentalCount: number;
  socialShares: number;
  tradingVolume: number;
  rank: number;
  streak: number;
  lastActivity: number;
}

interface AchievementDashboardProps {
  className?: string;
}

export function AchievementDashboard({ className }: AchievementDashboardProps) {
  const { account, isConnected } = useWeb3();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('progress');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock data
  useEffect(() => {
    const generateMockData = () => {
      const mockAchievements: Achievement[] = [
        {
          id: 'rental-novice',
          name: 'Rental Novice',
          description: 'Complete your first 10 rentals',
          imageUri: '/achievements/rental-novice.png',
          category: 'rental',
          requirement: 10,
          currentProgress: 7,
          reward: 0.01,
          xpReward: 100,
          isUnlocked: false,
          isRare: false,
          rarity: 'common',
          currentHolders: 1250
        },
        {
          id: 'rental-master',
          name: 'Rental Master',
          description: 'Complete 100 rentals',
          imageUri: '/achievements/rental-master.png',
          category: 'rental',
          requirement: 100,
          currentProgress: 23,
          reward: 0.1,
          xpReward: 500,
          isUnlocked: false,
          isRare: false,
          rarity: 'rare',
          currentHolders: 89
        },
        {
          id: 'rental-legend',
          name: 'Rental Legend',
          description: 'Complete 1000 rentals',
          imageUri: '/achievements/rental-legend.png',
          category: 'rental',
          requirement: 1000,
          currentProgress: 23,
          reward: 1.0,
          xpReward: 2000,
          isUnlocked: false,
          isRare: true,
          rarity: 'legendary',
          currentHolders: 5
        },
        {
          id: 'social-butterfly',
          name: 'Social Butterfly',
          description: 'Share 10 rentals on social media',
          imageUri: '/achievements/social-butterfly.png',
          category: 'social',
          requirement: 10,
          currentProgress: 3,
          reward: 0.005,
          xpReward: 50,
          isUnlocked: false,
          isRare: false,
          rarity: 'common',
          currentHolders: 456
        },
        {
          id: 'influencer',
          name: 'Influencer',
          description: 'Share 100 rentals on social media',
          imageUri: '/achievements/influencer.png',
          category: 'social',
          requirement: 100,
          currentProgress: 3,
          reward: 0.05,
          xpReward: 250,
          isUnlocked: false,
          isRare: false,
          rarity: 'rare',
          currentHolders: 23
        },
        {
          id: 'big-spender',
          name: 'Big Spender',
          description: 'Spend 10 STT on rentals',
          imageUri: '/achievements/big-spender.png',
          category: 'trading',
          requirement: 10,
          currentProgress: 2.5,
          reward: 0.1,
          xpReward: 200,
          isUnlocked: false,
          isRare: false,
          rarity: 'common',
          currentHolders: 234
        },
        {
          id: 'high-roller',
          name: 'High Roller',
          description: 'Spend 100 STT on rentals',
          imageUri: '/achievements/high-roller.png',
          category: 'trading',
          requirement: 100,
          currentProgress: 2.5,
          reward: 1.0,
          xpReward: 1000,
          isUnlocked: false,
          isRare: true,
          rarity: 'epic',
          currentHolders: 12
        },
        {
          id: 'early-adopter',
          name: 'Early Adopter',
          description: 'Join NFTFlow in the first month',
          imageUri: '/achievements/early-adopter.png',
          category: 'special',
          requirement: 1,
          currentProgress: 1,
          reward: 0.5,
          xpReward: 1000,
          isUnlocked: true,
          isRare: true,
          unlockedAt: Date.now() - 86400000,
          rarity: 'legendary',
          maxHolders: 1000,
          currentHolders: 847
        },
        {
          id: 'streak-master',
          name: 'Streak Master',
          description: 'Rent NFTs for 7 consecutive days',
          imageUri: '/achievements/streak-master.png',
          category: 'special',
          requirement: 7,
          currentProgress: 3,
          reward: 0.25,
          xpReward: 500,
          isUnlocked: false,
          isRare: true,
          rarity: 'epic',
          currentHolders: 45
        }
      ];

      const mockProfile: UserProfile = {
        level: 5,
        xp: 1250,
        xpToNext: 750,
        totalAchievements: 1,
        rentalCount: 23,
        socialShares: 3,
        tradingVolume: 2.5,
        rank: 1247,
        streak: 3,
        lastActivity: Date.now() - 3600000
      };

      setAchievements(mockAchievements);
      setUserProfile(mockProfile);
      setIsLoading(false);
    };

    generateMockData();
  }, []);

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-orange-500';
      case 'mythic': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Medal className="w-4 h-4" />;
      case 'rare': return <Star className="w-4 h-4" />;
      case 'epic': return <Crown className="w-4 h-4" />;
      case 'legendary': return <Trophy className="w-4 h-4" />;
      case 'mythic': return <Flame className="w-4 h-4" />;
      default: return <Medal className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rental': return <Zap className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'trading': return <TrendingUp className="w-4 h-4" />;
      case 'special': return <Sparkles className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesUnlocked = !showUnlockedOnly || achievement.isUnlocked;
    
    return matchesCategory && matchesUnlocked;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return b.currentProgress - a.currentProgress;
      case 'rarity':
        const rarityOrder = ['mythic', 'legendary', 'epic', 'rare', 'common'];
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      case 'reward':
        return b.reward - a.reward;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return b.currentProgress - a.currentProgress;
    }
  });

  const getProgressPercentage = (achievement: Achievement): number => {
    return Math.min(100, (achievement.currentProgress / achievement.requirement) * 100);
  };

  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Trophy className="w-6 h-6" />
          Achievement Dashboard
        </h2>
        <p className="text-gray-600">Track your progress and unlock rewards</p>
      </div>

      {/* User Profile Summary */}
      {userProfile && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Level and XP */}
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{userProfile.level}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Level {userProfile.level}</p>
                <p className="text-xs text-gray-500">{userProfile.xp} XP</p>
              </div>

              {/* XP Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Level {userProfile.level + 1}</span>
                  <span>{userProfile.xpToNext} XP to go</span>
                </div>
                <Progress 
                  value={(userProfile.xp / (userProfile.xp + userProfile.xpToNext)) * 100} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{userProfile.xp} XP</span>
                  <span>{userProfile.xp + userProfile.xpToNext} XP</span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Achievements</span>
                  <span className="font-semibold">{userProfile.totalAchievements}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rentals</span>
                  <span className="font-semibold">{userProfile.rentalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Streak</span>
                  <span className="font-semibold text-orange-500">{userProfile.streak} days</span>
                </div>
              </div>

              {/* Rank */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-gray-600">Rank</p>
                <p className="text-lg font-bold">#{userProfile.rank}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Controls */}
      <div className="flex gap-4 mb-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="rental">Rental</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
          </TabsList>
        </Tabs>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="progress">Progress</option>
          <option value="rarity">Rarity</option>
          <option value="reward">Reward</option>
          <option value="name">Name</option>
        </select>

        <Button
          variant={showUnlockedOnly ? "default" : "outline"}
          onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
        >
          {showUnlockedOnly ? "Show All" : "Unlocked Only"}
        </Button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`relative overflow-hidden ${
              achievement.isUnlocked ? 'ring-2 ring-green-500' : ''
            }`}>
              {/* Rarity indicator */}
              <div className={`absolute top-2 right-2 ${getRarityColor(achievement.rarity)}`}>
                {getRarityIcon(achievement.rarity)}
              </div>

              {/* Rare achievement glow */}
              {achievement.isRare && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 pointer-events-none" />
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    {achievement.isUnlocked ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {achievement.name}
                      {achievement.isRare && <Sparkles className="w-4 h-4 text-yellow-500" />}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getCategoryIcon(achievement.category)}
                      <span className="capitalize">{achievement.category}</span>
                      <span>•</span>
                      <span className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{achievement.description}</p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{achievement.currentProgress} / {achievement.requirement}</span>
                  </div>
                  <Progress value={getProgressPercentage(achievement)} className="h-2" />
                </div>

                {/* Rewards */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Reward</p>
                      <p className="font-semibold text-green-600">{achievement.reward} STT</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">XP</p>
                      <p className="font-semibold text-blue-600">{achievement.xpReward}</p>
                    </div>
                  </div>
                  
                  {achievement.isUnlocked && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Unlocked
                    </Badge>
                  )}
                </div>

                {/* Holders info for rare achievements */}
                {achievement.isRare && achievement.maxHolders && (
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      {achievement.currentHolders} / {achievement.maxHolders} holders
                    </p>
                    <Progress 
                      value={(achievement.currentHolders / achievement.maxHolders) * 100} 
                      className="h-1 mt-1"
                    />
                  </div>
                )}

                {/* Unlock date */}
                {achievement.isUnlocked && achievement.unlockedAt && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Unlocked {formatTime(achievement.unlockedAt)}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={!achievement.isUnlocked}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!achievement.isUnlocked}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {filteredAchievements.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Achievements Found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later</p>
          </CardContent>
        </Card>
      )}

      {/* Export and Share */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Achievements
        </Button>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share Profile
        </Button>
      </div>
    </div>
  );
}

