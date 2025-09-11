import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { formatEther } from 'ethers';

interface PricingData {
  basePrice: string;
  currentPrice: string;
  utilizationRate: number;
  demandScore: number;
  timeOfDayMultiplier: number;
  lastUpdate: number;
  totalRentals: number;
  activeRentals: number;
  averageRentalDuration: number;
}

interface TimeTier {
  startHour: number;
  endHour: number;
  multiplier: number;
  name: string;
}

interface DemandFactors {
  rentalFrequency: number;
  averageDuration: number;
  uniqueRenters: number;
  priceElasticity: number;
  marketTrend: number;
}

export const useDynamicPricing = () => {
  const { account, isConnected, dynamicPricingContract } = useWeb3();
  const { toast } = useToast();
  
  const [pricingData, setPricingData] = useState<Map<string, PricingData>>(new Map());
  const [timeTiers, setTimeTiers] = useState<TimeTier[]>([]);
  const [demandFactors, setDemandFactors] = useState<DemandFactors | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get dynamic price for NFT
  const getDynamicPrice = useCallback(async (
    nftContract: string,
    tokenId: number
  ): Promise<string> => {
    if (!dynamicPricingContract) {
      throw new Error('Dynamic pricing contract not available');
    }

    try {
      const price = await dynamicPricingContract.getDynamicPrice(nftContract, tokenId);
      return formatEther(price);
    } catch (err: any) {
      console.error('Failed to get dynamic price:', err);
      throw err;
    }
  }, [dynamicPricingContract]);

  // Get pricing data for NFT
  const getPricingData = useCallback(async (
    nftContract: string,
    tokenId: number
  ): Promise<PricingData | null> => {
    if (!dynamicPricingContract) return null;

    try {
      const data = await dynamicPricingContract.getPricingData(nftContract, tokenId);
      return {
        basePrice: formatEther(data.basePrice),
        currentPrice: formatEther(data.currentPrice),
        utilizationRate: Number(data.utilizationRate),
        demandScore: Number(data.demandScore),
        timeOfDayMultiplier: Number(data.timeOfDayMultiplier),
        lastUpdate: Number(data.lastUpdate),
        totalRentals: Number(data.totalRentals),
        activeRentals: Number(data.activeRentals),
        averageRentalDuration: Number(data.averageRentalDuration)
      };
    } catch (err: any) {
      console.error('Failed to get pricing data:', err);
      return null;
    }
  }, [dynamicPricingContract]);

  // Update pricing data
  const updatePricingData = useCallback(async (
    nftContract: string,
    tokenId: number,
    basePrice: string
  ) => {
    if (!isConnected || !account || !dynamicPricingContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await dynamicPricingContract.updatePricingData(
        nftContract,
        tokenId,
        basePrice
      );
      await tx.wait();

      toast({
        title: "Pricing Updated",
        description: "Successfully updated pricing data",
      });

      // Refresh pricing data
      const newData = await getPricingData(nftContract, tokenId);
      if (newData) {
        setPricingData(prev => new Map(prev.set(`${nftContract}-${tokenId}`, newData)));
      }

      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update pricing data';
      setError(errorMessage);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, dynamicPricingContract, getPricingData, toast]);

  // Record rental activity
  const recordRentalActivity = useCallback(async (
    nftContract: string,
    tokenId: number,
    duration: number,
    pricePaid: string
  ) => {
    if (!dynamicPricingContract) {
      throw new Error('Dynamic pricing contract not available');
    }

    try {
      const tx = await dynamicPricingContract.recordRentalActivity(
        nftContract,
        tokenId,
        duration,
        pricePaid
      );
      await tx.wait();

      // Refresh pricing data
      const newData = await getPricingData(nftContract, tokenId);
      if (newData) {
        setPricingData(prev => new Map(prev.set(`${nftContract}-${tokenId}`, newData)));
      }

      return tx;
    } catch (err: any) {
      console.error('Failed to record rental activity:', err);
      throw err;
    }
  }, [dynamicPricingContract, getPricingData]);

  // Update demand factors
  const updateDemandFactors = useCallback(async (
    rentalFrequency: number,
    averageDuration: number,
    uniqueRenters: number,
    priceElasticity: number,
    marketTrend: number
  ) => {
    if (!isConnected || !account || !dynamicPricingContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await dynamicPricingContract.updateDemandFactors(
        rentalFrequency,
        averageDuration,
        uniqueRenters,
        priceElasticity,
        marketTrend
      );
      await tx.wait();

      toast({
        title: "Demand Factors Updated",
        description: "Successfully updated global demand factors",
      });

      // Refresh demand factors
      await loadDemandFactors();

      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update demand factors';
      setError(errorMessage);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, dynamicPricingContract, toast]);

  // Add time tier
  const addTimeTier = useCallback(async (
    startHour: number,
    endHour: number,
    multiplier: number,
    name: string
  ) => {
    if (!isConnected || !account || !dynamicPricingContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await dynamicPricingContract.addTimeTier(
        startHour,
        endHour,
        multiplier,
        name
      );
      await tx.wait();

      toast({
        title: "Time Tier Added",
        description: `Successfully added ${name} time tier`,
      });

      // Refresh time tiers
      await loadTimeTiers();

      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add time tier';
      setError(errorMessage);
      toast({
        title: "Addition Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, dynamicPricingContract, toast]);

  // Set collection base price
  const setCollectionBasePrice = useCallback(async (
    nftContract: string,
    basePrice: string
  ) => {
    if (!isConnected || !account || !dynamicPricingContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await dynamicPricingContract.setCollectionBasePrice(
        nftContract,
        basePrice
      );
      await tx.wait();

      toast({
        title: "Base Price Set",
        description: "Successfully set collection base price",
      });

      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to set base price';
      setError(errorMessage);
      toast({
        title: "Setting Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, dynamicPricingContract, toast]);

  // Set collection multiplier
  const setCollectionMultiplier = useCallback(async (
    nftContract: string,
    multiplier: number
  ) => {
    if (!isConnected || !account || !dynamicPricingContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await dynamicPricingContract.setCollectionMultiplier(
        nftContract,
        multiplier
      );
      await tx.wait();

      toast({
        title: "Multiplier Set",
        description: "Successfully set collection multiplier",
      });

      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to set multiplier';
      setError(errorMessage);
      toast({
        title: "Setting Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, dynamicPricingContract, toast]);

  // Load time tiers
  const loadTimeTiers = useCallback(async () => {
    if (!dynamicPricingContract) return;

    try {
      const tiers = await dynamicPricingContract.getAllTimeTiers();
      setTimeTiers(tiers.map((tier: any) => ({
        startHour: Number(tier.startHour),
        endHour: Number(tier.endHour),
        multiplier: Number(tier.multiplier),
        name: tier.name
      })));
    } catch (err: any) {
      console.error('Failed to load time tiers:', err);
      setError(err.message);
    }
  }, [dynamicPricingContract]);

  // Load demand factors
  const loadDemandFactors = useCallback(async () => {
    if (!dynamicPricingContract) return;

    try {
      const factors = await dynamicPricingContract.getGlobalDemandFactors();
      setDemandFactors({
        rentalFrequency: Number(factors.rentalFrequency),
        averageDuration: Number(factors.averageDuration),
        uniqueRenters: Number(factors.uniqueRenters),
        priceElasticity: Number(factors.priceElasticity),
        marketTrend: Number(factors.marketTrend)
      });
    } catch (err: any) {
      console.error('Failed to load demand factors:', err);
      setError(err.message);
    }
  }, [dynamicPricingContract]);

  // Get current time tier
  const getCurrentTimeTier = useCallback((): TimeTier | null => {
    const currentHour = new Date().getHours();
    
    for (const tier of timeTiers) {
      if (tier.startHour <= tier.endHour) {
        // Normal case: start <= end
        if (currentHour >= tier.startHour && currentHour <= tier.endHour) {
          return tier;
        }
      } else {
        // Wraparound case: start > end (e.g., 22-6 for night hours)
        if (currentHour >= tier.startHour || currentHour <= tier.endHour) {
          return tier;
        }
      }
    }
    
    return null;
  }, [timeTiers]);

  // Calculate price prediction
  const calculatePricePrediction = useCallback(async (
    nftContract: string,
    tokenId: number,
    futureHours: number = 24
  ): Promise<{
    currentPrice: string;
    predictedPrice: string;
    priceChange: number;
    confidence: number;
  }> => {
    try {
      const currentPrice = await getDynamicPrice(nftContract, tokenId);
      const pricingData = await getPricingData(nftContract, tokenId);
      
      if (!pricingData) {
        throw new Error('No pricing data available');
      }

      // Simple prediction based on current trends
      const currentPriceNum = parseFloat(currentPrice);
      const utilizationRate = pricingData.utilizationRate / 10000; // Convert from basis points
      const demandScore = pricingData.demandScore / 10000; // Convert from basis points
      
      // Predict price change based on utilization and demand
      const priceChange = (utilizationRate * 0.1) + (demandScore * 0.05);
      const predictedPrice = currentPriceNum * (1 + priceChange);
      
      // Calculate confidence based on data quality
      const confidence = Math.min(95, Math.max(60, 
        (pricingData.totalRentals * 2) + 
        (pricingData.activeRentals * 5) + 
        (pricingData.averageRentalDuration / 3600) * 10
      ));

      return {
        currentPrice,
        predictedPrice: predictedPrice.toFixed(6),
        priceChange: priceChange * 100,
        confidence
      };
    } catch (err: any) {
      console.error('Failed to calculate price prediction:', err);
      throw err;
    }
  }, [getDynamicPrice, getPricingData]);

  // Load data on mount
  useEffect(() => {
    if (dynamicPricingContract) {
      loadTimeTiers();
      loadDemandFactors();
    }
  }, [dynamicPricingContract, loadTimeTiers, loadDemandFactors]);

  return {
    // State
    pricingData,
    timeTiers,
    demandFactors,
    isLoading,
    error,
    
    // Actions
    getDynamicPrice,
    getPricingData,
    updatePricingData,
    recordRentalActivity,
    updateDemandFactors,
    addTimeTier,
    setCollectionBasePrice,
    setCollectionMultiplier,
    
    // Data loading
    loadTimeTiers,
    loadDemandFactors,
    
    // Utilities
    getCurrentTimeTier,
    calculatePricePrediction
  };
};