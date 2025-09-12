import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  Eye, 
  Star,
  TrendingUp,
  Filter,
  Search,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

interface RentalEvent {
  id: string;
  nftName: string;
  nftImage: string;
  nftContract: string;
  tokenId: number;
  renter: string;
  owner: string;
  pricePerSecond: number;
  duration: number;
  totalCost: number;
  startTime: number;
  endTime: number;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  category: string;
  rating?: number;
  review?: string;
  isLiked: boolean;
  likes: number;
  comments: number;
  tags: string[];
}

interface RentalTimelineProps {
  className?: string;
}

export function RentalTimeline({ className }: RentalTimelineProps) {
  const { account, isConnected } = useWeb3();
  
  const [rentals, setRentals] = useState<RentalEvent[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<RentalEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedRental, setSelectedRental] = useState<RentalEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  // Generate mock rental data
  useEffect(() => {
    const generateMockRentals = (): RentalEvent[] => {
      const categories = ['Gaming', 'Art', 'Music', 'Sports', 'Fashion', 'Collectibles'];
      const statuses: Array<'active' | 'completed' | 'cancelled' | 'expired'> = ['active', 'completed', 'cancelled', 'expired'];
      
      return Array.from({ length: 50 }, (_, i) => {
        const startTime = Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000; // Last 30 days
        const duration = Math.floor(Math.random() * 86400) + 300; // 5 minutes to 24 hours
        const pricePerSecond = Math.random() * 0.01 + 0.001;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        return {
          id: `rental-${i}`,
          nftName: `Epic NFT #${i + 1}`,
          nftImage: `/placeholder.svg`,
          nftContract: `0x${Math.random().toString(16).substr(2, 8)}...`,
          tokenId: i + 1,
          renter: account || `0x${Math.random().toString(16).substr(2, 8)}...`,
          owner: `0x${Math.random().toString(16).substr(2, 8)}...`,
          pricePerSecond,
          duration,
          totalCost: pricePerSecond * duration,
          startTime,
          endTime: startTime + duration * 1000,
          status,
          category: categories[Math.floor(Math.random() * categories.length)],
          rating: status === 'completed' ? Math.random() * 2 + 3 : undefined,
          review: status === 'completed' && Math.random() > 0.5 ? 
            'Great rental experience! The NFT was exactly as described.' : undefined,
          isLiked: Math.random() > 0.5,
          likes: Math.floor(Math.random() * 20),
          comments: Math.floor(Math.random() * 10),
          tags: ['trending', 'popular', 'rare'].filter(() => Math.random() > 0.7)
        };
      });
    };

    setRentals(generateMockRentals());
    setIsLoading(false);
  }, [account]);

  // Filter and sort rentals
  useEffect(() => {
    let filtered = rentals.filter(rental => {
      const matchesSearch = rental.nftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rental.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || rental.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort rentals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.startTime - a.startTime;
        case 'oldest':
          return a.startTime - b.startTime;
        case 'price':
          return b.totalCost - a.totalCost;
        case 'duration':
          return b.duration - a.duration;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return b.startTime - a.startTime;
      }
    });

    setFilteredRentals(filtered);
  }, [rentals, searchTerm, statusFilter, categoryFilter, sortBy]);

  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleLike = (rentalId: string) => {
    setRentals(prev => prev.map(rental => 
      rental.id === rentalId 
        ? { 
            ...rental, 
            isLiked: !rental.isLiked,
            likes: rental.isLiked ? rental.likes - 1 : rental.likes + 1
          }
        : rental
    ));
  };

  const exportTimeline = () => {
    const csvData = filteredRentals.map(rental => ({
      'NFT Name': rental.nftName,
      'Category': rental.category,
      'Status': rental.status,
      'Duration': formatDuration(rental.duration),
      'Total Cost': rental.totalCost.toFixed(6),
      'Start Time': new Date(rental.startTime).toISOString(),
      'End Time': new Date(rental.endTime).toISOString(),
      'Rating': rental.rating || 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rental-timeline-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Rental Timeline
            </h2>
            <p className="text-gray-600">Your complete rental history and journey</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search rentals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Gaming">Gaming</SelectItem>
              <SelectItem value="Art">Art</SelectItem>
              <SelectItem value="Music">Music</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Fashion">Fashion</SelectItem>
              <SelectItem value="Collectibles">Collectibles</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price">Highest Price</SelectItem>
              <SelectItem value="duration">Longest Duration</SelectItem>
              <SelectItem value="rating">Highest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {filteredRentals.map((rental, index) => (
              <motion.div
                key={rental.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Timeline dot */}
                <div className="absolute left-6 w-4 h-4 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(rental.status)}`}></div>
                </div>
                
                {/* Rental card */}
                <Card className="ml-16 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedRental(rental)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={rental.nftImage}
                        alt={rental.nftName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{rental.nftName}</h3>
                          <Badge className={getStatusColor(rental.status)}>
                            {getStatusIcon(rental.status)}
                            <span className="ml-1 capitalize">{rental.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <p className="font-medium">Duration</p>
                            <p>{formatDuration(rental.duration)}</p>
                          </div>
                          <div>
                            <p className="font-medium">Total Cost</p>
                            <p className="text-green-600 font-semibold">
                              {rental.totalCost.toFixed(6)} STT
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Category</p>
                            <p>{rental.category}</p>
                          </div>
                          <div>
                            <p className="font-medium">Time</p>
                            <p>{formatTime(rental.startTime)}</p>
                          </div>
                        </div>
                        
                        {rental.rating && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(rental.rating!) 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {rental.rating.toFixed(1)} rating
                            </span>
                          </div>
                        )}
                        
                        {rental.review && (
                          <p className="text-sm text-gray-600 italic mb-3">
                            "{rental.review}"
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(rental.id);
                              }}
                            >
                              <Heart className={`w-4 h-4 mr-1 ${
                                rental.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'
                              }`} />
                              {rental.likes}
                            </Button>
                            
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {rental.comments}
                            </Button>
                            
                            <Button variant="ghost" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex gap-1">
                            {rental.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRentals.map((rental, index) => (
            <motion.div
              key={rental.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedRental(rental)}>
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <img
                      src={rental.nftImage}
                      alt={rental.nftName}
                      className="w-full h-32 rounded-lg object-cover"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${getStatusColor(rental.status)}`}
                    >
                      {getStatusIcon(rental.status)}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{rental.nftName}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{formatDuration(rental.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span className="text-green-600 font-semibold">
                        {rental.totalCost.toFixed(6)} STT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{rental.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{formatTime(rental.startTime)}</span>
                    </div>
                  </div>
                  
                  {rental.rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(rental.rating!) 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {rental.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(rental.id);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${
                          rental.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'
                        }`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-1">
                      {rental.tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredRentals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rentals Found</h3>
            <p className="text-gray-600">Try adjusting your filters or start renting NFTs</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" onClick={exportTimeline}>
          <Download className="w-4 h-4 mr-2" />
          Export Timeline
        </Button>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share Timeline
        </Button>
      </div>

      {/* Rental Details Modal */}
      <AnimatePresence>
        {selectedRental && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRental(null)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{selectedRental.nftName}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRental(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <img
                  src={selectedRental.nftImage}
                  alt={selectedRental.nftName}
                  className="w-full h-48 rounded-lg object-cover"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className={getStatusColor(selectedRental.status)}>
                      {getStatusIcon(selectedRental.status)}
                      <span className="ml-1 capitalize">{selectedRental.status}</span>
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{selectedRental.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{formatDuration(selectedRental.duration)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="font-medium text-green-600">
                      {selectedRental.totalCost.toFixed(6)} STT
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="font-medium">{new Date(selectedRental.startTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Time</p>
                    <p className="font-medium">{new Date(selectedRental.endTime).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedRental.rating && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Rating</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(selectedRental.rating!) 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold">
                        {selectedRental.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
                
                {selectedRental.review && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Review</p>
                    <p className="text-gray-800 italic">"{selectedRental.review}"</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View NFT
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



