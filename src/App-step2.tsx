import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import WalletErrorBoundary from "@/components/WalletErrorBoundary";
import { ThemeProvider } from "./hooks/use-theme";
import Layout from "@/components/Layout";

// Step 2: Add back the original Index component
const IndexWithErrorBoundary = () => {
  try {
    const Index = React.lazy(() => import("@/pages/Index"));
    
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading NFTFlow...</p>
          </div>
        </div>
      }>
        <Index />
      </React.Suspense>
    );
  } catch (error) {
    console.error('Index component error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Index Component Error</h1>
          <p className="text-xl mb-8">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-white text-red-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }
};

// Add back some key page components with error boundaries
const PageWithErrorBoundary = ({ componentName, title, isComponent = false }: { componentName: string, title: string, isComponent?: boolean }) => {
  try {
    const importPath = isComponent ? `@/components/${componentName}` : `@/pages/${componentName}`;
    const Component = React.lazy(() => import(importPath));
    
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading {title}...</p>
          </div>
        </div>
      }>
        <Component />
      </React.Suspense>
    );
  } catch (error) {
    console.error(`${componentName} component error:`, error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">{title} Error</h1>
          <p className="text-xl mb-8">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Link to="/" className="bg-white text-red-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }
};

// Simple working components for other routes
const SimplePage = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-xl text-muted-foreground mb-8">This page is coming soon!</p>
      <Link to="/" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
        Go Home
      </Link>
    </div>
  </div>
);

const AppStep2 = () => {
  console.log('AppStep2 component rendering');
  
  try {
    return (
      <ErrorBoundary>
        <ThemeProvider defaultTheme="dark" storageKey="nftflow-ui-theme">
          <WalletErrorBoundary>
            <Web3Provider>
              <NotificationProvider>
                <TooltipProvider>
                  <Toaster />
                  <BrowserRouter>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<IndexWithErrorBoundary />} />
                        <Route path="/marketplace" element={<PageWithErrorBoundary componentName="Marketplace" title="Marketplace" />} />
                        <Route path="/create" element={<PageWithErrorBoundary componentName="Create" title="Create NFT" />} />
                        <Route path="/dashboard" element={<PageWithErrorBoundary componentName="Dashboard" title="Dashboard" />} />
                        <Route path="/profile" element={<PageWithErrorBoundary componentName="Profile" title="Profile" />} />
                        <Route path="/wallet" element={<PageWithErrorBoundary componentName="SimpleWallet" title="Wallet" isComponent={true} />} />
                        <Route path="/wallet-test" element={<PageWithErrorBoundary componentName="WalletTest" title="Wallet Test" />} />
                        <Route path="/somnia" element={<PageWithErrorBoundary componentName="Somnia" title="Somnia" />} />
                        <Route path="/dao" element={<SimplePage title="DAO" />} />
                        <Route path="/governance" element={<SimplePage title="Governance" />} />
                        <Route path="/analytics" element={<SimplePage title="Analytics" />} />
                        <Route path="/upload" element={<SimplePage title="Upload" />} />
                        <Route path="/creativity" element={<SimplePage title="Creativity" />} />
                        <Route path="/subgraph" element={<SimplePage title="Subgraph" />} />
                        <Route path="/social" element={<SimplePage title="Social" />} />
                        <Route path="/mobile" element={<SimplePage title="Mobile" />} />
                        <Route path="/rental" element={<SimplePage title="Rental" />} />
                        <Route path="/test" element={<div className="text-black">Test Route Works</div>} />
                        <Route
                          path="*"
                          element={
                            <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                              <div className="text-center">
                                <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
                                <p className="text-gray-300 mb-8">The page you're looking for doesn't exist.</p>
                                <Link to="/" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">Go Home</Link>
                              </div>
                            </div>
                          }
                        />
                      </Routes>
                    </Layout>
                  </BrowserRouter>
                </TooltipProvider>
              </NotificationProvider>
            </Web3Provider>
          </WalletErrorBoundary>
        </ThemeProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('AppStep2 rendering error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">AppStep2 Error</h1>
          <p className="text-xl mb-8">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-white text-red-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }
};

export default AppStep2;
