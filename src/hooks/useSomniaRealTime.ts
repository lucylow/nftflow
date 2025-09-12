import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { SOMNIA_CONFIG, SomniaUtils } from '@/config/somniaConfig';

// Types for real-time data
interface BlockData {
  number: number;
  timestamp: number;
  gasUsed: string;
  gasLimit: string;
  baseFeePerGas?: string;
}

interface PendingTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  timestamp: number;
}

interface RealTimeStats {
  currentBlock: number;
  pendingTransactions: PendingTransaction[];
  averageBlockTime: number;
  gasPrice: string;
  networkCongestion: 'low' | 'medium' | 'high';
  lastUpdate: number;
}

interface UseSomniaRealTimeReturn {
  // Block data
  blockNumber: number;
  blockData: BlockData | null;
  
  // Transaction data
  pendingTxs: PendingTransaction[];
  confirmedTxs: string[];
  
  // Network stats
  stats: RealTimeStats;
  
  // Control functions
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
  
  // Utility functions
  waitForConfirmation: (txHash: string, timeout?: number) => Promise<boolean>;
  getTransactionStatus: (txHash: string) => Promise<'pending' | 'confirmed' | 'failed' | 'unknown'>;
}

/**
 * Hook for real-time updates using Somnia's 1-second block times
 * Optimized for Somnia Network's high TPS and fast finality
 */
