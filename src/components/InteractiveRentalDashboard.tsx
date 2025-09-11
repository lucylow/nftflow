import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp,
  Filter,
  Search,
  Globe,
  Zap,
  Activity,
  Eye,
  Heart,
  Share2
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

interface RentalPin {
  id: string;
  latitude: number;
  longitude: number;
  nftName: string;
  nftImage: string;
  pricePerSecond: number;
  duration: number;
  renter: string;
  startTime: number;
  endTime: number;
  category: string;
  isActive: boolean;
  popularity: number;
}

interface RentalStats {
  totalRentals: number;
  activeRentals: number;
  totalVolume: number;
  averagePrice: number;
  topCategories: Array<{ name: string; count: number; color: string }>;
  recentActivity: Array<{ time: number; action: string; user: string; nft: string }>;
}

interface InteractiveRentalDashboardProps {
  className?: string;
}

export function InteractiveRentalDashboard({ className }: InteractiveRentalDashboardProps) {
  const { account, isConnected } = useWeb3();
  const { subscribe, isConnected: isRealTimeConnected } = useRealTimeUpdates();
  
  const [rentalPins, setRentalPins] = useState<RentalPin[]>([]);
  const [stats, setStats] = useState<RentalStats>({
    totalRentals: 0,
    activeRentals: 0,
    totalVolume: 0,
    averagePrice: 0,
    topCategories: [],
    recentActivity: []
  });
  const [selectedPin, setSelectedPin] = useState<RentalPin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(2);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Generate mock data for demonstration
  useEffect(() => {
    const generateMockData = () => {
      const mockPins: RentalPin[] = [];
      const categories = ['Gaming', 'Art', 'Music', 'Sports', 'Fashion', 'Collectibles'];
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
      
      // Generate random rental pins around the world
      for (let i = 0; i < 50; i++) {
        const lat = (Math.random() - 0.5) * 180;
        const lng = (Math.random() - 0.5) * 360;
        const category = categories[Math.floor(Math.random() * categories.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        mockPins.push({
          id: `pin-${i}`,
          latitude: lat,
          longitude: lng,
          nftName: `NFT #${Math.floor(Math.random() * 10000)}`,
          nftImage: `/placeholder.svg`,
          pricePerSecond: Math.random() * 0.01 + 0.001,
          duration: Math.floor(Math.random() * 3600) + 300,
          renter: `0x${Math.random().toString(16).substr(2, 8)}...`,
          startTime: Date.now() - Math.random() * 3600000,
          endTime: Date.now() + Math.random() * 3600000,
          category,
          isActive: Math.random() > 0.3,
          popularity: Math.floor(Math.random() * 100)
        });
      }
      
      setRentalPins(mockPins);
      
      // Calculate stats
      const activeRentals = mockPins.filter(pin => pin.isActive).length;
      const totalVolume = mockPins.reduce((sum, pin) => sum + (pin.pricePerSecond * pin.duration), 0);
      const averagePrice = mockPins.reduce((sum, pin) => sum + pin.pricePerSecond, 0) / mockPins.length;
      
      // Calculate top categories
      const categoryCounts = categories.map(cat => ({
        name: cat,
        count: mockPins.filter(pin => pin.category === cat).length,
        color: colors[categories.indexOf(cat)]
      })).sort((a, b) => b.count - a.count);
      
      setStats({
        totalRentals: mockPins.length,
        activeRentals,
        totalVolume,
        averagePrice,
        topCategories: categoryCounts,
        recentActivity: mockPins.slice(0, 10).map(pin => ({
          time: pin.startTime,
          action: 'rented',
          user: pin.renter,
          nft: pin.nftName
        }))
      });
      
      setIsLoading(false);
    };

    generateMockData();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!isRealTimeConnected) return;

    const unsubscribe = subscribe('rental-created', (data: any) => {
      const newPin: RentalPin = {
        id: data.id,
        latitude: data.latitude,
        longitude: data.longitude,
        nftName: data.nftName,
        nftImage: data.nftImage,
        pricePerSecond: data.pricePerSecond,
        duration: data.duration,
        renter: data.renter,
        startTime: data.startTime,
        endTime: data.endTime,
        category: data.category,
        isActive: true,
        popularity: data.popularity || 0
      };
      
      setRentalPins(prev => [...prev, newPin]);
      
      // Add to recent activity
      setStats(prev => ({
        ...prev,
        recentActivity: [
          {
            time: data.startTime,
            action: 'rented',
            user: data.renter,
            nft: data.nftName
          },
          ...prev.recentActivity.slice(0, 9)
        ]
      }));
    });

    return unsubscribe;
  }, [isRealTimeConnected, subscribe]);

  // Animation for pins
  useEffect(() => {
    const animatePins = () => {
      setRentalPins(prev => prev.map(pin => ({
        ...pin,
        popularity: Math.max(0, Math.min(100, pin.popularity + (Math.random() - 0.5) * 10))
      })));
      
      animationRef.current = requestAnimationFrame(animatePins);
    };

    animationRef.current = requestAnimationFrame(animatePins);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const filteredPins = rentalPins.filter(pin => {
    const matchesSearch = pin.nftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pin.renter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || pin.category === categoryFilter;
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'low' && pin.pricePerSecond < 0.005) ||
                        (priceFilter === 'medium' && pin.pricePerSecond >= 0.005 && pin.pricePerSecond < 0.02) ||
                        (priceFilter === 'high' && pin.pricePerSecond >= 0.02);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const getPinColor = (pin: RentalPin): string => {
    if (!pin.isActive) return '#9CA3AF';
    
    const category = stats.topCategories.find(cat => cat.name === pin.category);
    return category?.color || '#6B7280';
  };

  const getPinSize = (pin: RentalPin): number => {
    return Math.max(8, Math.min(20, 8 + (pin.popularity / 10)));
  };

  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
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
              <Globe className="w-6 h-6" />
              Global Rental Activity
            </h2>
            <p className="text-gray-600">Real-time NFT rental activity around the world</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isRealTimeConnected ? "default" : "secondary"}>
              <Activity className="w-3 h-3 mr-1" />
              {isRealTimeConnected ? 'Live' : 'Offline'}
            </Badge>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search NFTs or renters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {stats.topCategories.map(category => (
                <SelectItem key={category.name} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="low">Low (&lt;0.005)</SelectItem>
              <SelectItem value="medium">Medium (0.005-0.02)</SelectItem>
              <SelectItem value="high">High (&gt;0.02)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Live Rental Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapRef}
                className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden"
              >
                {/* Mock world map background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100"></div>
                </div>
                
                {/* Rental Pins */}
                <div className="relative w-full h-full">
                  {filteredPins.map((pin) => (
                    <motion.div
                      key={pin.id}
                      className="absolute cursor-pointer"
                      style={{
                        left: `${((pin.longitude + 180) / 360) * 100}%`,
                        top: `${((pin.latitude + 90) / 180) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: pin.isActive ? 1 : 0.7,
                        opacity: pin.isActive ? 1 : 0.5
                      }}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => setSelectedPin(pin)}
                    >
                      <div
                        className="rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                        style={{
                          width: getPinSize(pin),
                          height: getPinSize(pin),
                          backgroundColor: getPinColor(pin)
                        }}
                      >
                        {pin.isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ backgroundColor: getPinColor(pin) }}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(zoom + 1)}
                    disabled={zoom >= 5}
                  >
                    +
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(zoom - 1)}
                    disabled={zoom <= 1}
                  >
                    -
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Activity */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Live Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalRentals}</p>
                  <p className="text-sm text-gray-600">Total Rentals</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.activeRentals}</p>
                  <p className="text-sm text-gray-600">Active Now</p>
                </div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalVolume.toFixed(2)} STT
                </p>
                <p className="text-sm text-gray-600">Total Volume</p>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {(stats.averagePrice * 1000).toFixed(3)} mSTT
                </p>
                <p className="text-sm text-gray-600">Avg Price/sec</p>
              </div>
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topCategories.slice(0, 5).map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                        <span className="text-gray-600">{activity.nft}</span>
                      </p>
                      <p className="text-xs text-gray-500">{formatTime(activity.time)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pin Details Modal */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPin(null)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedPin.nftName}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPin(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: getPinColor(selectedPin) }}>
                    {selectedPin.category}
                  </Badge>
                  <Badge variant={selectedPin.isActive ? "default" : "secondary"}>
                    {selectedPin.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Price/sec</p>
                    <p className="font-semibold">{(selectedPin.pricePerSecond * 1000).toFixed(3)} mSTT</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{formatDuration(selectedPin.duration)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Renter</p>
                  <p className="font-mono text-sm">{selectedPin.renter}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Heart className="w-4 h-4" />
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

