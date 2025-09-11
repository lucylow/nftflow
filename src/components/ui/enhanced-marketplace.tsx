import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Heart,
  Eye,
  Clock,
  Star,
  TrendingUp,
  Zap
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { cn } from "@/lib/utils";

interface NFTCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  currency: string;
  owner: string;
  collection: string;
  rarity?: string;
  likes?: number;
  views?: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onClick?: (id: string) => void;
  delay?: number;
}

export function EnhancedNFTCard({
  id,
  name,
  image,
  price,
  currency,
  owner,
  collection,
  rarity,
  likes = 0,
  views = 0,
  isLiked = false,
  onLike,
  onClick,
  delay = 0
}: NFTCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group cursor-pointer"
      onClick={() => onClick?.(id)}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
        <div className="relative overflow-hidden">
          <motion.img
            src={image}
            alt={name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2"
          >
            <Button
              size="sm"
              variant="secondary"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onLike?.(id);
              }}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-red-500 text-red-500")} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Rarity badge */}
          {rarity && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.2, duration: 0.3 }}
              className="absolute top-2 left-2"
            >
              <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                {rarity}
              </Badge>
            </motion.div>
          )}

          {/* Price badge */}
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.3, duration: 0.3 }}
            className="absolute top-2 right-2"
          >
            <Badge className="bg-background/90 text-foreground">
              {price} {currency}
            </Badge>
          </motion.div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{collection}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{views}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">{price} {currency}</p>
              <p className="text-xs">per hour</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface MarketplaceFiltersProps {
  onSearch: (query: string) => void;
  onSort: (sortBy: string) => void;
  onFilter: (filters: any) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function MarketplaceFilters({
  onSearch,
  onSort,
  onFilter,
  viewMode,
  onViewModeChange
}: MarketplaceFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 p-4"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search NFTs, collections, creators..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="pl-10"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => {
            setSortBy(value);
            onSort(value);
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rare">Rarest</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <Badge className="ml-2 h-5 w-5 p-0 text-xs">3</Badge>
          </Button>

          {/* View Mode */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <div className="flex gap-2">
                  <Input placeholder="Min" type="number" />
                  <Input placeholder="Max" type="number" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Collection</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Collections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Collections</SelectItem>
                    <SelectItem value="art">Digital Art</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rarity</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rarities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarities</SelectItem>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Currently Rented</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface StatsOverviewProps {
  totalNFTs: number;
  totalVolume: string;
  activeRentals: number;
  averagePrice: string;
  currency: string;
}

export function StatsOverview({
  totalNFTs,
  totalVolume,
  activeRentals,
  averagePrice,
  currency
}: StatsOverviewProps) {
  const stats = [
    {
      title: "Total NFTs",
      value: totalNFTs.toLocaleString(),
      icon: <Zap className="w-5 h-5" />,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Total Volume",
      value: `${totalVolume} ${currency}`,
      icon: <TrendingUp className="w-5 h-5" />,
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Active Rentals",
      value: activeRentals.toLocaleString(),
      icon: <Clock className="w-5 h-5" />,
      trend: { value: 15, isPositive: true }
    },
    {
      title: "Average Price",
      value: `${averagePrice} ${currency}`,
      icon: <Star className="w-5 h-5" />,
      trend: { value: -3, isPositive: false }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}

