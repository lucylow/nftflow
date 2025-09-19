import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Settings, 
  Zap, 
  BarChart3, 
  Search,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Activity,
  Globe,
  Smartphone,
  TestTube,
  Database,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Users
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context-minimal';

const WalletAndTools = () => {
  const { account, balance, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [activeTab, setActiveTab] = useState('wallet');

  const walletStats = {
    balance: balance || '0.0',
    stakedAmount: '2.5',
    totalEarnings: '1.8',
    activeRentals: 3
  };

  const recentTransactions = [
    {
      id: 1,
      type: 'Rental Payment',
      amount: '+0.1 ETH',
      to: '0x1234...5678',
      timestamp: '2 hours ago',
      status: 'Completed'
    },
    {
      id: 2,
      type: 'NFT Rental',
      amount: '-0.05 ETH',
      to: '0x9876...5432',
      timestamp: '1 day ago',
      status: 'Completed'
    },
    {
      id: 3,
      type: 'Staking Reward',
      amount: '+0.02 ETH',
      to: 'Staking Contract',
      timestamp: '3 days ago',
      status: 'Completed'
    }
  ];

  const tools = [
    {
      id: 1,
      name: 'Wallet Test',
      description: 'Test wallet functionality and connection',
      icon: <TestTube className="h-6 w-6" />,
      href: '/wallet-test',
      status: 'Available'
    },
    {
      id: 2,
      name: 'Subgraph Explorer',
      description: 'Explore blockchain data with GraphQL',
      icon: <Database className="h-6 w-6" />,
      href: '/subgraph',
      status: 'Available'
    },
    {
      id: 3,
      name: 'Somnia Network',
      description: 'Access Somnia blockchain features',
      icon: <Globe className="h-6 w-6" />,
      href: '/somnia',
      status: 'Available'
    },
    {
      id: 4,
      name: 'Rental Flow',
      description: 'Advanced rental management tools',
      icon: <Clock className="h-6 w-6" />,
      href: '/rental',
      status: 'Available'
    },
    {
      id: 5,
      name: 'Mobile App',
      description: 'Download mobile application',
      icon: <Smartphone className="h-6 w-6" />,
      href: '/mobile',
      status: 'Coming Soon'
    }
  ];

  const networkInfo = {
    name: 'Somnia',
    chainId: 50312,
    rpcUrl: 'https://rpc.somnia.network',
    blockExplorer: 'https://explorer.somnia.network',
    nativeCurrency: 'STT'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wallet className="h-6 w-6 text-primary" />
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Wallet & Tools
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Wallet & Tools</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Manage your wallet, explore blockchain data, and access powerful tools for NFT rental management.
            Everything you need in one place.
          </p>
        </motion.div>

        {/* Wallet Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isConnected ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <Wallet className={`h-6 w-6 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
                    </h3>
                    <p className="text-muted-foreground">
                      {isConnected 
                        ? `Connected to ${account?.slice(0, 6)}...${account?.slice(-4)}`
                        : 'Connect your wallet to access all features'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isConnected ? (
                    <>
                      <Button variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Address
                      </Button>
                      <Button variant="outline" size="sm" onClick={disconnectWallet}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={connectWallet} className="bg-gradient-to-r from-primary to-accent">
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wallet Stats */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-background/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold text-white">{walletStats.balance} ETH</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Staked</p>
                    <p className="text-2xl font-bold text-white">{walletStats.stakedAmount} ETH</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Shield className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold text-white">{walletStats.totalEarnings} ETH</p>
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
                    <p className="text-sm text-muted-foreground">Active Rentals</p>
                    <p className="text-2xl font-bold text-white">{walletStats.activeRentals}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Wallet
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="rental" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Rental
              </TabsTrigger>
              <TabsTrigger value="subgraph" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Subgraph
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Network
              </TabsTrigger>
            </TabsList>

            {/* Wallet Tab */}
            <TabsContent value="wallet">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-border/30">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.amount.startsWith('+') ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}>
                              {tx.amount.startsWith('+') ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{tx.type}</h4>
                              <p className="text-sm text-muted-foreground">{tx.to}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                              {tx.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Wallet Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Send Transaction
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      Stake Tokens
                    </Button>
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Claim Rewards
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Wallet Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tools Tab */}
            <TabsContent value="tools">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <Card key={tool.id} className="bg-background/50 border-border/50 hover:border-primary/50 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/20 rounded-lg">
                          {tool.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white">{tool.name}</h3>
                            <Badge 
                              className={
                                tool.status === 'Available' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }
                            >
                              {tool.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            disabled={tool.status === 'Coming Soon'}
                          >
                            {tool.status === 'Available' ? (
                              <>
                                <ExternalLink className="mr-2 h-3 w-3" />
                                Open Tool
                              </>
                            ) : (
                              <>
                                <Clock className="mr-2 h-3 w-3" />
                                Coming Soon
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Rental Tab */}
            <TabsContent value="rental">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Streaming Rental Management</h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Manage your NFT rentals with advanced streaming tools and analytics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-background/50 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-blue-500/20 rounded-lg w-fit mx-auto mb-4">
                        <Clock className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Active Rentals</h3>
                      <p className="text-3xl font-bold text-white mb-2">3</p>
                      <p className="text-muted-foreground">Currently rented out</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-green-500/20 rounded-lg w-fit mx-auto mb-4">
                        <DollarSign className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Monthly Revenue</h3>
                      <p className="text-3xl font-bold text-white mb-2">1.2 ETH</p>
                      <p className="text-muted-foreground">From rentals</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-purple-500/20 rounded-lg w-fit mx-auto mb-4">
                        <TrendingUp className="h-8 w-8 text-purple-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Utilization Rate</h3>
                      <p className="text-3xl font-bold text-white mb-2">78%</p>
                      <p className="text-muted-foreground">Average occupancy</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Streaming Rental Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Rentals</span>
                        <span className="text-white font-medium">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Streaming Rentals</span>
                        <span className="text-green-400 font-medium">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Stream Views</span>
                        <span className="text-white font-medium">12,847</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Stream Duration</span>
                        <span className="text-white font-medium">2.4 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Peak Streaming Time</span>
                        <span className="text-white font-medium">7-9 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stream Revenue</span>
                        <span className="text-green-400 font-medium">2.8 ETH</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Subgraph Tab */}
            <TabsContent value="subgraph">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">GraphQL Blockchain Explorer</h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Explore blockchain data with powerful GraphQL queries and real-time analytics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-background/50 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-blue-500/20 rounded-lg w-fit mx-auto mb-4">
                        <Database className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Total NFTs</h3>
                      <p className="text-3xl font-bold text-white mb-2">12,847</p>
                      <p className="text-muted-foreground">Indexed on blockchain</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-green-500/20 rounded-lg w-fit mx-auto mb-4">
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Active Rentals</h3>
                      <p className="text-3xl font-bold text-white mb-2">3,456</p>
                      <p className="text-muted-foreground">Currently rented</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-purple-500/20 rounded-lg w-fit mx-auto mb-4">
                        <Users className="h-8 w-8 text-purple-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Unique Users</h3>
                      <p className="text-3xl font-bold text-white mb-2">8,923</p>
                      <p className="text-muted-foreground">Active participants</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-background/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-white">Query Examples</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-background/30 rounded-lg border border-border/30">
                          <h4 className="text-white font-medium mb-2">Get NFT by ID</h4>
                          <code className="text-sm text-muted-foreground block">
                            {`query GetNFT($id: ID!) {
  nft(id: $id) {
    id
    name
    owner
    rentalPrice
  }
}`}
                          </code>
                        </div>
                        <div className="p-4 bg-background/30 rounded-lg border border-border/30">
                          <h4 className="text-white font-medium mb-2">Get User Rentals</h4>
                          <code className="text-sm text-muted-foreground block">
                            {`query GetUserRentals($user: String!) {
  rentals(where: {renter: $user}) {
    id
    nft
    startTime
    endTime
  }
}`}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-white">Real-time Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Block Height</span>
                          <span className="text-white font-medium">1,234,567</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Indexed</span>
                          <span className="text-white font-medium">2 minutes ago</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Query Count</span>
                          <span className="text-white font-medium">45,678</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Response Time</span>
                          <span className="text-white font-medium">120ms</span>
                        </div>
                      </div>
                      <Button className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                        <Database className="mr-2 h-4 w-4" />
                        Open GraphQL Playground
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Mobile Tab */}
            <TabsContent value="mobile">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Mobile App</h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Take NFTFlow with you - mobile app coming soon with native features.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-background/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Smartphone className="h-5 w-5 text-blue-400" />
                        iOS App
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge className="bg-blue-500/20 text-blue-400">In Development</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Version</span>
                          <span className="text-white">1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Release</span>
                          <span className="text-white">Q2 2024</span>
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                          <Smartphone className="mr-2 h-4 w-4" />
                          Coming Soon
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Smartphone className="h-5 w-5 text-green-400" />
                        Android App
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge className="bg-green-500/20 text-green-400">In Development</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Version</span>
                          <span className="text-white">1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Release</span>
                          <span className="text-white">Q2 2024</span>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                          <Smartphone className="mr-2 h-4 w-4" />
                          Coming Soon
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Mobile Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { name: "Mobile Wallet", icon: <Wallet className="h-5 w-5 text-purple-400" /> },
                        { name: "Camera Integration", icon: <Search className="h-5 w-5 text-blue-400" /> },
                        { name: "Touch Optimized", icon: <Settings className="h-5 w-5 text-green-400" /> },
                        { name: "Offline Support", icon: <Globe className="h-5 w-5 text-yellow-400" /> }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-background/30 rounded-lg">
                          {feature.icon}
                          <span className="text-white font-medium">{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Network Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Name</span>
                      <span className="text-white font-medium">{networkInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chain ID</span>
                      <span className="text-white font-medium">{networkInfo.chainId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Native Currency</span>
                      <span className="text-white font-medium">{networkInfo.nativeCurrency}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-muted-foreground">RPC URL</span>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-background/30 rounded text-sm text-white">
                          {networkInfo.rpcUrl}
                        </code>
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-muted-foreground">Block Explorer</span>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-background/30 rounded text-sm text-white">
                          {networkInfo.blockExplorer}
                        </code>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-white">Network Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      <Globe className="mr-2 h-4 w-4" />
                      Switch Network
                    </Button>
                    <Button variant="outline" className="w-full">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Network Stats
                    </Button>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Explorer
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Network Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletAndTools;
