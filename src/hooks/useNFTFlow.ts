import { useState, useCallback } from 'react';
import { parseEther } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

export const useNFTFlow = () => {
  const { isConnected, account, nftFlowContract } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const listForRental = useCallback(async (nftContract: string, tokenId: string, pricePerSecond: number, minDuration: number, maxDuration: number, collateralRequired: number) => {
    if (!isConnected || !account || !nftFlowContract) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock implementation - replace with actual contract call
      const tx = await nftFlowContract.listForRental(
        nftContract,
        tokenId,
        parseEther(pricePerSecond.toString()),
        minDuration,
        maxDuration,
        parseEther(collateralRequired.toString())
      );
      
      await tx.wait();
      
      toast({
        title: "Success",
        description: "NFT listed for rental successfully!",
      });
    } catch (error) {
      console.error('Error listing NFT for rental:', error);
      toast({
        title: "Error",
        description: "Failed to list NFT for rental",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, nftFlowContract, toast]);

  const rentNFT = useCallback(async (nftContract: string, tokenId: string, duration: number) => {
    if (!isConnected || !account || !nftFlowContract) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock implementation - replace with actual contract call
      const tx = await nftFlowContract.rentNFT(
        nftContract,
        tokenId,
        duration
      );
      
      await tx.wait();
      
      toast({
        title: "Success",
        description: "NFT rented successfully!",
      });
    } catch (error) {
      console.error('Error renting NFT:', error);
      toast({
        title: "Error",
        description: "Failed to rent NFT",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, nftFlowContract, toast]);

  const returnNFT = useCallback(async (nftContract: string, tokenId: string) => {
    if (!isConnected || !account || !nftFlowContract) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Mock implementation - replace with actual contract call
      const tx = await nftFlowContract.returnNFT(
        nftContract,
        tokenId
      );
      
      await tx.wait();
      
      toast({
        title: "Success",
        description: "NFT returned successfully!",
      });
    } catch (error) {
      console.error('Error returning NFT:', error);
      toast({
        title: "Error",
        description: "Failed to return NFT",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, nftFlowContract, toast]);

  return {
    listForRental,
    rentNFT,
    returnNFT,
    isLoading,
  };
};
