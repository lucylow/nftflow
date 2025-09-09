import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

interface PriceData {
  pricePerSecond: string;
  pricePerHour: string;
  pricePerDay: string;
  pricePerWeek: string;
  estimatedPrice: boolean;
  lastUpdated: Date;
}

interface PricingInfo {
  basePrice: string;
  multiplier: string;
  customPrice?: string;
  oracleFee: string;
}

export const useDIAPriceOracle = () => {
  const { isConnected, account } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [priceCache, setPriceCache] = useState<Map<string, PriceData>>(new Map());

  // Get price from DIA Oracle
  const getPrice = useCallback(async (
    nftContract: string,
    tokenId: string,
    useOracle: boolean = false
  ): Promise<PriceData | null> => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to get NFT pricing",
        variant: "destructive",
      });
      return null;
    }

    const cacheKey = `${nftContract}-${tokenId}`;
    
    // Check cache first
    if (priceCache.has(cacheKey)) {
      const cached = priceCache.get(cacheKey)!;
      const cacheAge = Date.now() - cached.lastUpdated.getTime();
      
      // Use cache if less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return cached;
      }
    }

    setIsLoading(true);
    try {
      // For now, we'll use mock pricing since DIA Oracle integration requires
      // actual contract deployment and oracle setup
      const mockPrice = await getMockPrice(nftContract, tokenId);
      
      const priceData: PriceData = {
        pricePerSecond: mockPrice.pricePerSecond,
        pricePerHour: mockPrice.pricePerHour,
        pricePerDay: mockPrice.pricePerDay,
        pricePerWeek: mockPrice.pricePerWeek,
        estimatedPrice: !useOracle,
        lastUpdated: new Date()
      };

      // Cache the result
      setPriceCache(prev => new Map(prev).set(cacheKey, priceData));

      return priceData;
    } catch (error) {
      console.error('Failed to get price:', error);
      toast({
        title: "Price Fetch Failed",
        description: "Could not fetch NFT pricing data",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, priceCache, toast]);

  // Get estimated price without oracle call
  const getEstimatedPrice = useCallback(async (
    nftContract: string,
    tokenId: string
  ): Promise<PriceData | null> => {
    return getPrice(nftContract, tokenId, false);
  }, [getPrice]);

  // Set custom price for NFT
  const setCustomPrice = useCallback(async (
    nftContract: string,
    tokenId: string,
    pricePerSecond: string
  ): Promise<boolean> => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to set custom pricing",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      // This would call the actual contract method
      // For now, we'll simulate it
      console.log('Setting custom price:', { nftContract, tokenId, pricePerSecond });
      
      // Update cache with custom price
      const cacheKey = `${nftContract}-${tokenId}`;
      const priceData: PriceData = {
        pricePerSecond,
        pricePerHour: (parseFloat(pricePerSecond) * 3600).toString(),
        pricePerDay: (parseFloat(pricePerSecond) * 86400).toString(),
        pricePerWeek: (parseFloat(pricePerSecond) * 604800).toString(),
        estimatedPrice: false,
        lastUpdated: new Date()
      };

      setPriceCache(prev => new Map(prev).set(cacheKey, priceData));

      toast({
        title: "Custom Price Set",
        description: `Set custom price of ${pricePerSecond} STT/second for NFT #${tokenId}`,
      });

      return true;
    } catch (error) {
      console.error('Failed to set custom price:', error);
      toast({
        title: "Price Setting Failed",
        description: "Could not set custom price",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, toast]);

  // Get pricing information for a collection
  const getCollectionPricing = useCallback(async (
    nftContract: string
  ): Promise<PricingInfo | null> => {
    if (!isConnected) return null;

    try {
      // This would fetch collection-level pricing data
      // For now, return mock data
      return {
        basePrice: "0.000001", // 0.000001 STT per second
        multiplier: "1.0", // 1x multiplier
        oracleFee: "0.001" // 0.001 STT oracle fee
      };
    } catch (error) {
      console.error('Failed to get collection pricing:', error);
      return null;
    }
  }, [isConnected]);

  // Batch get prices for multiple NFTs
  const batchGetPrices = useCallback(async (
    nfts: Array<{ contract: string; tokenId: string }>
  ): Promise<Map<string, PriceData>> => {
    const results = new Map<string, PriceData>();
    
    setIsLoading(true);
    try {
      const promises = nfts.map(async (nft) => {
        const price = await getPrice(nft.contract, nft.tokenId, false);
        if (price) {
          results.set(`${nft.contract}-${nft.tokenId}`, price);
        }
      });

      await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Failed to batch get prices:', error);
      return results;
    } finally {
      setIsLoading(false);
    }
  }, [getPrice]);

  // Clear price cache
  const clearCache = useCallback(() => {
    setPriceCache(new Map());
  }, []);

  // Get cached price
  const getCachedPrice = useCallback((nftContract: string, tokenId: string): PriceData | null => {
    const cacheKey = `${nftContract}-${tokenId}`;
    return priceCache.get(cacheKey) || null;
  }, [priceCache]);

  // Mock price generation (replace with actual DIA Oracle integration)
  const getMockPrice = async (nftContract: string, tokenId: string): Promise<{
    pricePerSecond: string;
    pricePerHour: string;
    pricePerDay: string;
    pricePerWeek: string;
  }> => {
    // Simulate different pricing based on token ID
    const basePrice = 0.000001; // Base price per second
    const rarityMultiplier = 1 + (parseInt(tokenId) % 10) * 0.1; // 1x to 2x based on token ID
    const pricePerSecond = (basePrice * rarityMultiplier).toString();

    return {
      pricePerSecond,
      pricePerHour: (parseFloat(pricePerSecond) * 3600).toString(),
      pricePerDay: (parseFloat(pricePerSecond) * 86400).toString(),
      pricePerWeek: (parseFloat(pricePerSecond) * 604800).toString()
    };
  };

  // Format price for display
  const formatPrice = useCallback((price: string, unit: 'second' | 'hour' | 'day' | 'week' = 'second'): string => {
    const numPrice = parseFloat(price);
    
    if (numPrice < 0.000001) {
      return `${(numPrice * 1000000).toFixed(2)} μSTT/${unit}`;
    } else if (numPrice < 0.001) {
      return `${(numPrice * 1000).toFixed(3)} mSTT/${unit}`;
    } else {
      return `${numPrice.toFixed(6)} STT/${unit}`;
    }
  }, []);

  // Calculate total rental cost
  const calculateRentalCost = useCallback((
    pricePerSecond: string,
    durationInSeconds: number
  ): string => {
    const price = parseFloat(pricePerSecond);
    const totalCost = price * durationInSeconds;
    return totalCost.toString();
  }, []);

  return {
    isLoading,
    getPrice,
    getEstimatedPrice,
    setCustomPrice,
    getCollectionPricing,
    batchGetPrices,
    clearCache,
    getCachedPrice,
    formatPrice,
    calculateRentalCost
  };
};
