import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { formatEther, parseEther } from 'ethers';

interface MicroRental {
  id: string;
  nftContract: string;
  tokenId: number;
  owner: string;
  renter: string;
  pricePerSecond: string;
  startTime: number;
  endTime: number;
  totalCost: string;
  collateralAmount: string;
  active: boolean;
  completed: boolean;
  reputationDiscount: number;
  rentalType: number;
}

interface TimeSlot {
  startTime: number;
  endTime: number;
  renter: string;
  isReserved: boolean;
  premiumMultiplier: number;
}

interface RentalGroup {
  id: string;
  owner: string;
  members: string[];
  createdTime: number;
  active: boolean;
}

export const useMicroRental = () => {
  const { account, isConnected, microRentalContract } = useWeb3();
  const { toast } = useToast();
  
  const [rentals, setRentals] = useState<MicroRental[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [rentalGroups, setRentalGroups] = useState<RentalGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rent NFT by the second
  const rentByTheSecond = useCallback(async (
    nftContract: string,
    tokenId: number,
    secondsToRent: number,
    rentalType: number = 0
  ) => {
    if (!isConnected || !account || !microRentalContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get price per second
      const pricePerSecond = await microRentalContract.getDynamicPrice(nftContract, tokenId);
      const totalCost = pricePerSecond * BigInt(secondsToRent);
      
      // Calculate collateral (simplified)
      const collateralAmount = totalCost / BigInt(10); // 10% collateral
      
      const tx = await microRentalContract.rentByTheSecond(
        nftContract,
        tokenId,
        secondsToRent,
        rentalType,
        { value: totalCost + collateralAmount }
      );

      await tx.wait();

      toast({
        title: "Rental Started",
        description: `Successfully rented NFT for ${secondsToRent} seconds`,
      });

      // Refresh rentals
      await loadUserRentals();
      
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to rent NFT';
      setError(errorMessage);
      toast({
        title: "Rental Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, microRentalContract, toast]);

  // Rent time slot
  const rentTimeSlot = useCallback(async (
    nftContract: string,
    tokenId: number,
    startTime: number,
    endTime: number,
    premiumMultiplier: number = 100
  ) => {
    if (!isConnected || !account || !microRentalContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get base price
      const basePrice = await microRentalContract.getDynamicPrice(nftContract, tokenId);
      const premiumPrice = (basePrice * BigInt(premiumMultiplier)) / BigInt(100);
      const duration = endTime - startTime;
      const totalCost = premiumPrice * BigInt(duration);

      const tx = await microRentalContract.rentTimeSlot(
        nftContract,
        tokenId,
        startTime,
        endTime,
        premiumMultiplier,
        { value: totalCost }
      );

      await tx.wait();

      toast({
        title: "Time Slot Reserved",
        description: `Successfully reserved time slot for ${new Date(startTime * 1000).toLocaleString()}`,
      });

      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to rent time slot';
      setError(errorMessage);
      toast({
        title: "Time Slot Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, microRentalContract, toast]);

  // Create rental group
  const createRentalGroup = useCallback(async (members: string[]) => {
    if (!isConnected || !account || !microRentalContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await microRentalContract.createRentalGroup(members);
      await tx.wait();

      toast({
        title: "Group Created",
        description: `Successfully created rental group with ${members.length} members`,
      });

      // Refresh groups
      await loadRentalGroups();
      
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create rental group';
      setError(errorMessage);
      toast({
        title: "Group Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, microRentalContract, toast]);

  // Rent to group
  const rentToGroup = useCallback(async (
    groupId: string,
    nftContract: string,
    tokenId: number,
    secondsToRent: number
  ) => {
    if (!isConnected || !account || !microRentalContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get price per second
      const pricePerSecond = await microRentalContract.getDynamicPrice(nftContract, tokenId);
      const totalCost = pricePerSecond * BigInt(secondsToRent);
      
      // Get group members count for cost calculation
      const group = rentalGroups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');
      
      const costPerMember = totalCost / BigInt(group.members.length);

      const tx = await microRentalContract.rentToGroup(
        groupId,
        nftContract,
        tokenId,
        secondsToRent,
        { value: costPerMember }
      );

      await tx.wait();

      toast({
        title: "Group Rental Started",
        description: `Successfully rented NFT to group for ${secondsToRent} seconds`,
      });

      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to rent to group';
      setError(errorMessage);
      toast({
        title: "Group Rental Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, microRentalContract, rentalGroups, toast]);

  // Complete rental
  const completeRental = useCallback(async (rentalId: string) => {
    if (!isConnected || !account || !microRentalContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await microRentalContract.completeRental(rentalId);
      await tx.wait();

      toast({
        title: "Rental Completed",
        description: "Successfully completed rental",
      });

      // Refresh rentals
      await loadUserRentals();
      
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete rental';
      setError(errorMessage);
      toast({
        title: "Completion Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, microRentalContract, toast]);

  // Load user rentals
  const loadUserRentals = useCallback(async () => {
    if (!isConnected || !account || !microRentalContract) return;

    setIsLoading(true);
    try {
      // This would need to be implemented based on the contract events
      // For now, return empty array
      setRentals([]);
    } catch (err: any) {
      console.error('Failed to load rentals:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, microRentalContract]);

  // Load time slots for NFT
  const loadTimeSlots = useCallback(async (nftContract: string, tokenId: number) => {
    if (!microRentalContract) return;

    try {
      // This would need to be implemented based on the contract
      // For now, return empty array
      setTimeSlots([]);
    } catch (err: any) {
      console.error('Failed to load time slots:', err);
      setError(err.message);
    }
  }, [microRentalContract]);

  // Load rental groups
  const loadRentalGroups = useCallback(async () => {
    if (!isConnected || !account || !microRentalContract) return;

    try {
      // This would need to be implemented based on the contract
      // For now, return empty array
      setRentalGroups([]);
    } catch (err: any) {
      console.error('Failed to load rental groups:', err);
      setError(err.message);
    }
  }, [isConnected, account, microRentalContract]);

  // Get rental details
  const getRental = useCallback(async (rentalId: string): Promise<MicroRental | null> => {
    if (!microRentalContract) return null;

    try {
      const rental = await microRentalContract.getRental(rentalId);
      return {
        id: rentalId,
        nftContract: rental.nftContract,
        tokenId: Number(rental.tokenId),
        owner: rental.owner,
        renter: rental.renter,
        pricePerSecond: formatEther(rental.pricePerSecond),
        startTime: Number(rental.startTime),
        endTime: Number(rental.endTime),
        totalCost: formatEther(rental.totalCost),
        collateralAmount: formatEther(rental.collateralAmount),
        active: rental.active,
        completed: rental.completed,
        reputationDiscount: Number(rental.reputationDiscount),
        rentalType: Number(rental.rentalType)
      };
    } catch (err: any) {
      console.error('Failed to get rental:', err);
      return null;
    }
  }, [microRentalContract]);

  // Calculate rental cost
  const calculateRentalCost = useCallback(async (
    nftContract: string,
    tokenId: number,
    secondsToRent: number
  ): Promise<{
    pricePerSecond: string;
    totalCost: string;
    collateralAmount: string;
    reputationDiscount: number;
  }> => {
    if (!microRentalContract) {
      throw new Error('Contract not available');
    }

    try {
      const pricePerSecond = await microRentalContract.getDynamicPrice(nftContract, tokenId);
      const totalCost = pricePerSecond * BigInt(secondsToRent);
      const collateralAmount = totalCost / BigInt(10); // 10% collateral
      
      // Get reputation discount (simplified)
      const reputationDiscount = 0; // This would be calculated based on user reputation

      return {
        pricePerSecond: formatEther(pricePerSecond),
        totalCost: formatEther(totalCost),
        collateralAmount: formatEther(collateralAmount),
        reputationDiscount
      };
    } catch (err: any) {
      console.error('Failed to calculate rental cost:', err);
      throw err;
    }
  }, [microRentalContract]);

  // Load data on mount
  useEffect(() => {
    if (isConnected && account) {
      loadUserRentals();
      loadRentalGroups();
    }
  }, [isConnected, account, loadUserRentals, loadRentalGroups]);

  return {
    // State
    rentals,
    timeSlots,
    rentalGroups,
    isLoading,
    error,
    
    // Actions
    rentByTheSecond,
    rentTimeSlot,
    createRentalGroup,
    rentToGroup,
    completeRental,
    
    // Data loading
    loadUserRentals,
    loadTimeSlots,
    loadRentalGroups,
    getRental,
    
    // Utilities
    calculateRentalCost
  };
};


