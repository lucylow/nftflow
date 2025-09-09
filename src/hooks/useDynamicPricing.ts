import { useState, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { parseEther, formatEther } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

// Types
export interface PricingData {
  basePrice: string;
  utilizationRate: string;
  lastUpdate: string;
  rentalCount: string;
  totalRentalTime: string;
  rollingWindowStart: string;
}

export interface CollectionPricing {
  floorPrice: string;
  averagePrice: string;
  lastSalePrice: string;
  rarityScore: string;
  lastUpdate: string;
}

export interface ComprehensivePricing {
  dynamicPrice: string;
  utilizationRate: string;
  utilizationMultiplier: string;
  oraclePrice: string;
  reputationDiscount: string;
  finalPrice: string;
}

export const useDynamicPricing = () => {
  const { dynamicPricingContract, account } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Get dynamic price for an NFT
  const getDynamicPrice = useCallback(async (
    nftContract: string,
    tokenId: string,
    basePrice: string,
    userAddress?: string
  ): Promise<string> => {
    if (!dynamicPricingContract) {
      return basePrice; // Fallback to base price
    }

    try {
      const user = userAddress || account;
      if (!user) {
        return basePrice;
      }

      const dynamicPrice = await dynamicPricingContract.getDynamicPrice(
        nftContract,
        tokenId,
        parseEther(basePrice),
        user
      );

      return formatEther(dynamicPrice);
    } catch (error) {
      console.error('Failed to get dynamic price:', error);
      return basePrice; // Fallback to base price
    }
  }, [dynamicPricingContract, account]);

  // Get utilization rate for an NFT
  const getUtilizationRate = useCallback(async (
    nftContract: string,
    tokenId: string
  ): Promise<number> => {
    if (!dynamicPricingContract) {
      return 0;
    }

    try {
      const rate = await dynamicPricingContract.getUtilizationRate(nftContract, tokenId);
      return Number(rate) / 100; // Convert from basis points to percentage
    } catch (error) {
      console.error('Failed to get utilization rate:', error);
      return 0;
    }
  }, [dynamicPricingContract]);

  // Get pricing data for an NFT
  const getPricingData = useCallback(async (
    nftContract: string,
    tokenId: string
  ): Promise<PricingData | null> => {
    if (!dynamicPricingContract) {
      return null;
    }

    try {
      const data = await dynamicPricingContract.getPricingData(nftContract, tokenId);
      return {
        basePrice: formatEther(data.basePrice),
        utilizationRate: data.utilizationRate.toString(),
        lastUpdate: data.lastUpdate.toString(),
        rentalCount: data.rentalCount.toString(),
        totalRentalTime: data.totalRentalTime.toString(),
        rollingWindowStart: data.rollingWindowStart.toString(),
      };
    } catch (error) {
      console.error('Failed to get pricing data:', error);
      return null;
    }
  }, [dynamicPricingContract]);

  // Get collection pricing data
  const getCollectionPricing = useCallback(async (
    nftContract: string
  ): Promise<CollectionPricing | null> => {
    if (!dynamicPricingContract) {
      return null;
    }

    try {
      const data = await dynamicPricingContract.getCollectionPricing(nftContract);
      return {
        floorPrice: formatEther(data.floorPrice),
        averagePrice: formatEther(data.averagePrice),
        lastSalePrice: formatEther(data.lastSalePrice),
        rarityScore: data.rarityScore.toString(),
        lastUpdate: data.lastUpdate.toString(),
      };
    } catch (error) {
      console.error('Failed to get collection pricing:', error);
      return null;
    }
  }, [dynamicPricingContract]);

  // Check if NFT has high utility demand
  const hasHighUtilityDemand = useCallback(async (
    nftContract: string,
    tokenId: string
  ): Promise<boolean> => {
    if (!dynamicPricingContract) {
      return false;
    }

    try {
      return await dynamicPricingContract.hasHighUtilityDemand(nftContract, tokenId);
    } catch (error) {
      console.error('Failed to check utility demand:', error);
      return false;
    }
  }, [dynamicPricingContract]);

  // Get suggested price based on oracle data
  const getSuggestedPrice = useCallback(async (
    nftContract: string,
    tokenId: string
  ): Promise<string> => {
    if (!dynamicPricingContract) {
      return '0';
    }

    try {
      const price = await dynamicPricingContract.getSuggestedPrice(nftContract, tokenId);
      return formatEther(price);
    } catch (error) {
      console.error('Failed to get suggested price:', error);
      return '0';
    }
  }, [dynamicPricingContract]);

  // Get comprehensive pricing information
  const getComprehensivePricing = useCallback(async (
    nftContract: string,
    tokenId: string,
    basePrice: string,
    userAddress?: string
  ): Promise<ComprehensivePricing | null> => {
    if (!dynamicPricingContract) {
      return null;
    }

    try {
      const user = userAddress || account;
      if (!user) {
        return null;
      }

      const result = await dynamicPricingContract.getComprehensivePricing(
        nftContract,
        tokenId,
        parseEther(basePrice),
        user
      );

      return {
        dynamicPrice: formatEther(result.dynamicPrice),
        utilizationRate: result.utilizationRate.toString(),
        utilizationMultiplier: result.utilizationMultiplier.toString(),
        oraclePrice: formatEther(result.oraclePrice),
        reputationDiscount: result.reputationDiscount.toString(),
        finalPrice: formatEther(result.finalPrice),
      };
    } catch (error) {
      console.error('Failed to get comprehensive pricing:', error);
      return null;
    }
  }, [dynamicPricingContract, account]);

  // Update pricing data (only authorized contracts can call this)
  const updatePricingData = useCallback(async (
    nftContract: string,
    tokenId: string,
    rentalDuration: string,
    pricePerSecond: string
  ) => {
    if (!dynamicPricingContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const tx = await dynamicPricingContract.updatePricingData(
        nftContract,
        tokenId,
        rentalDuration,
        parseEther(pricePerSecond)
      );

      await tx.wait();
      
      toast({
        title: "Pricing Data Updated",
        description: "Pricing data has been updated successfully",
      });

      return tx;
    } catch (error: unknown) {
      console.error('Failed to update pricing data:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update pricing data",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [dynamicPricingContract, account, toast]);

  // Update collection pricing
  const updateCollectionPricing = useCallback(async (nftContract: string) => {
    if (!dynamicPricingContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const tx = await dynamicPricingContract.updateCollectionPricing(nftContract);
      await tx.wait();
      
      toast({
        title: "Collection Pricing Updated",
        description: "Collection pricing has been updated successfully",
      });

      return tx;
    } catch (error: unknown) {
      console.error('Failed to update collection pricing:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update collection pricing",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [dynamicPricingContract, account, toast]);

  return {
    isLoading,
    getDynamicPrice,
    getUtilizationRate,
    getPricingData,
    getCollectionPricing,
    hasHighUtilityDemand,
    getSuggestedPrice,
    getComprehensivePricing,
    updatePricingData,
    updateCollectionPricing,
  };
};
