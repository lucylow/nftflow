import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NFTFlow Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 to-purple-900 flex items-center justify-center">
          <div className="text-center text-white p-8 bg-black/20 rounded-lg backdrop-blur-sm">
            <h1 className="text-3xl font-bold mb-4">🚨 NFTFlow Error</h1>
            <p className="text-lg mb-4">Something went wrong with the application</p>
            <div className="bg-black/30 p-4 rounded text-left text-sm mb-4">
              <pre>{this.state.error?.message || 'Unknown error'}</pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
