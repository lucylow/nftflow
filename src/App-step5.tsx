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

// Import Marketplace and SimpleWallet components
import Marketplace from "@/pages/Marketplace";
import SimpleWallet from "@/components/SimpleWallet";

// Simple working Index component
const WorkingIndex = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <section className="relative px-4 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl" />
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Rent NFTs by the Second
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Access premium NFT utilities instantly. No ownership required. 
              Pay only for what you use with streaming payments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/marketplace">
                <button className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition-opacity">
                  Start Renting NFTs
                </button>
              </Link>
              <Link to="/create">
                <button className="px-8 py-4 text-lg border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
                  List Your NFT
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
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

const AppStep5 = () => {
  console.log('AppStep5 component rendering - testing Marketplace + SimpleWallet components');
  
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
                        <Route path="/" element={<WorkingIndex />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/create" element={<SimplePage title="Create NFT" />} />
                        <Route path="/dashboard" element={<SimplePage title="Dashboard" />} />
                        <Route path="/profile" element={<SimplePage title="Profile" />} />
                        <Route path="/wallet" element={<SimpleWallet />} />
                        <Route path="/wallet-test" element={<SimplePage title="Wallet Test" />} />
                        <Route path="/somnia" element={<SimplePage title="Somnia" />} />
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
    console.error('AppStep5 rendering error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">AppStep5 Error</h1>
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

export default AppStep5;
