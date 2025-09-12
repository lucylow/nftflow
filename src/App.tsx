import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import ApolloProviderWrapper from "./components/ApolloProvider";
import Header from "./components/Header";
import Index from "@/pages/SimpleIndex";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import Create from "./pages/Create";
import Upload from "./pages/Upload";
import Analytics from "./pages/Analytics";
import NFTDetail from "./pages/NFTDetail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import DAODashboard from "./components/DAODashboard";
import GovernanceTokenMinter from "./components/GovernanceTokenMinter";
import CreativityShowcase from "./pages/CreativityShowcase";
import SubgraphDashboard from "./components/SubgraphDashboard";
import LiveFeed from "./components/LiveFeed";
import SubgraphTest from "./components/SubgraphTest";
import WalletDebug from "./components/WalletDebug";
import WalletErrorBoundary from "./components/WalletErrorBoundary";
import { ThemeProvider } from "./hooks/use-theme";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="system" storageKey="nftflow-ui-theme">
      <QueryClientProvider client={queryClient}>
        <WalletErrorBoundary>
          <Web3Provider>
            <NotificationProvider>
              <ApolloProviderWrapper>
                <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/nft/:id" element={<NFTDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/dao" element={<DAODashboard />} />
                    <Route path="/governance" element={<GovernanceTokenMinter />} />
                    <Route path="/creativity" element={<CreativityShowcase />} />
                    <Route path="/subgraph" element={<SubgraphDashboard />} />
                    <Route path="/live-feed" element={<LiveFeed />} />
                    <Route path="/subgraph-test" element={<SubgraphTest />} />
                    <Route path="/wallet-debug" element={<WalletDebug />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
                </TooltipProvider>
              </ApolloProviderWrapper>
            </NotificationProvider>
          </Web3Provider>
        </WalletErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
