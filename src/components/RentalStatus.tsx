import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  DollarSign, 
  Shield, 
  Zap, 
  Timer, 
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useRentalTimer, formatDuration } from '@/hooks/useRentalTimer';

interface Rental {
  id: string;
  nftContract: string;
  tokenId: number;
  name: string;
  image: string;
  collection: string;
  startTime: number;
  endTime: number;
  totalPrice: string;
  collateralRequired: string;
  status: 'active' | 'expired' | 'completed' | 'cancelled';
  lender: string;
  tenant: string;
}

interface RentalStatusProps {
  rental: Rental;
  onComplete?: () => void;
  onCancel?: () => void;
  onExtend?: () => void;
  className?: string;
}

export function RentalStatus({ 
  rental, 
  onComplete, 
  onCancel, 
  onExtend,
  className 
}: RentalStatusProps) {
  const timer = useRentalTimer({
    endTime: rental.endTime,
    startTime: rental.startTime,
    onExpire: () => {
      console.log(`Rental ${rental.id} has expired`);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'expired': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const canExtend = rental.status === 'active' && timer.timeLeft > 3600; // Can extend if more than 1 hour left
  const canComplete = rental.status === 'active' && timer.isExpired;
  const canCancel = rental.status === 'active' && !timer.isExpired;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{rental.name}</CardTitle>
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(rental.status)} text-white`}
            >
              {getStatusIcon(rental.status)}
              <span className="ml-1 capitalize">{rental.status}</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{rental.collection}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* NFT Image */}
          <div className="aspect-square w-24 mx-auto rounded-lg overflow-hidden bg-muted/20">
            <img
              src={rental.image}
              alt={rental.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Timer */}
          {rental.status === 'active' && (
            <div className="text-center space-y-2">
              <div className="text-2xl font-mono font-bold text-primary">
                {timer.formattedTime}
              </div>
              <Progress value={timer.progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {timer.isExpired ? 'Rental expired' : 'Time remaining'}
              </p>
            </div>
          )}

          {/* Rental Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Duration</span>
              </div>
              <span>{formatDuration(rental.endTime - rental.startTime)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>Total Cost</span>
              </div>
              <span>{parseFloat(rental.totalPrice).toFixed(6)} STT</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span>Collateral</span>
              </div>
              <span>{rental.collateralRequired} STT</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {canExtend && onExtend && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExtend}
                className="flex-1"
              >
                <Timer className="w-4 h-4 mr-2" />
                Extend
              </Button>
            )}
            
            {canComplete && onComplete && (
              <Button
                size="sm"
                onClick={onComplete}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
            
            {canCancel && onCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onCancel}
                className="flex-1"
              >
                <Pause className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>

          {/* Status-specific information */}
          {rental.status === 'expired' && (
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-500">
                This rental has expired. Please complete it to return the NFT.
              </p>
            </div>
          )}

          {rental.status === 'completed' && (
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-green-500">
                Rental completed successfully!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Component for displaying multiple rental statuses
interface RentalStatusListProps {
  rentals: Rental[];
  onComplete?: (rentalId: string) => void;
  onCancel?: (rentalId: string) => void;
  onExtend?: (rentalId: string) => void;
  className?: string;
}

export function RentalStatusList({ 
  rentals, 
  onComplete, 
  onCancel, 
  onExtend,
  className 
}: RentalStatusListProps) {
  if (rentals.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Active Rentals</h3>
        <p className="text-muted-foreground">
          You don't have any active NFT rentals at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Rentals</h2>
        <Badge variant="secondary">
          {rentals.length} {rentals.length === 1 ? 'rental' : 'rentals'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rentals.map((rental) => (
          <RentalStatus
            key={rental.id}
            rental={rental}
            onComplete={() => onComplete?.(rental.id)}
            onCancel={() => onCancel?.(rental.id)}
            onExtend={() => onExtend?.(rental.id)}
          />
        ))}
      </div>
    </div>
  );
}
