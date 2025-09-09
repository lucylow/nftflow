import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Clock, 
  TrendingUp, 
  Users, 
  Zap,
  RefreshCw
} from 'lucide-react';
import { RentalMarketplace } from '@/components/RentalMarketplace';
import { RentalStatusList } from '@/components/RentalStatus';
import { LoadingSpinner } from '@/components/ui/skeleton';
import { useWeb3 } from '@/contexts/Web3Context';

// Mock rental data
const mockRentals = [
  {
    id: '1',
    nftContract: '0x123...',
    tokenId: 1,
    name: 'Epic Gaming Sword',
    image: '/placeholder.svg',
    collection: 'Fantasy Weapons',
    startTime: Math.floor(Date.now() / 1000) - 1800, // Started 30 minutes ago
    endTime: Math.floor(Date.now() / 1000) + 1800, // Ends in 30 minutes
    totalPrice: '0.0036',
    collateralRequired: '1.0',
    status: 'active' as const,
    lender: '0x456...',
    tenant: '0x789...'
  },
  {
    id: '2',
    nftContract: '0x123...',
    tokenId: 2,
    name: 'Digital Art Masterpiece',
    image: '/placeholder.svg',
    collection: 'Modern Art',
    startTime: Math.floor(Date.now() / 1000) - 3600, // Started 1 hour ago
    endTime: Math.floor(Date.now() / 1000) - 300, // Expired 5 minutes ago
    totalPrice: '0.0072',
    collateralRequired: '2.0',
    status: 'expired' as const,
    lender: '0xabc...',
    tenant: '0xdef...'
  }
];

export default function EnhancedMarketplace() {
  const { account, isConnected } = useWeb3();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('marketplace');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleCompleteRental = (rentalId: string) => {
    console.log('Completing rental:', rentalId);
    // Implement rental completion logic
  };

  const handleCancelRental = (rentalId: string) => {
    console.log('Cancelling rental:', rentalId);
    // Implement rental cancellation logic
  };

  const handleExtendRental = (rentalId: string) => {
    console.log('Extending rental:', rentalId);
    // Implement rental extension logic
  };

  const stats = [
    { 
      label: 'Available NFTs', 
      value: '1,247', 
      icon: ShoppingCart,
      change: '+12%',
      changeType: 'positive' as const
    },
    { 
      label: 'Active Rentals', 
      value: '892', 
      icon: Clock,
      change: '+8%',
      changeType: 'positive' as const
    },
    { 
      label: 'Total Volume', 
      value: '2.4K STT', 
      icon: TrendingUp,
      change: '+23%',
      changeType: 'positive' as const
    },
    { 
      label: 'Active Users', 
      value: '1,156', 
      icon: Users,
      change: '+15%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              NFT Rental Marketplace
            </h1>
            <p className="text-muted-foreground mt-2">
              Rent premium NFTs by the second on Somnia blockchain
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="shrink-0"
          >
            {isRefreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge 
                      variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">vs last week</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="rentals" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              My Rentals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            <RentalMarketplace />
          </TabsContent>

          <TabsContent value="rentals" className="space-y-6">
            {!isConnected ? (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Connect your wallet to view and manage your NFT rentals. 
                      Track active rentals, complete expired ones, and view your rental history.
                    </p>
                    <Button className="mt-4">
                      Connect Wallet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <RentalStatusList
                rentals={mockRentals}
                onComplete={handleCompleteRental}
                onCancel={handleCancelRental}
                onExtend={handleExtendRental}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                <span>Browse All NFTs</span>
                <span className="text-xs text-muted-foreground">Discover available rentals</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Clock className="w-6 h-6" />
                <span>View Active Rentals</span>
                <span className="text-xs text-muted-foreground">Manage your rentals</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                <span>Analytics Dashboard</span>
                <span className="text-xs text-muted-foreground">Track your activity</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
