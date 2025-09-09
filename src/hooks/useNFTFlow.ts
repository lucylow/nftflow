import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { parseEther, formatEther } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';
import { useDynamicPricing } from './useDynamicPricing';
import { useUtilityTracker } from './useUtilityTracker';

// Types
export interface RentalListing {
  nftContract: string;
  tokenId: string;
  owner: string;
  pricePerSecond: string;
  minRentalDuration: string;
  maxRentalDuration: string;
  collateralRequired: string;
  active: boolean;
}

export interface Rental {
  nftContract: string;
  tokenId: string;
  owner: string;
  renter: string;
  pricePerSecond: string;
  startTime: string;
  endTime: string;
  collateralAmount: string;
  active: boolean;
  completed: boolean;
}

export const useNFTFlow = () => {
  const { nftFlowContract, account } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { getDynamicPrice, getComprehensivePricing } = useDynamicPricing();
  const { getUtilityBasedPrice, hasHighUtilityDemand } = useUtilityTracker();

  // List NFT for rental
  const listForRental = useCallback(async (
    nftContract: string,
    tokenId: string,
    pricePerSecond: string,
    minDuration: string,
    maxDuration: string,
    collateralRequired: string
  ) => {
    if (!nftFlowContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const tx = await nftFlowContract.listForRental(
        nftContract,
        tokenId,
        parseEther(pricePerSecond),
        minDuration,
        maxDuration,
        parseEther(collateralRequired)
      );

      await tx.wait();
      
      toast({
        title: "NFT Listed Successfully",
        description: "Your NFT has been listed for rental",
      });

      return tx;
    } catch (error: any) {
      console.error('Failed to list NFT:', error);
      toast({
        title: "Listing Failed",
        description: error.message || "Failed to list NFT for rental",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [nftFlowContract, account, toast]);

  // Rent NFT
  const rentNFT = useCallback(async (
    listingId: string,
    duration: string,
    totalCost: string,
    collateralAmount: string
  ) => {
    if (!nftFlowContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const totalPayment = parseEther(totalCost) + parseEther(collateralAmount);
      
      const tx = await nftFlowContract.rentNFT(
        listingId,
        duration,
        { value: totalPayment }
      );

      await tx.wait();
      
      toast({
        title: "Rental Started",
        description: "Successfully rented the NFT",
      });

      return tx;
    } catch (error: any) {
      console.error('Failed to rent NFT:', error);
      toast({
        title: "Rental Failed",
        description: error.message || "Failed to rent NFT",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [nftFlowContract, account, toast]);

  // Complete rental
  const completeRental = useCallback(async (rentalId: string) => {
    if (!nftFlowContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const tx = await nftFlowContract.completeRental(rentalId);
      await tx.wait();
      
      toast({
        title: "Rental Completed",
        description: "Rental has been completed successfully",
      });

      return tx;
    } catch (error: any) {
      console.error('Failed to complete rental:', error);
      toast({
        title: "Completion Failed",
        description: error.message || "Failed to complete rental",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [nftFlowContract, account, toast]);

  // Deposit collateral
  const depositCollateral = useCallback(async (amount: string) => {
    if (!nftFlowContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const tx = await nftFlowContract.depositCollateral({
        value: parseEther(amount)
      });

      await tx.wait();
      
      toast({
        title: "Collateral Deposited",
        description: `Successfully deposited ${amount} STT as collateral`,
      });

      return tx;
    } catch (error: any) {
      console.error('Failed to deposit collateral:', error);
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to deposit collateral",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [nftFlowContract, account, toast]);

  // Withdraw collateral
  const withdrawCollateral = useCallback(async (amount: string) => {
    if (!nftFlowContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const tx = await nftFlowContract.withdrawCollateral(parseEther(amount));
      await tx.wait();
      
      toast({
        title: "Collateral Withdrawn",
        description: `Successfully withdrawn ${amount} STT`,
      });

      return tx;
    } catch (error: any) {
      console.error('Failed to withdraw collateral:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to withdraw collateral",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [nftFlowContract, account, toast]);

  // Get rental details
  const getRental = useCallback(async (rentalId: string): Promise<Rental | null> => {
    if (!nftFlowContract) {
      return null;
    }

    try {
      const rental = await nftFlowContract.getRental(rentalId);
      return {
        nftContract: rental.nftContract,
        tokenId: rental.tokenId.toString(),
        owner: rental.owner,
        renter: rental.renter,
        pricePerSecond: formatEther(rental.pricePerSecond),
        startTime: rental.startTime.toString(),
        endTime: rental.endTime.toString(),
        collateralAmount: formatEther(rental.collateralAmount),
        active: rental.active,
        completed: rental.completed,
      };
    } catch (error) {
      console.error('Failed to get rental:', error);
      return null;
    }
  }, [nftFlowContract]);

  // Get listing details
  const getListing = useCallback(async (listingId: string): Promise<RentalListing | null> => {
    if (!nftFlowContract) {
      return null;
    }

    try {
      const listing = await nftFlowContract.getListing(listingId);
      return {
        nftContract: listing.nftContract,
        tokenId: listing.tokenId.toString(),
        owner: listing.owner,
        pricePerSecond: formatEther(listing.pricePerSecond),
        minRentalDuration: listing.minRentalDuration.toString(),
        maxRentalDuration: listing.maxRentalDuration.toString(),
        collateralRequired: formatEther(listing.collateralRequired),
        active: listing.active,
      };
    } catch (error) {
      console.error('Failed to get listing:', error);
      return null;
    }
  }, [nftFlowContract]);

  // Get user collateral balance
  const getUserCollateralBalance = useCallback(async (): Promise<string> => {
    if (!nftFlowContract || !account) {
      return '0';
    }

    try {
      const balance = await nftFlowContract.userCollateralBalance(account);
      return formatEther(balance);
    } catch (error) {
      console.error('Failed to get collateral balance:', error);
      return '0';
    }
  }, [nftFlowContract, account]);

  // Get platform fee percentage
  const getPlatformFeePercentage = useCallback(async (): Promise<number> => {
    if (!nftFlowContract) {
      return 0;
    }

    try {
      const fee = await nftFlowContract.platformFeePercentage();
      return Number(fee) / 100; // Convert from basis points to percentage
    } catch (error) {
      console.error('Failed to get platform fee:', error);
      return 0;
    }
  }, [nftFlowContract]);

  // Get dynamic price for listing
  const getDynamicPriceForListing = useCallback(async (
    nftContract: string,
    tokenId: string,
    basePrice: string
  ): Promise<string> => {
    try {
      return await getDynamicPrice(nftContract, tokenId, basePrice);
    } catch (error) {
      console.error('Failed to get dynamic price:', error);
      return basePrice; // Fallback to base price
    }
  }, [getDynamicPrice]);

  // Get utility-based price for listing
  const getUtilityBasedPriceForListing = useCallback(async (
    nftContract: string,
    tokenId: string,
    basePrice: string
  ): Promise<string> => {
    try {
      return await getUtilityBasedPrice(nftContract, tokenId, basePrice);
    } catch (error) {
      console.error('Failed to get utility-based price:', error);
      return basePrice; // Fallback to base price
    }
  }, [getUtilityBasedPrice]);

  // Check if NFT has high utility demand
  const checkHighUtilityDemand = useCallback(async (
    nftContract: string,
    tokenId: string
  ): Promise<boolean> => {
    try {
      return await hasHighUtilityDemand(nftContract, tokenId);
    } catch (error) {
      console.error('Failed to check utility demand:', error);
      return false;
    }
  }, [hasHighUtilityDemand]);

  // Get comprehensive pricing information
  const getComprehensivePricingInfo = useCallback(async (
    nftContract: string,
    tokenId: string,
    basePrice: string
  ) => {
    try {
      return await getComprehensivePricing(nftContract, tokenId, basePrice);
    } catch (error) {
      console.error('Failed to get comprehensive pricing:', error);
      return null;
    }
  }, [getComprehensivePricing]);

  return {
    isLoading,
    listForRental,
    rentNFT,
    completeRental,
    depositCollateral,
    withdrawCollateral,
    getRental,
    getListing,
    getUserCollateralBalance,
    getPlatformFeePercentage,
    getDynamicPriceForListing,
    getUtilityBasedPriceForListing,
    checkHighUtilityDemand,
    getComprehensivePricingInfo,
  };
};
