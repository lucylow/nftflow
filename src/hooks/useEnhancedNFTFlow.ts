import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context-minimal';
import { useToast } from '@/hooks/use-toast';
import { parseEther, formatEther } from '@/lib/web3';

export interface TransactionStatus {
  hash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations?: number;
  gasUsed?: string;
  errorMessage?: string;
}

export interface EnhancedNFTRental {
  listingId: string;
  tokenId: string;
  nftContract: string;
  owner: string;
  renter?: string;
  pricePerSecond: string;
  minDuration: number;
  maxDuration: number;
  collateralRequired: string; 
  startTime?: number;
  endTime?: number;
  isActive: boolean;
  totalEarned?: string;
  gasOptimized?: boolean;
  metadata?: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: any }>;
  };
}

export const useEnhancedNFTFlow = () => {
  const { isConnected, account, nftFlowContract } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string>('0');

  // Enhanced listing with gas estimation and validation
  const listForRentalEnhanced = useCallback(async (
    nftContract: string,
    tokenId: string,
    pricePerSecond: string,
    minDuration: number,
    maxDuration: number,
    collateralRequired: string,
    validateMetadata: boolean = true
  ) => {
    if (!isConnected || !account || !nftFlowContract) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet and ensure contracts are loaded",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    setTransactionStatus({ status: 'pending' });

    try {
      // Validate inputs
      if (minDuration >= maxDuration) {
        throw new Error('Minimum duration must be less than maximum duration');
      }
      if (parseFloat(pricePerSecond) <= 0) {
        throw new Error('Price per second must be greater than 0');
      }
      if (parseFloat(collateralRequired) < 0) {
        throw new Error('Collateral cannot be negative');
      }

      // Estimate gas first
      const gasEstimate = await nftFlowContract.listForRental.estimateGas(
        nftContract,
        tokenId,
        parseEther(pricePerSecond),
        minDuration,
        maxDuration,
        parseEther(collateralRequired)
      );
      setGasEstimate(formatEther(gasEstimate));

      // Validate NFT metadata if requested
      if (validateMetadata) {
        try {
          const erc721Contract = new ethers.Contract(
            nftContract,
            ['function tokenURI(uint256) view returns (string)'],
            nftFlowContract.runner
          );
          const tokenURI = await erc721Contract.tokenURI(tokenId);
          console.log('NFT metadata validated:', tokenURI);
        } catch (error) {
          console.warn('Could not validate NFT metadata:', error);
        }
      }

      // Execute transaction with optimized gas
      const tx = await nftFlowContract.listForRental(
        nftContract,
        tokenId,
        parseEther(pricePerSecond),
        minDuration,
        maxDuration,
        parseEther(collateralRequired),
        {
          gasLimit: gasEstimate * BigInt(120) / BigInt(100) // 20% buffer
        }
      );

      setTransactionStatus({ hash: tx.hash, status: 'pending' });

      // Wait for confirmation with progress updates
      const receipt = await tx.wait();
      
      setTransactionStatus({
        hash: tx.hash,
        status: 'confirmed',
        confirmations: receipt.confirmations,
        gasUsed: formatEther(receipt.gasUsed)
      });

      toast({
        title: "Successfully Listed",
        description: `NFT listed for rental. Gas used: ${formatEther(receipt.gasUsed)} ETH`,
      });

      return receipt;
    } catch (error: any) {
      console.error('Error listing NFT for rental:', error);
      
      setTransactionStatus({
        status: 'failed',
        errorMessage: error.message || 'Transaction failed'
      });

      toast({
        title: "Listing Failed",
        description: error.reason || error.message || "Failed to list NFT for rental",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, nftFlowContract, toast]);

  // Enhanced rental with collateral calculation
  const rentNFTEnhanced = useCallback(async (
    listingId: string,
    duration: number,
    maxGasPrice?: string
  ) => {
    if (!isConnected || !account || !nftFlowContract) {
      toast({
        title: "Connection Required", 
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    setTransactionStatus({ status: 'pending' });

    try {
      // Get rental details first
      const listing = await nftFlowContract.getRentalListing(listingId);
      const totalCost = BigInt(listing.pricePerSecond) * BigInt(duration);
      const collateral = BigInt(listing.collateralRequired);
      const totalAmount = totalCost + collateral;

      // Estimate gas
      const gasEstimate = await nftFlowContract.rentNFT.estimateGas(
        listingId,
        duration,
        { value: totalAmount }
      );

      // Execute with gas optimization
      const txOptions: any = {
        value: totalAmount,
        gasLimit: gasEstimate * BigInt(120) / BigInt(100)
      };

      if (maxGasPrice) {
        txOptions.maxFeePerGas = parseEther(maxGasPrice);
      }

      const tx = await nftFlowContract.rentNFT(listingId, duration, txOptions);
      
      setTransactionStatus({ hash: tx.hash, status: 'pending' });

      const receipt = await tx.wait();
      
      setTransactionStatus({
        hash: tx.hash,
        status: 'confirmed',
        confirmations: receipt.confirmations,
        gasUsed: formatEther(receipt.gasUsed)
      });

      toast({
        title: "Rental Started",
        description: `NFT rental active for ${duration} seconds. Total cost: ${formatEther(totalAmount)} STT`,
      });

      return receipt;
    } catch (error: any) {
      console.error('Error renting NFT:', error);
      
      setTransactionStatus({
        status: 'failed',
        errorMessage: error.message || 'Rental failed'
      });

      toast({
        title: "Rental Failed",
        description: error.reason || error.message || "Failed to rent NFT",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, nftFlowContract, toast]);

  // Batch operations for multiple NFTs
  const batchListNFTs = useCallback(async (
    listings: Array<{
      nftContract: string;
      tokenId: string;
      pricePerSecond: string;
      minDuration: number;
      maxDuration: number;
      collateralRequired: string;
    }>
  ) => {
    if (!isConnected || !account || !nftFlowContract) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    const results = [];

    try {
      // Process in batches to avoid gas limit issues
      const batchSize = 5;
      for (let i = 0; i < listings.length; i += batchSize) {
        const batch = listings.slice(i, i + batchSize);
        
        const promises = batch.map(listing =>
          listForRentalEnhanced(
            listing.nftContract,
            listing.tokenId,
            listing.pricePerSecond,
            listing.minDuration,
            listing.maxDuration,
            listing.collateralRequired,
            false // Skip individual metadata validation for batch
          )
        );

        const batchResults = await Promise.allSettled(promises);
        results.push(...batchResults);

        // Add delay between batches
        if (i + batchSize < listings.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      toast({
        title: "Batch Operation Complete",
        description: `${successful} NFTs listed successfully, ${failed} failed`,
      });

      return results;
    } catch (error: any) {
      console.error('Batch listing error:', error);
      toast({
        title: "Batch Operation Failed",
        description: error.message || "Failed to complete batch listing",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, nftFlowContract, toast, listForRentalEnhanced]);

  // Get comprehensive rental data
  const getRentalData = useCallback(async (listingId: string): Promise<EnhancedNFTRental | null> => {
    if (!nftFlowContract) return null;

    try {
      const listing = await nftFlowContract.getRentalListing(listingId);
      const rentalInfo = await nftFlowContract.getRentalInfo(listingId);

      // Try to get metadata
      let metadata = null;
      try {
        const erc721Contract = new ethers.Contract(
          listing.nftContract,
          ['function tokenURI(uint256) view returns (string)'],
          nftFlowContract.runner
        );
        const tokenURI = await erc721Contract.tokenURI(listing.tokenId);
        
        if (tokenURI.startsWith('http')) {
          const response = await fetch(tokenURI);
          metadata = await response.json();
        }
      } catch (error) {
        console.warn('Could not fetch metadata:', error);
      }

      return {
        listingId,
        tokenId: listing.tokenId.toString(),
        nftContract: listing.nftContract,
        owner: listing.owner,
        renter: rentalInfo.renter !== ethers.ZeroAddress ? rentalInfo.renter : undefined,
        pricePerSecond: formatEther(listing.pricePerSecond),
        minDuration: Number(listing.minDuration),
        maxDuration: Number(listing.maxDuration),
        collateralRequired: formatEther(listing.collateralRequired),
        startTime: rentalInfo.startTime > 0 ? Number(rentalInfo.startTime) : undefined,
        endTime: rentalInfo.endTime > 0 ? Number(rentalInfo.endTime) : undefined,
        isActive: rentalInfo.isActive,
        totalEarned: formatEther(listing.totalEarned || 0),
        gasOptimized: true,
        metadata
      };
    } catch (error) {
      console.error('Error fetching rental data:', error);
      return null;
    }
  }, [nftFlowContract]);

  // Enhanced return with automatic collateral release
  const returnNFTEnhanced = useCallback(async (listingId: string) => {
    if (!isConnected || !account || !nftFlowContract) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    setTransactionStatus({ status: 'pending' });

    try {
      // Check if rental is still active
      const rentalInfo = await nftFlowContract.getRentalInfo(listingId);
      if (!rentalInfo.isActive) {
        throw new Error('Rental is not active');
      }

      // Estimate gas
      const gasEstimate = await nftFlowContract.returnNFT.estimateGas(listingId);

      const tx = await nftFlowContract.returnNFT(listingId, {
        gasLimit: gasEstimate * BigInt(120) / BigInt(100)
      });

      setTransactionStatus({ hash: tx.hash, status: 'pending' });

      const receipt = await tx.wait();
      
      setTransactionStatus({
        hash: tx.hash,
        status: 'confirmed',
        confirmations: receipt.confirmations,
        gasUsed: formatEther(receipt.gasUsed)
      });

      toast({
        title: "NFT Returned",
        description: "NFT returned successfully and collateral released",
      });

      return receipt;
    } catch (error: any) {
      console.error('Error returning NFT:', error);
      
      setTransactionStatus({
        status: 'failed',
        errorMessage: error.message || 'Return failed'
      });

      toast({
        title: "Return Failed",
        description: error.reason || error.message || "Failed to return NFT",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, nftFlowContract, toast]);

  // Clear transaction status
  const clearTransactionStatus = useCallback(() => {
    setTransactionStatus(null);
  }, []);

  return {
    listForRentalEnhanced,
    rentNFTEnhanced,
    returnNFTEnhanced,
    batchListNFTs,
    getRentalData,
    clearTransactionStatus,
    isLoading,
    transactionStatus,
    gasEstimate
  };
};