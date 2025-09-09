import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Grid, List, TrendingUp, Clock, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import NFTCard from "@/components/NFTCard";
import { NFTCardSkeleton, StatsCardSkeleton } from "@/components/ui/skeleton";

// Mock data - updated to match new interface
const mockNFTs = [
  {
    id: "1",
    name: "Cosmic Wizard #1234",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    collection: "Cosmic Wizards",
    pricePerSecond: 0.000001, // 0.0036 STT per hour
    isRented: false,
    owner: "0x1234567890abcdef",
    rarity: "Rare",
    listingId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    nftContract: "0xMockERC721",
    tokenId: "1234",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 1.0
  },
  {
    id: "2", 
    name: "Galaxy Punk #5678",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    collection: "Galaxy Punks",
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
    collateralRequired: 2.0
  },
  {
    id: "3",
    name: "Neon Cat #9999",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
    collection: "Neon Cats",
    pricePerSecond: 0.000002, // 0.0072 STT per hour
    isRented: false,
    owner: "0x5555666677778888",
    rarity: "Common",
    listingId: "0x5555666677778888555566667777888855556666777788885555666677778888",
    nftContract: "0xMockERC721",
    tokenId: "9999",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 0.5
  },
  {
    id: "4",
    name: "Digital Dragon #777",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    collection: "Digital Dragons", 
    pricePerSecond: 0.000007, // 0.0252 STT per hour
    isRented: false,
    owner: "0x1111222233334444",
    rarity: "Legendary",
    listingId: "0x1111222233334444111122223333444411112222333344441111222233334444",
    nftContract: "0xMockERC721",
    tokenId: "777",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 5.0
  },
  {
    id: "5",
    name: "Space Ape #456",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    collection: "Space Apes",
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
    collateralRequired: 1.5
  },
  {
    id: "6",
    name: "Quantum Robot #123",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop", 
    collection: "Quantum Robots",
    pricePerSecond: 0.0000008, // 0.00288 STT per hour
    isRented: false,
    owner: "0x3333444455556666",
    rarity: "Common",
    listingId: "0x3333444455556666333344445555666633334444555566663333444455556666",
    nftContract: "0xMockERC721",
    tokenId: "123",
    minDuration: 3600,
    maxDuration: 2592000,
    collateralRequired: 0.3
  }
];

const categories = ["All", "Gaming", "Art", "Music", "Utility", "Metaverse"];
const sortOptions = ["Price: Low to High", "Price: High to Low", "Recently Listed", "Most Popular"];

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Recently Listed");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: "Total Volume", value: "1,137 STT", trend: "+12%" },
    { label: "Floor Price", value: "0.3 STT", trend: "-2%" },
    { label: "Listed", value: "2,847", trend: "+5%" }
  ];

  const rarities = ["Common", "Rare", "Epic", "Legendary"];

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
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
              NFT Rental Marketplace
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover and rent premium NFTs by the second with streaming payments
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
                  <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Price Range */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Price Range (STT)</label>
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

                    {/* Rarity Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Rarity</label>
                      <div className="space-y-2">
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
                            onCheckedChange={setShowOnlyAvailable}
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

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <NFTCardSkeleton key={index} />
            ))
          ) : (
            mockNFTs.map((nft, index) => (
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
          )}
        </div>

        {/* Load More */}
        {!isLoading && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="border-primary/50 text-primary hover:bg-primary/10"
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