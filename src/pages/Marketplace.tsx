import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Grid, List, TrendingUp, Clock, SlidersHorizontal, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import NFTCard from "@/components/NFTCard";
import { NFTCardSkeleton, StatsCardSkeleton, MarketplaceSkeleton, LoadingSpinner } from "@/components/ui/skeleton";
import { useWeb3 } from "@/contexts/Web3Context";
import { useNFTManagement } from "@/hooks/useNFTManagement";
import { useToast } from "@/hooks/use-toast";

// Mock data - updated to match new interface with utility focus
const mockNFTs = [
  {
    id: "1",
    name: "Legendary Dragon Sword",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    collection: "Epic Gaming Weapons",
    pricePerSecond: 0.000001, // 0.0036 STT per hour
    isRented: false,
    owner: "0x1234567890abcdef",
    rarity: "Legendary",
    listingId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    nftContract: "0xMockERC721",
    tokenId: "1234",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 1.0,
    utilityType: "Gaming Weapon",
    utilityDescription: "Unlocks exclusive dungeon raids and +50% damage boost"
  },
  {
    id: "2", 
    name: "VIP Metaverse Pass",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    collection: "Exclusive Access",
    pricePerSecond: 0.000003, // 0.0108 STT per hour
    isRented: true,
    owner: "0x9876543210fedcba",
    timeLeft: "2h 15m",
    rarity: "Epic",
    listingId: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba98",
    nftContract: "0xMockERC721",
    tokenId: "5678",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 2.0,
    utilityType: "Metaverse Access",
    utilityDescription: "Access to exclusive virtual events and premium areas"
  },
  {
    id: "3",
    name: "Digital Art Gallery Space",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
    collection: "Virtual Galleries",
    pricePerSecond: 0.000002, // 0.0072 STT per hour
    isRented: false,
    owner: "0x5555666677778888",
    rarity: "Rare",
    listingId: "0x5555666677778888555566667777888855556666777788885555666677778888",
    nftContract: "0xMockERC721",
    tokenId: "9999",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 0.5,
    utilityType: "Art Display",
    utilityDescription: "Showcase your art in a premium virtual gallery space"
  },
  {
    id: "4",
    name: "Premium Gaming Avatar",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    collection: "Elite Avatars", 
    pricePerSecond: 0.000007, // 0.0252 STT per hour
    isRented: false,
    owner: "0x1111222233334444",
    rarity: "Legendary",
    listingId: "0x1111222233334444111122223333444411112222333344441111222233334444",
    nftContract: "0xMockERC721",
    tokenId: "777",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 5.0,
    utilityType: "Gaming Avatar",
    utilityDescription: "Premium avatar with exclusive abilities and cosmetics"
  },
  {
    id: "5",
    name: "Concert Venue Access",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    collection: "Event Spaces",
    pricePerSecond: 0.000005, // 0.018 STT per hour
    isRented: true,
    owner: "0x9999888877776666",
    timeLeft: "45m",
    rarity: "Rare",
    listingId: "0x9999888877776666999988887777666699998888777766669999888877776666",
    nftContract: "0xMockERC721",
    tokenId: "456",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 1.5,
    utilityType: "Event Access",
    utilityDescription: "Access to exclusive virtual concerts and events"
  },
  {
    id: "6",
    name: "Try-Before-Buy Demo",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop", 
    collection: "Demo Collection",
    pricePerSecond: 0.0000008, // 0.00288 STT per hour
    isRented: false,
    owner: "0x3333444455556666",
    rarity: "Common",
    listingId: "0x3333444455556666333344445555666633334444555566663333444455556666",
    nftContract: "0xMockERC721",
    tokenId: "123",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 0.3,
    utilityType: "Demo Access",
    utilityDescription: "Test premium NFT features before purchasing"
  },
  {
    id: "7",
    name: "AI Trading Bot License",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
    collection: "AI Services",
    pricePerSecond: 0.000012, // 0.0432 STT per hour
    isRented: false,
    owner: "0x7777888899990000",
    rarity: "Epic",
    listingId: "0x7777888899990000777788889999000077778888999900007777888899990000",
    nftContract: "0xMockERC721",
    tokenId: "888",
    minDuration: 7200,
    maxDuration: 604800,
    collateralRequired: 10.0,
    utilityType: "AI Service",
    utilityDescription: "Access to advanced AI trading algorithms and market analysis"
  },
  {
    id: "8",
    name: "Virtual Real Estate Plot",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop",
    collection: "Metaverse Land",
    pricePerSecond: 0.000008, // 0.0288 STT per hour
    isRented: true,
    owner: "0x4444555566667777",
    timeLeft: "1d 3h",
    rarity: "Legendary",
    listingId: "0x4444555566667777444455556666777744445555666677774444555566667777",
    nftContract: "0xMockERC721",
    tokenId: "555",
    minDuration: 86400,
    maxDuration: 2592000,
    collateralRequired: 15.0,
    utilityType: "Virtual Land",
    utilityDescription: "Prime location in the metaverse with development rights"
  },
  {
    id: "9",
    name: "Music Production Studio",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    collection: "Creative Tools",
    pricePerSecond: 0.000004, // 0.0144 STT per hour
    isRented: false,
    owner: "0x2222333344445555",
    rarity: "Rare",
    listingId: "0x2222333344445555222233334444555522223333444455552222333344445555",
    nftContract: "0xMockERC721",
    tokenId: "333",
    minDuration: 3600,
    maxDuration: 604800,
    collateralRequired: 3.0,
    utilityType: "Creative Tool",
    utilityDescription: "Professional music production software and virtual instruments"
  },
  {
    id: "10",
    name: "Fitness Coach AI",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    collection: "Health & Wellness",
    pricePerSecond: 0.000002, // 0.0072 STT per hour
    isRented: false,
    owner: "0x6666777788889999",
    rarity: "Common",
    listingId: "0x6666777788889999666677778888999966667777888899996666777788889999",
    nftContract: "0xMockERC721",
    tokenId: "222",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 1.0,
    utilityType: "Health Service",
    utilityDescription: "Personalized fitness coaching and workout plans"
  },
  {
    id: "11",
    name: "Luxury Car Showroom",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=400&fit=crop",
    collection: "Virtual Showrooms",
    pricePerSecond: 0.000006, // 0.0216 STT per hour
    isRented: true,
    owner: "0x8888999900001111",
    timeLeft: "6h 30m",
    rarity: "Epic",
    listingId: "0x8888999900001111888899990000111188889999000011118888999900001111",
    nftContract: "0xMockERC721",
    tokenId: "111",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 4.0,
    utilityType: "Virtual Showroom",
    utilityDescription: "Exclusive access to luxury car collection and test drives"
  },
  {
    id: "12",
    name: "Language Learning Tutor",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop",
    collection: "Education Services",
    pricePerSecond: 0.0000015, // 0.0054 STT per hour
    isRented: false,
    owner: "0x0000111122223333",
    rarity: "Common",
    listingId: "0x0000111122223333000011112222333300001111222233330000111122223333",
    nftContract: "0xMockERC721",
    tokenId: "999",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 0.5,
    utilityType: "Education",
    utilityDescription: "AI-powered language learning with native speaker simulation"
  },
  {
    id: "13",
    name: "Virtual Fashion Designer",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
    collection: "Fashion & Style",
    pricePerSecond: 0.000003, // 0.0108 STT per hour
    isRented: false,
    owner: "0x1111222233334444",
    rarity: "Rare",
    listingId: "0x1111222233334444111122223333444411112222333344441111222233334444",
    nftContract: "0xMockERC721",
    tokenId: "777",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 2.0,
    utilityType: "Fashion Design",
    utilityDescription: "Create custom virtual clothing and accessories"
  },
  {
    id: "14",
    name: "Crypto Trading Signals",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop",
    collection: "Financial Services",
    pricePerSecond: 0.000009, // 0.0324 STT per hour
    isRented: true,
    owner: "0x5555666677778888",
    timeLeft: "12h 45m",
    rarity: "Epic",
    listingId: "0x5555666677778888555566667777888855556666777788885555666677778888",
    nftContract: "0xMockERC721",
    tokenId: "666",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 8.0,
    utilityType: "Financial Service",
    utilityDescription: "Real-time crypto trading signals and market analysis"
  },
  {
    id: "15",
    name: "Virtual Pet Companion",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop",
    collection: "Digital Companions",
    pricePerSecond: 0.000001, // 0.0036 STT per hour
    isRented: false,
    owner: "0x9999000011112222",
    rarity: "Common",
    listingId: "0x9999000011112222999900001111222299990000111122229999000011112222",
    nftContract: "0xMockERC721",
    tokenId: "444",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 0.2,
    utilityType: "Digital Companion",
    utilityDescription: "AI-powered virtual pet with emotional intelligence"
  },
  {
    id: "16",
    name: "3D Modeling Workshop",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    collection: "Design Tools",
    pricePerSecond: 0.000005, // 0.018 STT per hour
    isRented: false,
    owner: "0x3333444455556666",
    rarity: "Rare",
    listingId: "0x3333444455556666333344445555666633334444555566663333444455556666",
    nftContract: "0xMockERC721",
    tokenId: "333",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 3.0,
    utilityType: "Design Tool",
    utilityDescription: "Professional 3D modeling software and tutorials"
  },
  {
    id: "17",
    name: "Virtual Restaurant Kitchen",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    collection: "Culinary Experiences",
    pricePerSecond: 0.000004, // 0.0144 STT per hour
    isRented: true,
    owner: "0x7777888899990000",
    timeLeft: "3h 20m",
    rarity: "Rare",
    listingId: "0x7777888899990000777788889999000077778888999900007777888899990000",
    nftContract: "0xMockERC721",
    tokenId: "222",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 2.5,
    utilityType: "Culinary Experience",
    utilityDescription: "Virtual cooking classes with celebrity chefs"
  },
  {
    id: "18",
    name: "Meditation & Wellness Space",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    collection: "Wellness Retreats",
    pricePerSecond: 0.000002, // 0.0072 STT per hour
    isRented: false,
    owner: "0x4444555566667777",
    rarity: "Common",
    listingId: "0x4444555566667777444455556666777744445555666677774444555566667777",
    nftContract: "0xMockERC721",
    tokenId: "111",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 1.0,
    utilityType: "Wellness Service",
    utilityDescription: "Guided meditation and mindfulness sessions"
  },
  {
    id: "19",
    name: "Virtual Reality Travel",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop",
    collection: "Travel Experiences",
    pricePerSecond: 0.000006, // 0.0216 STT per hour
    isRented: false,
    owner: "0x2222333344445555",
    rarity: "Epic",
    listingId: "0x2222333344445555222233334444555522223333444455552222333344445555",
    nftContract: "0xMockERC721",
    tokenId: "888",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 4.0,
    utilityType: "Travel Experience",
    utilityDescription: "Immersive VR travel to exotic destinations"
  },
  {
    id: "20",
    name: "Blockchain Developer Tools",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=400&fit=crop",
    collection: "Developer Resources",
    pricePerSecond: 0.000008, // 0.0288 STT per hour
    isRented: true,
    owner: "0x6666777788889999",
    timeLeft: "8h 15m",
    rarity: "Legendary",
    listingId: "0x6666777788889999666677778888999966667777888899996666777788889999",
    nftContract: "0xMockERC721",
    tokenId: "777",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 6.0,
    utilityType: "Developer Tool",
    utilityDescription: "Advanced blockchain development environment and tools"
  }
];

