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
  totalEarned?: number; // Added for compatibility
  rentalCount?: number;
  lastRented?: string;
  rentalStartTime?: string;
  totalCost?: number;
  tokenId?: string;
  listingId?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  minDuration?: number;
  maxDuration?: number;
  collateralRequired?: number;
}

export const useNFTManagement = () => {
  const { isConnected, account, nftFlowContract } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);

  // Enhanced mock NFT data with better images and attributes
  const mockUserNFTs: UserNFT[] = [
    {
      id: "1",
      tokenId: "1234",
      listingId: "listing-1",
      name: "Cosmic Wizard #1234",
      description: "A powerful cosmic wizard wielding ethereal magic and interdimensional spells. Perfect for RPG adventures and fantasy gaming worlds.",
      image: "https://images.unsplash.com/photo-1578662996442-48f103fc96?w=400&h=400&fit=crop&crop=center",
      collection: "Cosmic Wizards",
      pricePerSecond: 0.000138, // ~0.5 STT/hour
      isRented: true,
      owner: "0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59",
      timeLeft: "2h 15m",
      rarity: "Rare",
      utilityType: "RPG Character",
      rentalStartTime: new Date(Date.now() - 2.75 * 3600 * 1000).toISOString(),
      totalCost: 1.25,
      attributes: [
        { trait_type: "Class", value: "Wizard" },
        { trait_type: "Element", value: "Cosmic" },
        { trait_type: "Level", value: "45" },
        { trait_type: "Mana Power", value: "890" },
        { trait_type: "Special Ability", value: "Cosmic Storm" }
      ],
      minDuration: 3600,
      maxDuration: 86400,
      collateralRequired: 1.2,
      rentalCount: 15,
      totalEarned: 12.75,
      lastRented: "2 hours ago"
    },
    {
      id: "2",
      tokenId: "5678", 
      listingId: "listing-2",
      name: "Neon Samurai #5678",
      description: "A cyberpunk samurai warrior with advanced AR capabilities and traditional combat skills merged with futuristic technology.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center",
      collection: "Neon Warriors",
      pricePerSecond: 0.000333, // ~1.2 STT/hour
      isRented: false,
      owner: "0x9876543210fedcba9876543210fedcba98765432",
      timeLeft: null,
      rarity: "Epic",
      utilityType: "Metaverse Avatar",
      rentalStartTime: null,
      totalCost: 0,
      attributes: [
        { trait_type: "Class", value: "Samurai" },
        { trait_type: "Style", value: "Cyberpunk" },
        { trait_type: "Weapon", value: "Plasma Katana" },
        { trait_type: "Armor", value: "Neon Exosuit" },
        { trait_type: "Special Feature", value: "AR Visor" }
      ],
      minDuration: 1800,
      maxDuration: 172800,
      collateralRequired: 2.5,
      rentalCount: 23,
      totalEarned: 28.90,
      lastRented: "3 days ago"
    },
    {
      id: "3",
      tokenId: "9999",
      listingId: "listing-3",
      name: "Digital Art Gallery Space",
      description: "A premium virtual gallery space for displaying digital art collections with interactive features and customizable lighting.",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&crop=center",
      collection: "Virtual Spaces",
      pricePerSecond: 0.000055, // ~0.2 STT/hour
      isRented: false,
      owner: "0x5555666677778888999900001111222233334444",
      rarity: "Legendary",
      utilityType: "Art Gallery",
      totalEarnings: 35.60,
      rentalCount: 47,
      lastRented: "1 week ago",
      attributes: [
        { trait_type: "Space Type", value: "Gallery" },
        { trait_type: "Capacity", value: "50 Artworks" },
        { trait_type: "Lighting", value: "Dynamic" },
        { trait_type: "Interactivity", value: "High" },
        { trait_type: "Location", value: "Prime District" }
      ],
      minDuration: 7200,
      maxDuration: 604800,
      collateralRequired: 0.8
    },
    {
      id: "4",
      tokenId: "7777",
      listingId: "listing-4",
      name: "Racing Beast #7777",
      description: "A high-performance racing vehicle with nitro boost capabilities and advanced aerodynamics for competitive racing games.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center",
      collection: "Speed Demons",
      pricePerSecond: 0.000278, // ~1.0 STT/hour
      isRented: true,
      owner: "0xaaaa1111bbbb2222cccc3333dddd4444eeee5555",
      timeLeft: "45m",
      rarity: "Epic",
      utilityType: "Racing Vehicle",
      rentalStartTime: new Date(Date.now() - 0.75 * 3600 * 1000).toISOString(),
      totalCost: 0.75,
      attributes: [
        { trait_type: "Vehicle Type", value: "Supercar" },
        { trait_type: "Engine", value: "Plasma V12" },
        { trait_type: "Top Speed", value: "420 mph" },
        { trait_type: "Acceleration", value: "0-60 in 1.8s" },
        { trait_type: "Special Feature", value: "Nitro Boost" }
      ],
      minDuration: 900,
      maxDuration: 43200,
      collateralRequired: 1.8,
      rentalCount: 31,
      totalEarned: 22.30,
      lastRented: "45 minutes ago"
    },
    {
      id: "5",
      tokenId: "3333",
      listingId: "listing-5",
      name: "Mystic Dragon #3333",
      description: "An ancient mystic dragon with fire breath abilities and treasure hoarding instincts. Powerful companion for fantasy adventures.",
      image: "https://images.unsplash.com/photo-1578662015923-8c4e8ed4df3f?w=400&h=400&fit=crop&crop=center",
      collection: "Legendary Dragons",
      pricePerSecond: 0.000417, // ~1.5 STT/hour
      isRented: false,
      owner: "0xffff0000eeee1111dddd2222cccc3333bbbb4444",
      rarity: "Mythic",
      utilityType: "Companion Pet",
      totalEarnings: 45.80,
      rentalCount: 12,
      lastRented: "5 days ago",
      attributes: [
        { trait_type: "Species", value: "Dragon" },
        { trait_type: "Element", value: "Fire" },
        { trait_type: "Size", value: "Ancient" },
        { trait_type: "Breath Weapon", value: "Plasma Fire" },
        { trait_type: "Special Ability", value: "Treasure Sense" }
      ],
      minDuration: 3600,
      maxDuration: 259200,
      collateralRequired: 3.0
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

  const getAvailableNFTs = useCallback(async () => {
    // Return enhanced mock available NFTs for marketplace
    return mockUserNFTs.filter(nft => !nft.isRented);
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      getUserNFTs();
    }
  }, [isConnected, account, getUserNFTs]);

  return {
    mintNFT,
    getUserNFTs,
    getAvailableNFTs,
    approveNFTFlow,
    userNFTs,
    isLoading,
  };
};