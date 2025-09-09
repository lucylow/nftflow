import { useEffect, useCallback, useRef } from 'react';
import { webSocketService } from '@/services/WebSocketService';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';

interface RealTimeUpdateOptions {
  enableNotifications?: boolean;
  enableRentalUpdates?: boolean;
  enablePaymentUpdates?: boolean;
  enableReputationUpdates?: boolean;
}

export const useRealTimeUpdates = (options: RealTimeUpdateOptions = {}) => {
  const { 
    enableNotifications = true,
    enableRentalUpdates = true,
    enablePaymentUpdates = true,
    enableReputationUpdates = true
  } = options;
  
  const { isConnected, account } = useWeb3();
  const { toast } = useToast();
  const subscriptionsRef = useRef<(() => void)[]>([]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isConnected && account) {
      webSocketService.init().catch(error => {
        console.error('Failed to initialize WebSocket service:', error);
        if (enableNotifications) {
          toast({
            title: "Connection Warning",
            description: "Real-time updates may be limited. Using fallback mode.",
            variant: "destructive",
          });
        }
      });
    }

    return () => {
      webSocketService.destroy();
    };
  }, [isConnected, account, enableNotifications, toast]);

  // Subscribe to rental events
  useEffect(() => {
    if (!enableRentalUpdates || !isConnected) return;

    const unsubscribeRentalCreated = webSocketService.subscribe('rental-created', (data: any) => {
      console.log('Rental created:', data);
      
      if (enableNotifications && data.tenant === account) {
        toast({
          title: "Rental Started",
          description: `Your rental of NFT #${data.tokenId} has begun`,
        });
      }
    });

    const unsubscribeRentalCompleted = webSocketService.subscribe('rental-completed', (data: any) => {
      console.log('Rental completed:', data);
      
      if (enableNotifications && (data.tenant === account || data.lender === account)) {
        toast({
          title: "Rental Completed",
          description: `Rental of NFT #${data.tokenId} has ended`,
        });
      }
    });

    subscriptionsRef.current.push(unsubscribeRentalCreated, unsubscribeRentalCompleted);

    return () => {
      unsubscribeRentalCreated();
      unsubscribeRentalCompleted();
    };
  }, [enableRentalUpdates, enableNotifications, account, toast]);

  // Subscribe to payment events
  useEffect(() => {
    if (!enablePaymentUpdates || !isConnected) return;

    const unsubscribePaymentReceived = webSocketService.subscribe('funds-released', (data: any) => {
      console.log('Payment received:', data);
      
      if (enableNotifications) {
        toast({
          title: "Payment Received",
          description: `Received ${data.amount} STT from payment stream`,
        });
      }
    });

    subscriptionsRef.current.push(unsubscribePaymentReceived);

    return () => {
      unsubscribePaymentReceived();
    };
  }, [enablePaymentUpdates, enableNotifications, toast]);

  // Subscribe to reputation events
  useEffect(() => {
    if (!enableReputationUpdates || !isConnected) return;

    const unsubscribeReputationUpdated = webSocketService.subscribe('reputation-updated', (data: any) => {
      console.log('Reputation updated:', data);
      
      if (enableNotifications && data.user === account && parseInt(data.newScore) >= 750) {
        toast({
          title: "Reputation Milestone",
          description: `Congratulations! You've reached ${data.newScore} reputation points`,
        });
      }
    });

    subscriptionsRef.current.push(unsubscribeReputationUpdated);

    return () => {
      unsubscribeReputationUpdated();
    };
  }, [enableReputationUpdates, enableNotifications, account, toast]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current = [];
    };
  }, []);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return webSocketService.getConnectionStatus();
  }, []);

  // Manual subscription method for custom events
  const subscribe = useCallback((eventType: string, callback: Function) => {
    const unsubscribe = webSocketService.subscribe(eventType, callback);
    subscriptionsRef.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  return {
    getConnectionStatus,
    subscribe,
    isConnected: isConnected && getConnectionStatus() === 'connected'
  };
};
