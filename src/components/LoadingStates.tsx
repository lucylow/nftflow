import React, { useState, useEffect } from 'react';

// Skeleton loader for NFT cards
export const NFTSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="nft-card skeleton">
          <div className="skeleton-image"></div>
          <div className="nft-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
            <div className="skeleton-price"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </>
  );
};

// Transaction progress component
interface TransactionStep {
  name: string;
  label: string;
  description: string;
  estimatedTime?: string;
}

interface TransactionProgressProps {
  steps: TransactionStep[];
  currentStep: number;
  isVisible: boolean;
}

export const TransactionProgress: React.FC<TransactionProgressProps> = ({ 
  steps, 
  currentStep, 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div className="transaction-progress">
      <div className="progress-header">
        <h4>Processing Transaction</h4>
        <div className="progress-spinner">
          <div className="spinner"></div>
        </div>
      </div>
      
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div 
            key={step.name} 
            className={`step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'current' : ''}`}
          >
            <div className="step-icon">
              {index < currentStep ? (
                <span className="checkmark">✓</span>
              ) : (
                <span className="step-number">{index + 1}</span>
              )}
            </div>
            <div className="step-content">
              <div className="step-label">{step.label}</div>
              {index === currentStep && (
                <div className="step-description">{step.description}</div>
              )}
              {index === currentStep && step.estimatedTime && (
                <div className="step-time">Estimated: {step.estimatedTime}</div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${index < currentStep ? 'completed' : ''}`}></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="progress-footer">
        <p>Please don't close this window while the transaction is processing.</p>
      </div>
    </div>
  );
};

// Custom hook for managing loading states
export const useLoadingState = <T extends any[]>(
  action: (...args: T) => Promise<any>,
  dependencies: any[] = []
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);
  
  const execute = async (...args: T) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    
    try {
      const result = await action(...args);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const reset = () => {
    setIsLoading(false);
    setError(null);
    setData(null);
  };
  
  return { execute, isLoading, error, data, reset };
};

// Loading overlay component
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = "Loading...", 
  progress 
}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <div className="loading-message">{message}</div>
        {progress !== undefined && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Pulse animation for loading text
export const LoadingText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="loading-text">
      <span className="loading-dots">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
      {text}
    </div>
  );
};

// Shimmer effect for loading states
export const ShimmerEffect: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`shimmer-effect ${className}`}>
      <div className="shimmer-content"></div>
    </div>
  );
};

// Skeleton for different content types
export const ContentSkeleton: React.FC<{ type: 'text' | 'image' | 'button' | 'card' }> = ({ type }) => {
  const getSkeletonClass = () => {
    switch (type) {
      case 'text':
        return 'skeleton-text';
      case 'image':
        return 'skeleton-image';
      case 'button':
        return 'skeleton-button';
      case 'card':
        return 'skeleton-card';
      default:
        return 'skeleton-default';
    }
  };

  return <div className={`skeleton ${getSkeletonClass()}`}></div>;
};

// Loading state for async operations
export const AsyncLoadingState: React.FC<{
  isLoading: boolean;
  error: Error | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}> = ({ 
  isLoading, 
  error, 
  children, 
  loadingComponent = <NFTSkeleton count={4} />,
  errorComponent = <div className="error-state">Something went wrong</div>
}) => {
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    return <>{errorComponent}</>;
  }

  return <>{children}</>;
};
