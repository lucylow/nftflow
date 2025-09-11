import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  DollarSign, 
  Clock, 
  Zap,
  TrendingUp,
  Activity,
  Timer
} from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { usePaymentStream } from '@/hooks/usePaymentStream';
import { formatEther, parseEther } from 'ethers';

interface PaymentStreamData {
  id: string;
  sender: string;
  recipient: string;
  totalAmount: string;
  streamedAmount: string;
  ratePerSecond: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  nftContract?: string;
  tokenId?: number;
  nftName?: string;
  nftImage?: string;
}

interface RealTimePaymentStreamProps {
  streamId: string;
  className?: string;
}

export function RealTimePaymentStream({ streamId, className }: RealTimePaymentStreamProps) {
  const { account } = useWeb3();
  const { getStream, getStreamBalance, isStreamActive } = usePaymentStream();
  
  const [streamData, setStreamData] = useState<PaymentStreamData | null>(null);
  const [currentStreamedAmount, setCurrentStreamedAmount] = useState('0');
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [streamProgress, setStreamProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  // Load stream data
  useEffect(() => {
    const loadStreamData = async () => {
      if (!streamId) return;
      
      setIsLoading(true);
      try {
        const stream = await getStream(streamId);
        if (stream) {
          setStreamData(stream);
          setCurrentStreamedAmount(stream.streamedAmount);
          
          // Calculate initial time values
          const now = Math.floor(Date.now() / 1000);
          const elapsed = Math.max(0, now - stream.startTime);
          const remaining = Math.max(0, stream.endTime - now);
          
          setElapsedTime(elapsed);
          setRemainingTime(remaining);
          
          // Calculate progress
          const totalDuration = stream.endTime - stream.startTime;
          const progress = Math.min(100, (elapsed / totalDuration) * 100);
          setStreamProgress(progress);
        }
      } catch (error) {
        console.error('Failed to load stream data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStreamData();
  }, [streamId, getStream]);

  // Real-time updates
  useEffect(() => {
    if (!streamData || !isPlaying) return;

    const updateStream = async () => {
      try {
        const balance = await getStreamBalance(streamId);
        const now = Math.floor(Date.now() / 1000);
        
        // Calculate streamed amount based on time
        const elapsed = Math.max(0, now - streamData.startTime);
        const totalDuration = streamData.endTime - streamData.startTime;
        const expectedStreamed = (parseFloat(streamData.totalAmount) * elapsed) / totalDuration;
        
        setCurrentStreamedAmount(expectedStreamed.toString());
        
        // Update time values
        const remaining = Math.max(0, streamData.endTime - now);
        setElapsedTime(elapsed);
        setRemainingTime(remaining);
        
        // Update progress
        const progress = Math.min(100, (elapsed / totalDuration) * 100);
        setStreamProgress(progress);
        
        // Check if stream is complete
        if (now >= streamData.endTime) {
          setIsPlaying(false);
          setStreamProgress(100);
        }
      } catch (error) {
        console.error('Failed to update stream:', error);
      }
    };

    // Update every second for real-time effect
    intervalRef.current = setInterval(updateStream, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [streamData, isPlaying, streamId, getStreamBalance]);

  // Animation for streaming effect
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setCurrentStreamedAmount(prev => {
        const current = parseFloat(prev);
        const rate = parseFloat(streamData?.ratePerSecond || '0');
        return (current + rate).toString();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, streamData?.ratePerSecond]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toFixed(6);
  };

  const getStreamStatus = (): 'active' | 'paused' | 'completed' | 'upcoming' => {
    if (!streamData) return 'upcoming';
    
    const now = Math.floor(Date.now() / 1000);
    if (now >= streamData.endTime) return 'completed';
    if (now < streamData.startTime) return 'upcoming';
    if (!isPlaying) return 'paused';
    return 'active';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'paused': return 'text-yellow-500';
      case 'completed': return 'text-blue-500';
      case 'upcoming': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <Clock className="w-4 h-4" />;
      case 'upcoming': return <Timer className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!streamData) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Stream not found</p>
        </CardContent>
      </Card>
    );
  }

  const status = getStreamStatus();
  const totalAmount = parseFloat(streamData.totalAmount);
  const streamedAmount = parseFloat(currentStreamedAmount);
  const remainingAmount = totalAmount - streamedAmount;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Real-Time Payment Stream
          </CardTitle>
          <Badge 
            variant={status === 'active' ? 'default' : 'secondary'}
            className={`${getStatusColor(status)} border-current`}
          >
            {getStatusIcon(status)}
            <span className="ml-1 capitalize">{status}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* NFT Info */}
        {streamData.nftContract && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {streamData.nftImage && (
              <img 
                src={streamData.nftImage} 
                alt={streamData.nftName}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="font-medium">{streamData.nftName || `NFT #${streamData.tokenId}`}</p>
              <p className="text-sm text-gray-500">
                {streamData.nftContract.slice(0, 6)}...{streamData.nftContract.slice(-4)}
              </p>
            </div>
          </div>
        )}

        {/* Stream Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Stream Progress</span>
            <span className="font-medium">{streamProgress.toFixed(1)}%</span>
          </div>
          
          <div className="relative">
            <Progress value={streamProgress} className="h-3" />
            <motion.div
              className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              style={{ width: `${streamProgress}%` }}
              animate={{ width: `${streamProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Amount Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Streamed</p>
            <motion.p 
              className="text-2xl font-bold text-green-600"
              key={currentStreamedAmount}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {formatAmount(currentStreamedAmount)} STT
            </motion.p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatAmount(remainingAmount.toString())} STT
            </p>
          </div>
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Elapsed</p>
            <p className="text-lg font-semibold">{formatTime(elapsedTime)}</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p className="text-lg font-semibold">{formatTime(remainingTime)}</p>
          </div>
        </div>

        {/* Rate Information */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600">Stream Rate</span>
          </div>
          <span className="font-semibold text-purple-600">
            {formatAmount(streamData.ratePerSecond)} STT/sec
          </span>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            variant={isPlaying ? "destructive" : "default"}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={status === 'completed' || status === 'upcoming'}
            className="flex-1"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://somnia.network/tx/${streamId}`, '_blank')}
            className="flex-1"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View on Explorer
          </Button>
        </div>

        {/* Real-time Animation */}
        <AnimatePresence>
          {isPlaying && status === 'active' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 text-sm text-green-600">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Activity className="w-4 h-4" />
                </motion.div>
                <span>Streaming in real-time...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
