import { useState, useCallback, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

export interface UserNFT {
  id: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  pricePerSecond: number;
  isRented: boolean;
  owner: string;
  timeLeft?: string;
  rarity: string;
  utilityType: string;
  totalEarnings?: number;
  rentalCount?: number;
  lastRented?: string;
  rentalStartTime?: string;
  totalCost?: number;
}

export const useNFTManagement = () => {
  const { isConnected, account, nftFlowContract } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);

  // Mock NFT data
  const mockUserNFTs: UserNFT[] = [
    {
      id: "1",
      name: "Cosmic Wizard #1234",
      description: "A powerful wizard from the cosmic realm",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      collection: "Cosmic Wizards",
      pricePerSecond: 0.5 / 3600,
      isRented: true,
      owner: "0x1234567890abcdef",
      timeLeft: "2h 15m",
      rarity: "Rare",
      utilityType: "Gaming Weapon",
      rentalStartTime: "2024-01-15T10:30:00Z",
      totalCost: 1.25
    },
    {
      id: "2",
      name: "Galaxy Punk #5678",
      description: "A punk from the galaxy",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
      collection: "Galaxy Punks",
      pricePerSecond: 1.2 / 3600,
      isRented: true,
      owner: "0x9876543210fedcba",
      timeLeft: "45m",
      rarity: "Epic",
      utilityType: "Gaming Avatar",
      rentalStartTime: "2024-01-15T14:00:00Z",
      totalCost: 2.4
    },
    {
      id: "3",
      name: "Digital Art Gallery Space",
      description: "A virtual gallery space for displaying digital art",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
      collection: "Virtual Galleries",
      pricePerSecond: 0.000002,
      isRented: false,
      owner: "0x5555666677778888",
      rarity: "Rare",
      utilityType: "Art Display",
      totalEarnings: 12.5,
      rentalCount: 8,
      lastRented: "2 days ago"
    }
  ];

  const mintNFT = useCallback(async (name: string, description: string, image: string, collection: string) => {
    if (!isConnected || !account) {
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
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate minting delay
      
      const newNFT: UserNFT = {
        id: Date.now().toString(),
        name,
        description,
        image,
        collection,
        pricePerSecond: 0.000001,
        isRented: false,
        owner: account,
        rarity: "Common",
        utilityType: "General",
        totalEarnings: 0,
        rentalCount: 0,
        lastRented: "Never"
      };

      setUserNFTs(prev => [...prev, newNFT]);
      
      toast({
        title: "Success",
        description: "NFT minted successfully!",
      });
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast({
        title: "Error",
        description: "Failed to mint NFT",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, toast]);

  const getUserNFTs = useCallback(async () => {
    if (!isConnected || !account) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock implementation - replace with actual contract call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading delay
      setUserNFTs(mockUserNFTs);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user NFTs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, toast]);

  const approveNFTFlow = useCallback(async (nftContract: string, tokenId: string) => {
    if (!isConnected || !account) {
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
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate approval delay
      
      toast({
        title: "Success",
        description: "NFT approved for rental!",
      });
    } catch (error) {
      console.error('Error approving NFT:', error);
      toast({
        title: "Error",
        description: "Failed to approve NFT",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, toast]);

  useEffect(() => {
    if (isConnected && account) {
      getUserNFTs();
    }
  }, [isConnected, account, getUserNFTs]);

  return {
    mintNFT,
    getUserNFTs,
    approveNFTFlow,
    userNFTs,
    isLoading,
  };
};