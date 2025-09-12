import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getNFTFlowContract, getPaymentStreamContract, getReputationSystemContract } from '@/lib/web3';
import { SOMNIA_CONFIG } from '@/config/somniaConfig';

// Types for on-chain data
interface OnChainNFTMetadata {
  name: string;
  description: string;
  attributes: string[];
  values: string[];
  rarity: number;
  contentHash: string;
  creationTime: number;
  creator: string;
  isVerified: boolean;
  totalRentals: number;
  totalEarnings: number;
  lastRentalTime: number;
  stats: {
    viewCount: number;
    favoriteCount: number;
    shareCount: number;
    rentalCount: number;
    averageRentalDuration: number;
    averageRentalPrice: number;
    popularityScore: number;
    liquidityScore: number;
  };
}

interface OnChainUserProfile {
  username: string;
  bio: string;
  avatarHash: string;
  ownedNFTs: number[];
  rentalHistory: number[];
  joinDate: number;
  isVerified: boolean;
  totalEarnings: number;
  totalSpent: number;
  stats: {
    totalRentals: number;
    totalListings: number;
    averageRentalDuration: number;
    averageRentalPrice: number;
    reputationScore: number;
    achievementCount: number;
    referralCount: number;
    referralEarnings: number;
  };
}

interface OnChainAnalytics {
  totalUsers: number;
  totalRentals: number;
  totalVolume: number;
  totalCollections: number;
  averageRentalDuration: number;
  averageRentalValue: number;
  platformFeeCollected: number;
  disputeResolutionRate: number;
  userRetentionRate: number;
  trends: {
    dailyActiveUsers: number[];
    dailyVolume: number[];
    dailyRentals: number[];
    dailyFees: number[];
    growthRate: number;
    userGrowthRate: number;
    volumeGrowthRate: number;
    retentionRate: number;
  };
}

interface OnChainCollectionMetadata {
  name: string;
  description: string;
  symbol: string;
  categories: string[];
  creator: string;
  totalSupply: number;
  totalRentals: number;
  totalVolume: number;
  floorPrice: number;
  ceilingPrice: number;
  creationTime: number;
  isVerified: boolean;
  stats: {
    totalViews: number;
    totalFavorites: number;
    totalShares: number;
    averageRentalDuration: number;
    averageRentalPrice: number;
    popularityScore: number;
    liquidityScore: number;
    volatility: number;
    momentum: number;
  };
}

interface UseOnChainDataReturn {
  // Data states
  nftMetadata: OnChainNFTMetadata | null;
  userProfile: OnChainUserProfile | null;
  analytics: OnChainAnalytics | null;
  collectionMetadata: OnChainCollectionMetadata | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Data fetching functions
  fetchNFTMetadata: (nftContract: string, tokenId: number) => Promise<void>;
  fetchUserProfile: (userAddress: string) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  fetchCollectionMetadata: (collectionAddress: string) => Promise<void>;
  
  // Data update functions
  updateNFTMetadata: (nftContract: string, tokenId: number, updates: Partial<OnChainNFTMetadata>) => Promise<void>;
  updateUserProfile: (updates: Partial<OnChainUserProfile>) => Promise<void>;
  
  // Utility functions
  refreshData: () => Promise<void>;
  isDataStale: (timestamp: number) => boolean;
}

/**
 * Hook for fetching and managing on-chain data
 * Replaces all off-chain API dependencies with direct blockchain reads
 */
