import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  Star,
  Shield,
  Zap,
  Activity,
  BarChart3,
  History,
  Eye,
  Heart,
  Share2,
  Bookmark
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface NFTDetail {
  id: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  owner: string;
  pricePerSecond: number;
  minDuration: number;
  maxDuration: number;
  collateralRequired: number;
  utilityType: string;
  utilityDescription: string;
  rarity: string;
  isRented: boolean;
  rentalHistory: Array<{
    id: string;
    renter: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    price: number;
    rating: number;
  }>;
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
  utilityMetrics: {
    totalRentals: number;
    totalRevenue: number;
    averageRating: number;
    utilizationRate: number;
    lastRented: Date;
  };
  dynamicPricing: {
    currentPrice: number;
    suggestedPrice: number;
    demandLevel: 'low' | 'medium' | 'high';
    priceTrend: 'up' | 'down' | 'stable';
  };
}

const EnhancedNFTDetail: React.FC<{ nftId: string }> = ({ nftId }) => {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [nftDetail, setNftDetail] = useState<NFTDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rentalDuration, setRentalDuration] = useState(3600); // 1 hour default
  const [isRenting, setIsRenting] = useState(false);

  // Mock data for demonstration
  const mockNFTDetail: NFTDetail = {
    id: nftId,
    name: "Legendary Dragon Sword",
    description: "A mythical weapon forged in the fires of Mount Doom, capable of slaying dragons and unlocking exclusive dungeon raids.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
    collection: "Epic Gaming Weapons",
    owner: "0x1234567890abcdef1234567890abcdef12345678",
    pricePerSecond: 0.000001,
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 1.0,
    utilityType: "Gaming Weapon",
    utilityDescription: "Unlocks exclusive dungeon raids and provides +50% damage boost",
    rarity: "Legendary",
    isRented: false,
    rentalHistory: [
      {
        id: "1",
        renter: "0x9876543210fedcba9876543210fedcba98765432",
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        duration: 4 * 60 * 60,
        price: 0.0144,
        rating: 5
      },
      {
        id: "2",
        renter: "0x5555666677778888555566667777888855556666",
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        duration: 2 * 60 * 60,
        price: 0.0072,
        rating: 4
      }
    ],
    priceHistory: [
      { date: '2024-01-01', price: 0.0000008 },
      { date: '2024-01-02', price: 0.0000009 },
      { date: '2024-01-03', price: 0.000001 },
      { date: '2024-01-04', price: 0.0000011 },
      { date: '2024-01-05', price: 0.000001 },
      { date: '2024-01-06', price: 0.0000012 },
      { date: '2024-01-07', price: 0.000001 }
    ],
    utilityMetrics: {
      totalRentals: 47,
      totalRevenue: 0.678,
      averageRating: 4.7,
      utilizationRate: 78,
      lastRented: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    dynamicPricing: {
      currentPrice: 0.000001,
      suggestedPrice: 0.0000012,
      demandLevel: 'high',
      priceTrend: 'up'
    }
  };

  useEffect(() => {
    loadNFTDetail();
  }, [nftId]);

  const loadNFTDetail = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNftDetail(mockNFTDetail);
    } catch (error) {
      console.error('Error loading NFT detail:', error);
      toast({
        title: "Failed to Load NFT",
        description: "Could not load NFT details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRent = async () => {
    if (!nftDetail || !account) return;

    setIsRenting(true);
    try {
      // In a real implementation, this would call the rental contract
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Rental Started",
        description: `Successfully rented ${nftDetail.name} for ${rentalDuration / 3600} hours`,
      });
    } catch (error) {
      console.error('Error renting NFT:', error);
      toast({
        title: "Rental Failed",
        description: "Could not complete rental",
        variant: "destructive",
      });
    } finally {
      setIsRenting(false);
    }
  };

  const calculateRentalCost = () => {
    if (!nftDetail) return 0;
    return nftDetail.pricePerSecond * rentalDuration;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-500 bg-red-100';
      case 'medium': return 'text-yellow-500 bg-yellow-100';
      case 'low': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      case 'stable': return <Activity className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!nftDetail) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">NFT Not Found</h3>
          <p className="text-muted-foreground">The requested NFT could not be found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {nftDetail.name}
          </h1>
          <p className="text-muted-foreground">{nftDetail.collection}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NFT Image and Basic Info */}
        <Card>
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            <img 
              src={nftDetail.image} 
              alt={nftDetail.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary/90 text-primary-foreground">
                {nftDetail.rarity}
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <Badge variant={nftDetail.isRented ? "destructive" : "secondary"}>
                {nftDetail.isRented ? "Rented" : "Available"}
              </Badge>
            </div>
          </div>
          <CardHeader>
            <CardTitle>{nftDetail.name}</CardTitle>
            <CardDescription>{nftDetail.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Utility Type</div>
                <div className="font-medium">{nftDetail.utilityType}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Owner</div>
                <div className="font-medium text-sm">
                  {nftDetail.owner.slice(0, 6)}...{nftDetail.owner.slice(-4)}
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Utility Description</div>
              <div className="text-sm bg-muted/50 p-3 rounded-lg">
                {nftDetail.utilityDescription}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rental Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Rental Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dynamic Pricing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Price</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {(nftDetail.pricePerSecond * 3600).toFixed(6)} STT/hour
                  </span>
                  {getTrendIcon(nftDetail.dynamicPricing.priceTrend)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Demand Level</span>
                <Badge className={getDemandColor(nftDetail.dynamicPricing.demandLevel)}>
                  {nftDetail.dynamicPricing.demandLevel}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Suggested Price</span>
                <span className="font-medium">
                  {(nftDetail.dynamicPricing.suggestedPrice * 3600).toFixed(6)} STT/hour
                </span>
              </div>
            </div>

            {/* Rental Duration */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Rental Duration</label>
              <div className="space-y-2">
                <input
                  type="range"
                  min={nftDetail.minDuration}
                  max={nftDetail.maxDuration}
                  value={rentalDuration}
                  onChange={(e) => setRentalDuration(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(nftDetail.minDuration)}</span>
                  <span>{formatDuration(rentalDuration)}</span>
                  <span>{formatDuration(nftDetail.maxDuration)}</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rental Cost</span>
                <span className="font-medium">{calculateRentalCost().toFixed(6)} STT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Collateral Required</span>
                <span className="font-medium">{nftDetail.collateralRequired} STT</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between font-medium">
                  <span>Total Required</span>
                  <span>{(calculateRentalCost() + nftDetail.collateralRequired).toFixed(6)} STT</span>
                </div>
              </div>
            </div>

            {/* Rent Button */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleRent}
              disabled={isRenting || nftDetail.isRented || !isConnected}
            >
              {isRenting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : nftDetail.isRented ? (
                "Currently Rented"
              ) : !isConnected ? (
                "Connect Wallet to Rent"
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Rent Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nftDetail.utilityMetrics.totalRentals}</div>
                <p className="text-xs text-muted-foreground">
                  All time rentals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nftDetail.utilityMetrics.totalRevenue} STT</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nftDetail.utilityMetrics.averageRating}/5</div>
                <p className="text-xs text-muted-foreground">
                  Based on {nftDetail.utilityMetrics.totalRentals} rentals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nftDetail.utilityMetrics.utilizationRate}%</div>
                <Progress value={nftDetail.utilityMetrics.utilizationRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Rental History
              </CardTitle>
              <CardDescription>
                Recent rental activity for this NFT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nftDetail.rentalHistory.map((rental) => (
                  <div key={rental.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {rental.renter.slice(0, 6)}...{rental.renter.slice(-4)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {rental.startTime.toLocaleDateString()} • {formatDuration(rental.duration)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{rental.price} STT</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < rental.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Price History
              </CardTitle>
              <CardDescription>
                Price trends over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={nftDetail.priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reviews & Ratings
              </CardTitle>
              <CardDescription>
                Feedback from previous renters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nftDetail.rentalHistory.map((rental) => (
                  <div key={rental.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {rental.renter.slice(0, 6)}...{rental.renter.slice(-4)}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < rental.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {rental.startTime.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Rented for {formatDuration(rental.duration)} • Paid {rental.price} STT
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedNFTDetail;
