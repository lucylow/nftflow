import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target, Zap, Users, TrendingUp, Award, Crown } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

interface Achievement {
  id: number;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
  icon: string;
}

interface UserProfile {
  totalPoints: number;
  rentalCount: number;
  totalSpent: string;
  streakDays: number;
  rank: number;
}

interface LeaderboardEntry {
  user: string;
  points: number;
  rank: number;
}

const GamificationDashboard: React.FC = () => {
  const { account, contract } = useWeb3();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const achievementIcons = {
    'FIRST_RENTAL': '🎯',
    'POWER_USER': '⚡',
    'COLLECTOR': '🎨',
    'SPEED_DEMON': '🏃',
    'HIGH_ROLLER': '💰',
    'COMMUNITY_BUILDER': '👥',
    'UTILITY_EXPLORER': '🔍',
    'STREAK_MASTER': '🔥',
    'MICRO_RENTER': '⏱️',
    'NFT_WHISPERER': '🎭'
  };

  useEffect(() => {
    if (account && contract) {
      loadGamificationData();
    }
  }, [account, contract]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      if (contract?.nftUtilityGamification) {
        const profile = await contract.nftUtilityGamification.getUserProfile(account);
        setUserProfile({
          totalPoints: Number(profile.totalPoints),
          rentalCount: Number(profile.rentalCount),
          totalSpent: profile.totalSpent.toString(),
          streakDays: Number(profile.streakDays),
          rank: Number(profile.rank)
        });

        // Load achievements
        const userAchievements = await contract.nftUtilityGamification.getUserAchievements(account);
        const allAchievements = await Promise.all(
          userAchievements.map(async (achievementType: number) => {
            const achievement = await contract.nftUtilityGamification.getAchievement(achievementType);
            return {
              id: achievementType,
              name: achievement.name,
              description: achievement.description,
              points: Number(achievement.points),
              unlocked: true,
              icon: achievementIcons[achievementType as keyof typeof achievementIcons] || '🏆'
            };
          })
        );
        setAchievements(allAchievements);

        // Load leaderboard
        const topEntries = await contract.nftUtilityGamification.getTopLeaderboard(10);
        setLeaderboard(topEntries.map((entry: any) => ({
          user: entry.user,
          points: Number(entry.points),
          rank: Number(entry.rank)
        })));
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-medium">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-amber-600 text-white';
    if (rank <= 10) return 'bg-blue-500 text-white';
    if (rank <= 100) return 'bg-green-500 text-white';
    return 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile?.totalPoints.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userProfile?.rank ? `Rank #${userProfile.rank}` : 'Unranked'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile?.rentalCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userProfile?.totalSpent ? `${(Number(userProfile.totalSpent) / 1e18).toFixed(4)} ETH` : '0 ETH'}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile?.streakDays || 0}</div>
            <p className="text-xs text-muted-foreground">
              Days active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription>
              Unlock achievements by using NFTFlow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-medium text-green-800">{achievement.name}</h4>
                        <p className="text-sm text-green-600">{achievement.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +{achievement.points} pts
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No achievements unlocked yet</p>
                  <p className="text-sm">Start renting NFTs to unlock achievements!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leaderboard
            </CardTitle>
            <CardDescription>
              Top users by points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      <div>
                        <p className="font-medium">
                          {entry.user.slice(0, 6)}...{entry.user.slice(-4)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.points.toLocaleString()} points
                        </p>
                      </div>
                    </div>
                    <Badge className={getRankBadgeColor(entry.rank)}>
                      #{entry.rank}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Leaderboard loading...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Achievement Progress
          </CardTitle>
          <CardDescription>
            Track your progress towards unlocking achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Power User</span>
                <span>{userProfile?.rentalCount || 0}/10 rentals</span>
              </div>
              <Progress value={((userProfile?.rentalCount || 0) / 10) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>High Roller</span>
                <span>
                  {userProfile?.totalSpent ? `${(Number(userProfile.totalSpent) / 1e18).toFixed(4)}/1.0 ETH` : '0/1.0 ETH'}
                </span>
              </div>
              <Progress 
                value={userProfile?.totalSpent ? Math.min((Number(userProfile.totalSpent) / 1e18) * 100, 100) : 0} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Streak Master</span>
                <span>{userProfile?.streakDays || 0}/7 days</span>
              </div>
              <Progress value={((userProfile?.streakDays || 0) / 7) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={loadGamificationData} variant="outline">
          Refresh Data
        </Button>
        <Button onClick={() => window.open('/marketplace', '_blank')}>
          Start Renting NFTs
        </Button>
      </div>
    </div>
  );
};

export default GamificationDashboard;