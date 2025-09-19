import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  Users, 
  Star, 
  Award,
  DollarSign,
  Clock,
  Shield,
  Trophy,
  Activity,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import UserDashboard from '@/components/UserDashboard';
import { useWeb3 } from '@/contexts/Web3Context';

const Dashboard: React.FC = () => {
  const { account, isConnected } = useWeb3();

  // Mock data for demonstration
  const mockStats = {
    totalNFTs: 12,
    activeRentals: 3,
    totalEarnings: 2450.75,
    reputationScore: 850,
    successRate: 94.2,
    totalRentals: 28,
    monthlyGrowth: 12.5,
    communityRank: 15
  };

  const recentActivity = [
    { id: 1, type: 'rental', description: 'Rented "Digital Art #123" for 7 days', amount: '+$45.00', time: '2 hours ago' },
    { id: 2, type: 'earning', description: 'Received payment for "Music NFT #456"', amount: '+$120.00', time: '5 hours ago' },
    { id: 3, type: 'listing', description: 'Listed "Photography #789" for rent', amount: '', time: '1 day ago' },
    { id: 4, type: 'achievement', description: 'Unlocked "Rental Master" achievement', amount: '', time: '2 days ago' },
  ];

  const topPerformers = [
    { rank: 1, name: 'Digital Art #123', earnings: 450.00, rentals: 8 },
    { rank: 2, name: 'Music NFT #456', earnings: 320.00, rentals: 6 },
    { rank: 3, name: 'Photography #789', earnings: 280.00, rentals: 5 },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">Welcome to Your Dashboard</h1>
                <p className="text-lg text-slate-300 mb-8">
                  Connect your wallet to access your NFT portfolio, rental history, and analytics
                </p>
                <Button 
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                >
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-lg text-slate-300">
              Welcome back! Here's your NFT rental overview
            </p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total NFTs</p>
                      <p className="text-2xl font-bold text-blue-600">{mockStats.totalNFTs}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold text-green-600">${mockStats.totalEarnings.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Reputation Score</p>
                      <p className="text-2xl font-bold text-purple-600">{mockStats.reputationScore}</p>
                    </div>
                    <Trophy className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Rentals</p>
                      <p className="text-2xl font-bold text-orange-600">{mockStats.activeRentals}</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'rental' ? 'bg-blue-500' :
                            activity.type === 'earning' ? 'bg-green-500' :
                            activity.type === 'listing' ? 'bg-purple-500' :
                            'bg-yellow-500'
                          }`} />
                          <span className="text-sm text-slate-300">{activity.description}</span>
                        </div>
                        <div className="text-right">
                          {activity.amount && (
                            <span className={`text-sm font-semibold ${
                              activity.amount.startsWith('+') ? 'text-green-400' : 'text-slate-400'
                            }`}>
                              {activity.amount}
                            </span>
                          )}
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Performers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerformers.map((nft) => (
                      <div key={nft.rank} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            #{nft.rank}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium text-white">{nft.name}</p>
                            <p className="text-xs text-slate-400">{nft.rentals} rentals</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-400">${nft.earnings}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Success Rate</span>
                    <span className="text-lg font-bold text-green-400">{mockStats.successRate}%</span>
                  </div>
                  <Progress value={mockStats.successRate} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Successful</p>
                      <p className="text-lg font-semibold text-green-400">{mockStats.totalRentals - 2}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-lg font-semibold text-red-400">2</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5 text-blue-500" />
                  Community Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-400 mb-2">#{mockStats.communityRank}</p>
                    <p className="text-sm text-muted-foreground">Out of 1,247 users</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Growth</span>
                      <span className="text-green-400">+{mockStats.monthlyGrowth}%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="pt-4">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <Award className="w-3 h-3 mr-1" />
                      Rising Star
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Dashboard Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <UserDashboard />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
