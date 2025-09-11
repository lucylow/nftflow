import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Eye, 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Move3D,
  Headphones,
  Volume2,
  VolumeX,
  Settings,
  Share2,
  Heart,
  ShoppingCart,
  Clock,
  DollarSign,
  Star,
  Users,
  Zap
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useNFTFlow } from '@/hooks/useNFTFlow';

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  pricePerSecond: number;
  minDuration: number;
  maxDuration: number;
  rarity: string;
  utilityType: string;
  owner: string;
  isRented: boolean;
  rating: number;
  rentalCount: number;
  lastRented?: number;
  attributes: Array<{ trait_type: string; value: string }>;
  audioUrl?: string;
  videoUrl?: string;
  modelUrl?: string; // 3D model URL
}

interface VirtualShowroomProps {
  className?: string;
}

export function VirtualShowroom({ className }: VirtualShowroomProps) {
  const { account, isConnected } = useWeb3();
  const { rentNFT, isLoading } = useNFTFlow();
  
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'ar'>('2d');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [rentalDuration, setRentalDuration] = useState(3600); // 1 hour
  const [isRenting, setIsRenting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number | null>(null);

  // Generate mock NFT data
  useEffect(() => {
    const generateMockNFTs = (): NFT[] => {
      const categories = ['Gaming', 'Art', 'Music', 'Sports', 'Fashion', 'Collectibles'];
      const rarities = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
      const utilityTypes = ['Gaming', 'Social', 'Utility', 'Access', 'Collectible'];
      
      return Array.from({ length: 20 }, (_, i) => ({
        id: `nft-${i}`,
        name: `Epic NFT #${i + 1}`,
        description: `A unique digital asset with special properties and utility. This NFT represents ownership of a rare digital item with real-world applications.`,
        image: `/placeholder.svg`,
        collection: `Collection ${Math.floor(i / 4) + 1}`,
        pricePerSecond: Math.random() * 0.01 + 0.001,
        minDuration: 300, // 5 minutes
        maxDuration: 86400, // 24 hours
        rarity: rarities[Math.floor(Math.random() * rarities.length)],
        utilityType: utilityTypes[Math.floor(Math.random() * utilityTypes.length)],
        owner: `0x${Math.random().toString(16).substr(2, 8)}...`,
        isRented: Math.random() > 0.7,
        rating: Math.random() * 2 + 3, // 3-5 stars
        rentalCount: Math.floor(Math.random() * 100),
        lastRented: Date.now() - Math.random() * 86400000,
        attributes: [
          { trait_type: 'Color', value: ['Red', 'Blue', 'Green', 'Purple'][Math.floor(Math.random() * 4)] },
          { trait_type: 'Power', value: Math.floor(Math.random() * 100).toString() },
          { trait_type: 'Element', value: ['Fire', 'Water', 'Earth', 'Air'][Math.floor(Math.random() * 4)] }
        ],
        audioUrl: Math.random() > 0.5 ? '/audio/sample.mp3' : undefined,
        videoUrl: Math.random() > 0.7 ? '/video/sample.mp4' : undefined,
        modelUrl: Math.random() > 0.6 ? '/models/sample.glb' : undefined
      }));
    };

    setNfts(generateMockNFTs());
  }, []);

  // 3D rotation animation
  useEffect(() => {
    if (viewMode === '3d' && selectedNFT) {
      const animate = () => {
        setRotation(prev => (prev + 1) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [viewMode, selectedNFT]);

  // Audio controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || nft.utilityType === filterCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.pricePerSecond - b.pricePerSecond;
      case 'rating':
        return b.rating - a.rating;
      case 'rentals':
        return b.rentalCount - a.rentalCount;
      case 'rarity':
        const rarityOrder = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      default:
        return b.rentalCount - a.rentalCount;
    }
  });

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500';
      case 'Rare': return 'bg-blue-500';
      case 'Epic': return 'bg-purple-500';
      case 'Legendary': return 'bg-orange-500';
      case 'Mythic': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const calculateRentalCost = (nft: NFT, duration: number): number => {
    return nft.pricePerSecond * duration;
  };

  const handleRent = async (nft: NFT) => {
    if (!isConnected || !account) return;
    
    setIsRenting(true);
    try {
      const cost = calculateRentalCost(nft, rentalDuration);
      await rentNFT(nft.id, rentalDuration, { value: cost });
      
      // Update NFT status
      setNfts(prev => prev.map(n => 
        n.id === nft.id ? { ...n, isRented: true, lastRented: Date.now() } : n
      ));
    } catch (error) {
      console.error('Failed to rent NFT:', error);
    } finally {
      setIsRenting(false);
    }
  };

  const renderNFTView = () => {
    if (!selectedNFT) return null;

    switch (viewMode) {
      case '2d':
        return (
          <div className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
            <img
              src={selectedNFT.image}
              alt={selectedNFT.name}
              className="w-full h-full object-cover"
              style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
            />
            
            {/* Overlay controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );

      case '3d':
        return (
          <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ transform: `rotateY(${rotation}deg)` }}
            />
            
            {/* 3D placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Move3D className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">3D Model Loading...</p>
                <p className="text-sm text-gray-500">Rotation: {rotation}°</p>
              </div>
            </div>
          </div>
        );

      case 'ar':
        return (
          <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Eye className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">AR View</p>
                <p className="text-sm text-gray-500">Point your camera at the NFT</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="w-6 h-6" />
              Virtual NFT Showroom
            </h2>
            <p className="text-gray-600">Experience NFTs in immersive 3D and AR environments</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === '2d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('2d')}
            >
              2D
            </Button>
            <Button
              variant={viewMode === '3d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('3d')}
            >
              3D
            </Button>
            <Button
              variant={viewMode === 'ar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('ar')}
            >
              AR
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search NFTs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Categories</option>
            <option value="Gaming">Gaming</option>
            <option value="Art">Art</option>
            <option value="Music">Music</option>
            <option value="Sports">Sports</option>
            <option value="Fashion">Fashion</option>
            <option value="Collectibles">Collectibles</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="popularity">Popularity</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="rentals">Rentals</option>
            <option value="rarity">Rarity</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NFT Grid */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Available NFTs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredNFTs.map((nft) => (
                  <motion.div
                    key={nft.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedNFT?.id === nft.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedNFT(nft)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{nft.name}</p>
                          <Badge className={getRarityColor(nft.rarity)}>
                            {nft.rarity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{(nft.pricePerSecond * 1000).toFixed(3)} mSTT/s</span>
                          <span>•</span>
                          <span>{nft.rentalCount} rentals</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{nft.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main View */}
        <div className="lg:col-span-2">
          {selectedNFT ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {selectedNFT.name}
                    <Badge className={getRarityColor(selectedNFT.rarity)}>
                      {selectedNFT.rarity}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* NFT View */}
                {renderNFTView()}

                {/* Media Controls */}
                {(selectedNFT.audioUrl || selectedNFT.videoUrl) && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {selectedNFT.audioUrl && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <div className="flex items-center gap-2">
                          <Headphones className="w-4 h-4" />
                          <Slider
                            value={[volume]}
                            onValueChange={([value]) => setVolume(value)}
                            max={100}
                            step={1}
                            className="w-20"
                          />
                        </div>
                      </div>
                    )}
                    
                    {selectedNFT.videoUrl && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-600">Video Preview</span>
                      </div>
                    )}
                  </div>
                )}

                {/* NFT Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Collection</p>
                    <p className="font-medium">{selectedNFT.collection}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Utility Type</p>
                    <p className="font-medium">{selectedNFT.utilityType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Owner</p>
                    <p className="font-mono text-sm">{selectedNFT.owner}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rental Count</p>
                    <p className="font-medium">{selectedNFT.rentalCount}</p>
                  </div>
                </div>

                {/* Attributes */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Attributes</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNFT.attributes.map((attr, index) => (
                      <Badge key={index} variant="outline">
                        {attr.trait_type}: {attr.value}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Rental Controls */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Rental Duration</p>
                      <p className="text-2xl font-bold">
                        {formatDuration(rentalDuration)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Cost</p>
                      <p className="text-2xl font-bold text-green-600">
                        {calculateRentalCost(selectedNFT, rentalDuration).toFixed(6)} STT
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Slider
                      value={[rentalDuration]}
                      onValueChange={([value]) => setRentalDuration(value)}
                      min={selectedNFT.minDuration}
                      max={selectedNFT.maxDuration}
                      step={300}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatDuration(selectedNFT.minDuration)}</span>
                      <span>{formatDuration(selectedNFT.maxDuration)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleRent(selectedNFT)}
                      disabled={isRenting || selectedNFT.isRented || !isConnected}
                    >
                      {isRenting ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-spin" />
                          Renting...
                        </>
                      ) : selectedNFT.isRented ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Currently Rented
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Rent Now
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an NFT to View</h3>
                <p className="text-gray-600">Choose an NFT from the list to explore it in detail</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Audio Element */}
      {selectedNFT?.audioUrl && (
        <audio
          ref={audioRef}
          src={selectedNFT.audioUrl}
          loop
          autoPlay={isPlaying}
        />
      )}
    </div>
  );
}
