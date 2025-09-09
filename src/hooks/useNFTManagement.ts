import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { getMockERC721Contract, parseEther, formatEther } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface NFTData {
  tokenId: string;
  owner: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  isApproved: boolean;
  isListed: boolean;
  listingId?: string;
  pricePerSecond?: string;
  minDuration?: string;
  maxDuration?: string;
  collateralRequired?: string;
}

export const useNFTManagement = () => {
  const { account, isConnected } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Mint a new NFT
  const mintNFT = useCallback(async (metadata: NFTMetadata) => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const mockERC721 = await getMockERC721Contract(CONTRACT_ADDRESSES.MockERC721);
      const tx = await mockERC721.safeMint(account);
      await tx.wait();

      // Get the token ID from the transaction receipt
      const receipt = await tx.wait();
      let tokenId = "0"; // Default fallback
      
      // Try to extract token ID from Transfer event
      if (receipt.logs && receipt.logs.length > 0) {
        const transferLog = receipt.logs.find(log => 
          log.topics && log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" // Transfer event signature
        );
        if (transferLog && transferLog.topics && transferLog.topics.length > 3) {
          tokenId = transferLog.topics[3];
        }
      }

      toast({
        title: "NFT Minted Successfully",
        description: `Your NFT has been minted with token ID ${tokenId}`,
      });

      return { tx, tokenId };
    } catch (error: unknown) {
      console.error('Failed to mint NFT:', error);
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Failed to mint NFT",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnected, toast]);

  // Get NFT data
  const getNFTData = useCallback(async (tokenId: string): Promise<NFTData | null> => {
    if (!isConnected) {
      return null;
    }

    try {
      const mockERC721 = await getMockERC721Contract(CONTRACT_ADDRESSES.MockERC721);
      
      const [owner, name, symbol, tokenURI] = await Promise.all([
        mockERC721.ownerOf(tokenId),
        mockERC721.name(),
        mockERC721.symbol(),
        mockERC721.tokenURI(tokenId)
      ]);

      // Parse metadata from tokenURI
      let metadata: NFTMetadata = {
        name: `${name} #${tokenId}`,
        description: "A unique NFT from the collection",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
        attributes: []
      };

      try {
        if (tokenURI && tokenURI !== '') {
          const response = await fetch(tokenURI);
          if (response.ok) {
            metadata = await response.json();
          }
        }
      } catch (error) {
        console.warn('Failed to fetch NFT metadata:', error);
      }

      // Check if NFT is approved for NFTFlow
      const isApproved = await mockERC721.isApprovedForAll(owner, CONTRACT_ADDRESSES.NFTFlow);

      return {
        tokenId,
        owner,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        collection: symbol,
        attributes: metadata.attributes,
        isApproved,
        isListed: false, // This would need to be checked against NFTFlow contract
      };
    } catch (error) {
      console.error('Failed to get NFT data:', error);
      return null;
    }
  }, [isConnected]);

  // Get all NFTs owned by user
  const getUserNFTs = useCallback(async (): Promise<NFTData[]> => {
    if (!isConnected || !account) {
      return [];
    }

    try {
      const mockERC721 = await getMockERC721Contract(CONTRACT_ADDRESSES.MockERC721);
      
      // For now, we'll check a range of token IDs (0-100)
      // In a real implementation, you'd want to track minted tokens
      const nfts: NFTData[] = [];
      
      for (let i = 0; i < 100; i++) {
        try {
          const owner = await mockERC721.ownerOf(i);
          if (owner.toLowerCase() === account.toLowerCase()) {
            const nftData = await getNFTData(i.toString());
            if (nftData) {
              nfts.push(nftData);
            }
          }
        } catch (error) {
          // Token doesn't exist or error occurred, continue
          continue;
        }
      }

      return nfts;
    } catch (error) {
      console.error('Failed to get user NFTs:', error);
      return [];
    }
  }, [account, isConnected, getNFTData]);

  // Approve NFTFlow to manage NFT
  const approveNFTFlow = useCallback(async (tokenId: string) => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const mockERC721 = await getMockERC721Contract(CONTRACT_ADDRESSES.MockERC721);
      const tx = await mockERC721.setApprovalForAll(CONTRACT_ADDRESSES.NFTFlow, true);
      await tx.wait();

      toast({
        title: "Approval Successful",
        description: "NFTFlow is now approved to manage your NFTs",
      });

      return tx;
    } catch (error: unknown) {
      console.error('Failed to approve NFTFlow:', error);
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve NFTFlow",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnected, toast]);

  // Get all available NFTs for rental
  const getAvailableNFTs = useCallback(async (): Promise<NFTData[]> => {
    if (!isConnected) {
      return [];
    }

    try {
      // This would need to be implemented by querying the NFTFlow contract
      // for all active listings. For now, we'll return mock data.
      const mockNFTs: NFTData[] = [
        {
          tokenId: "0",
          owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          name: "TestNFT #0",
          description: "A test NFT for rental",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
          collection: "TNFT",
          attributes: [
            { trait_type: "Rarity", value: "Common" },
            { trait_type: "Color", value: "Blue" }
          ],
          isApproved: true,
          isListed: true,
          listingId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
          pricePerSecond: "0.000001",
          minDuration: "3600",
          maxDuration: "2592000",
          collateralRequired: "0.1"
        }
      ];

      return mockNFTs;
    } catch (error) {
      console.error('Failed to get available NFTs:', error);
      return [];
    }
  }, [isConnected]);

  return {
    isLoading,
    mintNFT,
    getNFTData,
    getUserNFTs,
    approveNFTFlow,
    getAvailableNFTs,
  };
};
