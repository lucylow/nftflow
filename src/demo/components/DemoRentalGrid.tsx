import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSomniaMock } from '../useSomniaMock';
import { SCHEMA_IDS } from '../sampleSchemas';
import { StreamEvent } from '../mockSomnia';
import { X, Clock, Coins } from 'lucide-react';

interface RentalData {
  rentalId: number;
  nftName: string;
  owner: string;
  renter: string;
  pricePerSecond: string;
  startTs: number;
  expiresTs: number;
  currentBalance: string;
  sequence: number;
  status: string;
}

interface DemoRentalGridProps {
  onRemoveRental: (id: number) => void;
}

export function DemoRentalGrid({ onRemoveRental }: DemoRentalGridProps) {
  const [rentals, setRentals] = useState<Map<number, RentalData>>(new Map());

  // Listen for new rentals
  useSomniaMock(SCHEMA_IDS.RENTAL_STARTED, (event: StreamEvent) => {
    const data = event.raw;
    setRentals(prev => {
      const newMap = new Map(prev);
      newMap.set(data.rentalId, {
        rentalId: data.rentalId,
        nftName: data.nftName,
        owner: data.owner,
        renter: data.renter,
        pricePerSecond: data.pricePerSecond,
        startTs: data.startTs,
        expiresTs: data.expiresTs,
        currentBalance: '0',
        sequence: 0,
        status: data.status,
      });
      return newMap;
    });
  });

  // Listen for ticks
  useSomniaMock(SCHEMA_IDS.RENTAL_TICK, (event: StreamEvent) => {
    const data = event.raw;
    setRentals(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(data.rentalId);
      if (existing) {
        newMap.set(data.rentalId, {
          ...existing,
          currentBalance: data.balanceWei,
          sequence: data.sequence,
        });
      }
      return newMap;
    });
  });

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  
  const getProgress = (rental: RentalData) => {
    const now = Math.floor(Date.now() / 1000);
    const total = rental.expiresTs - rental.startTs;
    const elapsed = now - rental.startTs;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const rentalArray = Array.from(rentals.values());

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Active Rentals</h3>
        <Badge variant="outline" className="text-xs">
          {rentalArray.length} active
        </Badge>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {rentalArray.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No active rentals. Click "Add Rental" to start.
          </div>
        ) : (
          <div className="grid gap-3">
            {rentalArray.map((rental) => (
              <div
                key={rental.rentalId}
                className="border border-border rounded-lg p-3 bg-background/50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      {rental.nftName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Rental #{rental.rentalId}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      STREAMING
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onRemoveRental(rental.rentalId)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="ml-1 font-mono text-foreground">
                      {formatAddress(rental.owner)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Renter:</span>
                    <span className="ml-1 font-mono text-foreground">
                      {formatAddress(rental.renter)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-muted/30 rounded p-2">
                  <div className="flex items-center gap-1 text-xs">
                    <Coins className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">Earned:</span>
                    <span className="font-mono font-medium text-foreground">
                      {parseFloat(rental.currentBalance).toFixed(6)} STT
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="font-mono text-muted-foreground">
                      Tick #{rental.sequence}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Rental Progress</span>
                    <span>{getProgress(rental).toFixed(0)}%</span>
                  </div>
                  <Progress value={getProgress(rental)} className="h-1" />
                </div>

                <div className="text-[10px] text-muted-foreground">
                  Rate: <span className="font-mono">{rental.pricePerSecond} STT/sec</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
