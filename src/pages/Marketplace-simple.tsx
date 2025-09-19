import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  DollarSign, 
  Shield, 
  Zap, 
  TrendingUp,
  Filter,
  Search,
  Play,
  Radio,
  Activity,
  Eye,
  Heart,
  Star
} from 'lucide-react';

export default function MarketplaceSimple() {
  console.log('🏪 MarketplaceSimple: Rendering marketplace...');

  // Simple mock data
  const mockNFTs = [
    {
      id: '1',
      name: 'Cosmic Wizard #1234',
      collection: 'Cosmic Wizards',
      pricePerSecond: '0.000138',
      minDuration: 3600,
      maxDuration: 86400,
      collateralRequired: '1.2',
      image: 'https://images.unsplash.com/photo-1578662996442-48f103fc96?w=400&h=400&fit=crop&crop=center',
      isRented: false,
      reputationScore: 875,
      streamingEnabled: true,
      streamQuality: '4K',
      streamType: 'video',
      currentViewers: 42,
      totalViews: 1250,
      likes: 89
    },
    {
      id: '2',
      name: 'Digital Dreams #5678',
      collection: 'Digital Dreams',
      pricePerSecond: '0.000200',
      minDuration: 1800,
      maxDuration: 43200,
      collateralRequired: '0.8',
      image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop&crop=center',
      isRented: false,
      reputationScore: 920,
      streamingEnabled: false
    },
    {
      id: '3',
      name: 'Neon Cityscape #9999',
      collection: 'Urban Digital',
      pricePerSecond: '0.000150',
      minDuration: 3600,
      maxDuration: 86400,
      collateralRequired: '1.0',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=center',
      isRented: false,
      reputationScore: 750,
      streamingEnabled: true,
      streamQuality: 'HD',
      streamType: 'audio',
      currentViewers: 15,
      totalViews: 890,
      likes: 45
    }
  ];

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return `${num.toFixed(6)} STT/sec`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">NFT Rental Marketplace</h1>
          <p className="text-gray-300 text-lg">
            Discover and rent NFTs by the second on Somnia Network
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search NFTs, collections, creators..."
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Sort
              </Button>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockNFTs.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group overflow-hidden">
                <div className="aspect-square relative overflow-hidden bg-muted/20">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      <Zap className="w-3 h-3 mr-1" />
                      Available
                    </Badge>
                    {nft.streamingEnabled && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        <Radio className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    )}
                  </div>
                  
                  {/* Streaming overlay */}
                  {nft.streamingEnabled && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex items-center justify-between text-white text-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{nft.currentViewers}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              <span>{nft.likes}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-red-400" />
                            <span className="text-red-400">{nft.streamQuality}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{nft.name}</h3>
                    <p className="text-sm text-muted-foreground">{nft.collection}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span>{formatPrice(nft.pricePerSecond)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>{formatDuration(nft.minDuration)} - {formatDuration(nft.maxDuration)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span>{nft.collateralRequired} STT collateral</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>{nft.reputationScore}</span>
                      </div>
                    </div>
                    
                    {/* Streaming info */}
                    {nft.streamingEnabled && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Radio className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">{nft.streamType?.toUpperCase()}</span>
                          </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span>{nft.totalViews} views</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Play className="w-4 h-4 mr-2" />
                    Rent Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
