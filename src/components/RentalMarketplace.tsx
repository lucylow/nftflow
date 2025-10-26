import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  DollarSign, 
  Shield, 
  Zap, 
  Timer, 
  Users, 
  TrendingUp,
  Filter,
  Search,
  Play,
  Pause,
  CheckCircle,
  Activity,
  Eye,
  Heart,
  Star,
  Download,
  Share2,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Radio
} from 'lucide-react';
import { useNFTFlow } from '@/hooks/useNFTFlow';
import { useEnhancedNFTFlow } from '@/hooks/useEnhancedNFTFlow';
import { useBlockchainEvents } from '@/hooks/useBlockchainEvents';
import { useWeb3 } from '@/contexts/Web3Context';
import { formatEther, parseEther } from 'ethers';
import { TransactionStatus } from '@/components/TransactionStatus';

interface NFTRental {
  id: string;
  nftContract: string;
  tokenId: number;
  owner: string;
  pricePerSecond: string;
  minDuration: number;
  maxDuration: number;
  collateralRequired: string;
  image: string;
  name: string;
  collection: string;
  isRented: boolean;
  reputationScore?: number;
  streamingEnabled?: boolean;
  streamUrl?: string;
  streamQuality?: 'HD' | '4K' | '8K';
  streamType?: 'video' | 'audio' | 'interactive' | 'vr';
  currentViewers?: number;
  totalViews?: number;
  likes?: number;
  streamDuration?: number;
}

interface RentalMarketplaceProps {
  className?: string;
}