export const useSomniaRealTime = (): UseSomniaRealTimeReturn => {
  // State
  const [blockNumber, setBlockNumber] = useState<number>(0);
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const [pendingTxs, setPendingTxs] = useState<PendingTransaction[]>([]);
  const [confirmedTxs, setConfirmedTxs] = useState<string[]>([]);
  const [stats, setStats] = useState<RealTimeStats>({
    currentBlock: 0,
    pendingTransactions: [],
    averageBlockTime: 1000, // 1 second for Somnia
    gasPrice: SOMNIA_CONFIG.GAS_PRICE,
    networkCongestion: 'low',
    lastUpdate: Date.now()
  });
  
  // Refs
  const providerRef = useRef<ethers.WebSocketProvider | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const blockTimesRef = useRef<number[]>([]);
  const pendingTxMapRef = useRef<Map<string, PendingTransaction>>(new Map());
  
  // Initialize WebSocket provider
  const initializeProvider = useCallback(async () => {
    try {
      if (providerRef.current) {
        providerRef.current.removeAllListeners();
        providerRef.current.destroy();
      }
      
      providerRef.current = new ethers.WebSocketProvider(SOMNIA_CONFIG.WS_URL);
      
      // Listen for new blocks
      providerRef.current.on('block', async (blockNumber) => {
        await handleNewBlock(blockNumber);
      });
      
      // Listen for pending transactions
      providerRef.current.on('pending', async (txHash) => {
        await handlePendingTransaction(txHash);
      });
      
      console.log('✅ Somnia real-time provider initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Somnia provider:', error);
    }
  }, []);
  
  // Handle new block
  const handleNewBlock = useCallback(async (blockNumber: number) => {
    try {
      if (!providerRef.current) return;
      
      const block = await providerRef.current.getBlock(blockNumber);
      if (!block) return;
      
      const blockData: BlockData = {
        number: block.number,
        timestamp: block.timestamp,
        gasUsed: block.gasUsed.toString(),
        gasLimit: block.gasLimit.toString(),
        baseFeePerGas: block.baseFeePerGas?.toString()
      };
      
      setBlockNumber(blockNumber);
      setBlockData(blockData);
      
      // Update block times for average calculation
      const now = Date.now();
      blockTimesRef.current.push(now);
      if (blockTimesRef.current.length > 10) {
        blockTimesRef.current.shift();
      }
      
      // Calculate average block time
      let averageBlockTime = 1000; // Default 1 second for Somnia
      if (blockTimesRef.current.length > 1) {
        const timeDiffs = blockTimesRef.current.slice(1).map((time, index) => 
          time - blockTimesRef.current[index]
        );
        averageBlockTime = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
      }
      
      // Update confirmed transactions
      const confirmedHashes = pendingTxs
        .filter(tx => tx.timestamp < block.timestamp * 1000)
        .map(tx => tx.hash);
      
      if (confirmedHashes.length > 0) {
        setConfirmedTxs(prev => [...prev, ...confirmedHashes]);
        setPendingTxs(prev => prev.filter(tx => !confirmedHashes.includes(tx.hash)));
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        currentBlock: blockNumber,
        averageBlockTime,
        lastUpdate: now
      }));
      
    } catch (error) {
      console.error('Error handling new block:', error);
    }
  }, [pendingTxs]);
  
  // Handle pending transaction
  const handlePendingTransaction = useCallback(async (txHash: string) => {
    try {
      if (!providerRef.current) return;
      
      // Check if we already have this transaction
      if (pendingTxMapRef.current.has(txHash)) return;
      
      const tx = await providerRef.current.getTransaction(txHash);
      if (!tx) return;
      
      const pendingTx: PendingTransaction = {
        hash: txHash,
        from: tx.from,
        to: tx.to || '',
        value: tx.value.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        gasLimit: tx.gasLimit.toString(),
        timestamp: Date.now()
      };
      
      pendingTxMapRef.current.set(txHash, pendingTx);
      
      setPendingTxs(prev => {
        const newPendingTxs = [...prev, pendingTx];
        // Keep only recent pending transactions
        return newPendingTxs
          .filter(tx => Date.now() - tx.timestamp < SOMNIA_CONFIG.PENDING_TX_TIMEOUT)
          .slice(-SOMNIA_CONFIG.MAX_PENDING_TXS);
      });
      
      // Remove from pending after timeout
      setTimeout(() => {
        setPendingTxs(prev => prev.filter(tx => tx.hash !== txHash));
        pendingTxMapRef.current.delete(txHash);
      }, SOMNIA_CONFIG.PENDING_TX_TIMEOUT);
      
    } catch (error) {
      console.error('Error handling pending transaction:', error);
    }
  }, []);
  
  // Start polling
  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;
    
    isPollingRef.current = true;
    initializeProvider();
    
    // Fallback polling in case WebSocket fails
    pollingIntervalRef.current = setInterval(async () => {
      try {
        if (!providerRef.current) return;
        
        const currentBlock = await providerRef.current.getBlockNumber();
        if (currentBlock !== blockNumber) {
          await handleNewBlock(currentBlock);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, SOMNIA_CONFIG.BLOCK_POLLING_INTERVAL);
    
    console.log('🔄 Started Somnia real-time polling');
  }, [blockNumber, handleNewBlock, initializeProvider]);
  
  // Stop polling
  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (providerRef.current) {
      providerRef.current.removeAllListeners();
      providerRef.current.destroy();
      providerRef.current = null;
    }
    
    console.log('⏹️ Stopped Somnia real-time polling');
  }, []);
  
  // Wait for transaction confirmation
  const waitForConfirmation = useCallback(async (txHash: string, timeout: number = 10000): Promise<boolean> => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const status = await getTransactionStatus(txHash);
      
      if (status === 'confirmed') {
        return true;
      }
      
      if (status === 'failed') {
        return false;
      }
      
      // Wait for next block (1 second on Somnia)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false; // Timeout
  }, []);
  
  // Get transaction status
  const getTransactionStatus = useCallback(async (txHash: string): Promise<'pending' | 'confirmed' | 'failed' | 'unknown'> => {
    try {
      if (!providerRef.current) return 'unknown';
      
      const tx = await providerRef.current.getTransaction(txHash);
      if (!tx) return 'unknown';
      
      const receipt = await providerRef.current.getTransactionReceipt(txHash);
      if (receipt) {
        return receipt.status === 1 ? 'confirmed' : 'failed';
      }
      
      return 'pending';
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return 'unknown';
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);
  
  // Auto-start polling
  useEffect(() => {
    startPolling();
  }, [startPolling]);
  
  return {
    blockNumber,
    blockData,
    pendingTxs,
    confirmedTxs,
    stats,
    startPolling,
    stopPolling,
    isPolling: isPollingRef.current,
    waitForConfirmation,
    getTransactionStatus
  };
};

// Utility hook for batch operations
export const useSomniaBatchOperations = () => {
  const { blockNumber, stats } = useSomniaRealTime();
  
  const calculateBatchGasCost = useCallback((itemCount: number, operationType: 'rental' | 'price_update' | 'listing' | 'transfer') => {
    return SomniaUtils.calculateBatchCost(itemCount, operationType);
  }, []);
  
  const isOptimalForBatch = useCallback((itemCount: number) => {
    // Somnia can handle large batches efficiently
    return itemCount <= SOMNIA_CONFIG.BATCH_SIZE && stats.networkCongestion === 'low';
  }, [stats.networkCongestion]);
  
  const getRecommendedBatchSize = useCallback(() => {
    // Adjust batch size based on network congestion
    switch (stats.networkCongestion) {
      case 'low':
        return SOMNIA_CONFIG.BATCH_SIZE;
      case 'medium':
        return Math.floor(SOMNIA_CONFIG.BATCH_SIZE * 0.7);
      case 'high':
        return Math.floor(SOMNIA_CONFIG.BATCH_SIZE * 0.5);
      default:
        return SOMNIA_CONFIG.BATCH_SIZE;
    }
  }, [stats.networkCongestion]);
  
  return {
    calculateBatchGasCost,
    isOptimalForBatch,
    getRecommendedBatchSize,
    currentBlock: blockNumber,
    networkCongestion: stats.networkCongestion
  };
};

// Utility hook for micro-payment streaming
export const useSomniaMicroStreaming = () => {
  const { blockNumber, stats } = useSomniaRealTime();
  
  const calculateStreamCost = useCallback((ratePerSecond: string, duration: number) => {
    return SomniaUtils.calculateStreamCost(ratePerSecond, duration);
  }, []);
  
  const isOptimalForStreaming = useCallback((ratePerSecond: string) => {
    const rateWei = BigInt(ratePerSecond);
    const minRateWei = BigInt(SOMNIA_CONFIG.MIN_STREAM_RATE);
    const maxRateWei = BigInt(SOMNIA_CONFIG.MAX_STREAM_RATE);
    
    return rateWei >= minRateWei && rateWei <= maxRateWei && stats.networkCongestion === 'low';
  }, [stats.networkCongestion]);
  
  const getRecommendedStreamRate = useCallback(() => {
    // Recommend rate based on network conditions
    const baseRate = BigInt(SOMNIA_CONFIG.MIN_STREAM_RATE);
    
    switch (stats.networkCongestion) {
      case 'low':
        return baseRate * BigInt(100); // 100x minimum
      case 'medium':
        return baseRate * BigInt(50); // 50x minimum
      case 'high':
        return baseRate * BigInt(10); // 10x minimum
      default:
        return baseRate;
    }
  }, [stats.networkCongestion]);
  
  return {
    calculateStreamCost,
    isOptimalForStreaming,
    getRecommendedStreamRate,
    currentBlock: blockNumber,
    networkCongestion: stats.networkCongestion
  };
};
