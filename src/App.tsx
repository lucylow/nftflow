import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import WalletErrorBoundary from "@/components/WalletErrorBoundary";
import { ThemeProvider } from "./hooks/use-theme";
import Index from "@/pages/SimpleIndex";
import Analytics from "@/pages/Analytics";
import EnhancedMarketplace from "@/pages/EnhancedMarketplace";
import Profile from "@/pages/Profile";
import NFTDetail from "@/pages/NFTDetail";
import SimpleWallet from "@/components/SimpleWallet";
import SimpleRentalFlow from "@/components/SimpleRentalFlow";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="dark" storageKey="nftflow-ui-theme">
      <QueryClientProvider client={queryClient}>
        <WalletErrorBoundary>
          <Web3Provider>
            <NotificationProvider>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
                    <main>
                        <Routes>
                         <Route path="/" element={<Index />} />
                         <Route path="/analytics" element={<Analytics />} />
                         <Route path="/enhanced-marketplace" element={<EnhancedMarketplace />} />
                         <Route path="/profile" element={<Profile />} />
                         <Route path="/nft/:id" element={<NFTDetail />} />
                         <Route path="/wallet" element={<SimpleWallet />} />
                         <Route path="/rental" element={<SimpleRentalFlow />} />
                         <Route path="*" element={<div className="text-center text-white py-20">Page not found</div>} />
                      </Routes>
                    </main>
                  </div>
                </BrowserRouter>
              </TooltipProvider>
            </NotificationProvider>
          </Web3Provider>
        </WalletErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;