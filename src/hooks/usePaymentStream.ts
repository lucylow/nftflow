import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { parseEther, formatEther } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

// Types
export interface Stream {
  sender: string;
  recipient: string;
  deposit: string;
  ratePerSecond: string;
  startTime: string;
  stopTime: string;
  remainingBalance: string;
  active: boolean;
}

export const usePaymentStream = () => {
  const { paymentStreamContract, account } = useWeb3();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Create payment stream
  const createStream = useCallback(async (
    recipient: string,
    startTime: number,
    stopTime: number,
    depositAmount: string
  ) => {
    if (!paymentStreamContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const tx = await paymentStreamContract.createStream(
        recipient,
        startTime,
        stopTime,
        { value: parseEther(depositAmount) }
      );

      await tx.wait();
      
      toast({
        title: "Stream Created",
        description: "Payment stream has been created successfully",
      });

      return tx;
    } catch (error: any) {
      console.error('Failed to create stream:', error);
      toast({
        title: "Stream Creation Failed",
        description: error.message || "Failed to create payment stream",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [paymentStreamContract, account, toast]);

  // Withdraw from stream
  const withdrawFromStream = useCallback(async (
    streamId: string,
    amount?: string
  ) => {
    if (!paymentStreamContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const withdrawAmount = amount ? parseEther(amount) : 0;
      
      const tx = await paymentStreamContract.withdrawFromStream(
        streamId,
        withdrawAmount
      );

      await tx.wait();
      
      toast({
        title: "Withdrawal Successful",
        description: amount 
          ? `Withdrew ${amount} STT from stream`
          : "Withdrew all available funds from stream",
      });

      return tx;
    } catch (error: any) {
      console.error('Failed to withdraw from stream:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to withdraw from stream",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [paymentStreamContract, account, toast]);

  // Cancel stream
  const cancelStream = useCallback(async (streamId: string) => {
    if (!paymentStreamContract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    setIsLoading(true);
    try {
      const tx = await paymentStreamContract.cancelStream(streamId);
      await tx.wait();
      
      toast({
        title: "Stream Cancelled",
        description: "Payment stream has been cancelled",
      });

      return tx;
    } catch (error: any) {
      console.error('Failed to cancel stream:', error);
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel stream",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [paymentStreamContract, account, toast]);

  // Get stream details
  const getStream = useCallback(async (streamId: string): Promise<Stream | null> => {
    if (!paymentStreamContract) {
      return null;
    }

    try {
      const stream = await paymentStreamContract.getStream(streamId);
      return {
        sender: stream.sender,
        recipient: stream.recipient,
        deposit: formatEther(stream.deposit),
        ratePerSecond: formatEther(stream.ratePerSecond),
        startTime: stream.startTime.toString(),
        stopTime: stream.stopTime.toString(),
        remainingBalance: formatEther(stream.remainingBalance),
        active: stream.active,
      };
    } catch (error) {
      console.error('Failed to get stream:', error);
      return null;
    }
  }, [paymentStreamContract]);

  // Get stream balance
  const getStreamBalance = useCallback(async (streamId: string): Promise<string> => {
    if (!paymentStreamContract) {
      return '0';
    }

    try {
      const balance = await paymentStreamContract.balanceOf(streamId);
      return formatEther(balance);
    } catch (error) {
      console.error('Failed to get stream balance:', error);
      return '0';
    }
  }, [paymentStreamContract]);

  // Check if stream is active
  const isStreamActive = useCallback(async (streamId: string): Promise<boolean> => {
    if (!paymentStreamContract) {
      return false;
    }

    try {
      return await paymentStreamContract.isStreamActive(streamId);
    } catch (error) {
      console.error('Failed to check stream status:', error);
      return false;
    }
  }, [paymentStreamContract]);

  // Get stream rate
  const getStreamRate = useCallback(async (streamId: string): Promise<string> => {
    if (!paymentStreamContract) {
      return '0';
    }

    try {
      const rate = await paymentStreamContract.getStreamRate(streamId);
      return formatEther(rate);
    } catch (error) {
      console.error('Failed to get stream rate:', error);
      return '0';
    }
  }, [paymentStreamContract]);

  // Get total streamed amount
  const getTotalStreamed = useCallback(async (streamId: string): Promise<string> => {
    if (!paymentStreamContract) {
      return '0';
    }

    try {
      const total = await paymentStreamContract.getTotalStreamed(streamId);
      return formatEther(total);
    } catch (error) {
      console.error('Failed to get total streamed:', error);
      return '0';
    }
  }, [paymentStreamContract]);

  // Get sender streams
  const getSenderStreams = useCallback(async (userAddress?: string): Promise<string[]> => {
    if (!paymentStreamContract) {
      return [];
    }

    const address = userAddress || account;
    if (!address) {
      return [];
    }

    try {
      const streams = await paymentStreamContract.getSenderStreams(address);
      return streams.map((id: any) => id.toString());
    } catch (error) {
      console.error('Failed to get sender streams:', error);
      return [];
    }
  }, [paymentStreamContract, account]);

  // Get recipient streams
  const getRecipientStreams = useCallback(async (userAddress?: string): Promise<string[]> => {
    if (!paymentStreamContract) {
      return [];
    }

    const address = userAddress || account;
    if (!address) {
      return [];
    }

    try {
      const streams = await paymentStreamContract.getRecipientStreams(address);
      return streams.map((id: any) => id.toString());
    } catch (error) {
      console.error('Failed to get recipient streams:', error);
      return [];
    }
  }, [paymentStreamContract, account]);

  return {
    isLoading,
    createStream,
    withdrawFromStream,
    cancelStream,
    getStream,
    getStreamBalance,
    isStreamActive,
    getStreamRate,
    getTotalStreamed,
    getSenderStreams,
    getRecipientStreams,
  };
};