const categories = [
  "All", 
  "Gaming Utilities", 
  "AI Services", 
  "Virtual Land", 
  "Creative Tools", 
  "Health & Wellness", 
  "Virtual Showrooms", 
  "Education", 
  "Fashion & Style", 
  "Financial Services", 
  "Digital Companions", 
  "Design Tools", 
  "Culinary Experiences", 
  "Wellness Retreats", 
  "Travel Experiences", 
  "Developer Resources", 
  "Art & Display", 
  "Metaverse Access", 
  "Event Access", 
  "Demo Access"
];
const sortOptions = ["Price: Low to High", "Price: High to Low", "Recently Listed", "Most Popular"];

const Marketplace = () => {
  const { isConnected } = useWeb3();
  const { getAvailableNFTs } = useNFTManagement();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Recently Listed");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [selectedUtilityTypes, setSelectedUtilityTypes] = useState<string[]>([]);
  const [durationRange, setDurationRange] = useState([3600, 2592000]); // 1 hour to 30 days
  const [collateralRange, setCollateralRange] = useState([0, 10]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [filteredNFTs, setFilteredNFTs] = useState<any[]>([]);

  // Load NFTs from contracts
  const loadNFTs = async () => {
    if (!isConnected) {
      setNfts(mockNFTs);
      setIsLoading(false);
      return;
    }

    try {
      const availableNFTs = await getAvailableNFTs();
      setNfts(availableNFTs);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
      toast({
        title: "Failed to Load NFTs",
        description: "Using mock data instead",
        variant: "destructive",
      });
      setNfts(mockNFTs);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh NFTs
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNFTs();
    setIsRefreshing(false);
  };

  // Filter NFTs based on current filters
  const applyFilters = useCallback(() => {
    let filtered = [...nfts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.collection.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.utilityType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(nft => {
        switch (selectedCategory) {
          case "Gaming Utilities":
            return nft.utilityType === "Gaming Weapon" || nft.utilityType === "Gaming Avatar";
          case "Art & Display":
            return nft.utilityType === "Art Display";
          case "Metaverse Access":
            return nft.utilityType === "Metaverse Access" || nft.utilityType === "Event Access";
          case "Real-World Benefits":
            return nft.utilityType === "Event Access";
          case "Try Before Buy":
            return nft.utilityType === "Demo Access";
          default:
            return true;
        }
      });
    }

    // Price range filter
    filtered = filtered.filter(nft => {
      const pricePerHour = nft.pricePerSecond * 3600;
      return pricePerHour >= priceRange[0] && pricePerHour <= priceRange[1];
    });

    // Rarity filter
    if (selectedRarities.length > 0) {
      filtered = filtered.filter(nft => selectedRarities.includes(nft.rarity));
    }

    // Utility type filter
    if (selectedUtilityTypes.length > 0) {
      filtered = filtered.filter(nft => selectedUtilityTypes.includes(nft.utilityType));
    }

    // Duration range filter
    filtered = filtered.filter(nft => 
      nft.minDuration >= durationRange[0] && nft.maxDuration <= durationRange[1]
    );

    // Collateral range filter
    filtered = filtered.filter(nft => 
      nft.collateralRequired >= collateralRange[0] && nft.collateralRequired <= collateralRange[1]
    );

    // Availability filter
    if (showOnlyAvailable) {
      filtered = filtered.filter(nft => !nft.isRented);
    }

    // Sort filter
    switch (selectedSort) {
      case "Price: Low to High":
        filtered.sort((a, b) => a.pricePerSecond - b.pricePerSecond);
        break;
      case "Price: High to Low":
        filtered.sort((a, b) => b.pricePerSecond - a.pricePerSecond);
        break;
      case "Most Popular":
        // Sort by rarity (Legendary > Epic > Rare > Common)
        const rarityOrder = { "Legendary": 4, "Epic": 3, "Rare": 2, "Common": 1 };
        filtered.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0));
        break;
      case "Recently Listed":
      default:
        // Keep original order (most recent first)
        break;
    }

    setFilteredNFTs(filtered);
  }, [nfts, searchTerm, selectedCategory, selectedSort, priceRange, selectedRarities, selectedUtilityTypes, durationRange, collateralRange, showOnlyAvailable]);

  useEffect(() => {
    loadNFTs();
  }, [isConnected]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const stats = [
    { label: "Total Volume", value: "1,137 STT", trend: "+12%" },
    { label: "Floor Price", value: "0.3 STT", trend: "-2%" },
    { label: "Listed", value: "2,847", trend: "+5%" }
  ];

  const rarities = ["Common", "Rare", "Epic", "Legendary"];

  // Show full page skeleton on initial load
  if (isLoading && nfts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <MarketplaceSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                NFT Rental Marketplace
              </h1>
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
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover and access premium NFT utilities by the second. Transform idle assets into active utility generators with streaming payments.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <StatsCardSkeleton key={index} />
              ))
            ) : (
              stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">{stat.label}</p>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        </div>
                        <Badge 
                          variant={stat.trend.startsWith('+') ? "default" : "destructive"}
                          className="ml-2"
                        >
                          {stat.trend}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search NFTs, collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category 
                      ? "bg-primary hover:bg-primary/90" 
                      : "border-border text-muted-foreground hover:bg-muted/50"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Advanced Filters */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-border text-muted-foreground hover:bg-muted/50"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="border-border"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="border-border"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-6 border-t border-border overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Price Range */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Price Range (STT/hour)</label>
                      <div className="px-3">
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={5}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>{priceRange[0]} STT</span>
                          <span>{priceRange[1]} STT</span>
                        </div>
                      </div>
                    </div>

                    {/* Duration Range */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Duration Range</label>
                      <div className="px-3">
                        <Slider
                          value={[durationRange[0] / 3600, durationRange[1] / 3600]}
                          onValueChange={(value) => setDurationRange([value[0] * 3600, value[1] * 3600])}
                          max={720} // 30 days in hours
                          min={1} // 1 hour
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>{Math.round(durationRange[0] / 3600)}h</span>
                          <span>{Math.round(durationRange[1] / 3600)}h</span>
                        </div>
                      </div>
                    </div>

                    {/* Collateral Range */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Collateral Range (STT)</label>
                      <div className="px-3">
                        <Slider
                          value={collateralRange}
                          onValueChange={setCollateralRange}
                          max={10}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>{collateralRange[0]} STT</span>
                          <span>{collateralRange[1]} STT</span>
                        </div>
                      </div>
                    </div>

                    {/* Utility Types */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Utility Types</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {["Gaming Weapon", "Gaming Avatar", "Metaverse Access", "Art Display", "Event Access", "Demo Access"].map((utilityType) => (
                          <div key={utilityType} className="flex items-center space-x-2">
                            <Checkbox
                              id={utilityType}
                              checked={selectedUtilityTypes.includes(utilityType)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUtilityTypes([...selectedUtilityTypes, utilityType]);
                                } else {
                                  setSelectedUtilityTypes(selectedUtilityTypes.filter(t => t !== utilityType));
                                }
                              }}
                            />
                            <label htmlFor={utilityType} className="text-sm text-muted-foreground">
                              {utilityType}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Rarity Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Rarity</label>
                      <div className="grid grid-cols-2 gap-2">
                        {rarities.map((rarity) => (
                          <div key={rarity} className="flex items-center space-x-2">
                            <Checkbox
                              id={rarity}
                              checked={selectedRarities.includes(rarity)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRarities([...selectedRarities, rarity]);
                                } else {
                                  setSelectedRarities(selectedRarities.filter(r => r !== rarity));
                                }
                              }}
                            />
                            <label htmlFor={rarity} className="text-sm text-muted-foreground">
                              {rarity}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Availability Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Availability</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="available"
                            checked={showOnlyAvailable}
                            onCheckedChange={(checked) => setShowOnlyAvailable(checked === true)}
                          />
                          <label htmlFor="available" className="text-sm text-muted-foreground">
                            Show only available
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Results Counter */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing {filteredNFTs.length} of {nfts.length} NFTs
            </p>
            <div className="flex items-center gap-2">
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <NFTCardSkeleton key={index} />
            ))
          ) : filteredNFTs.length > 0 ? (
            filteredNFTs.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NFTCard 
                  nft={nft} 
                  onRent={async (nft) => {
                    // Simulate rental process
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    console.log("Rent NFT:", nft);
                  }} 
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No NFTs found</h3>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            </div>
          )}
        </div>

        {/* Load More */}
        {!isLoading && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="border-primary/50 text-primary hover:bg-primary/10"
              onClick={() => {
                toast({
                  title: "Load More",
                  description: "Loading more NFTs...",
                });
                // In a real implementation, this would load more NFTs from the API
              }}
            >
              Load More NFTs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;