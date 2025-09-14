import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

export interface BlockchainEvent {
  id: string;
  type: 'RentalStarted' | 'RentalEnded' | 'NFTListed' | 'NFTUnlisted' | 'PaymentStreamed';
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  data: any;
  processed: boolean;
}

export const useBlockchainEvents = () => {
  const { nftFlowContract, paymentStreamContract, account } = useWeb3();
  const { toast } = useToast();
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Process and store new events
  const processEvent = useCallback((event: ethers.EventLog, type: string) => {
    const newEvent: BlockchainEvent = {
      id: `${event.transactionHash}-${event.index || Date.now()}`,
      type: type as any,
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: Date.now(), // We could get actual block timestamp
      data: event.args,
      processed: false
    };

    setEvents(prev => {
      // Avoid duplicates
      if (prev.some(e => e.id === newEvent.id)) {
        return prev;
      }
      return [newEvent, ...prev].slice(0, 100); // Keep last 100 events
    });

    // Show toast notification for user's events
    if (account && (
      event.args?.owner?.toLowerCase() === account.toLowerCase() ||
      event.args?.renter?.toLowerCase() === account.toLowerCase() ||
      event.args?.sender?.toLowerCase() === account.toLowerCase() ||
      event.args?.recipient?.toLowerCase() === account.toLowerCase()
    )) {
      switch (type) {
        case 'RentalStarted':
          toast({
            title: "Rental Started",
            description: `Your NFT rental has begun for token ${event.args?.tokenId}`,
          });
          break;
        case 'RentalEnded':
          toast({
            title: "Rental Ended",
            description: `Rental completed for token ${event.args?.tokenId}`,
          });
          break;
        case 'NFTListed':
          toast({
            title: "NFT Listed",
            description: `Your NFT ${event.args?.tokenId} is now available for rent`,
          });
          break;
        case 'PaymentStreamed':
          toast({
            title: "Payment Received",
            description: `Received rental payment for your NFT`,
          });
          break;
      }
    }
  }, [account, toast]);

  // Start listening to events
  const startListening = useCallback(async () => {
    if (!nftFlowContract || isListening) return;

    setIsListening(true);

    try {
      // Listen to NFTFlow contract events
      nftFlowContract.on('RentalStarted', (owner, renter, nftContract, tokenId, duration, totalCost, event) => {
        processEvent(event, 'RentalStarted');
      });

      nftFlowContract.on('RentalEnded', (owner, renter, nftContract, tokenId, event) => {
        processEvent(event, 'RentalEnded');
      });

      nftFlowContract.on('NFTListed', (owner, nftContract, tokenId, pricePerSecond, event) => {
        processEvent(event, 'NFTListed');
      });

      nftFlowContract.on('NFTUnlisted', (owner, nftContract, tokenId, event) => {
        processEvent(event, 'NFTUnlisted');
      });

      // Listen to PaymentStream events if available
      if (paymentStreamContract) {
        paymentStreamContract.on('StreamCreated', (streamId, sender, recipient, deposit, event) => {
          processEvent(event, 'PaymentStreamed');
        });
      }

      console.log('Started listening to blockchain events');
    } catch (error) {
      console.error('Failed to start event listening:', error);
      setIsListening(false);
    }
  }, [nftFlowContract, paymentStreamContract, isListening, processEvent]);

  // Stop listening to events
  const stopListening = useCallback(() => {
    if (!nftFlowContract || !isListening) return;

    try {
      nftFlowContract.removeAllListeners('RentalStarted');
      nftFlowContract.removeAllListeners('RentalEnded');
      nftFlowContract.removeAllListeners('NFTListed');
      nftFlowContract.removeAllListeners('NFTUnlisted');

      if (paymentStreamContract) {
        paymentStreamContract.removeAllListeners('StreamCreated');
      }

      setIsListening(false);
      console.log('Stopped listening to blockchain events');
    } catch (error) {
      console.error('Failed to stop event listening:', error);
    }
  }, [nftFlowContract, paymentStreamContract, isListening]);

  // Get historical events
  const getHistoricalEvents = useCallback(async (fromBlock: number = -10000) => {
    if (!nftFlowContract) return [];

    try {
      const currentBlock = await nftFlowContract.runner?.provider?.getBlockNumber();
      if (!currentBlock) return [];

      const startBlock = Math.max(0, currentBlock + fromBlock);

      // Get all events from the last N blocks
      const eventNames = ['RentalStarted', 'RentalEnded', 'NFTListed', 'NFTUnlisted'];
      const allEvents = [];

      for (const eventName of eventNames) {
        try {
          const filter = nftFlowContract.filters[eventName]();
          const events = await nftFlowContract.queryFilter(filter, startBlock, currentBlock);
          
          events.forEach(event => {
            if (event instanceof ethers.EventLog) {
              processEvent(event, eventName);
            }
          });

          allEvents.push(...events);
        } catch (error) {
          console.warn(`Failed to get ${eventName} events:`, error);
        }
      }

      return allEvents;
    } catch (error) {
      console.error('Failed to get historical events:', error);
      return [];
    }
  }, [nftFlowContract, processEvent]);

  // Mark event as processed
  const markEventProcessed = useCallback((eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, processed: true }
          : event
      )
    );
  }, []);

  // Clear old events
  const clearOldEvents = useCallback((olderThanHours: number = 24) => {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    setEvents(prev => prev.filter(event => event.timestamp > cutoffTime));
  }, []);

  // Get events for current user
  const getUserEvents = useCallback(() => {
    if (!account) return [];
    
    return events.filter(event => {
      const data = event.data;
      return (
        data?.owner?.toLowerCase() === account.toLowerCase() ||
        data?.renter?.toLowerCase() === account.toLowerCase() ||
        data?.sender?.toLowerCase() === account.toLowerCase() ||
        data?.recipient?.toLowerCase() === account.toLowerCase()
      );
    });
  }, [events, account]);

  // Auto-start listening when contract is available
  useEffect(() => {
    if (nftFlowContract && !isListening) {
      startListening();
    }

    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [nftFlowContract, isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    events,
    userEvents: getUserEvents(),
    isListening,
    startListening,
    stopListening,
    getHistoricalEvents,
    markEventProcessed,
    clearOldEvents
  };
};