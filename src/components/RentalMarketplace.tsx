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
  CheckCircle
} from 'lucide-react';
import { useNFTFlow } from '@/hooks/useNFTFlow';
import { useWeb3 } from '@/contexts/Web3Context';
import { formatEther, parseEther } from 'ethers';

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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedNFT, setSelectedNFT] = useState<NFTRental | null>(null);
  const [rentalDuration, setRentalDuration] = useState(3600); // 1 hour default
  const [isRenting, setIsRenting] = useState(false);

  // Mock data for demonstration
  const mockNFTs: NFTRental[] = [
    {
      id: '1',
      nftContract: '0x123...',
      tokenId: 1,
      owner: '0x456...',
      pricePerSecond: '0.000001',
      minDuration: 3600,
      maxDuration: 86400,
      collateralRequired: '1.0',
      image: '/placeholder.svg',
      name: 'Epic Gaming Sword',
      collection: 'Fantasy Weapons',
      isRented: false,
      reputationScore: 850
    },
    {
      id: '2',
      nftContract: '0x123...',
      tokenId: 2,
      owner: '0x789...',
      pricePerSecond: '0.000002',
      minDuration: 1800,
      maxDuration: 172800,
      collateralRequired: '2.0',
      image: '/placeholder.svg',
      name: 'Digital Art Masterpiece',
      collection: 'Modern Art',
      isRented: false,
      reputationScore: 920
    },
    {
      id: '3',
      nftContract: '0x123...',
      tokenId: 3,
      owner: '0xabc...',
      pricePerSecond: '0.000003',
      minDuration: 7200,
      maxDuration: 259200,
      collateralRequired: '0.5',
      image: '/placeholder.svg',
      name: 'Metaverse Land Plot',
      collection: 'Virtual Real Estate',
      isRented: true,
      reputationScore: 750
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
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    <Zap className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                </div>
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
