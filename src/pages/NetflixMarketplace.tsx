import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Star, Heart, Share, ChevronLeft, ChevronRight, Search, Filter, SortAsc, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NFTItem {
  id: string;
  title: string;
  creator: string;
  price: string;
  duration: string;
  rating: number;
  category: string;
  image: string;
  featured?: boolean;
}

const NetflixMarketplace: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10]);
  const [showFilters, setShowFilters] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: "Trending Now", items: mockNFTs.slice(0, 6) },
    { name: "Gaming Assets", items: mockNFTs.slice(6, 12) },
    { name: "Digital Art", items: mockNFTs.slice(12, 18) },
    { name: "Music & Audio", items: mockNFTs.slice(18, 24) },
    { name: "Virtual Worlds", items: mockNFTs.slice(24, 30) }
  ];

  const featuredNFT = mockNFTs[0];

  // Filter and sort NFTs based on search and filters
  const filteredNFTs = useMemo(() => {
    let filtered = mockNFTs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(nft => 
        nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(nft => nft.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(nft => {
      const price = parseFloat(nft.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'trending':
      default:
        // Keep original order for trending
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const scroll = (direction: 'left' | 'right', categoryIndex: number) => {
    const container = document.getElementById(`category-${categoryIndex}`);
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Search and Filter Bar */}
      <div className="sticky top-16 z-40 bg-black/90 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search NFTs, creators, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Digital Art">Digital Art</SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Virtual Worlds">Virtual Worlds</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <div className="flex border border-gray-700 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r border-gray-700"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-700"
            >
              <div className="flex gap-4 items-center">
                <span className="text-sm text-gray-400">Price Range:</span>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseFloat(e.target.value) || 0, priceRange[1]])}
                    className="w-20 bg-gray-900 border-gray-700 text-white"
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value) || 10])}
                    className="w-20 bg-gray-900 border-gray-700 text-white"
                  />
                  <span className="text-gray-400">STT/hr</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Hero Section - Featured NFT */}
      <div className="relative h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.3)), url(${featuredNFT.image})` 
          }}
        />
        
        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-red-600 hover:bg-red-700">
              🔥 Trending #1
            </Badge>
            
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              {featuredNFT.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < featuredNFT.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                  />
                ))}
                <span className="ml-2 text-gray-300">{featuredNFT.rating}/5</span>
              </div>
              <Badge variant="outline" className="border-green-500 text-green-400">
                {featuredNFT.category}
              </Badge>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Experience premium digital art like never before. Rent this exclusive NFT 
              and unlock special features, utilities, and community access.
            </p>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="text-3xl font-bold text-green-400">
                {featuredNFT.price}
              </div>
              <div className="text-gray-400">
                <Clock className="w-4 h-4 inline mr-1" />
                {featuredNFT.duration}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="px-8 py-3 bg-white text-black hover:bg-gray-200 font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Rent Now
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Heart className="w-5 h-5 mr-2" />
                Add to Wishlist
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Share className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search Results or Category Rows */}
      <div className="relative z-10 -mt-32 pb-20">
        {searchQuery || selectedCategory !== 'all' ? (
          /* Filtered Results */
          <div className="container mx-auto px-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : `Category: ${selectedCategory}`}
              </h2>
              <p className="text-gray-400">
                {filteredNFTs.length} NFT{filteredNFTs.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredNFTs.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={viewMode === 'list' ? 'flex gap-4' : ''}
                >
                  <Card className={`bg-gray-900 border-gray-700 hover:border-purple-500 transition-all duration-300 overflow-hidden ${
                    viewMode === 'list' ? 'flex-1' : ''
                  }`}>
                    <div className="relative">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className={`object-cover ${viewMode === 'list' ? 'w-32 h-20' : 'w-full h-48'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                          <Play className="w-3 h-3 mr-1" />
                          Rent
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className={`${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
                      <h3 className="font-semibold text-lg mb-2 truncate">{item.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">by {item.creator}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-green-400 font-bold">{item.price}</div>
                        <div className="text-gray-400 text-sm flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.duration}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredNFTs.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No NFTs found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setPriceRange([0, 10]);
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Original Category Rows */
          categories.map((category, categoryIndex) => (
          <div key={category.name} className="mb-12">
            <div className="container mx-auto px-6">
              <h2 className="text-2xl font-bold mb-6">{category.name}</h2>
              
              <div className="relative group">
                <button
                  onClick={() => scroll('left', categoryIndex)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => scroll('right', categoryIndex)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div 
                  id={`category-${categoryIndex}`}
                  className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {category.items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex-shrink-0 w-80"
                      onHoverStart={() => setHoveredItem(item.id)}
                      onHoverEnd={() => setHoveredItem(null)}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="bg-gray-900 border-gray-700 hover:border-purple-500 transition-all duration-300 overflow-hidden">
                        <div className="relative">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-48 object-cover"
                          />
                          {hoveredItem === item.id && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center"
                            >
                              <Button className="bg-white text-black hover:bg-gray-200">
                                <Play className="w-4 h-4 mr-2" />
                                Quick Rent
                              </Button>
                            </motion.div>
                          )}
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 truncate">{item.title}</h3>
                          <p className="text-gray-400 text-sm mb-3">by {item.creator}</p>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-green-400 font-bold">{item.price}</div>
                            <div className="text-gray-400 text-sm">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {item.duration}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock data for demonstration
const mockNFTs: NFTItem[] = [
  {
    id: '1',
    title: 'Cosmic Dragon #001',
    creator: 'ArtistDAO',
    price: '0.5 STT/hr',
    duration: 'Min 1hr',
    rating: 5,
    category: 'Digital Art',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=300&fit=crop',
    featured: true
  },
  {
    id: '2',
    title: 'Cyberpunk Avatar',
    creator: 'MetaCreators',
    price: '0.3 STT/hr',
    duration: 'Min 2hr',
    rating: 4,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    title: 'Digital Symphony',
    creator: 'AudioNFT',
    price: '0.8 STT/hr',
    duration: 'Min 30min',
    rating: 5,
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    title: 'Virtual Realms',
    creator: 'VRStudio',
    price: '1.2 STT/hr',
    duration: 'Min 3hr',
    rating: 4,
    category: 'Virtual Worlds',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '5',
    title: 'Neon Dreams',
    creator: 'CyberArt',
    price: '0.6 STT/hr',
    duration: 'Min 1hr',
    rating: 5,
    category: 'Digital Art',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=300&fit=crop'
  },
  {
    id: '6',
    title: 'Battle Armor Set',
    creator: 'GameStudio',
    price: '0.4 STT/hr',
    duration: 'Min 2hr',
    rating: 4,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '7',
    title: 'Melodic Journey',
    creator: 'SoundNFT',
    price: '0.7 STT/hr',
    duration: 'Min 45min',
    rating: 5,
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
  },
  {
    id: '8',
    title: 'Futuristic City',
    creator: 'Architects',
    price: '1.0 STT/hr',
    duration: 'Min 4hr',
    rating: 4,
    category: 'Virtual Worlds',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '9',
    title: 'Abstract Visions',
    creator: 'ArtCollective',
    price: '0.9 STT/hr',
    duration: 'Min 1hr',
    rating: 5,
    category: 'Digital Art',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=300&fit=crop'
  },
  {
    id: '10',
    title: 'Legendary Weapon',
    creator: 'GameDev',
    price: '0.5 STT/hr',
    duration: 'Min 2hr',
    rating: 4,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '11',
    title: 'Ambient Sounds',
    creator: 'AudioArt',
    price: '0.6 STT/hr',
    duration: 'Min 1hr',
    rating: 5,
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
  },
  {
    id: '12',
    title: 'Space Station',
    creator: 'SciFiStudio',
    price: '1.5 STT/hr',
    duration: 'Min 6hr',
    rating: 4,
    category: 'Virtual Worlds',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '13',
    title: 'Colorful Chaos',
    creator: 'ModernArt',
    price: '0.8 STT/hr',
    duration: 'Min 1hr',
    rating: 5,
    category: 'Digital Art',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=300&fit=crop'
  },
  {
    id: '14',
    title: 'Magic Spells',
    creator: 'FantasyGames',
    price: '0.7 STT/hr',
    duration: 'Min 3hr',
    rating: 4,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '15',
    title: 'Electronic Beats',
    creator: 'EDMArtist',
    price: '0.5 STT/hr',
    duration: 'Min 30min',
    rating: 5,
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
  },
  {
    id: '16',
    title: 'Fantasy Kingdom',
    creator: 'WorldBuilders',
    price: '1.3 STT/hr',
    duration: 'Min 5hr',
    rating: 4,
    category: 'Virtual Worlds',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '17',
    title: 'Minimalist Design',
    creator: 'CleanArt',
    price: '0.6 STT/hr',
    duration: 'Min 1hr',
    rating: 5,
    category: 'Digital Art',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=300&fit=crop'
  },
  {
    id: '18',
    title: 'Racing Car',
    creator: 'SpeedGames',
    price: '0.4 STT/hr',
    duration: 'Min 2hr',
    rating: 4,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '19',
    title: 'Jazz Fusion',
    creator: 'JazzNFT',
    price: '0.8 STT/hr',
    duration: 'Min 45min',
    rating: 5,
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
  },
  {
    id: '20',
    title: 'Underwater City',
    creator: 'AquaWorlds',
    price: '1.1 STT/hr',
    duration: 'Min 4hr',
    rating: 4,
    category: 'Virtual Worlds',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '21',
    title: 'Surreal Landscapes',
    creator: 'DreamArt',
    price: '0.7 STT/hr',
    duration: 'Min 1hr',
    rating: 5,
    category: 'Digital Art',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=300&fit=crop'
  },
  {
    id: '22',
    title: 'Stealth Suit',
    creator: 'ActionGames',
    price: '0.5 STT/hr',
    duration: 'Min 2hr',
    rating: 4,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '23',
    title: 'Classical Symphony',
    creator: 'OrchestraNFT',
    price: '1.0 STT/hr',
    duration: 'Min 2hr',
    rating: 5,
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
  },
  {
    id: '24',
    title: 'Medieval Castle',
    creator: 'HistoricWorlds',
    price: '1.2 STT/hr',
    duration: 'Min 6hr',
    rating: 4,
    category: 'Virtual Worlds',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '25',
    title: 'Pop Art Revival',
    creator: 'PopArtists',
    price: '0.9 STT/hr',
    duration: 'Min 1hr',
    rating: 5,
    category: 'Digital Art',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=300&fit=crop'
  },
  {
    id: '26',
    title: 'Puzzle Master',
    creator: 'BrainGames',
    price: '0.3 STT/hr',
    duration: 'Min 1hr',
    rating: 4,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '27',
    title: 'Rock Anthem',
    creator: 'RockNFT',
    price: '0.7 STT/hr',
    duration: 'Min 30min',
    rating: 5,
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
  },
  {
    id: '28',
    title: 'Cyberpunk District',
    creator: 'FutureWorlds',
    price: '1.4 STT/hr',
    duration: 'Min 8hr',
    rating: 4,
    category: 'Virtual Worlds',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  },
  {
    id: '29',
    title: 'Digital Sculpture',
    creator: 'SculptureArt',
    price: '1.1 STT/hr',
    duration: 'Min 2hr',
    rating: 5,
    category: 'Digital Art',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=300&fit=crop'
  },
  {
    id: '30',
    title: 'Strategy Game',
    creator: 'TacticalGames',
    price: '0.6 STT/hr',
    duration: 'Min 3hr',
    rating: 4,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
  }
];

export default NetflixMarketplace;
