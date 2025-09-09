import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Grid, List, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NFTCard from "@/components/NFTCard";

// Mock data
const mockNFTs = [
  {
    id: "1",
    name: "Cosmic Wizard #1234",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    collection: "Cosmic Wizards",
    pricePerHour: 0.5,
    isRented: false,
    owner: "0x1234567890abcdef",
    rarity: "Rare"
  },
  {
    id: "2", 
    name: "Galaxy Punk #5678",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    collection: "Galaxy Punks",
    pricePerHour: 1.2,
    isRented: true,
    owner: "0x9876543210fedcba",
    timeLeft: "2h 15m",
    rarity: "Epic"
  },
  {
    id: "3",
    name: "Neon Cat #9999",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
    collection: "Neon Cats",
    pricePerHour: 0.8,
    isRented: false,
    owner: "0x5555666677778888",
    rarity: "Common"
  },
  {
    id: "4",
    name: "Digital Dragon #777",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    collection: "Digital Dragons", 
    pricePerHour: 2.5,
    isRented: false,
    owner: "0x1111222233334444",
    rarity: "Legendary"
  },
  {
    id: "5",
    name: "Space Ape #456",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    collection: "Space Apes",
    pricePerHour: 1.8,
    isRented: true,
    owner: "0x9999888877776666",
    timeLeft: "45m",
    rarity: "Rare"
  },
  {
    id: "6",
    name: "Quantum Robot #123",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop", 
    collection: "Quantum Robots",
    pricePerHour: 0.3,
    isRented: false,
    owner: "0x3333444455556666",
    rarity: "Common"
  }
];

const categories = ["All", "Gaming", "Art", "Music", "Utility", "Metaverse"];
const sortOptions = ["Price: Low to High", "Price: High to Low", "Recently Listed", "Most Popular"];

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Recently Listed");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const stats = [
    { label: "Total Volume", value: "1,137 STT", trend: "+12%" },
    { label: "Floor Price", value: "0.3 STT", trend: "-2%" },
    { label: "Listed", value: "2,847", trend: "+5%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              NFT Rental Marketplace
            </h1>
            <p className="text-slate-300 text-lg">
              Discover and rent premium NFTs by the second
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
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
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search NFTs, collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white"
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
                      ? "bg-purple-600 hover:bg-purple-700" 
                      : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="border-slate-600"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="border-slate-600"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockNFTs.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NFTCard 
                nft={nft} 
                onRent={(nft) => console.log("Rent NFT:", nft)} 
              />
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
          >
            Load More NFTs
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;