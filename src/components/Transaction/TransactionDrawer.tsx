import React, { useState } from 'react';
import { useTransactionContext } from '../../contexts/TransactionContext';

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDrawer: React.FC<TransactionDrawerProps> = ({ isOpen, onClose }) => {
  const { transactions, clearCompleted } = useTransactionContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const activeTransactions = transactions.filter(tx => 
    tx.status === 'pending' || tx.status === 'confirming'
  );
  
  const completedTransactions = transactions.filter(tx => 
    tx.status === 'confirmed' || tx.status === 'failed'
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirming': return '🔄';
      case 'confirmed': return '✅';
      case 'failed': return '❌';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'confirming': return 'text-blue-500';
      case 'confirmed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  const formatTransactionHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <aside 
      className="transaction-drawer"
      role="complementary"
      aria-label="Transaction status"
      aria-live="polite"
    >
      <div className="transaction-drawer-header">
        <h2 className="transaction-drawer-title">
          Transactions
          {activeTransactions.length > 0 && (
            <span className="transaction-count">
              {activeTransactions.length}
            </span>
          )}
        </h2>
        <div className="transaction-drawer-actions">
          <button
            className="transaction-drawer-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse drawer' : 'Expand drawer'}
          >
            {isExpanded ? '−' : '+'}
          </button>
          <button
            className="transaction-drawer-close"
            onClick={onClose}
            aria-label="Close transaction drawer"
          >
            ×
          </button>
        </div>
      </div>

      <div className={`transaction-drawer-content ${isExpanded ? 'expanded' : ''}`}>
        {/* Active Transactions */}
        {activeTransactions.length > 0 && (
          <div className="transaction-section">
            <h3 className="transaction-section-title">In Progress</h3>
            <div className="transaction-list">
              {activeTransactions.map((tx) => (
                <div key={tx.id} className="transaction-item active">
                  <div className="transaction-item-header">
                    <div className="transaction-status">
                      <span 
                        className={`status-icon ${getStatusColor(tx.status)}`}
                        aria-hidden="true"
                      >
                        {getStatusIcon(tx.status)}
                      </span>
                      <span className="status-text">{tx.status}</span>
                    </div>
                    <span className="transaction-time">
                      {formatTime(tx.timestamp)}
                    </span>
                  </div>
                  
                  <div className="transaction-details">
                    <p className="transaction-description">{tx.description}</p>
                    {tx.progress !== undefined && (
                      <div className="transaction-progress">
                        <progress 
                          value={tx.progress} 
                          max="100" 
                          aria-label={`Transaction progress: ${tx.progress}%`}
                        />
                        <span className="progress-text">{tx.progress}%</span>
                      </div>
                    )}
                    {tx.hash && (
                      <div className="transaction-hash">
                        <span className="hash-label">Hash:</span>
                        <code className="hash-value">
                          {formatTransactionHash(tx.hash)}
                        </code>
                        <button
                          className="hash-copy"
                          onClick={() => navigator.clipboard.writeText(tx.hash)}
                          aria-label="Copy transaction hash"
                        >
                          📋
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Transactions */}
        {completedTransactions.length > 0 && (
          <div className="transaction-section">
            <div className="transaction-section-header">
              <h3 className="transaction-section-title">Recent</h3>
              <button
                className="transaction-clear"
                onClick={clearCompleted}
                aria-label="Clear completed transactions"
              >
                Clear
              </button>
            </div>
            <div className="transaction-list">
              {completedTransactions.slice(0, isExpanded ? undefined : 3).map((tx) => (
                <div key={tx.id} className="transaction-item completed">
                  <div className="transaction-item-header">
                    <div className="transaction-status">
                      <span 
                        className={`status-icon ${getStatusColor(tx.status)}`}
                        aria-hidden="true"
                      >
                        {getStatusIcon(tx.status)}
                      </span>
                      <span className="status-text">{tx.status}</span>
                    </div>
                    <span className="transaction-time">
                      {formatTime(tx.timestamp)}
                    </span>
                  </div>
                  
                  <div className="transaction-details">
                    <p className="transaction-description">{tx.description}</p>
                    {tx.hash && (
                      <div className="transaction-hash">
                        <span className="hash-label">Hash:</span>
                        <code className="hash-value">
                          {formatTransactionHash(tx.hash)}
                        </code>
                        <button
                          className="hash-copy"
                          onClick={() => navigator.clipboard.writeText(tx.hash)}
                          aria-label="Copy transaction hash"
                        >
                          📋
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {completedTransactions.length > 3 && !isExpanded && (
              <button
                className="transaction-show-more"
                onClick={() => setIsExpanded(true)}
              >
                Show {completedTransactions.length - 3} more
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {transactions.length === 0 && (
          <div className="transaction-empty">
            <div className="transaction-empty-icon" aria-hidden="true">
              📋
            </div>
            <p className="transaction-empty-text">
              No transactions yet
            </p>
            <p className="transaction-empty-description">
              Your transaction history will appear here
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default TransactionDrawer;