export function RentalMarketplace({ className }: RentalMarketplaceProps) {
  const { account } = useWeb3();
  const { 
    rentNFT, 
    isLoading 
  } = useNFTFlow();
  const {
    rentNFTEnhanced,
    transactionStatus,
    clearTransactionStatus
  } = useEnhancedNFTFlow();
  const { userEvents } = useBlockchainEvents();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedNFT, setSelectedNFT] = useState<NFTRental | null>(null);
  const [rentalDuration, setRentalDuration] = useState(3600); // 1 hour default
  const [isRenting, setIsRenting] = useState(false);
  
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamQuality, setStreamQuality] = useState<'HD' | '4K' | '8K'>('HD');
  const [streamVolume, setStreamVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStreamTime, setCurrentStreamTime] = useState(0);

  // Enhanced mock data with realistic images and diverse NFTs
  const mockNFTs: NFTRental[] = [
    {
      id: '1',
      nftContract: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
      tokenId: 1234,
      owner: '0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59',
      pricePerSecond: '0.000138',
      minDuration: 3600,
      maxDuration: 86400,
      collateralRequired: '1.2',
      image: 'https://images.unsplash.com/photo-1578662996442-48f103fc96?w=400&h=400&fit=crop&crop=center',
      name: 'Cosmic Wizard #1234',
      collection: 'Cosmic Wizards',
      isRented: false,
      reputationScore: 875,
      streamingEnabled: true,
      streamUrl: 'https://stream.example.com/cosmic-wizard-1234',
      streamQuality: '4K',
      streamType: 'video',
      currentViewers: 42,
      totalViews: 1250,
      likes: 89,
      streamDuration: 3600
    },
    {
      id: '2',
      nftContract: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260360',
      tokenId: 5678,
      owner: '0x9876543210fedcba9876543210fedcba98765432',
      pricePerSecond: '0.000333',
      minDuration: 1800,
      maxDuration: 172800,
      collateralRequired: '2.5',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
      name: 'Neon Samurai #5678',
      collection: 'Neon Warriors',
      isRented: false,
      reputationScore: 920
    },
    {
      id: '3',
      nftContract: '0x7c8e2d3f4a5b6c9d1e2f3a4b5c6d7e8f9a0b1c2',
      tokenId: 9999,
      owner: '0x5555666677778888999900001111222233334444',
      pricePerSecond: '0.000055',
      minDuration: 7200,
      maxDuration: 604800,
      collateralRequired: '0.8',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&crop=center',
      name: 'Digital Art Gallery Space',
      collection: 'Virtual Spaces',
      isRented: false,
      reputationScore: 950
    },
    {
      id: '4',
      nftContract: '0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
      tokenId: 7777,
      owner: '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555',
      pricePerSecond: '0.000278',
      minDuration: 900,
      maxDuration: 43200,
      collateralRequired: '1.8',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
      name: 'Racing Beast #7777',
      collection: 'Speed Demons',
      isRented: false,
      reputationScore: 890
    },
    {
      id: '5',
      nftContract: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
      tokenId: 3333,
      owner: '0xffff0000eeee1111dddd2222cccc3333bbbb4444',
      pricePerSecond: '0.000417',
      minDuration: 3600,
      maxDuration: 259200,
      collateralRequired: '3.0',
      image: 'https://images.unsplash.com/photo-1578662015923-8c4e8ed4df3f?w=400&h=400&fit=crop&crop=center',
      name: 'Mystic Dragon #3333',
      collection: 'Legendary Dragons',
      isRented: false,
      reputationScore: 985
    },
    {
      id: '6',
      nftContract: '0x4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
      tokenId: 8888,
      owner: '0x1111aaaa2222bbbb3333cccc4444dddd5555eeee',
      pricePerSecond: '0.000167',
      minDuration: 1800,
      maxDuration: 86400,
      collateralRequired: '1.5',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=center',
      name: 'Cyberpunk Hacker Terminal',
      collection: 'Tech Arsenal',
      isRented: false,
      reputationScore: 846
    },
    {
      id: '7',
      nftContract: '0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2',
      tokenId: 6666,
      owner: '0x6666777788889999aaaabbbbccccddddeeeeffff',
      pricePerSecond: '0.000694',
      minDuration: 7200,
      maxDuration: 1209600,
      collateralRequired: '5.0',
      image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=400&fit=crop&crop=center',
      name: 'Space Station Module Alpha',
      collection: 'Cosmic Infrastructure',
      isRented: false,
      reputationScore: 962
    },
    {
      id: '8',
      nftContract: '0x2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1',
      tokenId: 1111,
      owner: '0x7777888899990000aaaabbbbccccddddeeeeffff',
      pricePerSecond: '0.000111',
      minDuration: 3600,
      maxDuration: 432000,
      collateralRequired: '2.2',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center',
      name: 'Enchanted Forest Realm',
      collection: 'Mystical Realms',
      isRented: false,
      reputationScore: 918
    }
  ];

  const filteredNFTs = mockNFTs.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.collection.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDuration = durationFilter === 'all' || 
      (durationFilter === 'short' && nft.minDuration <= 3600) ||
      (durationFilter === 'medium' && nft.minDuration > 3600 && nft.minDuration <= 86400) ||
      (durationFilter === 'long' && nft.minDuration > 86400);
    
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'low' && parseFloat(nft.pricePerSecond) <= 0.000001) ||
      (priceFilter === 'medium' && parseFloat(nft.pricePerSecond) > 0.000001 && parseFloat(nft.pricePerSecond) <= 0.000005) ||
      (priceFilter === 'high' && parseFloat(nft.pricePerSecond) > 0.000005);

    return matchesSearch && matchesDuration && matchesPrice && !nft.isRented;
  });

  const handleRentNFT = async (nft: NFTRental) => {
    if (!account) return;
    
    setIsRenting(true);
    try {
      const totalPrice = parseFloat(nft.pricePerSecond) * rentalDuration;
      const collateral = parseFloat(nft.collateralRequired);
      const totalAmount = totalPrice + collateral;
      
      await rentNFT(
        nft.id, // listingId 
        nft.id, // tokenId
        rentalDuration
      );
      
      // Success feedback
      console.log('NFT rented successfully!');
    } catch (error) {
      console.error('Failed to rent NFT:', error);
    } finally {
      setIsRenting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const formatPrice = (pricePerSecond: string) => {
    const price = parseFloat(pricePerSecond);
    if (price < 0.000001) return `${(price * 1000000).toFixed(2)}μ STT/s`;
    return `${price.toFixed(6)} STT/s`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <TransactionStatus 
        status={transactionStatus} 
        onClose={clearTransactionStatus}
      />
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          NFT Rental Marketplace
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Rent premium NFTs by the second. Access gaming assets, digital art, and metaverse items instantly.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{filteredNFTs.length}</div>
            <div className="text-sm text-muted-foreground">Available NFTs</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">&lt;1s</div>
            <div className="text-sm text-muted-foreground">Rental Speed</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">$0.0001</div>
            <div className="text-sm text-muted-foreground">Avg. Cost/Second</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">50+</div>
            <div className="text-sm text-muted-foreground">Collections</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search NFTs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or collection..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Label>Duration</Label>
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="short">Short (&lt;1h)</SelectItem>
                  <SelectItem value="medium">Medium (1h-1d)</SelectItem>
                  <SelectItem value="long">Long (&gt;1d)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:w-48">
              <Label>Price Range</Label>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Low (&lt;1μ STT/s)</SelectItem>
                  <SelectItem value="medium">Medium (1-5μ STT/s)</SelectItem>
                  <SelectItem value="high">High (&gt;5μ STT/s)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNFTs.map((nft, index) => (
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
                    {nft.reputationScore && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>{nft.reputationScore}</span>
                      </div>
                    )}
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
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      onClick={() => setSelectedNFT(nft)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Rent Now
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Rent {selectedNFT?.name}</DialogTitle>
                    </DialogHeader>
                    
                    {selectedNFT && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <img
                            src={selectedNFT.image}
                            alt={selectedNFT.name}
                            className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                          />
                          <p className="text-sm text-muted-foreground">{selectedNFT.collection}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="duration">Rental Duration</Label>
                            <Select value={rentalDuration.toString()} onValueChange={(value) => setRentalDuration(parseInt(value))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3600">1 Hour</SelectItem>
                                <SelectItem value="7200">2 Hours</SelectItem>
                                <SelectItem value="21600">6 Hours</SelectItem>
                                <SelectItem value="43200">12 Hours</SelectItem>
                                <SelectItem value="86400">1 Day</SelectItem>
                                <SelectItem value="172800">2 Days</SelectItem>
                                <SelectItem value="604800">1 Week</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Streaming options */}
                          {selectedNFT.streamingEnabled && (
                            <div className="space-y-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Radio className="w-5 h-5 text-green-400" />
                                <h4 className="font-medium text-green-400">Streaming Options</h4>
                              </div>
                              
                              <div>
                                <Label htmlFor="stream-quality">Stream Quality</Label>
                                <Select value={streamQuality} onValueChange={(value: 'HD' | '4K' | '8K') => setStreamQuality(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="HD">HD (1080p)</SelectItem>
                                    <SelectItem value="4K">4K (2160p)</SelectItem>
                                    <SelectItem value="8K">8K (4320p)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span>Stream Type:</span>
                                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                                  {selectedNFT.streamType?.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span>Current Viewers:</span>
                                <span className="text-green-400">{selectedNFT.currentViewers}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Price per second:</span>
                              <span>{formatPrice(selectedNFT.pricePerSecond)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Duration:</span>
                              <span>{formatDuration(rentalDuration)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Rental cost:</span>
                              <span>{(parseFloat(selectedNFT.pricePerSecond) * rentalDuration).toFixed(6)} STT</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Collateral:</span>
                              <span>{selectedNFT.collateralRequired} STT</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-2">
                              <span>Total:</span>
                              <span>{(parseFloat(selectedNFT.pricePerSecond) * rentalDuration + parseFloat(selectedNFT.collateralRequired)).toFixed(6)} STT</span>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleRentNFT(selectedNFT)}
                            disabled={isRenting || !account}
                            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                          >
                            {isRenting ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Starting Rental...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Confirm Rental
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredNFTs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No NFTs found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        </div>
      )}
    </div>
  );
}
