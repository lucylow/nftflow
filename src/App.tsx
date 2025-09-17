import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import WalletErrorBoundary from "@/components/WalletErrorBoundary";
import { ThemeProvider } from "./hooks/use-theme";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Analytics from "@/pages/Analytics";
import EnhancedMarketplace from "@/pages/EnhancedMarketplace";
import Marketplace from "@/pages/Marketplace";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import NFTDetail from "@/pages/NFTDetail";
import Create from "@/pages/Create";
import DAO from "@/pages/DAO";
import Governance from "@/pages/Governance";
import CreativityShowcase from "@/pages/CreativityShowcase";
import Upload from "@/pages/Upload";
import SubgraphDashboard from "@/pages/SubgraphDashboard";
import Social from "@/pages/Social";
import Mobile from "@/pages/Mobile";
import SimpleWallet from "@/components/SimpleWallet";
import SimpleRentalFlow from "@/components/SimpleRentalFlow";
import WalletTest from "@/pages/WalletTest";
import Somnia from "@/pages/Somnia";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering with full configuration');
  console.log('Index component:', Index);
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="nftflow-ui-theme">
        <QueryClientProvider client={queryClient}>
          <WalletErrorBoundary>
            <Web3Provider>
              <NotificationProvider>
                <TooltipProvider>
                  <Toaster />
                  <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<div className="min-h-screen bg-red-500 flex items-center justify-center"><h1 className="text-white text-4xl">TEST PAGE WORKS</h1></div>} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/enhanced-marketplace" element={<EnhancedMarketplace />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/nft/:id" element={<NFTDetail />} />
                        <Route path="/create" element={<Create />} />
                        <Route path="/upload" element={<Upload />} />
                        <Route path="/dao" element={<DAO />} />
                        <Route path="/governance" element={<Governance />} />
                        <Route path="/creativity" element={<CreativityShowcase />} />
                        <Route path="/subgraph" element={<SubgraphDashboard />} />
                        <Route path="/social" element={<Social />} />
                        <Route path="/mobile" element={<Mobile />} />
                        <Route path="/wallet" element={<SimpleWallet />} />
                        <Route path="/wallet-test" element={<WalletTest />} />
                        <Route path="/somnia" element={<Somnia />} />
                        <Route path="/rental" element={<SimpleRentalFlow />} />
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
                  </BrowserRouter>
                </TooltipProvider>
              </NotificationProvider>
            </Web3Provider>
          </WalletErrorBoundary>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;