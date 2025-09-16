import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  Zap,
  Wallet,
  Activity,
  Star,
  Calendar
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { MockDataService } from '@/mockData/mockDataService';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { account, isConnected, balance, chainId } = useWeb3();
  const navigate = useNavigate();

  // Get mock data
  const userNFTs = MockDataService.getNFTsByOwner(account || '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59');
  const activeRentals = MockDataService.getActiveRentals();
  const analytics = MockDataService.getAnalytics();

  const stats = [
    { 
      label: 'Your NFTs', 
      value: userNFTs.length.toString(), 
      icon: Wallet,
      change: '+2',
      changeType: 'positive' as const
    },
    { 
      label: 'Active Rentals', 
      value: activeRentals.filter(r => r.tenant === account).length.toString(), 
      icon: Clock,
      change: '+1',
      changeType: 'positive' as const
    },
    { 
      label: 'Total Earned', 
      value: `${userNFTs.reduce((sum, nft) => sum + parseFloat(nft.totalEarned || '0'), 0).toFixed(2)} STT`, 
      icon: DollarSign,
      change: '+12%',
      changeType: 'positive' as const
    },
    { 
      label: 'Reputation Score', 
      value: '875', 
      icon: Star,
      change: '+25',
      changeType: 'positive' as const
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'rental_started',
      nft: 'Cosmic Wizard #1234',
      amount: '0.75 STT',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'nft_listed',
      nft: 'Digital Art Masterpiece',
      amount: '2.25 STT/hour',
      time: '1 day ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'rental_completed',
      nft: 'Neon Samurai #5678',
      amount: '1.85 STT',
      time: '3 days ago',
      status: 'completed'
    }
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700/50 max-w-md mx-auto">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Connect Your Wallet</h3>
              <p className="text-slate-400">
                Connect your wallet to view your dashboard and manage your NFT rentals.
              </p>
              <Button 
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => navigate('/')}
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-slate-300">
            Welcome back! Manage your NFTs and track your rental activity.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-full">
                      <stat.icon className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge 
                      variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                      className="text-xs bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-slate-400 ml-2">this week</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your NFTs */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet className="w-5 h-5 text-purple-400" />
                Your NFTs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userNFTs.slice(0, 3).map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{nft.name}</h4>
                      <p className="text-sm text-slate-400">{nft.collectionId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-400">{nft.currentPrice} STT</p>
                      <p className="text-xs text-slate-400">{nft.rentalCount} rentals</p>
                    </div>
                  </motion.div>
                ))}
                {userNFTs.length === 0 && (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400">No NFTs found</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => navigate('/marketplace')}
                    >
                      Browse Marketplace
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="w-5 h-5 text-purple-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className="p-2 bg-purple-500/10 rounded-full">
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {activity.type === 'rental_started' && 'Started rental'}
                        {activity.type === 'nft_listed' && 'Listed NFT'}
                        {activity.type === 'rental_completed' && 'Completed rental'}
                      </p>
                      <p className="text-xs text-slate-400">{activity.nft}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-400">{activity.amount}</p>
                      <p className="text-xs text-slate-400">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700/50 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-purple-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2 border-slate-600 text-slate-300 hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-400"
                onClick={() => navigate('/marketplace')}
              >
                <TrendingUp className="w-6 h-6" />
                <span>Browse Marketplace</span>
                <span className="text-xs text-slate-400">Discover NFTs to rent</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2 border-slate-600 text-slate-300 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400"
                onClick={() => navigate('/analytics')}
              >
                <BarChart3 className="w-6 h-6" />
                <span>View Analytics</span>
                <span className="text-xs text-slate-400">Track your performance</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2 border-slate-600 text-slate-300 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-400"
                onClick={() => navigate('/profile')}
              >
                <Users className="w-6 h-6" />
                <span>View Profile</span>
                <span className="text-xs text-slate-400">Manage your account</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
