import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

export interface UserNFT {
  id: string;
  name: string;
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

export const useUserNFTs = () => {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockUserNFTs: UserNFT[] = [
    {
      id: "1",
      name: "Cosmic Wizard #1234",
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
    },
    {
      id: "4",
      name: "Fitness Coach AI",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
      collection: "Health & Wellness",
      pricePerSecond: 0.000002,
      isRented: true,
      owner: "0x6666777788889999",
      timeLeft: "3h 45m",
      rarity: "Common",
      utilityType: "Health Service",
      totalEarnings: 8.3,
      rentalCount: 15,
      lastRented: "Currently rented"
    }
  ];

  const loadUserNFTs = useCallback(async () => {
    if (!isConnected || !account) {
      setUserNFTs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would fetch from your smart contract or API
      setUserNFTs(mockUserNFTs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load NFTs';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isConnected, account, toast]);

  const rentNFT = useCallback(async (nftId: string, duration: number) => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to rent NFTs",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Simulate rental transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the NFT to rented status
      setUserNFTs(prev => prev.map(nft => 
        nft.id === nftId 
          ? { 
              ...nft, 
              isRented: true,
              timeLeft: `${duration}h`,
              rentalStartTime: new Date().toISOString(),
              totalCost: nft.pricePerSecond * duration * 3600
            }
          : nft
      ));

      toast({
        title: "Rental Successful",
        description: `Successfully rented ${nftId} for ${duration} hours`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rent NFT';
      toast({
        title: "Rental Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isConnected, account, toast]);

  const returnNFT = useCallback(async (nftId: string) => {
    try {
      setLoading(true);
      
      // Simulate return transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the NFT to available status
      setUserNFTs(prev => prev.map(nft => 
        nft.id === nftId 
          ? { 
              ...nft, 
              isRented: false,
              timeLeft: undefined,
              rentalStartTime: undefined,
              totalCost: undefined
            }
          : nft
      ));

      toast({
        title: "Return Successful",
        description: `Successfully returned ${nftId}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to return NFT';
      toast({
        title: "Return Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const listNFT = useCallback(async (nftId: string, pricePerSecond: number) => {
    try {
      setLoading(true);
      
      // Simulate listing transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add the NFT to user's listings
      const newListing: UserNFT = {
        id: nftId,
        name: `New NFT #${nftId}`,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
        collection: "User Collection",
        pricePerSecond,
        isRented: false,
        owner: account || "",
        rarity: "Common",
        utilityType: "Utility",
        totalEarnings: 0,
        rentalCount: 0,
        lastRented: "Never"
      };

      setUserNFTs(prev => [...prev, newListing]);

      toast({
        title: "Listing Successful",
        description: `Successfully listed NFT for ${pricePerSecond} STT/second`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list NFT';
      toast({
        title: "Listing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [account, toast]);

  useEffect(() => {
    loadUserNFTs();
  }, [loadUserNFTs]);

  return {
    userNFTs,
    loading,
    error,
    loadUserNFTs,
    rentNFT,
    returnNFT,
    listNFT
  };
};
