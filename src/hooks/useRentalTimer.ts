import { useEffect, useState, useCallback } from 'react';

interface RentalTimerState {
  timeLeft: number;
  progress: number;
  isActive: boolean;
  isExpired: boolean;
  formattedTime: string;
}

interface UseRentalTimerOptions {
  endTime?: number;
  startTime?: number;
  onExpire?: () => void;
  updateInterval?: number;
}

export function useRentalTimer({
  endTime,
  startTime,
  onExpire,
  updateInterval = 1000
}: UseRentalTimerOptions): RentalTimerState {
  const [blockNumber, setBlockNumber] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // Update current time periodically for accurate timing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
      setBlockNumber(prev => prev + 1); // Simulate block updates
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [updateInterval]);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  const calculateTimerState = useCallback((): RentalTimerState => {
    if (!endTime || !startTime) {
      return {
        timeLeft: 0,
        progress: 0,
        isActive: false,
        isExpired: true,
        formattedTime: '00:00:00'
      };
    }

    const totalDuration = endTime - startTime;
    const elapsedTime = Math.max(0, currentTime - startTime);
    const remainingTime = Math.max(0, endTime - currentTime);
    
    const progress = totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 0;
    const isActive = currentTime >= startTime && currentTime < endTime;
    const isExpired = currentTime >= endTime;

    // Format time as HH:MM:SS
    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
      timeLeft: remainingTime,
      progress: Math.min(progress, 100),
      isActive,
      isExpired,
      formattedTime: formatTime(remainingTime)
    };
  }, [currentTime, endTime, startTime]);

  const timerState = calculateTimerState();

  // Call onExpire when rental expires
  useEffect(() => {
    if (timerState.isExpired && onExpire) {
      onExpire();
    }
  }, [timerState.isExpired, onExpire]);

  return timerState;
}

// Hook for tracking multiple rentals
export function useMultipleRentalTimers(rentals: Array<{
  id: string;
  endTime: number;
  startTime: number;
}>): Record<string, RentalTimerState> {
  const timerStates: Record<string, RentalTimerState> = {};

  rentals.forEach(rental => {
    const timerState = useRentalTimer({
      endTime: rental.endTime,
      startTime: rental.startTime
    });
    
    timerStates[rental.id] = timerState;
  });

  return timerStates;
}

// Utility function to calculate rental cost
export function calculateRentalCost(
  pricePerSecond: string,
  duration: number,
  collateralRequired: string
): {
  rentalCost: number;
  totalCost: number;
  formattedRentalCost: string;
  formattedTotalCost: string;
} {
  const price = parseFloat(pricePerSecond);
  const collateral = parseFloat(collateralRequired);
  
  const rentalCost = price * duration;
  const totalCost = rentalCost + collateral;

  return {
    rentalCost,
    totalCost,
    formattedRentalCost: rentalCost.toFixed(6),
    formattedTotalCost: totalCost.toFixed(6)
  };
}

// Utility function to format duration
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

// Utility function to get time until rental starts
export function getTimeUntilStart(startTime: number): {
  timeLeft: number;
  formattedTime: string;
  isStartingSoon: boolean;
} {
  const currentTime = Math.floor(Date.now() / 1000);
  const timeLeft = Math.max(0, startTime - currentTime);
  
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isStartingSoon: timeLeft <= 300 // 5 minutes
  };
}
