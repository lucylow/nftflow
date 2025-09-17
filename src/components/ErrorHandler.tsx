import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';

// Error mapping for common blockchain errors
const ERROR_MAPPINGS: Record<string, string> = {
  'USER_REJECTED': 'Transaction was rejected by user',
  'INSUFFICIENT_FUNDS': 'Insufficient funds for transaction',
  'NETWORK_ERROR': 'Network connection issue. Please check your internet connection',
  'CALL_EXCEPTION': 'Contract interaction failed. Please try again',
  'UNPREDICTABLE_GAS_LIMIT': 'Transaction may fail. Please try with higher gas limit',
  'NONCE_EXPIRED': 'Transaction nonce expired. Please try again',
  'REPLACEMENT_UNDERPRICED': 'Transaction replacement under-priced',
  'ALREADY_KNOWN': 'Transaction already known',
  'TOO_MANY_PEERS': 'Too many peers connected',
  'LIMIT_EXCEEDED': 'Rate limit exceeded. Please wait and try again',
  'INVALID_PARAMS': 'Invalid parameters provided',
  'METHOD_NOT_FOUND': 'Method not found',
  'INTERNAL_ERROR': 'Internal error occurred',
  'INVALID_REQUEST': 'Invalid request format',
  'PARSE_ERROR': 'Parse error in request',
  'EXECUTION_REVERTED': 'Transaction execution reverted',
  'GAS_REQUIREMENT_EXCEEDED': 'Gas requirement exceeded',
  'TRANSACTION_UNDERPRICED': 'Transaction under-priced',
  'INSUFFICIENT_PERMISSIONS': 'Insufficient permissions for this action',
  'CONTRACT_NOT_DEPLOYED': 'Contract not deployed at this address',
  'INVALID_SIGNATURE': 'Invalid signature provided',
};

// Custom hook for error handling
export const useErrorHandler = () => {
  const [error, setError] = useState<{ message: string; rawError: any; timestamp: number } | null>(null);
  const [errorHistory, setErrorHistory] = useState<Array<{ message: string; timestamp: number }>>([]);
  
  const handleError = (error: any) => {
    console.error('Application error:', error);
    
    // Parse the error to get a user-friendly message
    let message = 'Something went wrong. Please try again';
    let errorCode = '';
    
    // Check for specific error codes
    if (error.code) {
      errorCode = error.code.toString();
      if (ERROR_MAPPINGS[errorCode]) {
        message = ERROR_MAPPINGS[errorCode];
      }
    }
    
    // Check for error message patterns
    if (error.message) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('user rejected')) {
        message = 'Transaction was cancelled by user';
      } else if (errorMessage.includes('insufficient funds')) {
        message = 'Insufficient funds. Please add more tokens to your wallet';
      } else if (errorMessage.includes('network')) {
        message = 'Network error. Please check your connection and try again';
      } else if (errorMessage.includes('gas')) {
        message = 'Gas estimation failed. Please try with a higher gas limit';
      } else if (errorMessage.includes('nonce')) {
        message = 'Transaction nonce issue. Please try again';
      } else if (errorMessage.includes('revert')) {
        message = 'Transaction failed. Please check the contract state';
      }
    }
    
    // Check for string errors
    if (typeof error === 'string') {
      message = error;
    }
    
    const errorObj = { 
      message, 
      rawError: error, 
      timestamp: Date.now() 
    };
    
    setError(errorObj);
    
    // Add to error history
    setErrorHistory(prev => [
      { message, timestamp: Date.now() },
      ...prev.slice(0, 9) // Keep only last 10 errors
    ]);
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      setError(null);
    }, 8000);
  };
  
  const clearError = () => {
    setError(null);
  };
  
  const clearErrorHistory = () => {
    setErrorHistory([]);
  };
  
  return { 
    error, 
    errorHistory,
    handleError, 
    clearError, 
    clearErrorHistory 
  };
};

// Error display component
interface ErrorDisplayProps {
  error: { message: string; rawError: any; timestamp: number } | null;
  onDismiss: () => void;
  showDetails?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onDismiss, 
  showDetails = false 
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  if (!error) return null;
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  return (
    <div className="error-toast">
      <div className="error-content">
        <div className="error-header">
          <div className="error-icon">⚠️</div>
          <div className="error-message">
            <span className="error-text">{error.message}</span>
            <span className="error-time">{formatTimestamp(error.timestamp)}</span>
          </div>
          <button 
            onClick={onDismiss}
            className="error-dismiss"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
        
        {showDetails && (
          <div className="error-actions">
            <button 
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="details-toggle"
            >
              {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
            </button>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(error.rawError, null, 2));
              }}
              className="copy-error"
            >
              Copy Error
            </button>
          </div>
        )}
        
        {showTechnicalDetails && (
          <div className="error-details">
            <pre className="error-raw">
              {JSON.stringify(error.rawError, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

// Error boundary for React components
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: log to external service
      // logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="error-fallback">
          <div className="error-fallback-content">
            <div className="error-icon">🚨</div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
            
            <div className="error-fallback-actions">
              <button 
                onClick={() => window.location.reload()}
                className="retry-btn"
              >
                Refresh Page
              </button>
              
              <button 
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="retry-btn secondary"
              >
                Try Again
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details-dev">
                <summary>Development Error Details</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error context for global error handling
interface ErrorContextType {
  handleError: (error: any) => void;
  clearError: () => void;
  error: { message: string; rawError: any; timestamp: number } | null;
}

const ErrorContext = React.createContext<ErrorContextType | null>(null);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { error, handleError, clearError } = useErrorHandler();
  
  return (
    <ErrorContext.Provider value={{ error, handleError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorContext = () => {
  const context = React.useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
};

// Error reporting hook
export const useErrorReporting = () => {
  const reportError = async (error: Error, context?: any) => {
    try {
      // In a real application, you would send this to an error reporting service
      console.log('Reporting error:', { error, context });
      
      // Example: Send to external service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     message: error.message,
      //     stack: error.stack,
      //     context,
      //     timestamp: new Date().toISOString(),
      //     userAgent: navigator.userAgent,
      //     url: window.location.href
      //   })
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };
  
  return { reportError };
};
