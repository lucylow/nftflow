import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Transaction {
  id: string;
  description: string;
  status: 'pending' | 'confirming' | 'confirmed' | 'failed';
  progress?: number;
  hash?: string;
  timestamp: number;
  type: 'rental' | 'listing' | 'payment' | 'other';
  amount?: string;
  token?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => string;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  clearCompleted: () => void;
  getTransaction: (id: string) => Transaction | undefined;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'timestamp'>): string => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      timestamp: Date.now()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return id;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === id 
          ? { ...tx, ...updates }
          : tx
      )
    );
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTransactions(prev => 
      prev.filter(tx => 
        tx.status === 'pending' || tx.status === 'confirming'
      )
    );
  }, []);

  const getTransaction = useCallback((id: string): Transaction | undefined => {
    return transactions.find(tx => tx.id === id);
  }, [transactions]);

  const value: TransactionContextType = {
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    clearCompleted,
    getTransaction
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
};

// Hook for managing individual transactions
export const useTransaction = (transactionId?: string) => {
  const { transactions, addTransaction, updateTransaction, removeTransaction } = useTransactionContext();

  const transaction = transactionId ? transactions.find(tx => tx.id === transactionId) : undefined;

  const startTransaction = useCallback((
    description: string,
    type: Transaction['type'],
    amount?: string,
    token?: string
  ) => {
    return addTransaction({
      description,
      status: 'pending',
      type,
      amount,
      token
    });
  }, [addTransaction]);

  const confirmTransaction = useCallback((id: string, hash: string) => {
    updateTransaction(id, {
      status: 'confirming',
      hash,
      progress: 50
    });
  }, [updateTransaction]);

  const completeTransaction = useCallback((id: string) => {
    updateTransaction(id, {
      status: 'confirmed',
      progress: 100
    });
  }, [updateTransaction]);

  const failTransaction = useCallback((id: string, error?: string) => {
    updateTransaction(id, {
      status: 'failed',
      progress: 0
    });
  }, [updateTransaction]);

  const updateProgress = useCallback((id: string, progress: number) => {
    updateTransaction(id, { progress });
  }, [updateTransaction]);

  return {
    transaction,
    startTransaction,
    confirmTransaction,
    completeTransaction,
    failTransaction,
    updateProgress,
    removeTransaction
  };
};

// Utility functions for common transaction patterns
export const useRentalTransaction = () => {
  const { startTransaction, confirmTransaction, completeTransaction, failTransaction } = useTransaction();

  const startRental = useCallback((
    nftContract: string,
    tokenId: string,
    duration: number,
    amount: string
  ) => {
    return startTransaction(
      `Renting NFT ${tokenId} for ${duration} days`,
      'rental',
      amount,
      'ETH'
    );
  }, [startTransaction]);

  const confirmRental = useCallback((txId: string, hash: string) => {
    confirmTransaction(txId, hash);
  }, [confirmTransaction]);

  const completeRental = useCallback((txId: string) => {
    completeTransaction(txId);
  }, [completeTransaction]);

  const failRental = useCallback((txId: string, error?: string) => {
    failTransaction(txId, error);
  }, [failTransaction]);

  return {
    startRental,
    confirmRental,
    completeRental,
    failRental
  };
};

export const useListingTransaction = () => {
  const { startTransaction, confirmTransaction, completeTransaction, failTransaction } = useTransaction();

  const startListing = useCallback((
    nftContract: string,
    tokenId: string,
    pricePerSecond: string
  ) => {
    return startTransaction(
      `Creating listing for NFT ${tokenId}`,
      'listing',
      pricePerSecond,
      'ETH'
    );
  }, [startTransaction]);

  const confirmListing = useCallback((txId: string, hash: string) => {
    confirmTransaction(txId, hash);
  }, [confirmTransaction]);

  const completeListing = useCallback((txId: string) => {
    completeTransaction(txId);
  }, [completeTransaction]);

  const failListing = useCallback((txId: string, error?: string) => {
    failTransaction(txId, error);
  }, [failTransaction]);

  return {
    startListing,
    confirmListing,
    completeListing,
    failListing
  };
};
