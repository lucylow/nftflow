import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context-minimal";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import WalletErrorBoundary from "@/components/WalletErrorBoundary";
import { ThemeProvider } from "./hooks/use-theme";
import Layout from "@/components/Layout";

// Import working pages
import Marketplace from "@/pages/Marketplace";
import WalletAndTools from "@/pages/WalletAndTools";

// Simple placeholder for other pages
const SimplePage = ({ title, description }: { title: string; description: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
        <p className="text-gray-300 text-lg">{description}</p>
      </div>
    </div>
  </div>
);

const App = () => {
  console.log('App component rendering - NFTFlow simple version');

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
                        {/* Working routes */}
                        <Route path="/" element={<SimplePage title="NFTFlow" description="Discover, Create, & Rent NFTs" />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/wallet" element={<WalletAndTools />} />
                        
                        {/* Placeholder routes */}
                        <Route path="/create" element={<SimplePage title="Create NFT" description="Create and upload your NFTs" />} />
                        <Route path="/profile" element={<SimplePage title="Profile" description="User profile and dashboard" />} />
                        <Route path="/community" element={<SimplePage title="Community" description="DAO and governance" />} />
                        
                        {/* 404 Page */}
                        <Route
                          path="*"
                          element={
                            <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                              <div className="text-center">
                                <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
                                <p className="text-gray-300 mb-8">The page you're looking for doesn't exist.</p>
                                <a
                                  href="/"
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                                >
                                  Go Home
                                </a>
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
    console.error('App rendering error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">App Error</h1>
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

export default App;
