import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context";
import ErrorBoundary from "@/components/ui/error-boundary";
import ApolloProviderWrapper from "./components/ApolloProvider";
import Header from "./components/Header";
import Index from "./pages/Index";
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

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
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
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ApolloProviderWrapper>
      </Web3Provider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
