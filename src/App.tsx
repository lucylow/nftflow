import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./hooks/use-theme";
import { Web3Provider } from "@/contexts/Web3Context-minimal";
import WalletErrorBoundary from "@/components/WalletErrorBoundary";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ui/error-boundary";

// Import all working components
import MarketplaceSimple from "@/pages/Marketplace-simple";
import Create from "@/pages/Create";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import SimpleWallet from "@/components/SimpleWallet";

// Working Index component
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
              <a href="/marketplace">
                <button className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition-opacity">
                  Start Renting NFTs
                </button>
              </a>
              <a href="/create">
                <button className="px-8 py-4 text-lg border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
                  List Your NFT
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const App = () => {
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
                      <Route path="/marketplace" element={<MarketplaceSimple />} />
                      <Route path="/create" element={<Create />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/wallet" element={<SimpleWallet />} />
                      <Route path="*" element={<WorkingIndex />} />
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
};

export default App;