import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  Clock, 
  Star,
  Eye,
  Heart,
  Share2,
  Settings,
  Edit,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

const UserProfile = () => {
  const { account } = useWeb3();
  const [activeTab, setActiveTab] = useState('profile');

  const userStats = {
    totalNFTs: 12,
    activeRentals: 8,
    totalEarnings: '2.4 ETH',
    totalSpent: '1.8 ETH',
    rating: 4.8,
    reviews: 23
  };

  const ownedNFTs = [
    {
      id: 1,
      name: "Cyberpunk Ape #123",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&h=300&fit=crop",
      price: "0.5 ETH",
      status: "Available",
      earnings: "0.2 ETH"
    },
    {
      id: 2,
      name: "Abstract Universe #456",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop",
      price: "0.3 ETH",
      status: "Rented",
      earnings: "0.1 ETH"
    },
    {
      id: 3,
      name: "Neon Skull #789",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop",
      price: "0.8 ETH",
      status: "Available",
      earnings: "0.4 ETH"
    }
  ];

  const rentalHistory = [
    {
      id: 1,
      nftName: "Digital Waves #001",
      renter: "0x1234...5678",
      duration: "2 days",
      amount: "0.1 ETH",
      status: "Completed",
      date: "2024-01-15"
    },
    {
      id: 2,
      nftName: "Cyber Art #042",
      renter: "0x9876...5432",
      duration: "1 week",
      amount: "0.3 ETH",
      status: "Active",
      date: "2024-01-20"
    }
  ];

  const analyticsData = {
    monthlyEarnings: [0.1, 0.2, 0.15, 0.3, 0.25, 0.4],
    monthlyRentals: [2, 3, 1, 4, 3, 5],
    topCategories: [
      { name: 'Art', count: 8, percentage: 40 },
      { name: 'Gaming', count: 6, percentage: 30 },
      { name: 'Music', count: 4, percentage: 20 },
      { name: 'Sports', count: 2, percentage: 10 }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Anonymous User'}
                    </h1>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-white font-medium">{userStats.rating}</span>
                        <span className="text-muted-foreground">({userStats.reviews} reviews)</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Verified Creator
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total NFTs</p>
                  <p className="text-2xl font-bold text-white">{userStats.totalNFTs}</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Rentals</p>
                  <p className="text-2xl font-bold text-white">{userStats.activeRentals}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-white">{userStats.totalEarnings}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-white">{userStats.totalSpent}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Wallet className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                My NFTs
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Rental History
              </TabsTrigger>
            </TabsList>

            {/* My NFTs Tab */}
            <TabsContent value="profile">
              <Card className="bg-background/50 border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">My NFTs</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add NFT
                      </Button>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownedNFTs.map((nft) => (
                      <Card key={nft.id} className="bg-background/30 border-border/30 hover:border-primary/50 transition-all duration-300">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-full h-48 object-cover"
                          />
                          <Badge 
                            className={`absolute top-3 right-3 ${
                              nft.status === 'Available' 
                                ? 'bg-green-500/90 text-white' 
                                : 'bg-orange-500/90 text-white'
                            }`}
                          >
                            {nft.status}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-white mb-2">{nft.name}</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Price</span>
                              <span className="text-white font-medium">{nft.price}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Earnings</span>
                              <span className="text-green-400 font-medium">{nft.earnings}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Portfolio Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="text-white font-medium">12.4 ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">24h Change</span>
                        <span className="text-green-400 font-medium">+2.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best Performer</span>
                        <span className="text-white font-medium">Cyberpunk Ape #123</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Worst Performer</span>
                        <span className="text-white font-medium">Abstract Universe #456</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { action: "NFT Listed", nft: "Neon Skull #789", time: "2 hours ago", type: "success" },
                        { action: "Rental Started", nft: "Cyberpunk Ape #123", time: "5 hours ago", type: "info" },
                        { action: "Payment Received", nft: "Abstract Universe #456", time: "1 day ago", type: "success" },
                        { action: "NFT Delisted", nft: "Digital Waves #001", time: "2 days ago", type: "warning" }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">{activity.nft}</p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={
                                activity.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                activity.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }
                            >
                              {activity.type}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Monthly Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {analyticsData.monthlyEarnings.map((amount, index) => (
                        <div key={index} className="flex flex-col items-center gap-2">
                          <div 
                            className="bg-primary rounded-t w-8 transition-all duration-500 hover:bg-primary/80"
                            style={{ height: `${(amount / 0.4) * 200}px` }}
                          />
                          <span className="text-xs text-muted-foreground">Month {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.topCategories.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white">{category.name}</span>
                            <span className="text-muted-foreground">{category.count} NFTs</span>
                          </div>
                          <div className="w-full bg-muted/20 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Rental History Tab */}
            <TabsContent value="history">
              <Card className="bg-background/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-white">Rental History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rentalHistory.map((rental) => (
                      <div key={rental.id} className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-border/30">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{rental.nftName}</h3>
                            <p className="text-sm text-muted-foreground">Rented by {rental.renter}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={
                                rental.status === 'Completed' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-blue-500/20 text-blue-400'
                              }
                            >
                              {rental.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-white font-medium">{rental.amount}</p>
                          <p className="text-xs text-muted-foreground">{rental.duration} • {rental.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
