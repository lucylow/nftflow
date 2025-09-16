import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Zap, 
  Clock, 
  DollarSign, 
  Shield, 
  TrendingUp,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { hybridNFTService, HybridNFTRental } from '@/services/hybridNFTService';

interface NFTCardProps {
  nft: HybridNFTRental;
  onRent?: (nft: HybridNFTRental) => void;
}

const NFTCard = ({ nft, onRent }: NFTCardProps) => {
  const [isRenting, setIsRenting] = useState(false);
  const { toast } = useToast();
  const { isConnected } = useWeb3();

  const handleRent = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to rent NFTs",
        variant: "destructive",
      });
      return;
    }

    setIsRenting(true);
    try {
      // Use hybrid service to rent NFT
      const txHash = await hybridNFTService.rentNFT(nft.id, 3600); // Rent for 1 hour
      
      toast({
        title: "Rental Started",
        description: `Successfully rented ${nft.name || nft.metadata?.name} for 1 hour`,
      });
      
      console.log('Rental transaction:', txHash);
    } catch (error) {
      console.error('Rental failed:', error);
      toast({
        title: "Rental Failed",
        description: error instanceof Error ? error.message : "Failed to start rental",
        variant: "destructive",
      });
    } finally {
      setIsRenting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group"
    >
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300 group/card shadow-lg hover:shadow-xl hover:shadow-primary/10">
        {/* Image Container */}
        <div className="aspect-square relative overflow-hidden bg-muted/20">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover/card:scale-110"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-all duration-300">
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <div className="flex gap-2">
                {nft.metadata?.attributes?.find((attr: any) => attr.trait_type === 'Rarity') && (
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/90 text-primary-foreground backdrop-blur-sm border-0"
                  >
                    {nft.metadata.attributes.find((attr: any) => attr.trait_type === 'Rarity')?.value}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                <Badge 
                  variant="secondary" 
                  className="bg-green-500/90 text-white backdrop-blur-sm border-0"
                >
                  Available
                </Badge>
                <Badge 
                  variant="outline"
                  className={`backdrop-blur-sm border-0 ${
                    nft.source === 'blockchain' 
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                      : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  }`}
                >
                  {nft.source === 'blockchain' ? '🔗' : '🎭'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Title and Collection */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground truncate group-hover/card:text-primary transition-colors">
              {nft.name || nft.metadata?.name || 'Unknown NFT'}
            </h3>
            <p className="text-muted-foreground text-sm">{nft.collection || 'Unknown Collection'}</p>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price/second</span>
              <span className="font-mono text-primary font-semibold">
                {parseFloat(nft.pricePerSecond).toFixed(6)} STT
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price/hour</span>
              <span className="font-mono text-primary font-semibold">
                {(parseFloat(nft.pricePerSecond) * 3600).toFixed(6)} STT
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="font-mono">{nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</span>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp size={12} />
                <span>{nft.rentalCount || 0} rentals</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleRent}
              disabled={!nft.isActive || isRenting || !isConnected}
              variant={!nft.isActive ? "secondary" : "premium"}
              className="w-full transition-all duration-200 relative overflow-hidden group"
            >
              {isRenting ? (
                <Pause className="w-4 h-4 mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              
              <span className="relative z-10">
                {isRenting ? 'Starting Rental...' : 
                 !isConnected ? 'Connect Wallet' :
                 !nft.isActive ? 'Currently Rented' : 'Rent Now'}
              </span>
              
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </motion.div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Instant access</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Secure rental</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Marketplace() {
  const { account, isConnected, isBlockchainReady, serviceStatus } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [nftListings, setNftListings] = useState<HybridNFTRental[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load NFT listings from hybrid service
  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true);
      try {
        const listings = await hybridNFTService.getAllRentalListings();
        setNftListings(listings);
        console.log('📡 Loaded', listings.length, 'NFT listings');
      } catch (error) {
        console.error('Failed to load NFT listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, [isConnected]);

  // Get collections from NFT listings for filtering
  const collections = Array.from(
    new Set(nftListings.map(nft => nft.collection).filter(Boolean))
  ).map(collection => ({ id: collection!, name: collection! }));

  const filteredNFTs = nftListings.filter(nft => {
    const nftName = nft.name || nft.metadata?.name || '';
    const nftCollection = nft.collection || nft.metadata?.name || '';
    
    const matchesSearch = nftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nftCollection.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'low' && parseFloat(nft.pricePerSecond) <= 0.000001) ||
      (priceFilter === 'medium' && parseFloat(nft.pricePerSecond) > 0.000001 && parseFloat(nft.pricePerSecond) <= 0.000005) ||
      (priceFilter === 'high' && parseFloat(nft.pricePerSecond) > 0.000005);

    const matchesCollection = collectionFilter === 'all' || nft.collection === collectionFilter;

    return matchesSearch && matchesPrice && matchesCollection && nft.isActive;
  });

  const stats = [
    { 
      label: 'Available NFTs', 
      value: filteredNFTs.length.toString(), 
      icon: Zap,
      change: '+12%',
      changeType: 'positive' as const
    },
    { 
      label: 'Collections', 
      value: collections.length.toString(), 
      icon: TrendingUp,
      change: '+8%',
      changeType: 'positive' as const
    },
    { 
      label: 'Total Volume', 
      value: '2.4K STT', 
      icon: DollarSign,
      change: '+23%',
      changeType: 'positive' as const
    },
    { 
      label: 'Active Users', 
      value: '1,156', 
      icon: Clock,
      change: '+15%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            NFT Rental Marketplace
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Rent premium NFTs by the second on Somnia blockchain. Access gaming assets, digital art, and metaverse items instantly.
          </p>
          
          {/* Service Status */}
          <div className="flex justify-center gap-4 mt-4">
            <Badge 
              variant={isBlockchainReady ? "default" : "secondary"}
              className={`px-3 py-1 ${
                isBlockchainReady 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}
            >
              {isBlockchainReady ? '🔗 Blockchain Active' : '🎭 Mock Mode'}
            </Badge>
            {serviceStatus.blockchain && (
              <Badge variant="outline" className="px-3 py-1 border-purple-500/30 text-purple-400">
                📡 Somnia Testnet
              </Badge>
            )}
          </div>
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
                    <span className="text-xs text-slate-400 ml-2">vs last week</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700/50 mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search NFTs</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or collection..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Label>Price Range</Label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Filter by price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="low">Low (&lt;1 STT)</SelectItem>
                    <SelectItem value="medium">Medium (1-5 STT)</SelectItem>
                    <SelectItem value="high">High (&gt;5 STT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-48">
                <Label>Collection</Label>
                <Select value={collectionFilter} onValueChange={setCollectionFilter}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Filter by collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Collections</SelectItem>
                    {collections.map(collection => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NFT Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700/50">
                <div className="aspect-square bg-slate-700/50 animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-slate-700/50 rounded animate-pulse" />
                  <div className="h-3 bg-slate-700/50 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-slate-700/50 rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNFTs.map((nft, index) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        )}

        {filteredNFTs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-white">No NFTs found</h3>
              <p className="text-slate-400">Try adjusting your search criteria or filters</p>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {!isConnected && (
          <Card className="bg-slate-800/50 border-slate-700/50 mt-8">
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Connect Your Wallet</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Connect your wallet to rent NFTs and access the full marketplace experience. 
                  All rentals are secured by smart contracts on Somnia blockchain.
                </p>
                <Button className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