export const useOnChainData = (): UseOnChainDataReturn => {
  // State
  const [nftMetadata, setNftMetadata] = useState<OnChainNFTMetadata | null>(null);
  const [userProfile, setUserProfile] = useState<OnChainUserProfile | null>(null);
  const [analytics, setAnalytics] = useState<OnChainAnalytics | null>(null);
  const [collectionMetadata, setCollectionMetadata] = useState<OnChainCollectionMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Contract instances
  const [nftFlowContract, setNftFlowContract] = useState<ethers.Contract | null>(null);
  const [paymentStreamContract, setPaymentStreamContract] = useState<ethers.Contract | null>(null);
  const [reputationSystemContract, setReputationSystemContract] = useState<ethers.Contract | null>(null);
  const [metadataContract, setMetadataContract] = useState<ethers.Contract | null>(null);
  const [analyticsContract, setAnalyticsContract] = useState<ethers.Contract | null>(null);
  
  // Initialize contracts
  useEffect(() => {
    const initializeContracts = async () => {
      try {
        const nftFlow = await getNFTFlowContract();
        const paymentStream = await getPaymentStreamContract();
        const reputationSystem = await getReputationSystemContract();
        
        setNftFlowContract(nftFlow);
        setPaymentStreamContract(paymentStream);
        setReputationSystemContract(reputationSystem);
        
        // Initialize new contracts when deployed
        if (SOMNIA_CONFIG.CONTRACTS.NFT_FLOW_METADATA) {
          const metadata = new ethers.Contract(
            SOMNIA_CONFIG.CONTRACTS.NFT_FLOW_METADATA,
            [], // ABI would be imported
            nftFlow.provider
          );
          setMetadataContract(metadata);
        }
        
        if (SOMNIA_CONFIG.CONTRACTS.ON_CHAIN_ANALYTICS) {
          const analytics = new ethers.Contract(
            SOMNIA_CONFIG.CONTRACTS.ON_CHAIN_ANALYTICS,
            [], // ABI would be imported
            nftFlow.provider
          );
          setAnalyticsContract(analytics);
        }
        
      } catch (err) {
        console.error('Error initializing contracts:', err);
        setError('Failed to initialize contracts');
      }
    };
    
    initializeContracts();
  }, []);
  
  // Fetch NFT metadata from on-chain storage
  const fetchNFTMetadata = useCallback(async (nftContract: string, tokenId: number) => {
    if (!metadataContract) {
      setError('Metadata contract not available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const metadata = await metadataContract.getNFTMetadata(nftContract, tokenId);
      
      const onChainMetadata: OnChainNFTMetadata = {
        name: metadata.name,
        description: metadata.description,
        attributes: metadata.attributes,
        values: metadata.values,
        rarity: metadata.rarity.toNumber(),
        contentHash: metadata.contentHash,
        creationTime: metadata.creationTime.toNumber(),
        creator: metadata.creator,
        isVerified: metadata.isVerified,
        totalRentals: metadata.totalRentals.toNumber(),
        totalEarnings: metadata.totalEarnings.toNumber(),
        lastRentalTime: metadata.lastRentalTime.toNumber(),
        stats: {
          viewCount: metadata.stats.viewCount.toNumber(),
          favoriteCount: metadata.stats.favoriteCount.toNumber(),
          shareCount: metadata.stats.shareCount.toNumber(),
          rentalCount: metadata.stats.rentalCount.toNumber(),
          averageRentalDuration: metadata.stats.averageRentalDuration.toNumber(),
          averageRentalPrice: metadata.stats.averageRentalPrice.toNumber(),
          popularityScore: metadata.stats.popularityScore.toNumber(),
          liquidityScore: metadata.stats.liquidityScore.toNumber(),
        }
      };
      
      setNftMetadata(onChainMetadata);
    } catch (err) {
      console.error('Error fetching NFT metadata:', err);
      setError('Failed to fetch NFT metadata');
    } finally {
      setIsLoading(false);
    }
  }, [metadataContract]);
  
  // Fetch user profile from on-chain storage
  const fetchUserProfile = useCallback(async (userAddress: string) => {
    if (!metadataContract) {
      setError('Metadata contract not available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = await metadataContract.getUserProfile(userAddress);
      
      const onChainProfile: OnChainUserProfile = {
        username: profile.username,
        bio: profile.bio,
        avatarHash: profile.avatarHash,
        ownedNFTs: profile.ownedNFTs.map((id: any) => id.toNumber()),
        rentalHistory: profile.rentalHistory.map((id: any) => id.toNumber()),
        joinDate: profile.joinDate.toNumber(),
        isVerified: profile.isVerified,
        totalEarnings: profile.totalEarnings.toNumber(),
        totalSpent: profile.totalSpent.toNumber(),
        stats: {
          totalRentals: profile.stats.totalRentals.toNumber(),
          totalListings: profile.stats.totalListings.toNumber(),
          averageRentalDuration: profile.stats.averageRentalDuration.toNumber(),
          averageRentalPrice: profile.stats.averageRentalPrice.toNumber(),
          reputationScore: profile.stats.reputationScore.toNumber(),
          achievementCount: profile.stats.achievementCount.toNumber(),
          referralCount: profile.stats.referralCount.toNumber(),
          referralEarnings: profile.stats.referralEarnings.toNumber(),
        }
      };
      
      setUserProfile(onChainProfile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile');
    } finally {
      setIsLoading(false);
    }
  }, [metadataContract]);
  
  // Fetch analytics from on-chain storage
  const fetchAnalytics = useCallback(async () => {
    if (!analyticsContract) {
      setError('Analytics contract not available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const platformAnalytics = await analyticsContract.getPlatformAnalytics();
      const marketInsights = await analyticsContract.getMarketInsights();
      
      const onChainAnalytics: OnChainAnalytics = {
        totalUsers: platformAnalytics.totalUsers.toNumber(),
        totalRentals: platformAnalytics.totalRentals.toNumber(),
        totalVolume: platformAnalytics.totalVolume.toNumber(),
        totalCollections: platformAnalytics.totalCollections.toNumber(),
        averageRentalDuration: platformAnalytics.averageRentalDuration.toNumber(),
        averageRentalValue: platformAnalytics.averageRentalValue.toNumber(),
        platformFeeCollected: platformAnalytics.platformFeeCollected.toNumber(),
        disputeResolutionRate: platformAnalytics.disputeResolutionRate.toNumber(),
        userRetentionRate: platformAnalytics.userRetentionRate.toNumber(),
        trends: {
          dailyActiveUsers: platformAnalytics.trends.dailyActiveUsers.map((val: any) => val.toNumber()),
          dailyVolume: platformAnalytics.trends.dailyVolume.map((val: any) => val.toNumber()),
          dailyRentals: platformAnalytics.trends.dailyRentals.map((val: any) => val.toNumber()),
          dailyFees: platformAnalytics.trends.dailyFees.map((val: any) => val.toNumber()),
          growthRate: platformAnalytics.trends.growthRate.toNumber(),
          userGrowthRate: platformAnalytics.trends.userGrowthRate.toNumber(),
          volumeGrowthRate: platformAnalytics.trends.volumeGrowthRate.toNumber(),
          retentionRate: platformAnalytics.trends.retentionRate.toNumber(),
        }
      };
      
      setAnalytics(onChainAnalytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsContract]);
  
  // Fetch collection metadata from on-chain storage
  const fetchCollectionMetadata = useCallback(async (collectionAddress: string) => {
    if (!metadataContract) {
      setError('Metadata contract not available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const metadata = await metadataContract.getCollectionMetadata(collectionAddress);
      
      const onChainCollectionMetadata: OnChainCollectionMetadata = {
        name: metadata.name,
        description: metadata.description,
        symbol: metadata.symbol,
        categories: metadata.categories,
        creator: metadata.creator,
        totalSupply: metadata.totalSupply.toNumber(),
        totalRentals: metadata.totalRentals.toNumber(),
        totalVolume: metadata.totalVolume.toNumber(),
        floorPrice: metadata.floorPrice.toNumber(),
        ceilingPrice: metadata.ceilingPrice.toNumber(),
        creationTime: metadata.creationTime.toNumber(),
        isVerified: metadata.isVerified,
        stats: {
          totalViews: metadata.stats.totalViews.toNumber(),
          totalFavorites: metadata.stats.totalFavorites.toNumber(),
          totalShares: metadata.stats.totalShares.toNumber(),
          averageRentalDuration: metadata.stats.averageRentalDuration.toNumber(),
          averageRentalPrice: metadata.stats.averageRentalPrice.toNumber(),
          popularityScore: metadata.stats.popularityScore.toNumber(),
          liquidityScore: metadata.stats.liquidityScore.toNumber(),
          volatility: metadata.stats.volatility.toNumber(),
          momentum: metadata.stats.momentum.toNumber(),
        }
      };
      
      setCollectionMetadata(onChainCollectionMetadata);
    } catch (err) {
      console.error('Error fetching collection metadata:', err);
      setError('Failed to fetch collection metadata');
    } finally {
      setIsLoading(false);
    }
  }, [metadataContract]);
  
  // Update NFT metadata
  const updateNFTMetadata = useCallback(async (
    nftContract: string, 
    tokenId: number, 
    updates: Partial<OnChainNFTMetadata>
  ) => {
    if (!metadataContract) {
      setError('Metadata contract not available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would call the appropriate update function on the contract
      // For now, we'll just update the local state
      setNftMetadata(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating NFT metadata:', err);
      setError('Failed to update NFT metadata');
    } finally {
      setIsLoading(false);
    }
  }, [metadataContract]);
  
  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<OnChainUserProfile>) => {
    if (!metadataContract) {
      setError('Metadata contract not available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would call the appropriate update function on the contract
      // For now, we'll just update the local state
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Failed to update user profile');
    } finally {
      setIsLoading(false);
    }
  }, [metadataContract]);
  
  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Refresh analytics
      await fetchAnalytics();
      
      // Refresh other data if available
      if (nftMetadata) {
        // Refresh NFT metadata if we have it
      }
      
      if (userProfile) {
        // Refresh user profile if we have it
      }
      
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAnalytics, nftMetadata, userProfile]);
  
  // Check if data is stale
  const isDataStale = useCallback((timestamp: number) => {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    return now - timestamp > staleThreshold;
  }, []);
  
  return {
    nftMetadata,
    userProfile,
    analytics,
    collectionMetadata,
    isLoading,
    error,
    fetchNFTMetadata,
    fetchUserProfile,
    fetchAnalytics,
    fetchCollectionMetadata,
    updateNFTMetadata,
    updateUserProfile,
    refreshData,
    isDataStale
  };
};

// Utility hook for batch data fetching
export const useOnChainBatchData = () => {
  const { fetchNFTMetadata, fetchUserProfile, fetchCollectionMetadata } = useOnChainData();
  
  const fetchBatchNFTMetadata = useCallback(async (requests: Array<{nftContract: string, tokenId: number}>) => {
    const promises = requests.map(req => fetchNFTMetadata(req.nftContract, req.tokenId));
    return Promise.allSettled(promises);
  }, [fetchNFTMetadata]);
  
  const fetchBatchUserProfiles = useCallback(async (userAddresses: string[]) => {
    const promises = userAddresses.map(address => fetchUserProfile(address));
    return Promise.allSettled(promises);
  }, [fetchUserProfile]);
  
  const fetchBatchCollectionMetadata = useCallback(async (collectionAddresses: string[]) => {
    const promises = collectionAddresses.map(address => fetchCollectionMetadata(address));
    return Promise.allSettled(promises);
  }, [fetchCollectionMetadata]);
  
  return {
    fetchBatchNFTMetadata,
    fetchBatchUserProfiles,
    fetchBatchCollectionMetadata
  };
};
