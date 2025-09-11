import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Wallet Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Wallet Connection Error
            </CardTitle>
            <CardDescription>Something went wrong with the wallet connection</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                <div className="space-y-4">
                  <p>
                    <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred'}
                  </p>
                  
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Common solutions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Make sure MetaMask is installed and unlocked</li>
                      <li>Check if you're on the correct network (Somnia Testnet)</li>
                      <li>Try refreshing the page</li>
                      <li>Clear your browser cache and try again</li>
                      <li>Disconnect and reconnect your wallet</li>
                    </ul>
                  </div>

                  {this.state.errorInfo && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium">Technical Details</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}

                  <div className="pt-4 flex gap-2">
                    <Button onClick={this.handleRetry} className="mr-2">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                    >
                      Reload Page
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
